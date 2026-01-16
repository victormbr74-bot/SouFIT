// App State
let currentUser = null;
let users = {};
let workouts = [];
let results = [];
let profilePics = {};
let diets = [];
let foodLogs = [];
let hunterLevels = {};
let achievements = [];
let dailyQuests = [];
const validPages = ['home', 'workout', 'diet', 'results', 'speed', 'profile'];
let isInitializing = false;
let speedTracking = {
    active: false,
    watchId: null,
    map: null,
    polyline: null,
    startMarker: null,
    currentMarker: null,
    path: [],
    totalDistance: 0,
    lastXpKm: 0,
    startTime: null,
    timerId: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hunter\'s Gym - Solo Leveling Edition - Inicializando...');
    initializeApp();
    setupEventListeners();
    
    setTimeout(() => {
        const hash = getPageFromHash();
        loadPage(hash);
        setActiveNav(hash);
    }, 100);
});

window.addEventListener('hashchange', function() {
    const page = getPageFromHash();
    if (window.loadPage) {
        loadPage(page);
        setActiveNav(page);
    }
});

// Initialize App Data
function initializeApp() {
    console.log('Inicializando dados do app...');
    isInitializing = true;
    
    const savedUsers = localStorage.getItem('fitTrackUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        console.log('Usuários carregados:', Object.keys(users).length);
    } else {
        users = {
            1: {
                id: 1,
                name: "Ana Silva",
                email: "ana@email.com",
                height: 165,
                age: 28,
                goal: "Perda de peso",
                experience: "Intermediário",
                profilePic: '👩'
            },
            2: {
                id: 2,
                name: "Carlos Santos",
                email: "carlos@email.com",
                height: 180,
                age: 32,
                goal: "Ganho de massa",
                experience: "Avançado",
                profilePic: '👨'
            }
        };
        localStorage.setItem('fitTrackUsers', JSON.stringify(users));
    }

    loadData();
    loadHunterLevels();
    loadDietData();
    loadAchievements();
    loadDailyQuests();
    
    if (!currentUser) {
        currentUser = users[1];
        console.log('Usuário padrão definido:', currentUser.name);
    }
    
    initializeHunterLevels();
    updateUserSidebar();
    updateHunterLevelDisplay();
    isInitializing = false;
    console.log('App inicializado com sucesso!');
}

// Load Data from localStorage
function loadData() {
    try {
        console.log('Carregando dados do localStorage...');
        
        const savedUser = localStorage.getItem('fitTrackCurrentUser');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log('Usuário salvo encontrado:', parsedUser.name);
            if (users[parsedUser.id]) {
                currentUser = { ...users[parsedUser.id], ...parsedUser };
            } else {
                currentUser = parsedUser;
            }
        }
        
        const userId = currentUser?.id || 1;
        const savedWorkouts = localStorage.getItem(`fitTrackWorkouts_${userId}`);
        if (savedWorkouts) {
            workouts = JSON.parse(savedWorkouts);
            console.log(`${workouts.length} treinos carregados`);
        } else {
            workouts = getDefaultWorkouts();
            console.log('Treinos padrão carregados:', workouts.length);
        }
        
        const savedResults = localStorage.getItem(`fitTrackResults_${userId}`);
        if (savedResults) {
            results = JSON.parse(savedResults);
            console.log(`${results.length} resultados carregados`);
        } else {
            results = getDefaultResults();
            console.log('Resultados padrão carregados:', results.length);
        }
        
        const savedPics = localStorage.getItem('fitTrackProfilePics');
        if (savedPics) {
            profilePics = JSON.parse(savedPics);
            console.log('Fotos de perfil carregadas');
        } else {
            profilePics = {};
        }
        
        normalizeExerciseIds();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        workouts = getDefaultWorkouts();
        results = getDefaultResults();
        profilePics = {};
    }
}

// Load Diet Data
function loadDietData() {
    try {
        ensureCurrentUser();
        const userId = currentUser?.id || 1;
        const savedDiets = localStorage.getItem(`fitTrackDiets_${userId}`);
        const savedFoodLogs = localStorage.getItem(`fitTrackFoodLogs_${userId}`);

        if (savedDiets) {
            const parsedDiets = JSON.parse(savedDiets);
            diets = Array.isArray(parsedDiets) ? parsedDiets : [];
            console.log(`${diets.length} dietas carregadas`);
        } else {
            diets = getDefaultDiets();
            console.log('Dietas padrão carregadas:', diets.length);
        }

        if (savedFoodLogs) {
            const parsedLogs = JSON.parse(savedFoodLogs);
            foodLogs = Array.isArray(parsedLogs) ? parsedLogs : [];
            console.log(`${foodLogs.length} registros de comida carregados`);
        } else {
            foodLogs = [];
            console.log('Nenhum registro de comida encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de dieta:', error);
        diets = getDefaultDiets();
        foodLogs = [];
    }
}

// Load Hunter Levels
function loadHunterLevels() {
    const saved = localStorage.getItem('fitTrackHunterLevels');
    if (saved) {
        hunterLevels = JSON.parse(saved);
    } else {
        hunterLevels = {};
    }
}

// Load Achievements
function loadAchievements() {
    const saved = localStorage.getItem('fitTrackAchievements');
    if (saved) {
        achievements = JSON.parse(saved);
    } else {
        achievements = getDefaultAchievements();
    }
}

// Load Daily Quests
function loadDailyQuests() {
    const saved = localStorage.getItem('fitTrackDailyQuests');
    if (saved) {
        dailyQuests = JSON.parse(saved);
    } else {
        dailyQuests = getDefaultDailyQuests();
    }
}

// Initialize Hunter Levels
function initializeHunterLevels() {
    const userId = currentUser?.id || 1;
    
    if (!hunterLevels[userId]) {
        hunterLevels[userId] = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            totalXP: 0,
            rank: "Recruta",
            achievements: [],
            dailyStreak: 0,
            lastLogin: new Date().toISOString().split('T')[0],
            totalWorkouts: 0,
            totalFoodLogged: 0,
            totalCalories: 0
        };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = hunterLevels[userId].lastLogin;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastLogin === yesterdayStr) {
        hunterLevels[userId].dailyStreak++;
        addXP(10, "Daily Streak");
    } else if (lastLogin !== today) {
        hunterLevels[userId].dailyStreak = 1;
        addXP(10, "Daily Login");
    }
    
    hunterLevels[userId].lastLogin = today;
    saveHunterLevels();
}

// Add XP Function
function addXP(amount, reason) {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    const hunter = hunterLevels[userId];
    
    if (!hunter) {
        initializeHunterLevels();
        return;
    }
    
    hunter.xp += amount;
    hunter.totalXP += amount;
    
    const oldLevel = hunter.level;
    
    while (hunter.xp >= hunter.xpToNextLevel) {
        hunter.xp -= hunter.xpToNextLevel;
        hunter.level++;
        hunter.xpToNextLevel = Math.floor(hunter.xpToNextLevel * 1.2);
        
        if (hunter.level >= 1000) hunter.rank = "Monarca";
        else if (hunter.level >= 500) hunter.rank = "Mestre";
        else if (hunter.level >= 200) hunter.rank = "Avançado";
        else if (hunter.level >= 100) hunter.rank = "Intermediário";
        else if (hunter.level >= 50) hunter.rank = "Iniciante";
    }
    
    if (hunter.level > oldLevel) {
        showLevelUpAnimation(hunter.level);
    }
    
    saveHunterLevels();
    updateHunterLevelDisplay();
    
    showToast(`+${amount} XP - ${reason}`, 'success');
    
    checkAchievements();
}

// Show Level Up Animation
function showLevelUpAnimation(level) {
    const animationHtml = `
        <div class="level-up-animation">
            <div class="level-up-content">
                <div class="hunter-level-display">LEVEL UP!</div>
                <div class="new-level">Nível ${level}</div>
                <div class="xp-gain">+100 XP</div>
                <div class="confetti"></div>
            </div>
        </div>
    `;
    
    const existingAnimation = document.querySelector('.level-up-animation');
    if (existingAnimation) existingAnimation.remove();
    
    document.body.insertAdjacentHTML('beforeend', animationHtml);
    
    setTimeout(() => {
        const animation = document.querySelector('.level-up-animation');
        if (animation) animation.remove();
    }, 3000);
}

// Update Hunter Level Display
function updateHunterLevelDisplay() {
    const container = document.getElementById('hunterLevelDisplay');
    if (!container || !currentUser) return;
    
    const hunter = hunterLevels[currentUser.id];
    if (!hunter) {
        initializeHunterLevels();
        return;
    }
    
    const progress = (hunter.xp / hunter.xpToNextLevel) * 100;
    
    container.innerHTML = `
        <div class="text-center">
            <div class="hunter-level mb-2">${hunter.level}</div>
            <div class="mb-2">
                <small class="text-neon-blue">${hunter.rank}</small>
            </div>
            <div class="level-progress mb-2">
                <div class="level-progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="d-flex justify-content-between">
                <small class="text-muted">${hunter.xp} XP</small>
                <small class="text-neon-purple">${hunter.xpToNextLevel} XP</small>
            </div>
            <div class="mt-3">
                <small class="text-muted d-block">Streak: ${hunter.dailyStreak} dias</small>
                <small class="text-muted">Total XP: ${hunter.totalXP}</small>
            </div>
        </div>
    `;
}

// Save Data
function saveData() {
    try {
        if (isInitializing) return;
        if (!currentUser) return;
        
        localStorage.setItem('fitTrackUsers', JSON.stringify(users));
        localStorage.setItem('fitTrackCurrentUser', JSON.stringify(currentUser));
        localStorage.setItem(`fitTrackWorkouts_${currentUser.id}`, JSON.stringify(workouts));
        localStorage.setItem(`fitTrackResults_${currentUser.id}`, JSON.stringify(results));
        localStorage.setItem('fitTrackProfilePics', JSON.stringify(profilePics));
        
        saveDietData();
        saveHunterLevels();
        saveAchievements();
        saveDailyQuests();
        
        console.log('Todos os dados salvos com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showToast('Erro ao salvar dados', 'error');
    }
}

// Save Diet Data
function saveDietData() {
    try {
        if (isInitializing) return;
        ensureCurrentUser();
        const fallbackUserId = Object.keys(users || {})[0];
        const userId = currentUser?.id || (fallbackUserId ? parseInt(fallbackUserId, 10) : null);
        if (!userId) return;

        localStorage.setItem(`fitTrackDiets_${userId}`, JSON.stringify(diets));
        localStorage.setItem(`fitTrackFoodLogs_${userId}`, JSON.stringify(foodLogs));
        
        console.log('Dados de dieta salvos!');
    } catch (error) {
        console.error('Erro ao salvar dados de dieta:', error);
        showToast('Erro ao salvar dados de dieta', 'error');
    }
}

// Save Hunter Levels
function saveHunterLevels() {
    localStorage.setItem('fitTrackHunterLevels', JSON.stringify(hunterLevels));
}

// Save Achievements
function saveAchievements() {
    localStorage.setItem('fitTrackAchievements', JSON.stringify(achievements));
}

// Save Daily Quests
function saveDailyQuests() {
    localStorage.setItem('fitTrackDailyQuests', JSON.stringify(dailyQuests));
}

// Get Default Workouts
function getDefaultWorkouts() {
    return [
        {
            id: 1,
            day: 'Seg',
            name: 'Peito e Tríceps',
            exercises: [
                { id: 'ex-1-1-1', name: 'Supino Reto', sets: '4x10', completed: true },
                { id: 'ex-1-2-1', name: 'Crucifixo', sets: '3x12', completed: true },
                { id: 'ex-1-3-1', name: 'Tríceps Pulley', sets: '3x15', completed: false }
            ],
            duration: '60 min',
            completed: true,
            created: '2024-01-15'
        },
        {
            id: 2,
            day: 'Ter',
            name: 'Costas e Bíceps',
            exercises: [
                { id: 'ex-2-1-1', name: 'Puxada Alta', sets: '4x10', completed: true },
                { id: 'ex-2-2-1', name: 'Remada Curvada', sets: '3x12', completed: true },
                { id: 'ex-2-3-1', name: 'Rosca Direta', sets: '3x15', completed: true }
            ],
            duration: '60 min',
            completed: true,
            created: '2024-01-16'
        },
        {
            id: 3,
            day: 'Qua',
            name: 'Pernas',
            exercises: [
                { id: 'ex-3-1-1', name: 'Agachamento Livre', sets: '4x8', completed: true },
                { id: 'ex-3-2-1', name: 'Leg Press', sets: '3x12', completed: false },
                { id: 'ex-3-3-1', name: 'Cadeira Extensora', sets: '3x15', completed: false }
            ],
            duration: '75 min',
            completed: false,
            created: '2024-01-17'
        },
        {
            id: 4,
            day: 'Qui',
            name: 'Ombros e Trapézio',
            exercises: [
                { id: 'ex-4-1-1', name: 'Desenvolvimento', sets: '4x10', completed: false },
                { id: 'ex-4-2-1', name: 'Elevação Lateral', sets: '3x12', completed: false },
                { id: 'ex-4-3-1', name: 'Encolhimento', sets: '3x15', completed: false }
            ],
            duration: '60 min',
            completed: false,
            created: '2024-01-18'
        }
    ];
}

// Get Default Results
function getDefaultResults() {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    return [
        {
            id: 1,
            date: twoWeeksAgo.toLocaleDateString('pt-BR'),
            weight: 98.5,
            biceps: 37.5,
            chest: 104,
            waist: 93,
            hips: 101,
            bmi: 35.3
        },
        {
            id: 2,
            date: lastWeek.toLocaleDateString('pt-BR'),
            weight: 97.9,
            biceps: 38,
            chest: 104.5,
            waist: 92,
            hips: 100.5,
            bmi: 34.8
        },
        {
            id: 3,
            date: today.toLocaleDateString('pt-BR'),
            weight: 96.0,
            biceps: 38.5,
            chest: 105,
            waist: 91,
            hips: 100,
            bmi: 34.2
        }
    ];
}

// Get Default Diets
function getDefaultDiets() {
    return [
        {
            id: 1,
            name: "Plano de Corte - Caçador",
            description: "Dieta para definição muscular e perda de gordura",
            meals: [
                {
                    id: 1,
                    name: "Café da Manhã",
                    time: "07:00",
                    foods: [
                        { id: 1, name: "Ovos Cozidos", quantity: "3 unidades", protein: 18, carbs: 1, fat: 15, calories: 210 },
                        { id: 2, name: "Aveia", quantity: "50g", protein: 6, carbs: 30, fat: 3, calories: 160 }
                    ]
                },
                {
                    id: 2,
                    name: "Lanche da Manhã",
                    time: "10:00",
                    foods: [
                        { id: 3, name: "Whey Protein", quantity: "1 scoop", protein: 24, carbs: 3, fat: 2, calories: 120 },
                        { id: 4, name: "Maçã", quantity: "1 unidade", protein: 0, carbs: 25, fat: 0, calories: 95 }
                    ]
                },
                {
                    id: 3,
                    name: "Almoço",
                    time: "12:30",
                    foods: [
                        { id: 5, name: "Peito de Frango", quantity: "200g", protein: 46, carbs: 0, fat: 5, calories: 240 },
                        { id: 6, name: "Arroz Integral", quantity: "100g", protein: 3, carbs: 25, fat: 1, calories: 120 },
                        { id: 7, name: "Brócolis", quantity: "150g", protein: 4, carbs: 10, fat: 0, calories: 55 }
                    ]
                },
                {
                    id: 4,
                    name: "Pré-Treino",
                    time: "17:00",
                    foods: [
                        { id: 8, name: "Banana", quantity: "1 unidade", protein: 1, carbs: 27, fat: 0, calories: 105 },
                        { id: 9, name: "Pão Integral", quantity: "2 fatias", protein: 6, carbs: 24, fat: 2, calories: 140 }
                    ]
                },
                {
                    id: 5,
                    name: "Jantar",
                    time: "19:00",
                    foods: [
                        { id: 10, name: "Salmão", quantity: "150g", protein: 34, carbs: 0, fat: 13, calories: 280 },
                        { id: 11, name: "Batata Doce", quantity: "150g", protein: 2, carbs: 35, fat: 0, calories: 150 },
                        { id: 12, name: "Salada Verde", quantity: "200g", protein: 2, carbs: 8, fat: 0, calories: 40 }
                    ]
                },
                {
                    id: 6,
                    name: "Ceia",
                    time: "21:30",
                    foods: [
                        { id: 13, name: "Queijo Cottage", quantity: "100g", protein: 12, carbs: 4, fat: 4, calories: 100 },
                        { id: 14, name: "Castanhas", quantity: "30g", protein: 5, carbs: 6, fat: 15, calories: 180 }
                    ]
                }
            ],
            dailyCalories: 1895,
            dailyProtein: 163,
            dailyCarbs: 168,
            dailyFat: 60
        }
    ];
}

// Get Default Achievements
function getDefaultAchievements() {
    return [
        { id: 1, name: "Primeiros Passos", description: "Complete seu primeiro treino", xp: 50, icon: "🎯", unlocked: false, type: "workout" },
        { id: 2, name: "Nutrição Básica", description: "Registre sua primeira refeição", xp: 30, icon: "🍎", unlocked: false, type: "diet" },
        { id: 3, name: "Consistência", description: "Mantenha um streak de 7 dias", xp: 100, icon: "🔥", unlocked: false, type: "streak" },
        { id: 4, name: "Iniciante", description: "Alcance o nível 10", xp: 150, icon: "⭐", unlocked: false, type: "level" },
        { id: 5, name: "Disciplina", description: "Complete 10 treinos", xp: 200, icon: "💪", unlocked: false, type: "workout" },
        { id: 6, name: "Nutrição Avançada", description: "Registre 50 alimentos", xp: 250, icon: "🥦", unlocked: false, type: "diet" },
        { id: 7, name: "Veterano", description: "Alcance o nível 50", xp: 500, icon: "🏆", unlocked: false, type: "level" },
        { id: 8, name: "Mestre do Treino", description: "Complete 100 treinos", xp: 1000, icon: "👑", unlocked: false, type: "workout" }
    ];
}

// Get Default Daily Quests
function getDefaultDailyQuests() {
    return [
        { id: 1, name: "Treino Diário", description: "Complete 1 treino", xp: 25, completed: false, type: "workout" },
        { id: 2, name: "Nutrição Perfeita", description: "Registre 3 refeições", xp: 15, completed: false, type: "diet" },
        { id: 3, name: "Meta de Calorias", description: "Atinga 80% da meta calórica", xp: 20, completed: false, type: "diet" },
        { id: 4, name: "Medição", description: "Registre seu peso atual", xp: 10, completed: false, type: "measurement" }
    ];
}

// Check Achievements
function checkAchievements() {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    const hunter = hunterLevels[userId];
    
    if (!hunter) return;
    
    const completedWorkouts = workouts.filter(w => w.completed).length;
    const todayLogs = foodLogs.filter(log => log.date === new Date().toISOString().split('T')[0]);
    
    achievements.forEach(achievement => {
        if (achievement.unlocked) return;
        
        let shouldUnlock = false;
        
        switch(achievement.type) {
            case 'workout':
                if (achievement.name === "Primeiros Passos" && completedWorkouts >= 1) shouldUnlock = true;
                if (achievement.name === "Disciplina" && completedWorkouts >= 10) shouldUnlock = true;
                if (achievement.name === "Mestre do Treino" && completedWorkouts >= 100) shouldUnlock = true;
                break;
            case 'diet':
                if (achievement.name === "Nutrição Básica" && todayLogs.length >= 1) shouldUnlock = true;
                if (achievement.name === "Nutrição Avançada" && foodLogs.length >= 50) shouldUnlock = true;
                break;
            case 'streak':
                if (achievement.name === "Consistência" && hunter.dailyStreak >= 7) shouldUnlock = true;
                break;
            case 'level':
                if (achievement.name === "Iniciante" && hunter.level >= 10) shouldUnlock = true;
                if (achievement.name === "Veterano" && hunter.level >= 50) shouldUnlock = true;
                break;
        }
        
        if (shouldUnlock) {
            achievement.unlocked = true;
            if (!hunter.achievements.includes(achievement.id)) {
                hunter.achievements.push(achievement.id);
            }
            addXP(achievement.xp, `Conquista: ${achievement.name}`);
            showAchievementPopup(achievement);
        }
    });
    
    saveAchievements();
    saveHunterLevels();
}

// Show Achievement Popup
function showAchievementPopup(achievement) {
    const popupHtml = `
        <div class="achievement-popup">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <h6>Conquista Desbloqueada!</h6>
                <strong>${achievement.name}</strong>
                <p class="mb-0">${achievement.description}</p>
                <small class="text-neon-yellow">+${achievement.xp} XP</small>
            </div>
        </div>
    `;
    
    const existingPopup = document.querySelector('.achievement-popup');
    if (existingPopup) existingPopup.remove();
    
    document.body.insertAdjacentHTML('beforeend', popupHtml);
    
    setTimeout(() => {
        const popup = document.querySelector('.achievement-popup');
        if (popup) popup.remove();
    }, 5000);
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    document.body.addEventListener('click', function(event) {
        const speedButton = event.target.closest('#speedStartBtn, #speedPauseBtn, #speedStopBtn, #speedResetBtn');
        if (speedButton) {
            event.preventDefault();
            if (speedButton.id === 'speedStartBtn') startSpeedTracking();
            if (speedButton.id === 'speedPauseBtn') pauseSpeedTracking();
            if (speedButton.id === 'speedStopBtn') stopSpeedTracking();
            if (speedButton.id === 'speedResetBtn') resetSpeedTracking();
            return;
        }

        const link = event.target.closest('[data-page]');
        if (!link) return;

        event.preventDefault();
        const page = link.getAttribute('data-page');
        if (!page) return;

        console.log('Navegando para:', page);
        loadPage(page);
        setActiveNav(page);

        window.location.hash = page;

        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
    
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        });
    }
    
    document.getElementById('mainContent')?.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
    
    console.log('Event listeners configurados!');
}

function getPageFromHash() {
    const hash = window.location.hash.substring(1);
    return validPages.includes(hash) ? hash : 'home';
}

function setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
}

// Update User Sidebar
function updateUserSidebar() {
    const userSection = document.getElementById('userSection');
    if (!userSection) {
        const sidebar = document.querySelector('.sidebar-content');
        if (!sidebar) return;
        
        const newUserSection = document.createElement('div');
        newUserSection.id = 'userSection';
        newUserSection.className = 'user-section';
        
        sidebar.prepend(newUserSection);
    }
    
    const userSectionElement = document.getElementById('userSection');
    userSectionElement.innerHTML = '';
    
    if (currentUser) {
        const currentUserDiv = document.createElement('div');
        currentUserDiv.className = 'current-user-profile';
        currentUserDiv.innerHTML = `
            <div class="d-flex align-items-center mb-3 p-2 bg-dark rounded">
                <div class="user-avatar me-2">
                    ${profilePics[currentUser.id] ? 
                        `<img src="${profilePics[currentUser.id]}" alt="${currentUser.name}" class="profile-img">` :
                        `<span>${currentUser.profilePic || '👤'}</span>`}
                </div>
                <div class="flex-grow-1">
                    <div class="fw-bold">${currentUser.name}</div>
                    <small class="text-muted d-block">${currentUser.email}</small>
                    <small class="badge bg-primary">${currentUser.experience}</small>
                </div>
            </div>
        `;
        userSectionElement.appendChild(currentUserDiv);
    }
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'px-2 mb-2';
    titleDiv.innerHTML = '<small class="text-muted fw-bold">TROCAR CAÇADOR</small>';
    userSectionElement.appendChild(titleDiv);
    
    Object.values(users).forEach(user => {
        if (currentUser && user.id === currentUser.id) return;
        
        const userItem = document.createElement('a');
        userItem.href = '#';
        userItem.className = 'nav-link user-item';
        userItem.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="user-avatar-sm me-2">
                    ${profilePics[user.id] ? 
                        `<img src="${profilePics[user.id]}" alt="${user.name}" class="profile-img-sm">` :
                        `<span>${user.profilePic || '👤'}</span>`}
                </div>
                <div class="flex-grow-1">
                    <div>${user.name}</div>
                    <small class="text-muted">${user.email}</small>
                </div>
                <div class="ms-2">
                    <i class="fas fa-sign-in-alt text-primary"></i>
                </div>
            </div>
        `;
        
        userItem.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            switchUser(user.id);
            
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
        
        userSectionElement.appendChild(userItem);
    });
    
    const divider = document.createElement('hr');
    divider.className = 'my-2 mx-2';
    userSectionElement.appendChild(divider);
    
    const addUserItem = document.createElement('a');
    addUserItem.href = '#';
    addUserItem.className = 'nav-link text-success';
    addUserItem.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-user-plus me-3"></i>
            <span>Adicionar Novo Caçador</span>
        </div>
    `;
    
    addUserItem.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        addUser();
        
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
    
    userSectionElement.appendChild(addUserItem);
    
    const manageUsersItem = document.createElement('a');
    manageUsersItem.href = '#';
    manageUsersItem.className = 'nav-link';
    manageUsersItem.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-users-cog me-3"></i>
            <span>Gerenciar Caçadores</span>
        </div>
    `;
    
    manageUsersItem.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openUsersManager();
        
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
    
    userSectionElement.appendChild(manageUsersItem);
    
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand && currentUser) {
        navbarBrand.innerHTML = `
            <i class="fas fa-dungeon me-2"></i>
            <span class="fw-bold">${currentUser.name.split(' ')[0]}</span>
            <small class="ms-2 text-neon-blue" style="font-size: 0.8rem;">HUNTER</small>
        `;
    }
}

// Switch User
function switchUser(userId) {
    userId = parseInt(userId);
    
    if (!users[userId]) {
        showToast('Caçador não encontrado', 'error');
        return;
    }
    
    const newUser = users[userId];
    
    if (currentUser) {
        localStorage.setItem(`fitTrackWorkouts_${currentUser.id}`, JSON.stringify(workouts));
        localStorage.setItem(`fitTrackResults_${currentUser.id}`, JSON.stringify(results));
        localStorage.setItem(`fitTrackDiets_${currentUser.id}`, JSON.stringify(diets));
        localStorage.setItem(`fitTrackFoodLogs_${currentUser.id}`, JSON.stringify(foodLogs));
    }
    
    currentUser = newUser;
    localStorage.setItem('fitTrackCurrentUser', JSON.stringify(currentUser));
    
    const userIdForLoad = currentUser.id;
    
    const savedWorkouts = localStorage.getItem(`fitTrackWorkouts_${userIdForLoad}`);
    workouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];
    
    const savedResults = localStorage.getItem(`fitTrackResults_${userIdForLoad}`);
    results = savedResults ? JSON.parse(savedResults) : [];
    
    const savedDiets = localStorage.getItem(`fitTrackDiets_${userIdForLoad}`);
    diets = savedDiets ? JSON.parse(savedDiets) : getDefaultDiets();
    
    const savedFoodLogs = localStorage.getItem(`fitTrackFoodLogs_${userIdForLoad}`);
    foodLogs = savedFoodLogs ? JSON.parse(savedFoodLogs) : [];
    
    updateUserSidebar();
    updateHunterLevelDisplay();
    
    const currentHash = window.location.hash.substring(1) || 'home';
    loadPage(currentHash);
    
    showToast(`Caçador alterado para ${currentUser.name}`, 'success');
}

// Add User
function addUser() {
    const name = prompt("Digite o nome do novo caçador:");
    if (!name || name.trim() === '') return;
    
    const email = prompt("Digite o email do novo caçador:");
    if (!email || email.trim() === '') return;
    
    const height = parseInt(prompt("Digite a altura (cm):")) || 170;
    const age = parseInt(prompt("Digite a idade:")) || 25;
    const experience = prompt("Nível de experiência (Iniciante/Intermediário/Avançado):") || "Iniciante";
    const goal = prompt("Objetivo (Perda de peso/Ganho de massa/Definição muscular):") || "Perda de peso";
    const profilePic = prompt("Emoji para foto (opcional):") || '⚔️';
    
    const newId = Math.max(...Object.keys(users).map(Number), 0) + 1;
    
    users[newId] = {
        id: newId,
        name: name.trim(),
        email: email.trim(),
        height: height,
        age: age,
        experience: experience,
        goal: goal,
        profilePic: profilePic
    };
    
    localStorage.setItem(`fitTrackWorkouts_${newId}`, JSON.stringify([]));
    localStorage.setItem(`fitTrackResults_${newId}`, JSON.stringify([]));
    localStorage.setItem(`fitTrackDiets_${newId}`, JSON.stringify([]));
    localStorage.setItem(`fitTrackFoodLogs_${newId}`, JSON.stringify([]));
    
    saveData();
    updateUserSidebar();
    showToast(`Caçador ${name} adicionado com sucesso!`, 'success');
}

// Remove User
function removeUser(userId) {
    userId = parseInt(userId);
    
    if (!users[userId]) {
        showToast('Caçador não encontrado', 'error');
        return;
    }
    
    const userName = users[userId].name;
    
    if (currentUser && userId === currentUser.id) {
        showToast('Não é possível remover o caçador atual. Troque para outro caçador primeiro.', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja remover o caçador "${userName}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    delete users[userId];
    
    localStorage.removeItem(`fitTrackWorkouts_${userId}`);
    localStorage.removeItem(`fitTrackResults_${userId}`);
    localStorage.removeItem(`fitTrackDiets_${userId}`);
    localStorage.removeItem(`fitTrackFoodLogs_${userId}`);
    
    if (profilePics[userId]) {
        delete profilePics[userId];
    }
    
    saveData();
    updateUserSidebar();
    
    const modal = document.getElementById('usersManagerModal');
    if (modal && modal.classList.contains('show')) {
        openUsersManager();
    }
    
    showToast(`Caçador ${userName} removido com sucesso!`, 'success');
}

// Edit User
function editUser(userId) {
    userId = parseInt(userId);
    const user = users[userId];
    if (!user) return;
    
    const name = prompt("Novo nome:", user.name);
    if (name === null || name.trim() === '') return;
    
    const email = prompt("Novo email:", user.email);
    if (email === null || email.trim() === '') return;
    
    const height = parseInt(prompt("Nova altura (cm):", user.height)) || user.height;
    const age = parseInt(prompt("Nova idade:", user.age)) || user.age;
    const experience = prompt("Novo nível de experiência:", user.experience) || user.experience;
    const goal = prompt("Novo objetivo:", user.goal) || user.goal;
    const profilePic = prompt("Novo emoji (opcional):", user.profilePic) || user.profilePic;
    
    users[userId] = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        height: height,
        age: age,
        experience: experience,
        goal: goal,
        profilePic: profilePic
    };
    
    if (currentUser && currentUser.id === userId) {
        currentUser = users[userId];
    }
    
    saveData();
    updateUserSidebar();
    
    const modal = document.getElementById('usersManagerModal');
    if (modal && modal.classList.contains('show')) {
        openUsersManager();
    }
    
    showToast(`Caçador ${user.name} atualizado com sucesso!`, 'success');
}

// Open Users Manager
function openUsersManager() {
    let modalHtml = `
        <div class="modal fade" id="usersManagerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-users me-2"></i>Gerenciar Caçadores</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Foto</th>
                                        <th>Nome</th>
                                        <th>Email</th>
                                        <th>Perfil</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="usersManagerList">
    `;
    
    Object.values(users).forEach(user => {
        const isCurrent = currentUser && currentUser.id === user.id;
        modalHtml += `
            <tr ${isCurrent ? 'class="table-primary"' : ''}>
                <td>
                    <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                        style="width:40px;height:40px;background:#2d2d2d;color:white">
                        ${profilePics[user.id] ? 
                            `<img src="${profilePics[user.id]}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : 
                            user.profilePic || '👤'}
                    </div>
                </td>
                <td>
                    <strong>${user.name}</strong>
                    ${isCurrent ? '<span class="badge bg-success ms-2">Atual</span>' : ''}
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge bg-primary">${user.experience}</span><br>
                    <small class="text-muted">${user.goal}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.switchUser(${user.id}); setTimeout(() => { const modalEl = document.getElementById('usersManagerModal'); if(modalEl) bootstrap.Modal.getInstance(modalEl).hide(); }, 100);" 
                                ${isCurrent ? 'disabled' : ''}>
                            <i class="fas fa-sign-in-alt"></i> Usar
                        </button>
                        <button class="btn btn-outline-warning" onclick="window.editUser(${user.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline-danger" onclick="window.removeUser(${user.id})" 
                                ${isCurrent ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    modalHtml += `
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="mt-4">
                            <button class="btn btn-success" onclick="window.addUser(); setTimeout(() => { const modalEl = document.getElementById('usersManagerModal'); if(modalEl) bootstrap.Modal.getInstance(modalEl).hide(); }, 100);">
                                <i class="fas fa-user-plus me-2"></i>Adicionar Novo Caçador
                            </button>
                            <button class="btn btn-outline-info ms-2" onclick="window.exportAllUsersData()">
                                <i class="fas fa-download me-2"></i>Exportar Todos os Dados
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('usersManagerModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modalElement = document.getElementById('usersManagerModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.remove();
    });
}

// Export All Users Data
function exportAllUsersData() {
    const allData = {
        users: users,
        profilePics: profilePics,
        hunterLevels: hunterLevels,
        achievements: achievements,
        dailyQuests: dailyQuests,
        exportDate: new Date().toISOString(),
        version: '3.0.0'
    };
    
    Object.values(users).forEach(user => {
        const userWorkouts = JSON.parse(localStorage.getItem(`fitTrackWorkouts_${user.id}`)) || [];
        const userResults = JSON.parse(localStorage.getItem(`fitTrackResults_${user.id}`)) || [];
        const userDiets = JSON.parse(localStorage.getItem(`fitTrackDiets_${user.id}`)) || [];
        const userFoodLogs = JSON.parse(localStorage.getItem(`fitTrackFoodLogs_${user.id}`)) || [];
        
        if (!allData.userData) allData.userData = {};
        allData.userData[user.id] = {
            workouts: userWorkouts,
            results: userResults,
            diets: userDiets,
            foodLogs: userFoodLogs
        };
    });
    
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hunters-gym-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Dados de todos os caçadores exportados com sucesso!', 'success');
}

// Import All Users Data
function importAllUsersData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!confirm('Isso substituirá todos os dados de todos os caçadores. Deseja continuar?')) {
                    return;
                }
                
                if (!data.users) {
                    showToast('Arquivo de backup inválido', 'error');
                    return;
                }
                
                users = data.users;
                profilePics = data.profilePics || {};
                hunterLevels = data.hunterLevels || {};
                achievements = data.achievements || getDefaultAchievements();
                dailyQuests = data.dailyQuests || getDefaultDailyQuests();
                
                localStorage.setItem('fitTrackUsers', JSON.stringify(users));
                localStorage.setItem('fitTrackProfilePics', JSON.stringify(profilePics));
                localStorage.setItem('fitTrackHunterLevels', JSON.stringify(hunterLevels));
                localStorage.setItem('fitTrackAchievements', JSON.stringify(achievements));
                localStorage.setItem('fitTrackDailyQuests', JSON.stringify(dailyQuests));
                
                if (data.userData) {
                    Object.keys(data.userData).forEach(userId => {
                        const userData = data.userData[userId];
                        ['workouts', 'results', 'diets', 'foodLogs'].forEach(type => {
                            if (userData[type]) {
                                localStorage.setItem(`fitTrack${type.charAt(0).toUpperCase() + type.slice(1)}_${userId}`, JSON.stringify(userData[type]));
                            }
                        });
                    });
                }
                
                if (currentUser && users[currentUser.id]) {
                    currentUser = users[currentUser.id];
                } else {
                    const firstUserId = Object.keys(users)[0];
                    if (firstUserId) {
                        currentUser = users[firstUserId];
                    }
                }
                
                localStorage.setItem('fitTrackCurrentUser', JSON.stringify(currentUser));
                
                loadData();
                loadDietData();
                updateUserSidebar();
                updateHunterLevelDisplay();
                loadPage('home');
                
                showToast('Dados de todos os caçadores importados com sucesso!', 'success');
            } catch (error) {
                console.error('Import error:', error);
                showToast('Erro ao importar dados. Arquivo inválido.', 'error');
            }
        };
        reader.onerror = function() {
            showToast('Erro ao ler o arquivo', 'error');
        };
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Page Loading System
function loadPage(page) {
    const content = document.getElementById('pageContent');
    if (!content) return;
    
    console.log('Carregando página:', page);
    resetModalState();
    if (page !== 'speed' && speedTracking.map) {
        speedTracking.map.remove();
        speedTracking.map = null;
        speedTracking.polyline = null;
        speedTracking.startMarker = null;
        speedTracking.currentMarker = null;
    }
    content.innerHTML = '';
    
    switch(page) {
        case 'home':
            content.innerHTML = getHomePage();
            setTimeout(() => {
                initWeightChart();
                updateHunterLevelDisplay();
            }, 100);
            break;
        case 'workout':
            content.innerHTML = getWorkoutPage();
            setTimeout(() => setupWorkoutEvents(), 100);
            break;
        case 'diet':
            content.innerHTML = getDietPage();
            setTimeout(() => setupDietEvents(), 100);
            break;
        case 'speed':
            content.innerHTML = getSpeedPage();
            setTimeout(() => setupSpeedEvents(), 100);
            break;
        case 'results':
            content.innerHTML = getResultsPage();
            setTimeout(() => setupResultsEvents(), 100);
            break;
        case 'profile':
            content.innerHTML = getProfilePage();
            setTimeout(() => setupProfileEvents(), 100);
            break;
        default:
            content.innerHTML = getHomePage();
            window.location.hash = 'home';
    }
    
    window.scrollTo(0, 0);
}

function resetModalState() {
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('.modal.show').forEach(modalEl => {
            const instance = bootstrap.Modal.getInstance(modalEl);
            if (instance) {
                instance.hide();
            } else {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
            }
        });
    }

    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
}

// Home Page
function getHomePage() {
    if (!currentUser) {
        return '<div class="loading"><div class="spinner-border"></div><p class="mt-3">Carregando...</p></div>';
    }
    
    const completedWorkouts = workouts.filter(w => w.completed).length;
    const totalWorkouts = workouts.length;
    const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = foodLogs.filter(log => log.date === today);
    const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const currentDiet = diets.length > 0 ? diets[0] : null;
    const dailyGoal = currentDiet ? currentDiet.dailyCalories : 2000;
    const calorieProgress = Math.min((totalCalories / dailyGoal) * 100, 100);
    
    const hunter = hunterLevels[currentUser.id];
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const totalAchievements = achievements.length;
    
    const dailyQuestsCompleted = dailyQuests.filter(q => q.completed).length;
    const totalDailyQuests = dailyQuests.length;
    
    return `
        <div class="container-fluid fade-in">
            <!-- Welcome Card -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card welcome-card">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h1 class="mb-2">Bem-vindo, Caçador ${currentUser.name}! ⚔️</h1>
                                    <p class="lead mb-0">
                                        ${hunter?.level >= 100 ? '👑 Você é um verdadeiro Monarca!' : 
                                          hunter?.level >= 50 ? '🔥 Continue evoluindo, Guerreiro!' : 
                                          '🎯 Sua jornada de leveling começa aqui!'}
                                    </p>
                                    <div class="mt-3 d-flex align-items-center">
                                        <span class="hunter-rank me-3">${hunter?.rank || 'Recruta'}</span>
                                        <span class="level-badge">Nível ${hunter?.level || 1}</span>
                                        <span class="badge bg-success ms-3">
                                            ${unlockedAchievements}/${totalAchievements} Conquistas
                                        </span>
                                    </div>
                                </div>
                                <div class="col-md-4 text-md-end">
                                    <div class="profile-pic-large d-inline-block">
                                        <div class="profile-pic">
                                            ${profilePics[currentUser.id] ? 
                                                `<img src="${profilePics[currentUser.id]}" alt="${currentUser.name}" class="profile-img">` :
                                                `<span>${currentUser.profilePic || '⚔️'}</span>`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-dumbbell"></i>
                            </div>
                            <h2 class="text-neon-blue mb-1">${completedWorkouts}/${totalWorkouts}</h2>
                            <h6 class="text-muted mb-3">Missões Concluídas</h6>
                            <div class="progress" style="height:8px">
                                <div class="progress-bar" style="width:${completionRate}%"></div>
                            </div>
                            <small class="text-muted mt-2 d-block">${completionRate}% de eficiência</small>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-fire"></i>
                            </div>
                            <h2 class="text-neon-purple mb-1">${totalCalories}</h2>
                            <h6 class="text-muted mb-3">Energia Consumida</h6>
                            <div class="progress" style="height:8px">
                                <div class="level-progress-bar" style="width:${calorieProgress}%"></div>
                            </div>
                            <small class="text-muted mt-2 d-block">${dailyGoal} kcal meta</small>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <h2 class="text-neon-green mb-1">${hunter?.level || 1}</h2>
                            <h6 class="text-muted mb-3">Nível do Caçador</h6>
                            <div class="level-progress" style="height:8px">
                                <div class="level-progress-bar" style="width:${hunter ? (hunter.xp / hunter.xpToNextLevel) * 100 : 0}%"></div>
                            </div>
                            <small class="text-muted mt-2 d-block">${hunter?.xp || 0}/${hunter?.xpToNextLevel || 100} XP</small>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-bolt"></i>
                            </div>
                            <h2 class="text-neon-yellow mb-1">${hunter?.dailyStreak || 0}</h2>
                            <h6 class="text-muted mb-3">Dias Consecutivos</h6>
                            <div class="streak-counter mt-3">
                                ${Array.from({length: 7}, (_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - (6 - i));
                                    const dateStr = date.toISOString().split('T')[0];
                                    const isActive = hunter?.lastLogin === dateStr;
                                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                                    return `
                                        <div class="streak-day ${isActive ? 'active' : ''} ${isToday ? 'current' : ''}">
                                            ${date.getDate()}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Daily Quest Card -->
                <div class="dashboard-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0"><i class="fas fa-scroll me-2"></i>Missões Diárias</h5>
                        <span class="badge bg-primary">${dailyQuestsCompleted}/${totalDailyQuests}</span>
                    </div>
                    ${dailyQuests.map(quest => `
                        <div class="quest-card ${quest.completed ? 'completed' : ''}">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">${quest.name}</h6>
                                    <p class="text-muted small mb-0">${quest.description}</p>
                                </div>
                                ${quest.completed ? 
                                    '<span class="badge bg-success"><i class="fas fa-check"></i></span>' : 
                                    `<button class="btn btn-sm btn-outline-primary" onclick="completeQuest(${quest.id})">
                                        Completar
                                    </button>`
                                }
                            </div>
                            <div class="quest-reward mt-2">
                                <small><i class="fas fa-coins me-1 text-neon-yellow"></i> Recompensa: ${quest.xp} XP</small>
                            </div>
                        </div>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-info w-100 mt-3" onclick="refreshDailyQuests()">
                        <i class="fas fa-sync-alt me-1"></i> Atualizar Missões
                    </button>
                </div>
                
                <!-- Quick Actions Card -->
                <div class="dashboard-card">
                    <h5 class="mb-3"><i class="fas fa-bolt me-2"></i>Ações Rápidas</h5>
                    <div class="row g-3">
                        <div class="col-6">
                            <a href="#workout" class="text-decoration-none" data-page="workout">
                                <div class="card action-card text-center h-100 py-3">
                                    <div class="card-body">
                                        <div class="mb-2" style="font-size: 2rem;">⚔️</div>
                                        <h6>Iniciar Treino</h6>
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-6">
                            <a href="#diet" class="text-decoration-none" data-page="diet">
                                <div class="card action-card text-center h-100 py-3">
                                    <div class="card-body">
                                        <div class="mb-2" style="font-size: 2rem;">🍎</div>
                                        <h6>Registrar Refeição</h6>
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-6">
                            <a href="#results" class="text-decoration-none" data-page="results">
                                <div class="card action-card text-center h-100 py-3">
                                    <div class="card-body">
                                        <div class="mb-2" style="font-size: 2rem;">📊</div>
                                        <h6>Ver Status</h6>
                                    </div>
                                </div>
                            </a>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-hunter w-100 h-100" onclick="completeDailyChallenge()">
                                <div class="py-3">
                                    <div class="mb-2" style="font-size: 2rem;">🏆</div>
                                    <h6 class="mb-0">Desafio Diário</h6>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Achievements Card -->
                <div class="dashboard-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0"><i class="fas fa-medal me-2"></i>Conquistas</h5>
                        <span class="badge bg-primary">${unlockedAchievements}/${totalAchievements}</span>
                    </div>
                    <div class="achievements-grid">
                        ${achievements.slice(0, 6).map(achievement => `
                            <div class="achievement-item ${achievement.unlocked ? '' : 'locked'}" 
                                 title="${achievement.unlocked ? achievement.description : 'Bloqueada'}"
                                 onclick="showAchievementDetails(${achievement.id})">
                                <div class="achievement-icon">${achievement.icon}</div>
                                <div class="achievement-info">
                                    <small class="d-block">${achievement.name}</small>
                                    <small class="text-muted">${achievement.xp} XP</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-sm btn-outline-primary w-100 mt-3" onclick="showAllAchievements()">
                        <i class="fas fa-list me-1"></i> Ver Todas as Conquistas
                    </button>
                </div>

                <!-- Nutrition Stats Card -->
                <div class="dashboard-card">
                    <h5 class="mb-3"><i class="fas fa-chart-pie me-2"></i>Nutrição Hoje</h5>
                    <div class="nutrition-stats">
                        ${currentDiet ? `
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <small>Proteínas</small>
                                    <small>${todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0)}g / ${currentDiet.dailyProtein}g</small>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar bg-success" style="width: ${Math.min((todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0) / currentDiet.dailyProtein) * 100, 100)}%"></div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <small>Carboidratos</small>
                                    <small>${todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0)}g / ${currentDiet.dailyCarbs}g</small>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar bg-warning" style="width: ${Math.min((todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0) / currentDiet.dailyCarbs) * 100, 100)}%"></div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <small>Gorduras</small>
                                    <small>${todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0)}g / ${currentDiet.dailyFat}g</small>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar bg-danger" style="width: ${Math.min((todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0) / currentDiet.dailyFat) * 100, 100)}%"></div>
                                </div>
                            </div>
                        ` : '<p class="text-muted text-center">Nenhuma dieta configurada</p>'}
                    </div>
                    <div class="text-center mt-3">
                        <small class="text-muted">${todayLogs.length} alimentos registrados hoje</small>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-history me-2"></i>Atividade Recente</h5>
                            <button class="btn btn-sm btn-outline-primary" onclick="refreshActivity()">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="timeline">
                                ${getRecentActivity()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get Recent Activity
function getRecentActivity() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = foodLogs.filter(log => log.date === today).slice(-5).reverse();
    const recentWorkouts = workouts.filter(w => w.completed).slice(-3).reverse();
    const recentResults = results.slice(-2).reverse();
    
    let activities = [];
    
    todayLogs.forEach(log => {
        activities.push({
            time: log.time,
            type: 'food',
            text: `Consumiu ${log.foodName} (${log.calories} kcal)`,
            icon: '🍎',
            timestamp: new Date(`${today}T${log.time}`).getTime()
        });
    });
    
    recentWorkouts.forEach(workout => {
        activities.push({
            time: 'Hoje',
            type: 'workout',
            text: `Completou ${workout.name}`,
            icon: '💪',
            timestamp: new Date().getTime()
        });
    });
    
    recentResults.forEach(result => {
        activities.push({
            time: result.date,
            type: 'measurement',
            text: `Registrou ${result.weight}kg`,
            icon: '⚖️',
            timestamp: new Date(result.date.split('/').reverse().join('-')).getTime()
        });
    });
    
    if (hunterLevels[currentUser.id]?.totalXP > 0) {
        activities.push({
            time: 'Hoje',
            type: 'xp',
            text: `Ganhou ${hunterLevels[currentUser.id].totalXP} XP total`,
            icon: '⭐',
            timestamp: new Date().getTime()
        });
    }
    
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    return activities.slice(0, 8).map(activity => `
        <div class="timeline-item mb-3">
            <div class="d-flex">
                <div class="timeline-icon me-3">
                    <span style="font-size: 1.5rem;">${activity.icon}</span>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-1">${activity.text}</h6>
                        <small class="text-muted">${activity.time}</small>
                    </div>
                    <small class="text-muted">${activity.type === 'food' ? 'Nutrição' : activity.type === 'workout' ? 'Treino' : activity.type === 'measurement' ? 'Medição' : 'Progresso'}</small>
                </div>
            </div>
        </div>
    `).join('') || `
        <div class="text-center py-4">
            <p class="text-muted">Nenhuma atividade recente. Comece sua jornada!</p>
        </div>
    `;
}

// Workout Page
function getWorkoutPage() {
    return `
        <div class="container-fluid fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="mb-0"><i class="fas fa-dumbbell me-2"></i>Missões de Treino</h3>
                            <div class="header-actions">
                                <button class="btn btn-primary" id="addWorkoutBtn">
                                    <i class="fas fa-plus me-2"></i>Nova Missão
                                </button>
                            </div>
                        </div>
                        <div class="card-body workout-card-body">
                            <div id="workoutListContainer" class="workout-list-scroll"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Workout Modal -->
        <div class="modal fade" id="workoutModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Missão de Treino</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="workoutForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nome da Missão *</label>
                                    <input type="text" class="form-control" id="workoutName" required 
                                           placeholder="Ex: Peito e Tríceps">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Dia da Semana *</label>
                                    <select class="form-select" id="workoutDay" required>
                                        <option value="">Selecione um dia</option>
                                        <option value="Seg">Segunda-feira</option>
                                        <option value="Ter">Terça-feira</option>
                                        <option value="Qua">Quarta-feira</option>
                                        <option value="Qui">Quinta-feira</option>
                                        <option value="Sex">Sexta-feira</option>
                                        <option value="Sáb">Sábado</option>
                                        <option value="Dom">Domingo</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Duração</label>
                                    <input type="text" class="form-control" id="workoutDuration" 
                                           placeholder="Ex: 60 minutos">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">XP por Conclusão</label>
                                    <input type="number" class="form-control" id="workoutXP" 
                                           value="25" min="10" max="100">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Exercícios</label>
                                <div id="exercisesContainer">
                                    <div class="exercise-item mb-2">
                                        <div class="row g-2">
                                            <div class="col-md-6">
                                                <input type="text" class="form-control exercise-name" 
                                                       placeholder="Nome do exercício">
                                            </div>
                                            <div class="col-md-4">
                                                <input type="text" class="form-control exercise-sets" 
                                                       placeholder="Séries (ex: 3x12)">
                                            </div>
                                            <div class="col-md-2">
                                                <button type="button" class="btn btn-outline-danger w-100 remove-exercise" disabled>
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="addExerciseBtn">
                                    <i class="fas fa-plus me-1"></i>Adicionar Exercício
                                </button>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="saveWorkoutBtn">Salvar Missão</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Speed Page
function getSpeedPage() {
    return `
        <div class="container-fluid fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center gap-3">
                                <h3 class="mb-0"><i class="fas fa-person-running me-2"></i>Speed</h3>
                                <span class="badge bg-secondary" id="speedStatus">Parado</span>
                            </div>
                            <div class="d-flex gap-2 speed-actions">
                                <button class="btn btn-success" id="speedStartBtn" type="button" onclick="startSpeedTracking()">
                                    <i class="fas fa-play me-2"></i>Iniciar
                                </button>
                                <button class="btn btn-outline-warning" id="speedPauseBtn" type="button" onclick="pauseSpeedTracking()" disabled>
                                    <i class="fas fa-pause me-2"></i>Pausar
                                </button>
                                <button class="btn btn-outline-danger" id="speedStopBtn" type="button" onclick="stopSpeedTracking()" disabled>
                                    <i class="fas fa-stop me-2"></i>Finalizar
                                </button>
                                <button class="btn btn-outline-secondary" id="speedResetBtn" type="button" onclick="resetSpeedTracking()">
                                    <i class="fas fa-rotate me-2"></i>Reset
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row g-3 mb-4">
                                <div class="col-md-4">
                                    <div class="stat-item">
                                        <div class="stat-label">Distancia</div>
                                        <div class="stat-value" id="speedDistance">0.00 km</div>
                                        <small class="text-muted">+25 XP por km</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-item">
                                        <div class="stat-label">Tempo</div>
                                        <div class="stat-value" id="speedTime">00:00:00</div>
                                        <small class="text-muted">Cronometro em tempo real</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-item">
                                        <div class="stat-label">Velocidade Media</div>
                                        <div class="stat-value" id="speedAvg">0.0 km/h</div>
                                        <small class="text-muted">Baseado no percurso</small>
                                    </div>
                                </div>
                            </div>
                            <div id="speedMap" class="speed-map"></div>
                            <div class="mt-3 text-muted">
                                <small>Ative a localizacao do navegador para registrar o percurso no mapa.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Diet Page
function getDietPage() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = foodLogs.filter(log => log.date === today);
    const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
    const totalFat = todayLogs.reduce((sum, log) => sum + (log.fat || 0), 0);
    
    const currentDiet = diets.length > 0 ? diets[0] : null;
    const dailyGoal = currentDiet ? currentDiet.dailyCalories : 2000;
    const calorieProgress = Math.min((totalCalories / dailyGoal) * 100, 100);
    
    const mealTimes = {
        'Café da Manhã': 'breakfast-badge',
        'Lanche da Manhã': 'snack-badge',
        'Almoço': 'lunch-badge',
        'Pré-Treino': 'snack-badge',
        'Jantar': 'dinner-badge',
        'Ceia': 'snack-badge'
    };
    
    return `
        <div class="container-fluid fade-in">
            <!-- Diet Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="mb-0"><i class="fas fa-utensils me-2"></i>Dieta do Caçador</h3>
                            <div class="header-actions">
                                <button class="btn btn-primary me-2" id="addFoodBtn">
                                    <i class="fas fa-plus me-2"></i>Registrar Alimento
                                </button>
                                <button class="btn btn-outline-primary" id="manageDietsBtn">
                                    <i class="fas fa-list me-2"></i>Gerenciar Dietas
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <!-- Daily Stats -->
                            <div class="stats-grid mb-4">
                                <div class="stat-item">
                                    <div class="stat-label">Calorias Hoje</div>
                                    <div class="stat-value">${totalCalories}</div>
                                    <small class="text-muted">Meta: ${dailyGoal}</small>
                                    <div class="level-progress mt-2">
                                        <div class="level-progress-bar" style="width: ${calorieProgress}%"></div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Proteínas (g)</div>
                                    <div class="stat-value">${totalProtein}</div>
                                    <small class="text-muted">${currentDiet ? `Meta: ${currentDiet.dailyProtein}g` : ''}</small>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Carboidratos (g)</div>
                                    <div class="stat-value">${totalCarbs}</div>
                                    <small class="text-muted">${currentDiet ? `Meta: ${currentDiet.dailyCarbs}g` : ''}</small>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">Gorduras (g)</div>
                                    <div class="stat-value">${totalFat}</div>
                                    <small class="text-muted">${currentDiet ? `Meta: ${currentDiet.dailyFat}g` : ''}</small>
                                </div>
                            </div>
                            
                            <!-- Meal Plan -->
                            ${currentDiet ? `
                                <div class="row">
                                    <div class="col-12">
                                        <div class="card diet-card">
                                            <div class="card-header">
                                                <h5 class="mb-0">${currentDiet.name}</h5>
                                                <small class="text-muted">${currentDiet.description}</small>
                                            </div>
                                            <div class="card-body">
                                                ${currentDiet.meals.map(meal => `
                                                    <div class="mb-4">
                                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 class="mb-0">
                                                                <i class="fas fa-clock me-2"></i>${meal.name} (${meal.time})
                                                            </h6>
                                                            <span class="meal-badge ${mealTimes[meal.name] || 'snack-badge'}">
                                                                ${meal.name}
                                                            </span>
                                                        </div>
                                                        <div class="food-list">
                                                            ${meal.foods.map(food => {
                                                                const isConsumed = todayLogs.some(log => log.foodId === food.id);
                                                                return `
                                                                    <div class="diet-item ${isConsumed ? 'completed' : ''}" data-food-id="${food.id}">
                                                                        <div class="d-flex justify-content-between align-items-center">
                                                                            <div class="flex-grow-1">
                                                                                <div class="d-flex align-items-center mb-2">
                                                                                    <button class="btn btn-sm ${isConsumed ? 'btn-success' : 'btn-outline-success'} me-3 toggle-food-consumption"
                                                                                            onclick="toggleFoodConsumption(${food.id}, '${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat}, '${meal.name}')"
                                                                                            title="${isConsumed ? 'Desmarcar como consumido' : 'Marcar como consumido'}">
                                                                                        <i class="fas fa-${isConsumed ? 'check-circle' : 'circle'}"></i>
                                                                                    </button>
                                                                                    <div>
                                                                                        <h6 class="mb-1 food-name ${isConsumed ? 'text-success text-decoration-line-through' : ''}">
                                                                                            ${food.name}
                                                                                        </h6>
                                                                                        <small class="text-muted">${food.quantity}</small>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="d-flex gap-2">
                                                                                    <span class="food-macro macro-protein">
                                                                                        <i class="fas fa-drumstick-bite me-1"></i>${food.protein}g P
                                                                                    </span>
                                                                                    <span class="food-macro macro-carbs">
                                                                                        <i class="fas fa-bread-slice me-1"></i>${food.carbs}g C
                                                                                    </span>
                                                                                    <span class="food-macro macro-fat">
                                                                                        <i class="fas fa-oil-can me-1"></i>${food.fat}g G
                                                                                    </span>
                                                                                    <span class="food-macro">
                                                                                        <i class="fas fa-fire me-1"></i>${food.calories} kcal
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="text-end">
                                                                                <small class="text-muted">${food.calories} kcal</small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                `;
                                                            }).join('')}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="empty-state">
                                    <div class="empty-state-icon">🍎</div>
                                    <h4>Nenhuma dieta configurada</h4>
                                    <p>Configure sua dieta para começar a acompanhar sua nutrição!</p>
                                    <button class="btn btn-primary" id="createDietBtn">
                                        <i class="fas fa-plus me-2"></i>Criar Dieta
                                    </button>
                                </div>
                            `}
                            
                            <!-- Food Log -->
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h5 class="mb-0"><i class="fas fa-history me-2"></i>Registro de Hoje</h5>
                                            <span class="badge bg-primary">${todayLogs.length} alimentos</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="food-log">
                                                ${todayLogs.length > 0 ? todayLogs.map(log => `
                                                    <div class="food-log-item">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 class="mb-1">${log.foodName}</h6>
                                                                <small class="text-muted">${log.quantity} • ${log.time}</small>
                                                                ${log.meal ? `<small class="d-block text-muted">${log.meal}</small>` : ''}
                                                            </div>
                                                            <div class="text-end">
                                                                <div class="fw-bold">${log.calories} kcal</div>
                                                                <div class="d-flex gap-1">
                                                                    <small class="macro-protein">${log.protein}g</small>
                                                                    <small class="macro-carbs">${log.carbs}g</small>
                                                                    <small class="macro-fat">${log.fat}g</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="removeFoodLog('${log.id}')">
                                                            <i class="fas fa-trash me-1"></i>Remover
                                                        </button>
                                                    </div>
                                                `).join('') : `
                                                    <div class="text-center py-4">
                                                        <div class="mb-3" style="font-size: 3rem; opacity: 0.3;">
                                                            <i class="fas fa-utensils"></i>
                                                        </div>
                                                        <h5 class="text-muted">Nenhum alimento registrado hoje</h5>
                                                        <p class="text-muted">Comece registrando seu primeiro alimento!</p>
                                                    </div>
                                                `}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Food Modal -->
        <div class="modal fade" id="foodModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Registrar Alimento</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="foodForm">
                            <div class="mb-3">
                                <label class="form-label">Nome do Alimento *</label>
                                <input type="text" class="form-control" id="foodName" required 
                                       placeholder="Ex: Peito de Frango">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Quantidade *</label>
                                    <input type="text" class="form-control" id="foodQuantity" required 
                                           placeholder="Ex: 200g ou 2 unidades">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Refeição</label>
                                    <select class="form-select" id="foodMeal">
                                        <option value="">Selecione uma refeição</option>
                                        <option value="Café da Manhã">Café da Manhã</option>
                                        <option value="Lanche da Manhã">Lanche da Manhã</option>
                                        <option value="Almoço">Almoço</option>
                                        <option value="Pré-Treino">Pré-Treino</option>
                                        <option value="Jantar">Jantar</option>
                                        <option value="Ceia">Ceia</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Horário</label>
                                    <input type="time" class="form-control" id="foodTime" 
                                           value="${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Calorias (kcal)</label>
                                    <input type="number" class="form-control" id="foodCalories" 
                                           placeholder="Ex: 240">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Proteínas (g)</label>
                                    <input type="number" class="form-control" id="foodProtein" 
                                           placeholder="Ex: 46">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Carboidratos (g)</label>
                                    <input type="number" class="form-control" id="foodCarbs" 
                                           placeholder="Ex: 0">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Gorduras (g)</label>
                                    <input type="number" class="form-control" id="foodFat" 
                                           placeholder="Ex: 5">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="saveFoodBtn">Registrar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Diet Management Modal -->
        <div class="modal fade" id="dietModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Gerenciar Dietas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="dietListContainer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Results Page
function getResultsPage() {
    const latestResult = results.length > 0 ? results[results.length - 1] : null;
    const previousResult = results.length > 1 ? results[results.length - 2] : null;
    
    return `
        <div class="container-fluid fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="mb-0"><i class="fas fa-chart-line me-2"></i>Status do Caçador</h3>
                            <div>
                                <button class="btn btn-primary" id="addResultBtn">
                                    <i class="fas fa-plus me-2"></i>Nova Medição
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <!-- Stats Overview -->
                            ${latestResult ? `
                                <div class="stats-grid mb-4">
                                    <div class="stat-item">
                                        <div class="stat-label">Peso Atual</div>
                                        <div class="stat-value">${latestResult.weight}</div>
                                        <small class="text-muted">kg</small>
                                        ${previousResult ? `
                                            <div class="trend-indicator ${latestResult.weight < previousResult.weight ? 'text-success' : 'text-danger'}">
                                                <i class="fas fa-${latestResult.weight < previousResult.weight ? 'arrow-down' : 'arrow-up'} me-1"></i>
                                                ${Math.abs(latestResult.weight - previousResult.weight).toFixed(1)} kg
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">IMC</div>
                                        <div class="stat-value ${getBMIColor(latestResult.bmi)}">${latestResult.bmi}</div>
                                        <small class="text-muted">${getBMICategory(latestResult.bmi)}</small>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Bíceps</div>
                                        <div class="stat-value">${latestResult.biceps}</div>
                                        <small class="text-muted">cm</small>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Cintura</div>
                                        <div class="stat-value ${latestResult.waist < 90 ? 'text-success' : 'text-warning'}">${latestResult.waist}</div>
                                        <small class="text-muted">cm</small>
                                    </div>
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Evolução de Peso</h5>
                                            </div>
                                            <div class="card-body">
                                                <div id="weightChart"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div id="resultsListContainer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Result Modal -->
        <div class="modal fade" id="resultModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nova Medição</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="resultForm">
                            <div class="mb-3">
                                <label class="form-label">Data *</label>
                                <input type="date" class="form-control" id="resultDate" 
                                       value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Peso (kg) *</label>
                                <input type="number" step="0.1" class="form-control" id="resultWeight" 
                                       placeholder="Ex: 75.5" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Bíceps (cm)</label>
                                    <input type="number" step="0.1" class="form-control" id="resultBiceps"
                                           placeholder="Ex: 38.5">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Cintura (cm)</label>
                                    <input type="number" step="0.1" class="form-control" id="resultWaist"
                                           placeholder="Ex: 85.0">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Peito (cm)</label>
                                    <input type="number" step="0.1" class="form-control" id="resultChest"
                                           placeholder="Ex: 105.0">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Quadril (cm)</label>
                                    <input type="number" step="0.1" class="form-control" id="resultHips"
                                           placeholder="Ex: 95.0">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="saveResultBtn">Salvar Medição</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Profile Page
function getProfilePage() {
    if (!currentUser) {
        return '<div class="loading"><div class="spinner-border"></div><p class="mt-3">Carregando perfil...</p></div>';
    }
    
    const hunter = hunterLevels[currentUser.id];
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    
    return `
        <div class="container-fluid fade-in">
            <!-- Profile Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <div class="d-flex align-items-center">
                                        <div class="profile-pic me-4" id="profilePicture">
                                            ${profilePics[currentUser.id] ? 
                                                `<img src="${profilePics[currentUser.id]}" alt="${currentUser.name}">` :
                                                `<span>${currentUser.profilePic || '👤'}</span>`}
                                            <input type="file" id="profilePicInput" class="profile-pic-input" 
                                                   accept="image/*" title="Clique para alterar foto">
                                        </div>
                                        <div>
                                            <h1 class="mb-1">${currentUser.name}</h1>
                                            <p class="text-muted mb-2">
                                                <i class="fas fa-envelope me-2"></i>${currentUser.email}
                                            </p>
                                            <div class="d-flex gap-2">
                                                <span class="badge bg-primary">
                                                    <i class="fas fa-dumbbell me-1"></i>${currentUser.experience}
                                                </span>
                                                <span class="badge bg-success">
                                                    <i class="fas fa-bullseye me-1"></i>${currentUser.goal}
                                                </span>
                                                <span class="badge bg-warning">
                                                    <i class="fas fa-trophy me-1"></i>Nível ${hunter?.level || 1}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-md-end">
                                    <button class="btn btn-primary" id="editProfileBtn">
                                        <i class="fas fa-edit me-2"></i>Editar Perfil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Info -->
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Informações do Caçador</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group list-group-flush">
                                <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                    <span class="text-muted">Nome Completo</span>
                                    <span class="fw-bold">${currentUser.name}</span>
                                </div>
                                <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                    <span class="text-muted">Email</span>
                                    <span>${currentUser.email}</span>
                                </div>
                                <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                    <span class="text-muted">Altura</span>
                                    <span class="fw-bold">${currentUser.height} cm</span>
                                </div>
                                <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                    <span class="text-muted">Idade</span>
                                    <span>${currentUser.age} anos</span>
                                </div>
                                <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                    <span class="text-muted">Experiência</span>
                                    <span class="badge bg-primary">${currentUser.experience}</span>
                                </div>
                                <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                    <span class="text-muted">Objetivo Principal</span>
                                    <span class="badge bg-success">${currentUser.goal}</span>
                                </div>
                                ${hunter ? `
                                    <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                        <span class="text-muted">Rank</span>
                                        <span class="hunter-rank">${hunter.rank}</span>
                                    </div>
                                    <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                        <span class="text-muted">Nível</span>
                                        <span class="badge bg-warning">${hunter.level}</span>
                                    </div>
                                    <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                        <span class="text-muted">XP Total</span>
                                        <span class="fw-bold text-neon-blue">${hunter.totalXP}</span>
                                    </div>
                                    <div class="list-group-item bg-transparent border-0 d-flex justify-content-between py-3">
                                        <span class="text-muted">Conquistas</span>
                                        <span class="badge bg-info">${unlockedAchievements}/${achievements.length}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-cog me-2"></i>Sistema do Caçador</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group list-group-flush">
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" id="exportDataBtn">
                                    <div>
                                        <i class="fas fa-download me-3"></i>
                                        <span>Exportar Dados</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" id="importDataBtn">
                                    <div>
                                        <i class="fas fa-upload me-3"></i>
                                        <span>Importar Dados</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" id="clearDataBtn">
                                    <div>
                                        <i class="fas fa-trash me-3"></i>
                                        <span>Limpar Dados Locais</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" onclick="window.saveToPhone()">
                                    <div>
                                        <i class="fas fa-mobile-alt me-3"></i>
                                        <span>Salvar como App</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" onclick="window.openUsersManager()">
                                    <div>
                                        <i class="fas fa-users me-3"></i>
                                        <span>Gerenciar Caçadores</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" onclick="showAllAchievements()">
                                    <div>
                                        <i class="fas fa-medal me-3"></i>
                                        <span>Ver Todas as Conquistas</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                            </div>
                            
                            <div class="mt-4 pt-3 border-top">
                                <h6 class="text-muted mb-3">Sobre o Sistema</h6>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <small class="text-muted d-block">Versão</small>
                                        <span class="fw-bold">3.0.0</span>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Armazenamento</small>
                                        <span class="fw-bold text-success">${Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
                                    </div>
                                </div>
                                <div class="row text-center mt-3">
                                    <div class="col-6">
                                        <small class="text-muted d-block">Treinos</small>
                                        <span class="fw-bold">${workouts.length}</span>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Registros de Comida</small>
                                        <span class="fw-bold">${foodLogs.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Profile Edit Modal -->
        <div class="modal fade" id="profileModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Perfil do Caçador</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="profileForm">
                            <div class="mb-3">
                                <label class="form-label">Nome Completo *</label>
                                <input type="text" class="form-control" id="profileName" 
                                       value="${currentUser.name}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" id="profileEmail" 
                                       value="${currentUser.email}" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Altura (cm)</label>
                                    <input type="number" class="form-control" id="profileHeight" 
                                           value="${currentUser.height}" min="100" max="250">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Idade</label>
                                    <input type="number" class="form-control" id="profileAge" 
                                           value="${currentUser.age}" min="10" max="100">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nível de Experiência</label>
                                <select class="form-select" id="profileExperience">
                                    <option value="Iniciante" ${currentUser.experience === 'Iniciante' ? 'selected' : ''}>Iniciante</option>
                                    <option value="Intermediário" ${currentUser.experience === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
                                    <option value="Avançado" ${currentUser.experience === 'Avançado' ? 'selected' : ''}>Avançado</option>
                                    <option value="Profissional" ${currentUser.experience === 'Profissional' ? 'selected' : ''}>Profissional</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Objetivo Principal</label>
                                <select class="form-select" id="profileGoal">
                                    <option value="Perda de peso" ${currentUser.goal === 'Perda de peso' ? 'selected' : ''}>Perda de peso</option>
                                    <option value="Ganho de massa" ${currentUser.goal === 'Ganho de massa' ? 'selected' : ''}>Ganho de massa</option>
                                    <option value="Definição muscular" ${currentUser.goal === 'Definição muscular' ? 'selected' : ''}>Definição muscular</option>
                                    <option value="Manutenção" ${currentUser.goal === 'Manutenção' ? 'selected' : ''}>Manutenção</option>
                                    <option value="Performance" ${currentUser.goal === 'Performance' ? 'selected' : ''}>Performance</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="saveProfileBtn">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper Functions
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidade';
}

function getBMIColor(bmi) {
    if (bmi < 18.5) return 'text-info';
    if (bmi < 25) return 'text-success';
    if (bmi < 30) return 'text-warning';
    return 'text-danger';
}

function getBMIBadgeClass(bmi) {
    if (bmi < 18.5) return 'bg-info';
    if (bmi < 25) return 'bg-success';
    if (bmi < 30) return 'bg-warning';
    return 'bg-danger';
}

function ensureCurrentUser() {
    if (currentUser) return;

    const firstUserId = Object.keys(users || {})[0];
    if (firstUserId && users[firstUserId]) {
        currentUser = users[firstUserId];
        localStorage.setItem('fitTrackCurrentUser', JSON.stringify(currentUser));
    }
}

function getDayName(abbreviation) {
    const days = {
        'Seg': 'Segunda-feira',
        'Ter': 'Terça-feira',
        'Qua': 'Quarta-feira',
        'Qui': 'Quinta-feira',
        'Sex': 'Sexta-feira',
        'Sáb': 'Sábado',
        'Dom': 'Domingo'
    };
    return days[abbreviation] || abbreviation;
}

// Normalize Exercise IDs
function normalizeExerciseIds() {
    if (!Array.isArray(workouts)) {
        workouts = [];
        return;
    }

    const timestamp = Date.now();
    workouts = workouts.map((workout, workoutIndex) => {
        const safeWorkout = workout && typeof workout === 'object' ? { ...workout } : {};
        safeWorkout.id = safeWorkout.id || timestamp + workoutIndex;
        safeWorkout.name = safeWorkout.name || 'Treino';
        safeWorkout.day = safeWorkout.day || 'Seg';
        safeWorkout.duration = safeWorkout.duration || '60 min';
        safeWorkout.completed = Boolean(safeWorkout.completed);
        safeWorkout.xp = Number.isFinite(safeWorkout.xp) ? safeWorkout.xp : 25;

        if (!Array.isArray(safeWorkout.exercises)) {
            safeWorkout.exercises = [];
        }

        safeWorkout.exercises = safeWorkout.exercises.map((exercise, index) => {
            const safeExercise = exercise && typeof exercise === 'object' ? { ...exercise } : {};
            safeExercise.id = safeExercise.id || `ex-${safeWorkout.id}-${index}-${timestamp}`;
            safeExercise.name = (safeExercise.name || '').toString();
            safeExercise.sets = (safeExercise.sets || '3x12').toString();
            safeExercise.completed = Boolean(safeExercise.completed);
            return safeExercise;
        });

        return safeWorkout;
    });

    saveData();
}

function initSpeedMap() {
    if (speedTracking.map || typeof L === 'undefined') return;

    const mapEl = document.getElementById('speedMap');
    if (!mapEl) return;

    speedTracking.map = L.map(mapEl, {
        zoomControl: true,
        attributionControl: true
    }).setView([-23.5505, -46.6333], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(speedTracking.map);

    speedTracking.polyline = L.polyline([], {
        color: '#00a8ff',
        weight: 4
    }).addTo(speedTracking.map);
}

function startSpeedTracking() {
    if (speedTracking.active) return;
    speedTracking.active = true;
    speedTracking.startTime = speedTracking.startTime || Date.now();
    setSpeedStatus('Ativo', 'bg-success');
    updateSpeedControls();
    showToast('Rastreamento iniciado', 'info');

    if (!navigator.geolocation) {
        showToast('Geolocalizacao nao suportada no navegador', 'error');
        stopSpeedTracking();
        return;
    }

    speedTracking.watchId = navigator.geolocation.watchPosition(
        handleSpeedPosition,
        handleSpeedError,
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
        }
    );

    if (!speedTracking.timerId) {
        speedTracking.timerId = setInterval(updateSpeedStats, 1000);
    }
}

function pauseSpeedTracking() {
    if (!speedTracking.active) return;
    speedTracking.active = false;
    setSpeedStatus('Pausado', 'bg-warning');

    if (speedTracking.watchId !== null) {
        navigator.geolocation.clearWatch(speedTracking.watchId);
        speedTracking.watchId = null;
    }

    if (speedTracking.timerId) {
        clearInterval(speedTracking.timerId);
        speedTracking.timerId = null;
    }

    updateSpeedControls();
}

function stopSpeedTracking() {
    pauseSpeedTracking();
    setSpeedStatus('Finalizado', 'bg-danger');
    updateSpeedControls();
}

function resetSpeedTracking() {
    stopSpeedTracking();
    speedTracking.path = [];
    speedTracking.totalDistance = 0;
    speedTracking.lastXpKm = 0;
    speedTracking.startTime = null;
    setSpeedStatus('Parado', 'bg-secondary');

    if (speedTracking.polyline) {
        speedTracking.polyline.setLatLngs([]);
    }
    if (speedTracking.startMarker) {
        speedTracking.map.removeLayer(speedTracking.startMarker);
        speedTracking.startMarker = null;
    }
    if (speedTracking.currentMarker) {
        speedTracking.map.removeLayer(speedTracking.currentMarker);
        speedTracking.currentMarker = null;
    }

    updateSpeedStats();
}

function handleSpeedPosition(position) {
    if (!speedTracking.map) return;

    const { latitude, longitude, accuracy } = position.coords;
    if (accuracy && accuracy > 50) {
        return;
    }

    const point = [latitude, longitude];
    const lastPoint = speedTracking.path[speedTracking.path.length - 1];

    if (!lastPoint) {
        speedTracking.path.push(point);
        speedTracking.startMarker = L.marker(point).addTo(speedTracking.map);
        speedTracking.currentMarker = L.marker(point).addTo(speedTracking.map);
        speedTracking.map.setView(point, 16);
        speedTracking.polyline.setLatLngs(speedTracking.path);
        updateSpeedStats();
        return;
    }

    const distanceKm = haversineDistanceKm(lastPoint[0], lastPoint[1], point[0], point[1]);
    if (distanceKm < 0.005) return;

    speedTracking.totalDistance += distanceKm;
    speedTracking.path.push(point);
    speedTracking.polyline.setLatLngs(speedTracking.path);

    if (speedTracking.currentMarker) {
        speedTracking.currentMarker.setLatLng(point);
    }

    const newKm = Math.floor(speedTracking.totalDistance);
    if (newKm > speedTracking.lastXpKm) {
        for (let km = speedTracking.lastXpKm + 1; km <= newKm; km += 1) {
            addXP(25, `Percorreu ${km} km`);
            showToast(`+25 XP por ${km} km`, 'success');
        }
        speedTracking.lastXpKm = newKm;
    }

    updateSpeedStats();
}

function handleSpeedError(error) {
    console.error('Erro de geolocalizacao:', error);
    showToast('Nao foi possivel acessar a localizacao', 'error');
    stopSpeedTracking();
}

function updateSpeedStats() {
    const distanceEl = document.getElementById('speedDistance');
    const timeEl = document.getElementById('speedTime');
    const avgEl = document.getElementById('speedAvg');

    const elapsed = speedTracking.startTime ? Date.now() - speedTracking.startTime : 0;
    const distanceKm = speedTracking.totalDistance;
    const hours = elapsed / 3600000;
    const avg = hours > 0 ? distanceKm / hours : 0;

    if (distanceEl) distanceEl.textContent = `${distanceKm.toFixed(2)} km`;
    if (timeEl) timeEl.textContent = formatDuration(elapsed);
    if (avgEl) avgEl.textContent = `${avg.toFixed(1)} km/h`;
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const toRad = value => value * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Setup Workout Events
function setupWorkoutEvents() {
    renderWorkoutList();
    
    const addWorkoutBtn = document.getElementById('addWorkoutBtn');
    if (addWorkoutBtn) {
        addWorkoutBtn.addEventListener('click', () => {
            const modalElement = document.getElementById('workoutModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        });
    }
    
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', addExerciseField);
    }
    
    const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
    if (saveWorkoutBtn) {
        saveWorkoutBtn.addEventListener('click', saveWorkout);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-exercise')) {
            const exerciseItem = e.target.closest('.exercise-item');
            if (exerciseItem) {
                const container = document.getElementById('exercisesContainer');
                if (container.children.length > 1) {
                    exerciseItem.remove();
                    
                    const removeButtons = container.querySelectorAll('.remove-exercise');
                    removeButtons.forEach(btn => {
                        btn.disabled = container.children.length <= 1;
                    });
                }
            }
        }
    });
}

// Setup Diet Events
function setupDietEvents() {
    const addFoodBtn = document.getElementById('addFoodBtn');
    if (addFoodBtn) {
        addFoodBtn.addEventListener('click', () => {
            const modalElement = document.getElementById('foodModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        });
    }
    
    const manageDietsBtn = document.getElementById('manageDietsBtn');
    if (manageDietsBtn) {
        manageDietsBtn.addEventListener('click', () => {
            const modalElement = document.getElementById('dietModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                loadDietManagement();
            }
        });
    }
    
    const createDietBtn = document.getElementById('createDietBtn');
    if (createDietBtn) {
        createDietBtn.addEventListener('click', () => {
            const modalElement = document.getElementById('dietModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                loadDietManagement();
            }
        });
    }
    
    const saveFoodBtn = document.getElementById('saveFoodBtn');
    if (saveFoodBtn) {
        saveFoodBtn.addEventListener('click', saveFoodLog);
    }
}

// Setup Speed Events
function setupSpeedEvents() {
    initSpeedMap();
    updateSpeedStats();
    updateSpeedControls();

    const startBtn = document.getElementById('speedStartBtn');
    const pauseBtn = document.getElementById('speedPauseBtn');
    const stopBtn = document.getElementById('speedStopBtn');
    const resetBtn = document.getElementById('speedResetBtn');

    if (startBtn) startBtn.addEventListener('click', startSpeedTracking);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseSpeedTracking);
    if (stopBtn) stopBtn.addEventListener('click', stopSpeedTracking);
    if (resetBtn) resetBtn.addEventListener('click', resetSpeedTracking);
}

function updateSpeedControls() {
    const startBtn = document.getElementById('speedStartBtn');
    const pauseBtn = document.getElementById('speedPauseBtn');
    const stopBtn = document.getElementById('speedStopBtn');
    const isActive = speedTracking.active;

    if (startBtn) startBtn.disabled = isActive;
    if (pauseBtn) pauseBtn.disabled = !isActive;
    if (stopBtn) stopBtn.disabled = !isActive;
}

function setSpeedStatus(label, className) {
    const statusEl = document.getElementById('speedStatus');
    if (!statusEl) return;
    statusEl.textContent = label;
    statusEl.className = `badge ${className}`;
}

// Setup Results Events
function setupResultsEvents() {
    renderResultsList();
    
    const addResultBtn = document.getElementById('addResultBtn');
    if (addResultBtn) {
        addResultBtn.addEventListener('click', () => {
            const modalElement = document.getElementById('resultModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        });
    }
    
    const saveResultBtn = document.getElementById('saveResultBtn');
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', saveResult);
    }
}

// Setup Profile Events
function setupProfileEvents() {
    const profilePicInput = document.getElementById('profilePicInput');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }
    
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            const modalElement = document.getElementById('profileModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        });
    }
    
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    const importDataBtn = document.getElementById('importDataBtn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importAllUsersData);
    }
    
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearData);
    }
}

// Handle Profile Picture Upload
function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione uma imagem válida (JPG, PNG, GIF)', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter menos de 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        profilePics[currentUser.id] = e.target.result;
        saveData();
        
        const profilePicElement = document.querySelector('#profilePicture');
        if (profilePicElement) {
            profilePicElement.innerHTML = `
                <img src="${e.target.result}" alt="${currentUser.name}">
                <input type="file" id="profilePicInput" class="profile-pic-input" accept="image/*" title="Clique para alterar foto">
            `;
            document.getElementById('profilePicInput')?.addEventListener('change', handleProfilePicUpload);
        }
        
        updateUserSidebar();
        showToast('Foto de perfil atualizada com sucesso!', 'success');
    };
    reader.onerror = function() {
        showToast('Erro ao carregar a imagem', 'error');
    };
    reader.readAsDataURL(file);
}

// Save Profile
function saveProfile() {
    if (!currentUser) {
        showToast('Erro: caçador não encontrado', 'error');
        return;
    }
    
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const height = parseInt(document.getElementById('profileHeight').value) || currentUser.height;
    const age = parseInt(document.getElementById('profileAge').value) || currentUser.age;
    const experience = document.getElementById('profileExperience').value;
    const goal = document.getElementById('profileGoal').value;
    
    if (!name) {
        showToast('Por favor, digite seu nome', 'warning');
        return;
    }
    
    if (!email || !email.includes('@')) {
        showToast('Por favor, digite um email válido', 'warning');
        return;
    }
    
    if (height < 100 || height > 250) {
        showToast('Altura deve estar entre 100 e 250 cm', 'warning');
        return;
    }
    
    if (age < 10 || age > 100) {
        showToast('Idade deve estar entre 10 e 100 anos', 'warning');
        return;
    }
    
    currentUser.name = name;
    currentUser.email = email;
    currentUser.height = height;
    currentUser.age = age;
    currentUser.experience = experience;
    currentUser.goal = goal;
    
    users[currentUser.id] = currentUser;
    
    saveData();
    
    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    loadPage('profile');
    showToast('Perfil atualizado com sucesso!', 'success');
}

// Export Data
function exportData() {
    const exportAll = confirm('Deseja exportar:\n\n• Apenas dados do caçador atual\n• Dados de todos os caçadores');
    
    if (exportAll === null) return;
    
    if (exportAll) {
        exportAllUsersData();
    } else {
        const data = {
            user: currentUser,
            workouts: workouts,
            results: results,
            diets: diets,
            foodLogs: foodLogs,
            profilePics: profilePics,
            hunterLevels: hunterLevels,
            achievements: achievements,
            dailyQuests: dailyQuests,
            exportDate: new Date().toISOString(),
            version: '3.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hunters-gym-backup-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Dados do caçador atual exportados com sucesso!', 'success');
    }
}

// Clear Data
function clearData() {
    if (!confirm('⚠️ ATENÇÃO: Isso apagará TODOS os dados de TODOS os caçadores. Esta ação NÃO pode ser desfeita. Deseja continuar?')) {
        return;
    }
    
    localStorage.clear();
    initializeApp();
    showToast('Todos os dados foram limpos com sucesso!', 'success');
}

// Add Exercise Field
function addExerciseField() {
    const container = document.getElementById('exercisesContainer');
    if (!container) return;
    
    const exerciseCount = container.children.length;
    
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item mb-2';
    exerciseDiv.innerHTML = `
        <div class="row g-2">
            <div class="col-md-6">
                <input type="text" class="form-control exercise-name" placeholder="Nome do exercício">
            </div>
            <div class="col-md-4">
                <input type="text" class="form-control exercise-sets" placeholder="Séries (ex: 3x12)">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-outline-danger w-100 remove-exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    const removeButtons = container.querySelectorAll('.remove-exercise');
    if (removeButtons.length > 1) {
        removeButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

// Save Workout
function saveWorkout() {
    const name = document.getElementById('workoutName').value.trim();
    const day = document.getElementById('workoutDay').value;
    const duration = document.getElementById('workoutDuration').value.trim();
    const xp = parseInt(document.getElementById('workoutXP').value) || 25;
    
    if (!name) {
        showToast('Por favor, digite um nome para a missão', 'warning');
        return;
    }
    
    if (!day) {
        showToast('Por favor, selecione um dia da semana', 'warning');
        return;
    }
    
    const exercises = [];
    const exercisesContainer = document.getElementById('exercisesContainer');
    const exerciseItems = exercisesContainer ? exercisesContainer.querySelectorAll('.exercise-item') : [];
    exerciseItems.forEach(item => {
        const nameInput = item.querySelector('.exercise-name');
        const setsInput = item.querySelector('.exercise-sets');
        
        if (nameInput?.value.trim()) {
            const uniqueId = `ex-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            exercises.push({
                id: uniqueId,
                name: nameInput.value.trim(),
                sets: setsInput?.value.trim() || '3x12',
                completed: false
            });
        }
    });
    
    const workout = {
        id: Date.now(),
        name: name,
        day: day,
        duration: duration || '60 min',
        exercises: exercises,
        completed: false,
        xp: xp,
        created: new Date().toISOString()
    };
    
    workouts.push(workout);
    saveData();
    
    const modalElement = document.getElementById('workoutModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    const workoutForm = document.getElementById('workoutForm');
    if (workoutForm) {
        workoutForm.reset();
    }
    
    if (exercisesContainer) {
        exercisesContainer.innerHTML = `
            <div class="exercise-item mb-2">
                <div class="row g-2">
                    <div class="col-md-6">
                        <input type="text" class="form-control exercise-name" placeholder="Nome do exercício">
                    </div>
                    <div class="col-md-4">
                        <input type="text" class="form-control exercise-sets" placeholder="Séries (ex: 3x12)">
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger w-100 remove-exercise" disabled>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderWorkoutList();
    showToast('Missão de treino adicionada com sucesso!', 'success');
}

// Save Result
function saveResult() {
    const date = document.getElementById('resultDate').value;
    const weight = parseFloat(document.getElementById('resultWeight').value);
    const biceps = parseFloat(document.getElementById('resultBiceps').value) || 0;
    const waist = parseFloat(document.getElementById('resultWaist').value) || 0;
    const chest = parseFloat(document.getElementById('resultChest').value) || 0;
    const hips = parseFloat(document.getElementById('resultHips').value) || 0;
    
    if (!date) {
        showToast('Por favor, selecione uma data', 'warning');
        return;
    }
    
    if (!weight || weight <= 0) {
        showToast('Por favor, digite um peso válido', 'warning');
        return;
    }
    
    if (weight > 300) {
        showToast('Peso inválido. Digite um valor realista.', 'warning');
        return;
    }
    
    const bmi = calculateBMI(weight, currentUser.height);
    
    const result = {
        id: Date.now(),
        date: new Date(date).toLocaleDateString('pt-BR'),
        weight: parseFloat(weight.toFixed(1)),
        biceps: parseFloat(biceps.toFixed(1)),
        waist: parseFloat(waist.toFixed(1)),
        chest: parseFloat(chest.toFixed(1)),
        hips: parseFloat(hips.toFixed(1)),
        bmi: parseFloat(bmi)
    };
    
    results.push(result);
    addXP(15, "Registrou medição");
    saveData();
    
    const modalElement = document.getElementById('resultModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    const resultForm = document.getElementById('resultForm');
    if (resultForm) {
        resultForm.reset();
        document.getElementById('resultDate').value = new Date().toISOString().split('T')[0];
    }
    
    renderResultsList();
    showToast('Medição registrada com sucesso! +15 XP', 'success');
}

// Calculate BMI
function calculateBMI(weight, height) {
    return (weight / ((height / 100) ** 2)).toFixed(1);
}

// Initialize Weight Chart
function initWeightChart() {
    const container = document.getElementById('weightChart');
    if (!container) return;

    if (results.length < 2) {
        container.innerHTML = `
            <div class="empty-chart-state">
                <i class="fas fa-chart-bar"></i>
                <p>Adicione mais medições para ver o gráfico</p>
            </div>
        `;
        return;
    }

    const recentResults = results.slice(-6);
    const barCount = recentResults.length;
    const chartHeight = 200;
    const barSpacing = 10;
    const availableWidth = 400;
    const barWidth = Math.min(40, (availableWidth - (barSpacing * (barCount - 1))) / barCount);

    const weights = recentResults.map(r => Number(r.weight));
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const weightRange = Math.max(maxWeight - minWeight, 2);
    const baseWeight = recentResults[0].weight;

    let html = `
        <div class="bar-chart-container">
            <div class="chart-header">
                <h6>Evolução de Peso</h6>
            </div>
            <div class="bar-chart">
                <div class="chart-body">
                    <div class="y-axis">
    `;

    const yStep = weightRange / 4;
    for (let i = 4; i >= 0; i--) {
        const value = (minWeight + (yStep * i)).toFixed(1);
        html += `<div class="y-label">${value}kg</div>`;
    }

    html += `
                    </div>
                    <div class="bars-container">
                        <div class="grid-lines">
    `;

    for (let i = 0; i <= 4; i++) {
        const top = (i * chartHeight) / 4;
        html += `<div class="grid-line" style="top:${top}px"></div>`;
    }

    html += `
                        </div>
                        <div class="bars">
    `;

    const positiveColor = '#4cd137';
    const negativeColor = '#e84118';

    recentResults.forEach((result, index) => {
        const currentWeight = Number(result.weight);
        const diffFromStart = currentWeight - baseWeight;
        const barHeight = ((currentWeight - minWeight) / weightRange) * chartHeight;
        const barLeft = index * (barWidth + barSpacing);
        
        let barColor;
        let diffText = '';
        
        if (index === 0) {
            barColor = '#00a8ff';
            diffText = 'Início';
        } else {
            barColor = diffFromStart >= 0 ? negativeColor : positiveColor;
            diffText = diffFromStart >= 0 ? 
                `+${diffFromStart.toFixed(1)}kg` : 
                `${diffFromStart.toFixed(1)}kg`;
        }

        html += `
            <div class="bar-group" style="left:${barLeft}px; width:${barWidth}px">
                <div class="bar-wrapper">
                    <div class="bar-base-line"></div>
                    <div class="bar" 
                         style="height:${barHeight}px; 
                                background: linear-gradient(to top, ${barColor}, ${barColor}80);"
                         data-weight="${result.weight}kg" 
                         data-date="${result.date}"
                         data-diff="${diffText}">
                    </div>
                </div>
                <div class="bar-label">
                    <div class="weight-value">${result.weight}kg</div>
                    ${index > 0 ? `<div class="diff-value ${diffFromStart >= 0 ? 'positive' : 'negative'}">${diffText}</div>` : ''}
                </div>
                <div class="bar-date">${result.date.split('/')[0] || ''}</div>
            </div>
        `;
    });

    html += `
                        </div>
                    </div>
                </div>
            </div>
            <div class="chart-info">
                <div class="legend">
                    <span class="legend-item"><span class="legend-color" style="background: #00a8ff"></span> Ponto inicial</span>
                    <span class="legend-item"><span class="legend-color" style="background: #4cd137"></span> Perda (-)</span>
                    <span class="legend-item"><span class="legend-color" style="background: #e84118"></span> Ganho (+)</span>
                </div>
                <small class="text-muted">Comparação com a primeira medição: ${baseWeight}kg</small>
            </div>
        </div>
    `;

    container.innerHTML = html;
    
    setTimeout(() => {
        document.querySelectorAll('.bar').forEach(bar => {
            bar.addEventListener('mouseenter', function() {
                this.style.transform = 'scaleY(1.05)';
                this.style.boxShadow = '0 0 15px rgba(76, 209, 55, 0.5)';
                
                const tooltip = document.createElement('div');
                tooltip.className = 'bar-tooltip';
                const weight = this.dataset.weight;
                const date = this.dataset.date;
                const diff = this.dataset.diff;
                
                tooltip.innerHTML = `
                    <div><strong>${weight}</strong></div>
                    <div>${date}</div>
                    ${diff ? `<div class="diff-tooltip">${diff}</div>` : ''}
                `;
                
                tooltip.style.position = 'absolute';
                tooltip.style.bottom = '100%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '10px 15px';
                tooltip.style.borderRadius = '8px';
                tooltip.style.fontSize = '12px';
                tooltip.style.zIndex = '100';
                tooltip.style.minWidth = '140px';
                tooltip.style.textAlign = 'center';
                tooltip.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                
                this.appendChild(tooltip);
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'scaleY(1)';
                this.style.boxShadow = 'none';
                const tooltip = this.querySelector('.bar-tooltip');
                if (tooltip) tooltip.remove();
            });
        });
    }, 100);
    
    const styleId = 'bar-chart-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .bar-chart-container {
                position: relative;
                padding: 15px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chart-header {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .chart-header h6 {
                color: var(--text-primary);
                font-weight: 600;
                margin: 0;
                font-size: 1.1rem;
            }
            
            .bar-chart {
                width: 100%;
                overflow-x: auto;
                padding: 10px 0;
            }
            
            .bar-chart::-webkit-scrollbar {
                height: 6px;
            }
            
            .bar-chart::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
            }
            
            .bar-chart::-webkit-scrollbar-thumb {
                background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                border-radius: 3px;
            }
            
            .chart-body {
                display: flex;
                height: ${chartHeight}px;
                min-width: 500px;
            }
            
            .y-axis {
                width: 50px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding-right: 15px;
                border-right: 1px solid rgba(255, 255, 255, 0.2);
                flex-shrink: 0;
            }
            
            .y-label {
                color: var(--text-muted);
                font-size: 11px;
                text-align: right;
                line-height: 20px;
            }
            
            .bars-container {
                flex: 1;
                position: relative;
                margin-left: 10px;
            }
            
            .grid-lines {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
            
            .grid-line {
                position: absolute;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .bars {
                position: relative;
                height: 100%;
                display: flex;
                align-items: flex-end;
                padding-bottom: 25px;
            }
            
            .bar-group {
                position: absolute;
                bottom: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: all 0.3s ease;
            }
            
            .bar-wrapper {
                position: relative;
                width: 100%;
                height: ${chartHeight}px;
                display: flex;
                align-items: flex-end;
            }
            
            .bar-base-line {
                position: absolute;
                top: ${((baseWeight - minWeight) / weightRange) * chartHeight}px;
                left: -5px;
                right: -5px;
                height: 2px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 1px;
                z-index: 1;
            }
            
            .bar {
                width: 100%;
                border-radius: 6px 6px 0 0;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                z-index: 2;
                min-height: 3px;
            }
            
            .bar:hover {
                opacity: 0.9;
                filter: brightness(1.1);
            }
            
            .bar-label {
                margin-top: 8px;
                font-size: 11px;
                text-align: center;
                white-space: nowrap;
                width: 100%;
            }
            
            .weight-value {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 2px;
            }
            
            .diff-value {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                margin-top: 2px;
                font-weight: 600;
            }
            
            .diff-value.positive {
                color: #4cd137;
                background: rgba(76, 209, 55, 0.15);
            }
            
            .diff-value.negative {
                color: #e84118;
                background: rgba(232, 65, 24, 0.15);
            }
            
            .bar-date {
                margin-top: 5px;
                font-size: 10px;
                color: var(--text-muted);
                text-align: center;
                white-space: nowrap;
            }
            
            .chart-info {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
            }
            
            .legend {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 3px;
                display: inline-block;
            }
            
            .diff-tooltip {
                margin-top: 4px;
                padding: 2px 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                font-weight: 600;
            }
            
            .bar-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
            }
            
            .empty-chart-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-muted);
            }
            
            .empty-chart-state i {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }
            
            @media (max-width: 768px) {
                .chart-body {
                    min-width: 400px;
                }
                
                .bar-group {
                    min-width: 35px;
                }
                
                .bar-label {
                    font-size: 10px;
                }
                
                .bar-date {
                    font-size: 9px;
                }
                
                .legend {
                    flex-direction: column;
                    gap: 8px;
                    align-items: flex-start;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Render Workout List
function renderWorkoutList() {
    const container = document.getElementById('workoutListContainer');
    if (!container) return;
    
    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏋️‍♂️</div>
                <h4>Nenhuma missão de treino</h4>
                <p>Comece adicionando sua primeira missão!</p>
                <button class="btn btn-primary" id="addFirstWorkoutBtn">
                    <i class="fas fa-plus me-2"></i>Criar Primeira Missão
                </button>
            </div>
        `;
        
        const addFirstWorkoutBtn = document.getElementById('addFirstWorkoutBtn');
        if (addFirstWorkoutBtn) {
            addFirstWorkoutBtn.addEventListener('click', () => {
                const modalElement = document.getElementById('workoutModal');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            });
        }
        return;
    }
    
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const workoutsByDay = {};
    days.forEach(day => {
        workoutsByDay[day] = workouts.filter(w => w.day === day);
    });
    
    let html = '<div class="row">';
    
    days.forEach(day => {
        const dayWorkouts = workoutsByDay[day];
        const dayName = getDayName(day);
        const completedCount = dayWorkouts.filter(w => w.completed).length;
        const totalCount = dayWorkouts.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${dayName}</h5>
                        <div>
                            <span class="badge ${totalCount > 0 ? 'bg-primary' : 'bg-secondary'} me-2">
                                ${totalCount} missão${totalCount !== 1 ? 's' : ''}
                            </span>
                            ${totalCount > 0 ? `
                                <span class="badge ${completionRate === 100 ? 'bg-success' : 'bg-warning'}">
                                    ${completionRate}%
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-body">
                        ${dayWorkouts.length > 0 ? dayWorkouts.map(workout => {
                            const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
                            const completedExercises = exercises.filter(e => e.completed).length;
                            const totalExercises = exercises.length;
                            const exerciseRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
                            
                            return `
                                <div class="workout-item mb-3 ${workout.completed ? 'completed' : ''}" data-id="${workout.id}">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <div class="d-flex align-items-center mb-2">
                                                <h6 class="mb-0 me-2">${workout.name}</h6>
                                                <span class="badge ${workout.completed ? 'bg-success' : 'bg-warning'}">
                                                    ${workout.completed ? 'Concluído' : 'Pendente'}
                                                </span>
                                                <span class="badge bg-info ms-2">
                                                    ${workout.xp} XP
                                                </span>
                                            </div>
                                            <small class="text-muted d-block">
                                                <i class="fas fa-clock me-1"></i>${workout.duration}
                                            </small>
                                            
                                            ${exercises.length > 0 ? `
                                                <div class="mt-3">
                                                    <small class="text-muted d-block mb-2">Exercícios:</small>
                                                    <div class="exercises-list">
                                                        ${exercises.map((ex, index) => {
                                                            const exerciseId = ex.id || `ex-${workout.id}-${index}`;
                                                            return `
                                                                <div class="exercise-item ${ex.completed ? 'completed' : ''} mb-2" data-exercise-id="${exerciseId}">
                                                                    <div class="d-flex align-items-center">
                                                                        <button class="btn btn-sm ${ex.completed ? 'btn-success' : 'btn-outline-success'} exercise-check me-2" 
                                                                                onclick="toggleExercise('${workout.id}', '${exerciseId}')"
                                                                                title="${ex.completed ? 'Marcar como não feito' : 'Marcar como feito'}">
                                                                            <i class="fas fa-${ex.completed ? 'check-circle' : 'circle'}"></i>
                                                                        </button>
                                                                        <div class="flex-grow-1">
                                                                            <div class="d-flex justify-content-between align-items-center">
                                                                                <span class="${ex.completed ? 'text-success text-decoration-line-through' : 'text-light'}">
                                                                                    ${ex.name}
                                                                                </span>
                                                                                <small class="text-muted">${ex.sets}</small>
                                                                            </div>
                                                                            ${ex.completed ? `
                                                                                <small class="text-success">
                                                                                    <i class="fas fa-check me-1"></i>Concluído
                                                                                </small>
                                                                            ` : ''}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }).join('')}
                                                    </div>
                                                    
                                                    <div class="mt-3">
                                                        <small class="text-muted d-block mb-1">Progresso:</small>
                                                        <div class="progress" style="height:8px">
                                                            <div class="progress-bar" style="width:${exerciseRate}%"></div>
                                                        </div>
                                                        <small class="text-muted">
                                                            ${completedExercises}/${totalExercises} exercícios
                                                        </small>
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div class="d-flex flex-column gap-2 ms-3">
                                            <button class="btn btn-sm btn-outline-info" 
                                                    onclick="viewWorkoutExercises(${workout.id})" 
                                                    title="Ver/Editar exercícios">
                                                <i class="fas fa-list"></i>
                                            </button>
                                            <button class="btn btn-sm ${workout.completed ? 'btn-success' : 'btn-outline-success'}" 
                                                    onclick="toggleWorkout(${workout.id})" 
                                                    title="${workout.completed ? 'Marcar como pendente' : 'Marcar como concluído'}">
                                                <i class="fas fa-${workout.completed ? 'check' : 'circle'}"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" 
                                                    onclick="deleteWorkout(${workout.id})" 
                                                    title="Excluir missão">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') : `
                            <div class="text-center py-4">
                                <div class="mb-2" style="font-size:2rem;opacity:0.3">
                                    <i class="fas fa-dumbbell"></i>
                                </div>
                                <p class="text-muted mb-3">Nenhuma missão para ${dayName.toLowerCase()}</p>
                                <button class="btn btn-sm btn-outline-primary" onclick="addWorkoutForDay('${day}')">
                                    <i class="fas fa-plus me-1"></i>Adicionar
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Render Results List
function renderResultsList() {
    const container = document.getElementById('resultsListContainer');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📏</div>
                <h4>Nenhuma medição registrada</h4>
                <p>Comece registrando sua primeira medição!</p>
                <button class="btn btn-primary" id="addFirstResultBtn">
                    <i class="fas fa-plus me-2"></i>Registrar Primeira Medição
                </button>
            </div>
        `;
        
        const addFirstResultBtn = document.getElementById('addFirstResultBtn');
        if (addFirstResultBtn) {
            addFirstResultBtn.addEventListener('click', () => {
                const modalElement = document.getElementById('resultModal');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            });
        }
        return;
    }
    
    const latestResult = results[results.length - 1];
    const previousResult = results.length > 1 ? results[results.length - 2] : null;
    
    let html = `
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-history me-2"></i>Histórico Completo</h5>
                        <span class="badge bg-primary">${results.length} medições</span>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th class="text-nowrap">Data</th>
                                        <th class="text-nowrap">Peso (kg)</th>
                                        <th class="text-nowrap">Bíceps (cm)</th>
                                        <th class="text-nowrap">Cintura (cm)</th>
                                        <th class="text-nowrap">Peito (cm)</th>
                                        <th class="text-nowrap">Quadril (cm)</th>
                                        <th class="text-nowrap">IMC</th>
                                        <th class="text-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;
    
    results.slice().reverse().forEach(result => {
        html += `
            <tr>
                <td class="text-nowrap"><strong>${result.date}</strong></td>
                <td class="text-nowrap">${result.weight}</td>
                <td class="text-nowrap">${result.biceps}</td>
                <td class="text-nowrap">${result.waist}</td>
                <td class="text-nowrap">${result.chest}</td>
                <td class="text-nowrap">${result.hips}</td>
                <td class="text-nowrap">
                    <span class="badge ${getBMIBadgeClass(result.bmi)}">
                        ${result.bmi}
                    </span>
                </td>
                <td class="text-nowrap">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteResult(${result.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Global Functions
window.toggleWorkout = function(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
        workout.completed = !workout.completed;
        if (workout.completed) {
            addXP(workout.xp || 25, `Completou ${workout.name}`);
        }
        saveData();
        renderWorkoutList();
        showToast(`Missão ${workout.completed ? 'concluída' : 'marcada como pendente'}!`, 'success');
    }
};

window.toggleExercise = function(workoutId, exerciseId) {
    const workout = workouts.find(w => w.id == workoutId);
    if (!workout) {
        console.error('Workout not found:', workoutId);
        return;
    }
    if (!Array.isArray(workout.exercises)) {
        workout.exercises = [];
    }

    const exercise = workout.exercises.find(e => e.id == exerciseId);
    if (!exercise) {
        console.error('Exercise not found:', exerciseId);
        console.log('Available exercises:', workout.exercises.map(e => ({ id: e.id, name: e.name })));
        return;
    }
    
    exercise.completed = !exercise.completed;
    
    const allExercisesCompleted = workout.exercises.every(e => e.completed);
    if (allExercisesCompleted && !workout.completed) {
        workout.completed = true;
        addXP(workout.xp || 25, `Completou ${workout.name}`);
        showToast('🎉 Todos os exercícios concluídos! Missão marcada como completa.', 'success');
    } else if (!allExercisesCompleted && workout.completed) {
        workout.completed = false;
        showToast('Missão marcada como pendente pois há exercícios incompletos.', 'warning');
    }
    
    saveData();
    renderWorkoutList();
    
    showToast(`"${exercise.name}" ${exercise.completed ? 'concluído' : 'pendente'}!`, 'info');
};

window.deleteWorkout = function(workoutId) {
    if (confirm('Tem certeza que deseja excluir esta missão de treino?')) {
        workouts = workouts.filter(w => w.id !== workoutId);
        saveData();
        renderWorkoutList();
        showToast('Missão excluída com sucesso!', 'success');
    }
};

window.deleteResult = function(resultId) {
    if (confirm('Tem certeza que deseja excluir esta medição?')) {
        results = results.filter(r => r.id !== resultId);
        saveData();
        renderResultsList();
        showToast('Medição excluída com sucesso!', 'success');
    }
};

window.addWorkoutForDay = function(day) {
    const modalElement = document.getElementById('workoutModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        document.getElementById('workoutDay').value = day;
        modal.show();
    }
};

// Toggle Food Consumption
window.toggleFoodConsumption = function(foodId, foodName, calories, protein, carbs, fat, meal) {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = foodLogs.find(log => 
        log.date === today && log.foodId === foodId
    );
    
    if (existingLog) {
        foodLogs = foodLogs.filter(log => log.id !== existingLog.id);
        showToast(`${foodName} removido do registro`, 'warning');
    } else {
        const foodLog = {
            id: Date.now(),
            date: today,
            foodId: foodId,
            foodName: foodName,
            quantity: "1 porção",
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            meal: meal,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
            timestamp: new Date().toISOString()
        };
        
        foodLogs.push(foodLog);
        addXP(5, `Consumiu ${foodName}`);
        showToast(`${foodName} registrado! +5 XP`, 'success');
    }
    
    saveDietData();
    loadPage('diet');
};

// Remove Food Log
window.removeFoodLog = function(logId) {
    foodLogs = foodLogs.filter(log => log.id !== logId);
    saveDietData();
    loadPage('diet');
    showToast('Registro de alimento removido', 'warning');
};

// Save Food Log
function saveFoodLog() {
    const name = document.getElementById('foodName').value.trim();
    const quantity = document.getElementById('foodQuantity').value.trim();
    const meal = document.getElementById('foodMeal').value;
    const time = document.getElementById('foodTime').value;
    const calories = parseInt(document.getElementById('foodCalories').value) || 0;
    const protein = parseInt(document.getElementById('foodProtein').value) || 0;
    const carbs = parseInt(document.getElementById('foodCarbs').value) || 0;
    const fat = parseInt(document.getElementById('foodFat').value) || 0;
    
    if (!name || !quantity) {
        showToast('Por favor, preencha o nome e quantidade do alimento', 'warning');
        return;
    }
    
    const foodLog = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        foodId: Date.now(),
        foodName: name,
        quantity: quantity,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        meal: meal,
        time: time || new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        timestamp: new Date().toISOString()
    };
    
    foodLogs.push(foodLog);
    addXP(10, `Registrou ${name}`);
    saveDietData();
    
    const modalElement = document.getElementById('foodModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    const foodForm = document.getElementById('foodForm');
    if (foodForm) {
        foodForm.reset();
    }
    
    loadPage('diet');
    showToast(`${name} registrado com sucesso! +10 XP`, 'success');
}

// Load Diet Management
function loadDietManagement() {
    const container = document.getElementById('dietListContainer');
    if (!container) return;
    
    let html = `
        <div class="mb-4">
            <div class="card">
                <div class="card-header">
                    <strong>Cadastrar Dieta</strong>
                </div>
                <div class="card-body">
                    <form id="dietCreateForm">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Nome da dieta</label>
                                <input type="text" class="form-control" id="dietNameInput" placeholder="Ex: Plano de Corte" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">DescriÇõÇœo</label>
                                <input type="text" class="form-control" id="dietDescriptionInput" placeholder="Ex: DefiniÇõÇœo e energia">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Calorias/dia</label>
                                <input type="number" class="form-control" id="dietCaloriesInput" value="2000" min="800" max="6000" required>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">ProteÇðnas (g)</label>
                                <input type="number" class="form-control" id="dietProteinInput" value="150" min="0" max="600">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Carboidratos (g)</label>
                                <input type="number" class="form-control" id="dietCarbsInput" value="200" min="0" max="800">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Gorduras (g)</label>
                                <input type="number" class="form-control" id="dietFatInput" value="50" min="0" max="300">
                            </div>
                        </div>
                        <div class="mt-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Salvar Dieta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Refeições</th>
                        <th>Calorias</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    diets.forEach(diet => {
        html += `
            <tr>
                <td><strong>${diet.name}</strong></td>
                <td><small class="text-muted">${diet.description}</small></td>
                <td>${diet.meals.length}</td>
                <td>${diet.dailyCalories} kcal</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="setActiveDiet(${diet.id})">
                            <i class="fas fa-check"></i> Usar
                        </button>
                        <button class="btn btn-outline-warning" onclick="editDiet(${diet.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteDiet(${diet.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;

    const dietForm = document.getElementById('dietCreateForm');
    if (dietForm) {
        dietForm.addEventListener('submit', function(event) {
            event.preventDefault();
            createNewDiet();
        });
    }
}

// Create New Diet
window.createNewDiet = function() {
    const nameInput = document.getElementById('dietNameInput');
    const descriptionInput = document.getElementById('dietDescriptionInput');
    const caloriesInput = document.getElementById('dietCaloriesInput');
    const proteinInput = document.getElementById('dietProteinInput');
    const carbsInput = document.getElementById('dietCarbsInput');
    const fatInput = document.getElementById('dietFatInput');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        showToast('Informe o nome da dieta', 'warning');
        return;
    }

    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const dailyCalories = parseInt(caloriesInput?.value, 10) || 2000;
    const dailyProtein = parseInt(proteinInput?.value, 10) || 150;
    const dailyCarbs = parseInt(carbsInput?.value, 10) || 200;
    const dailyFat = parseInt(fatInput?.value, 10) || 50;

    const newDiet = {
        id: Date.now(),
        name: name,
        description: description,
        meals: [],
        dailyCalories: dailyCalories,
        dailyProtein: dailyProtein,
        dailyCarbs: dailyCarbs,
        dailyFat: dailyFat
    };

    diets.push(newDiet);
    saveDietData();
    loadPage('diet');
    showToast('Dieta criada com sucesso!', 'success');

    if (nameInput) nameInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (caloriesInput) caloriesInput.value = '2000';
    if (proteinInput) proteinInput.value = '150';
    if (carbsInput) carbsInput.value = '200';
    if (fatInput) fatInput.value = '50';
};

// Set Active Diet
window.setActiveDiet = function(dietId) {
    const dietIndex = diets.findIndex(d => d.id === dietId);
    if (dietIndex > 0) {
        const [diet] = diets.splice(dietIndex, 1);
        diets.unshift(diet);
        saveDietData();
        loadPage('diet');
        showToast('Dieta definida como ativa!', 'success');
    }
};

// Delete Diet
window.deleteDiet = function(dietId) {
    if (confirm('Tem certeza que deseja excluir esta dieta?')) {
        diets = diets.filter(d => d.id !== dietId);
        saveDietData();
        loadPage('diet');
        showToast('Dieta excluída com sucesso!', 'success');
    }
};

// Complete Quest
window.completeQuest = function(questId) {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;
    
    quest.completed = true;
    addXP(quest.xp, `Missão: ${quest.name}`);
    saveDailyQuests();
    loadPage('home');
    showToast(`Missão "${quest.name}" completada! +${quest.xp} XP`, 'success');
};

// Complete Daily Challenge
window.completeDailyChallenge = function() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = foodLogs.filter(log => log.date === today);
    const completedWorkouts = workouts.filter(w => w.completed).length;
    
    let xpEarned = 0;
    let challenges = [];
    
    if (todayLogs.length >= 3) {
        xpEarned += 20;
        challenges.push('Registrou 3+ refeições');
    }
    
    if (completedWorkouts > 0) {
        xpEarned += 25;
        challenges.push('Completou 1+ treino');
    }
    
    if (xpEarned > 0) {
        addXP(xpEarned, `Desafio Diário: ${challenges.join(', ')}`);
        showToast(`Desafio diário completado! +${xpEarned} XP`, 'success');
    } else {
        showToast('Complete algumas atividades para ganhar XP no desafio diário', 'info');
    }
};

// Refresh Daily Quests
window.refreshDailyQuests = function() {
    dailyQuests = getDefaultDailyQuests();
    saveDailyQuests();
    loadPage('home');
    showToast('Missões diárias atualizadas!', 'success');
};

// Refresh Activity
window.refreshActivity = function() {
    loadPage('home');
    showToast('Atividade atualizada!', 'info');
};

// Show All Achievements
window.showAllAchievements = function() {
    const modalHtml = `
        <div class="modal fade" id="achievementsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-medal me-2"></i>Todas as Conquistas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            ${achievements.map(achievement => `
                                <div class="col-md-6 mb-3">
                                    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                                        <div class="d-flex align-items-center">
                                            <div class="achievement-icon-lg me-3">
                                                ${achievement.icon}
                                            </div>
                                            <div class="flex-grow-1">
                                                <h6 class="mb-1">${achievement.name}</h6>
                                                <p class="text-muted small mb-1">${achievement.description}</p>
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <small class="text-neon-yellow">
                                                        <i class="fas fa-coins me-1"></i>${achievement.xp} XP
                                                    </small>
                                                    <small class="${achievement.unlocked ? 'text-success' : 'text-muted'}">
                                                        ${achievement.unlocked ? '<i class="fas fa-check me-1"></i>Desbloqueada' : 'Bloqueada'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('achievementsModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modalElement = document.getElementById('achievementsModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
};

// Show Achievement Details
window.showAchievementDetails = function(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    alert(`${achievement.icon} ${achievement.name}\n\n${achievement.description}\n\nRecompensa: ${achievement.xp} XP\n\nStatus: ${achievement.unlocked ? '✅ Desbloqueada' : '🔒 Bloqueada'}`);
};

// Save to Phone
window.saveToPhone = function() {
    showToast('Para instalar como app: no menu do navegador (⋯), selecione "Adicionar à tela inicial"', 'info');
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    if (isIOS) {
        instructions = 'No Safari, toque no ícone de compartilhar (⬆️) e selecione "Adicionar à Tela de Início"';
    } else if (isAndroid) {
        instructions = 'No Chrome, toque no menu (⋯) e selecione "Adicionar à tela inicial"';
    } else {
        instructions = 'No menu do navegador, procure por "Instalar aplicativo" ou "Adicionar à tela inicial"';
    }
    
    alert(`📱 Instalar como App:\n\n${instructions}\n\nDepois disso, o Hunter\'s Gym aparecerá como um app normal no seu celular!`);
};

// Show Toast Notification
function showToast(message, type = 'info') {
    const existingContainer = document.querySelector('.toast-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 
                    type === 'error' ? 'bg-danger' : 
                    type === 'warning' ? 'bg-warning' : 'bg-info';
    
    toastContainer.innerHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgClass} text-white">
                <strong class="me-auto">
                    ${type === 'success' ? '✅ Sucesso' : 
                      type === 'error' ? '❌ Erro' : 
                      type === 'warning' ? '⚠️ Aviso' : 'ℹ️ Informação'}
                </strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toastContainer);
    
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        toast.show();
        
        toastElement.addEventListener('hidden.bs.toast', function() {
            if (toastContainer.parentNode) {
                toastContainer.remove();
            }
        });
    }
}

// Make functions available globally
window.loadPage = loadPage;
window.switchUser = switchUser;
window.removeUser = removeUser;
window.editUser = editUser;
window.addUser = addUser;
window.openUsersManager = openUsersManager;
window.exportAllUsersData = exportAllUsersData;
window.importAllUsersData = importAllUsersData;
window.saveToPhone = saveToPhone;
window.startSpeedTracking = startSpeedTracking;
window.pauseSpeedTracking = pauseSpeedTracking;
window.stopSpeedTracking = stopSpeedTracking;
window.resetSpeedTracking = resetSpeedTracking;

console.log('Hunter\'s Gym - Sistema completo carregado com sucesso!');
