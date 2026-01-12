// App State
let currentUser = null;
let users = {};
let workouts = [];
let results = [];
let profilePics = {};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('FitTrack Pro - Inicializando...');
    initializeApp();
    setupEventListeners();
    
    // Carregar página inicial
    setTimeout(() => {
        const hash = window.location.hash.substring(1) || 'home';
        loadPage(hash);
        
        // Atualizar menu ativo
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === hash) {
                link.classList.add('active');
            }
        });
    }, 100);
});

// Initialize App Data
function initializeApp() {
    console.log('Inicializando dados do app...');
    
    // Initialize default users with profile pictures
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

    // Load data from localStorage
    loadData();
    
    // Set default user if none
    if (!currentUser) {
        currentUser = users[1];
        console.log('Usuário padrão definido:', currentUser.name);
    }
    
    // Initialize UI
    updateUserMenu();
    console.log('App inicializado com sucesso!');
}

// Load Data from localStorage
function loadData() {
    try {
        console.log('Carregando dados do localStorage...');
        
        // Load current user
        const savedUser = localStorage.getItem('fitTrackCurrentUser');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log('Usuário salvo encontrado:', parsedUser.name);
            // Merge with default user data
            if (users[parsedUser.id]) {
                currentUser = { ...users[parsedUser.id], ...parsedUser };
            } else {
                currentUser = parsedUser;
            }
        }
        
        // Load workouts
        const userId = currentUser?.id || 1;
        const savedWorkouts = localStorage.getItem(`fitTrackWorkouts_${userId}`);
        if (savedWorkouts) {
            workouts = JSON.parse(savedWorkouts);
            console.log(`${workouts.length} treinos carregados`);
        } else {
            // Default workouts
            workouts = getDefaultWorkouts();
            console.log('Treinos padrão carregados:', workouts.length);
        }
        
        // Load results
        const savedResults = localStorage.getItem(`fitTrackResults_${userId}`);
        if (savedResults) {
            results = JSON.parse(savedResults);
            console.log(`${results.length} resultados carregados`);
        } else {
            // Default results
            results = getDefaultResults();
            console.log('Resultados padrão carregados:', results.length);
        }
        
        // Load profile pictures
        const savedPics = localStorage.getItem('fitTrackProfilePics');
        if (savedPics) {
            profilePics = JSON.parse(savedPics);
            console.log('Fotos de perfil carregadas');
        } else {
            profilePics = {};
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        workouts = getDefaultWorkouts();
        results = getDefaultResults();
        profilePics = {};
    }
}

// Save Data to localStorage
function saveData() {
    try {
        if (!currentUser) {
            console.error('Não há usuário atual para salvar');
            return;
        }
        
        localStorage.setItem('fitTrackCurrentUser', JSON.stringify(currentUser));
        localStorage.setItem(`fitTrackWorkouts_${currentUser.id}`, JSON.stringify(workouts));
        localStorage.setItem(`fitTrackResults_${currentUser.id}`, JSON.stringify(results));
        localStorage.setItem('fitTrackProfilePics', JSON.stringify(profilePics));
        
        console.log('Dados salvos com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showToast('Erro ao salvar dados', 'error');
    }
}

// Get Default Workouts
function getDefaultWorkouts() {
    return [
        {
            id: 1,
            day: 'Seg',
            name: 'Peito e Tríceps',
            exercises: [
                { id: 1, name: 'Supino Reto', sets: '4x10', completed: true },
                { id: 2, name: 'Crucifixo', sets: '3x12', completed: true },
                { id: 3, name: 'Tríceps Pulley', sets: '3x15', completed: false }
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
                { id: 1, name: 'Puxada Alta', sets: '4x10', completed: true },
                { id: 2, name: 'Remada Curvada', sets: '3x12', completed: true },
                { id: 3, name: 'Rosca Direta', sets: '3x15', completed: true }
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
                { id: 1, name: 'Agachamento Livre', sets: '4x8', completed: true },
                { id: 2, name: 'Leg Press', sets: '3x12', completed: false },
                { id: 3, name: 'Cadeira Extensora', sets: '3x15', completed: false }
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
                { id: 1, name: 'Desenvolvimento', sets: '4x10', completed: false },
                { id: 2, name: 'Elevação Lateral', sets: '3x12', completed: false },
                { id: 3, name: 'Encolhimento', sets: '3x15', completed: false }
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
            weight: 82.5,
            biceps: 37.5,
            chest: 104,
            waist: 93,
            hips: 101,
            bmi: 26.5
        },
        {
            id: 2,
            date: lastWeek.toLocaleDateString('pt-BR'),
            weight: 81.8,
            biceps: 38,
            chest: 104.5,
            waist: 92,
            hips: 100.5,
            bmi: 26.2
        },
        {
            id: 3,
            date: today.toLocaleDateString('pt-BR'),
            weight: 81.2,
            biceps: 38.5,
            chest: 105,
            waist: 91,
            hips: 100,
            bmi: 26.0
        }
    ];
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Navigation links
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            console.log('Navegando para:', page);
            loadPage(page);
            
            // Update active nav
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Update URL hash
            window.location.hash = page;
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
    
    // User dropdown
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            updateUserMenu();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        const dropdown = document.querySelector('.dropdown-menu.show');
        if (dropdown) {
            const dropdownInstance = bootstrap.Dropdown.getInstance(document.getElementById('userDropdown'));
            if (dropdownInstance) {
                dropdownInstance.hide();
            }
        }
    });
    
    // Mobile sidebar toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking on main content on mobile
    document.getElementById('mainContent')?.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
    
    console.log('Event listeners configurados!');
}

// Update User Menu
function updateUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) {
        console.error('Elemento userMenu não encontrado');
        return;
    }
    
    userMenu.innerHTML = '';
    
    Object.values(users).forEach(user => {
        const item = document.createElement('button');
        item.className = `dropdown-item ${currentUser && currentUser.id === user.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="rounded-circle me-2 d-flex align-items-center justify-content-center"
                    style="width:36px;height:36px;background:${currentUser && currentUser.id === user.id ? 'linear-gradient(45deg, #4CAF50, #FF5722)' : '#2d2d2d'};color:white">
                    ${profilePics[user.id] ? 
                        `<img src="${profilePics[user.id]}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : 
                        user.profilePic || '👤'}
                </div>
                <div>
                    <div class="fw-bold">${user.name}</div>
                    <small class="text-muted">${user.email}</small>
                </div>
            </div>
        `;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            switchUser(user.id);
        });
        userMenu.appendChild(item);
    });
    
    // Update navbar username
    const userDropdownText = document.querySelector('#userDropdown .username');
    if (userDropdownText && currentUser) {
        userDropdownText.textContent = currentUser.name;
    }
    
    // Initialize dropdown
    const dropdownElement = document.getElementById('userDropdown');
    if (dropdownElement) {
        new bootstrap.Dropdown(dropdownElement);
    }
}

// Switch User
function switchUser(userId) {
    if (!users[userId]) {
        console.error('Usuário não encontrado:', userId);
        showToast('Usuário não encontrado', 'error');
        return;
    }
    
    console.log('Trocando para usuário:', users[userId].name);
    currentUser = users[userId];
    loadData(); // Recarregar dados do novo usuário
    saveData(); // Salvar alteração
    updateUserMenu();
    loadPage('home');
    showToast(`Usuário alterado para ${currentUser.name}`, 'success');
}

// Page Loading System
function loadPage(page) {
    const content = document.getElementById('pageContent');
    if (!content) {
        console.error('Elemento pageContent não encontrado');
        return;
    }
    
    console.log('Carregando página:', page);
    content.innerHTML = '';
    
    switch(page) {
        case 'home':
            content.innerHTML = getHomePage();
            setTimeout(() => initWeightChart(), 100);
            break;
        case 'workout':
            content.innerHTML = getWorkoutPage();
            setTimeout(() => setupWorkoutEvents(), 100);
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
            console.warn('Página desconhecida, redirecionando para home');
            content.innerHTML = getHomePage();
            window.location.hash = 'home';
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Home Page
function getHomePage() {
    if (!currentUser) {
        return '<div class="loading"><div class="spinner-border"></div><p class="mt-3">Carregando...</p></div>';
    }
    
    const completedWorkouts = workouts.filter(w => w.completed).length;
    const totalWorkouts = workouts.length;
    const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
    
    const latestResult = results.length > 0 ? results[results.length - 1] : null;
    const previousResult = results.length > 1 ? results[results.length - 2] : null;
    
    const weightChange = latestResult && previousResult ? 
        (latestResult.weight - previousResult.weight).toFixed(1) : null;
    
    const bmiCategory = latestResult ? getBMICategory(latestResult.bmi) : '--';
    const bmiColor = latestResult ? getBMIColor(latestResult.bmi) : 'text-muted';
    
    return `
        <div class="container-fluid fade-in">
            <!-- Welcome Card -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card welcome-card">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h1 class="mb-2">Olá, ${currentUser.name}! 👋</h1>
                                    <p class="lead mb-0">
                                        ${completionRate >= 80 ? '🎉 Excelente trabalho! Continue assim!' : 
                                          completionRate >= 50 ? '👏 Bom progresso! Mantenha o foco!' : 
                                          '🚀 Vamos começar sua jornada fitness!'}
                                    </p>
                                </div>
                                <div class="col-md-4 text-md-end">
                                    <div class="profile-pic-large d-inline-block">
                                        <div class="profile-pic">
                                            ${profilePics[currentUser.id] ? 
                                                `<img src="${profilePics[currentUser.id]}" alt="${currentUser.name}" class="profile-img">` :
                                                `<span>${currentUser.profilePic || '👤'}</span>`
                                            }
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
                            <h2 class="text-success mb-1">${completedWorkouts}/${totalWorkouts}</h2>
                            <h6 class="text-muted mb-3">Treinos Concluídos</h6>
                            <div class="progress" style="height:8px">
                                <div class="progress-bar" style="width:${completionRate}%"></div>
                            </div>
                            <small class="text-muted mt-2 d-block">${completionRate}% de conclusão</small>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-weight"></i>
                            </div>
                            <h2 class="text-primary mb-1">${latestResult ? latestResult.weight + ' kg' : '--'}</h2>
                            <h6 class="text-muted mb-3">Peso Atual</h6>
                            ${weightChange ? `
                                <div class="trend-indicator ${parseFloat(weightChange) < 0 ? 'text-success' : 'text-danger'}">
                                    <i class="fas fa-${parseFloat(weightChange) < 0 ? 'arrow-down' : 'arrow-up'} me-1"></i>
                                    ${Math.abs(parseFloat(weightChange))} kg
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon ${bmiColor.replace('text-', '')}">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h2 class="${bmiColor} mb-1">${latestResult ? latestResult.bmi : '--'}</h2>
                            <h6 class="text-muted mb-3">Índice de Massa Corporal</h6>
                            <small class="text-muted">${bmiCategory}</small>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card stat-card h-100">
                        <div class="card-body">
                            <div class="stat-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <h2 class="text-info mb-1">${completionRate}%</h2>
                            <h6 class="text-muted mb-3">Atividade Semanal</h6>
                            <div class="progress" style="height:8px">
                                <div class="progress-bar bg-info" style="width:${completionRate}%"></div>
                            </div>
                            <small class="text-muted mt-2 d-block">Meta: 80%</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-dumbbell me-2"></i>Treinos Recentes</h5>
                            <a href="#workout" class="btn btn-sm btn-outline-primary" data-page="workout">Ver Todos</a>
                        </div>
                        <div class="card-body">
                            ${workouts.length > 0 ? workouts.slice(0, 4).map(workout => `
                                <div class="workout-item ${workout.completed ? 'completed' : ''}">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${workout.name}</h6>
                                            <small class="text-muted">
                                                <i class="fas fa-calendar-alt me-1"></i>${workout.day} • 
                                                <i class="fas fa-clock me-1"></i>${workout.duration}
                                            </small>
                                        </div>
                                        <span class="badge ${workout.completed ? 'bg-success' : 'bg-warning'}">
                                            ${workout.completed ? 'Concluído' : 'Pendente'}
                                        </span>
                                    </div>
                                    ${workout.exercises && workout.exercises.length > 0 ? `
                                        <div class="mt-3">
                                            <small class="text-muted d-block mb-2">Exercícios:</small>
                                            <div class="d-flex flex-wrap gap-2">
                                                ${workout.exercises.slice(0, 3).map(ex => `
                                                    <span class="badge bg-dark">${ex.name}</span>
                                                `).join('')}
                                                ${workout.exercises.length > 3 ? 
                                                    `<span class="badge bg-secondary">+${workout.exercises.length - 3}</span>` : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('') : `
                                <div class="empty-state">
                                    <div class="empty-state-icon">🏋️‍♂️</div>
                                    <h4>Nenhum treino encontrado</h4>
                                    <p>Comece adicionando seu primeiro treino!</p>
                                    <a href="#workout" class="btn btn-primary" data-page="workout">
                                        <i class="fas fa-plus me-2"></i>Criar Treino
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Evolução de Peso</h5>
                            <a href="#results" class="btn btn-sm btn-outline-primary" data-page="results">Ver Detalhes</a>
                        </div>
                        <div class="card-body">
                            ${results.length >= 2 ? `
                                <div id="weightChart"></div>
                                <div class="mt-3">
                                    <h6 class="text-muted mb-3">Últimas Medições</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Data</th>
                                                    <th>Peso</th>
                                                    <th>IMC</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${results.slice(-3).reverse().map(result => `
                                                    <tr>
                                                        <td><strong>${result.date}</strong></td>
                                                        <td>${result.weight} kg</td>
                                                        <td>${result.bmi}</td>
                                                        <td>
                                                            <span class="badge ${getBMIBadgeClass(result.bmi)}">
                                                                ${getBMICategory(result.bmi)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ` : `
                                <div class="empty-state">
                                    <div class="empty-state-icon">📏</div>
                                    <h4>Dados insuficientes</h4>
                                    <p>Adicione pelo menos 2 medições para ver o gráfico</p>
                                    <a href="#results" class="btn btn-primary" data-page="results">
                                        <i class="fas fa-plus me-2"></i>Adicionar Medição
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Ações Rápidas</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 col-6 mb-3">
                                    <a href="#workout" class="text-decoration-none" data-page="workout">
                                        <div class="card action-card text-center h-100">
                                            <div class="card-body">
                                                <div class="mb-3" style="font-size: 2rem;">💪</div>
                                                <h6>Adicionar Treino</h6>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <a href="#results" class="text-decoration-none" data-page="results">
                                        <div class="card action-card text-center h-100">
                                            <div class="card-body">
                                                <div class="mb-3" style="font-size: 2rem;">📏</div>
                                                <h6>Nova Medição</h6>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <a href="#workout" class="text-decoration-none" data-page="workout">
                                        <div class="card action-card text-center h-100">
                                            <div class="card-body">
                                                <div class="mb-3" style="font-size: 2rem;">📅</div>
                                                <h6>Ver Agenda</h6>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <a href="#profile" class="text-decoration-none" data-page="profile">
                                        <div class="card action-card text-center h-100">
                                            <div class="card-body">
                                                <div class="mb-3" style="font-size: 2rem;">👤</div>
                                                <h6>Meu Perfil</h6>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize Weight Chart
function initWeightChart() {
    const container = document.getElementById('weightChart');
    if (!container) return;

    if (results.length < 2) {
        container.innerHTML = `
            <div class="empty-chart-state">
                <p>Adicione mais medições para ver o gráfico</p>
            </div>
        `;
        return;
    }

    const recentResults = results.slice(-6);

    const maxWeight = Math.max(...recentResults.map(r => Number(r.weight)));
    const minWeight = Math.min(...recentResults.map(r => Number(r.weight)));

    const range = Math.max(maxWeight - minWeight, 1);
    const chartHeight = 200;

    let html = `
        <div class="simple-weight-chart">
            <div class="chart-body">
                <div class="y-axis">
    `;

    for (let i = 4; i >= 0; i--) {
        html += `<div class="y-label">${(maxWeight - (range * i / 4)).toFixed(1)}</div>`;
    }

    html += `
                </div>
                <div class="chart-area">
    `;

    for (let i = 0; i <= 4; i++) {
        html += `<div class="grid-line" style="top:${(i * chartHeight) / 4}px"></div>`;
    }

    recentResults.forEach((r, i) => {
        const x = (i * 100) / (recentResults.length - 1);
        const y = ((maxWeight - r.weight) / range) * chartHeight;

        html += `<div class="data-point" style="left:${x}%; top:${y}px"></div>`;

        if (i > 0) {
            const prev = recentResults[i - 1];
            const prevY = ((maxWeight - prev.weight) / range) * chartHeight;
            const dx = 100 / (recentResults.length - 1);
            const dy = y - prevY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            html += `
                <div class="line-segment"
                     style="left:${(i - 1) * dx}%;
                            top:${prevY}px;
                            width:${length}px;
                            transform: rotate(${angle}deg);">
                </div>`;
        }
    });

    html += `
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    
    // Adicionar estilos para o gráfico
    const styleId = 'weight-chart-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .simple-weight-chart {
                position: relative;
                padding: 20px;
            }
            
            .chart-body {
                display: flex;
                height: ${chartHeight}px;
                position: relative;
            }
            
            .y-axis {
                width: 50px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding-right: 10px;
                border-right: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .y-label {
                color: #888888;
                font-size: 12px;
                text-align: right;
                height: 20px;
                line-height: 20px;
            }
            
            .chart-area {
                flex: 1;
                position: relative;
                margin-left: 10px;
            }
            
            .grid-line {
                position: absolute;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .data-point {
                position: absolute;
                width: 12px;
                height: 12px;
                background: #4CAF50;
                border: 2px solid white;
                border-radius: 50%;
                transform: translateX(-50%);
                cursor: pointer;
                z-index: 2;
                transition: all 0.3s ease;
            }
            
            .data-point:hover {
                transform: translateX(-50%) scale(1.5);
                box-shadow: 0 0 10px #4CAF50;
            }
            
            .data-point:hover .point-tooltip {
                display: block;
            }
            
            .point-tooltip {
                display: none;
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                white-space: nowrap;
                font-size: 12px;
                z-index: 10;
                min-width: 120px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                margin-bottom: 10px;
            }
            
            .point-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
            }
            
            .line-segment {
                position: absolute;
                background: #4CAF50;
                transform-origin: 0 0;
                z-index: 1;
                height: 3px;
            }
            
            .x-axis {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                padding-left: 60px;
                padding-right: 10px;
            }
            
            .x-label {
                color: #888888;
                font-size: 12px;
                text-align: center;
                min-width: 40px;
                transform: translateX(-50%);
            }
            
            .chart-header {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .chart-header h6 {
                color: #ffffff;
                font-weight: 600;
                font-size: 1.1rem;
            }
            
            .empty-chart-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: #888888;
            }
            
            .empty-chart-state i {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }
}

// Workout Page
function getWorkoutPage() {
    return `
        <div class="container-fluid fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="mb-0"><i class="fas fa-dumbbell me-2"></i>Meus Treinos</h3>
                            <div>
                                <button class="btn btn-primary" id="addWorkoutBtn">
                                    <i class="fas fa-plus me-2"></i>Novo Treino
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="workoutListContainer"></div>
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
                        <h5 class="modal-title">Adicionar Treino</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="workoutForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nome do Treino *</label>
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
                        <button type="button" class="btn btn-primary" id="saveWorkoutBtn">Salvar Treino</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Results Page
function getResultsPage() {
    return `
        <div class="container-fluid fade-in">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="mb-0"><i class="fas fa-chart-line me-2"></i>Meus Resultados</h3>
                            <div>
                                <button class="btn btn-primary" id="addResultBtn">
                                    <i class="fas fa-plus me-2"></i>Nova Medição
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
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
                                                `<span>${currentUser.profilePic || '👤'}</span>`
                                            }
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
                            <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Informações Pessoais</h5>
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
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-cog me-2"></i>Configurações</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group list-group-flush">
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" id="exportDataBtn">
                                    <div>
                                        <i class="fas fa-download me-3"></i>
                                        <span>Exportar Todos os Dados</span>
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
                                <button class="list-group-item list-group-item-action bg-transparent border-0 d-flex justify-content-between align-items-center py-3" onclick="saveToPhone()">
                                    <div>
                                        <i class="fas fa-mobile-alt me-3"></i>
                                        <span>Salvar como App</span>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </button>
                            </div>
                            
                            <div class="mt-4 pt-3 border-top">
                                <h6 class="text-muted mb-3">Sobre o App</h6>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <small class="text-muted d-block">Versão</small>
                                        <span class="fw-bold">2.0.0</span>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted d-block">Armazenamento</small>
                                        <span class="fw-bold text-success">${Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
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
                        <h5 class="modal-title">Editar Perfil</h5>
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

// Setup Workout Events
function setupWorkoutEvents() {
    renderWorkoutList();
    
    // Add workout button
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
    
    // Add exercise button
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', addExerciseField);
    }
    
    // Save workout button
    const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
    if (saveWorkoutBtn) {
        saveWorkoutBtn.addEventListener('click', saveWorkout);
    }
    
    // Remove exercise buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-exercise')) {
            const exerciseItem = e.target.closest('.exercise-item');
            if (exerciseItem) {
                const container = document.getElementById('exercisesContainer');
                if (container.children.length > 1) {
                    exerciseItem.remove();
                    
                    // Update remove button states
                    const removeButtons = container.querySelectorAll('.remove-exercise');
                    removeButtons.forEach(btn => {
                        btn.disabled = container.children.length <= 1;
                    });
                }
            }
        }
    });
}

// Setup Results Events
function setupResultsEvents() {
    renderResultsList();
    
    // Add result button
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
    
    // Save result button
    const saveResultBtn = document.getElementById('saveResultBtn');
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', saveResult);
    }
}

// Setup Profile Events
function setupProfileEvents() {
    // Profile picture upload
    const profilePicInput = document.getElementById('profilePicInput');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }
    
    // Edit profile button
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
    
    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // Export data button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    // Import data button
    const importDataBtn = document.getElementById('importDataBtn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importData);
    }
    
    // Clear data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearData);
    }
}

// Handle Profile Picture Upload
function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione uma imagem válida (JPG, PNG, GIF)', 'error');
        return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter menos de 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        profilePics[currentUser.id] = e.target.result;
        saveData();
        
        // Update profile picture display
        const profilePicElement = document.querySelector('#profilePicture');
        if (profilePicElement) {
            profilePicElement.innerHTML = `
                <img src="${e.target.result}" alt="${currentUser.name}">
                <input type="file" id="profilePicInput" class="profile-pic-input" accept="image/*" title="Clique para alterar foto">
            `;
            // Re-attach event listener
            document.getElementById('profilePicInput')?.addEventListener('change', handleProfilePicUpload);
        }
        
        // Update user menu
        updateUserMenu();
        
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
        showToast('Erro: usuário não encontrado', 'error');
        return;
    }
    
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const height = parseInt(document.getElementById('profileHeight').value) || currentUser.height;
    const age = parseInt(document.getElementById('profileAge').value) || currentUser.age;
    const experience = document.getElementById('profileExperience').value;
    const goal = document.getElementById('profileGoal').value;
    
    // Validation
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
    
    // Update user in users object
    users[currentUser.id] = currentUser;
    
    saveData();
    
    // Close modal
    const modalElement = document.getElementById('profileModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    // Reload profile page
    loadPage('profile');
    
    showToast('Perfil atualizado com sucesso!', 'success');
}

// Export Data
function exportData() {
    const data = {
        user: currentUser,
        workouts: workouts,
        results: results,
        profilePics: profilePics,
        exportDate: new Date().toISOString(),
        version: '2.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fit-track-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Dados exportados com sucesso!', 'success');
}

// Import Data
function importData() {
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
                
                if (!confirm('Isso substituirá todos os seus dados atuais. Deseja continuar?')) {
                    return;
                }
                
                // Validate data structure
                if (!data.user || !data.workouts || !data.results) {
                    showToast('Arquivo de backup inválido', 'error');
                    return;
                }
                
                // Import data
                currentUser = data.user;
                workouts = data.workouts;
                results = data.results;
                profilePics = data.profilePics || {};
                
                // Update users object
                users[currentUser.id] = currentUser;
                
                saveData();
                updateUserMenu();
                loadPage('home');
                
                showToast('Dados importados com sucesso!', 'success');
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

// Clear Data
function clearData() {
    if (!confirm('⚠️ ATENÇÃO: Isso apagará TODOS os seus dados locais (treinos, resultados, configurações). Esta ação NÃO pode ser desfeita. Deseja continuar?')) {
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
    
    // Enable remove button for all exercises if there's more than one
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
    
    // Validation
    if (!name) {
        showToast('Por favor, digite um nome para o treino', 'warning');
        return;
    }
    
    if (!day) {
        showToast('Por favor, selecione um dia da semana', 'warning');
        return;
    }
    
    const exercises = [];
    document.querySelectorAll('.exercise-item').forEach(item => {
        const nameInput = item.querySelector('.exercise-name');
        const setsInput = item.querySelector('.exercise-sets');
        
        if (nameInput?.value.trim()) {
            exercises.push({
                id: Date.now() + Math.random(),
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
        created: new Date().toISOString()
    };
    
    workouts.push(workout);
    saveData();
    
    // Close modal
    const modalElement = document.getElementById('workoutModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    // Reset form
    const workoutForm = document.getElementById('workoutForm');
    if (workoutForm) {
        workoutForm.reset();
    }
    
    // Reset exercises container
    const exercisesContainer = document.getElementById('exercisesContainer');
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
    
    // Reload workout list
    renderWorkoutList();
    
    showToast('Treino adicionado com sucesso!', 'success');
}

// Save Result
function saveResult() {
    const date = document.getElementById('resultDate').value;
    const weight = parseFloat(document.getElementById('resultWeight').value);
    const biceps = parseFloat(document.getElementById('resultBiceps').value) || 0;
    const waist = parseFloat(document.getElementById('resultWaist').value) || 0;
    const chest = parseFloat(document.getElementById('resultChest').value) || 0;
    const hips = parseFloat(document.getElementById('resultHips').value) || 0;
    
    // Validation
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
    saveData();
    
    // Close modal
    const modalElement = document.getElementById('resultModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    // Reset form
    const resultForm = document.getElementById('resultForm');
    if (resultForm) {
        resultForm.reset();
        document.getElementById('resultDate').value = new Date().toISOString().split('T')[0];
    }
    
    // Reload results list
    renderResultsList();
    
    showToast('Medição registrada com sucesso!', 'success');
}

// Calculate BMI
function calculateBMI(weight, height) {
    return (weight / ((height / 100) ** 2)).toFixed(1);
}

// Render Workout List
function renderWorkoutList() {
    const container = document.getElementById('workoutListContainer');
    if (!container) return;
    
    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏋️‍♂️</div>
                <h4>Nenhum treino cadastrado</h4>
                <p>Comece adicionando seu primeiro treino!</p>
                <button class="btn btn-primary" id="addFirstWorkoutBtn">
                    <i class="fas fa-plus me-2"></i>Criar Primeiro Treino
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
    
    // Group workouts by day
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
                                ${totalCount} treino${totalCount !== 1 ? 's' : ''}
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
                            const completedExercises = workout.exercises.filter(e => e.completed).length;
                            const totalExercises = workout.exercises.length;
                            const exerciseRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
                            
                            return `
                                <div class="workout-item mb-3 ${workout.completed ? 'completed' : ''}" data-id="${workout.id}">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">${workout.name}</h6>
                                            <small class="text-muted d-block">
                                                <i class="fas fa-clock me-1"></i>${workout.duration}
                                            </small>
                                            ${workout.exercises.length > 0 ? `
                                                <div class="mt-2">
                                                    <small class="text-muted d-block mb-1">Progresso:</small>
                                                    <div class="progress" style="height:6px">
                                                        <div class="progress-bar" style="width:${exerciseRate}%"></div>
                                                    </div>
                                                    <small class="text-muted">
                                                        ${completedExercises}/${totalExercises} exercícios
                                                    </small>
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div class="d-flex flex-column gap-2 ms-3">
                                            <button class="btn btn-sm ${workout.completed ? 'btn-success' : 'btn-outline-success'}" 
                                                    onclick="toggleWorkout(${workout.id})" 
                                                    title="${workout.completed ? 'Marcar como pendente' : 'Marcar como concluído'}">
                                                <i class="fas fa-${workout.completed ? 'check' : 'circle'}"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" 
                                                    onclick="deleteWorkout(${workout.id})" 
                                                    title="Excluir treino">
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
                                <p class="text-muted mb-3">Nenhum treino para ${dayName.toLowerCase()}</p>
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
    
    // Latest result
    const latestResult = results[results.length - 1];
    const previousResult = results.length > 1 ? results[results.length - 2] : null;
    
    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-star me-2"></i>Última Medição</h5>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-md-2 col-6 mb-3">
                                <div class="stat-box">
                                    <h6 class="text-muted mb-2">Peso</h6>
                                    <h3 class="text-primary">${latestResult.weight} kg</h3>
                                    ${previousResult ? `
                                        <small class="${latestResult.weight < previousResult.weight ? 'text-success' : 'text-danger'}">
                                            <i class="fas fa-${latestResult.weight < previousResult.weight ? 'arrow-down' : 'arrow-up'} me-1"></i>
                                            ${Math.abs(latestResult.weight - previousResult.weight).toFixed(1)} kg
                                        </small>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="col-md-2 col-6 mb-3">
                                <div class="stat-box">
                                    <h6 class="text-muted mb-2">IMC</h6>
                                    <h3 class="${getBMIColor(latestResult.bmi)}">${latestResult.bmi}</h3>
                                    <small class="text-muted">${getBMICategory(latestResult.bmi)}</small>
                                </div>
                            </div>
                            <div class="col-md-2 col-6 mb-3">
                                <div class="stat-box">
                                    <h6 class="text-muted mb-2">Bíceps</h6>
                                    <h3 class="text-info">${latestResult.biceps} cm</h3>
                                    ${previousResult ? `
                                        <small class="${latestResult.biceps > previousResult.biceps ? 'text-success' : 'text-danger'}">
                                            <i class="fas fa-${latestResult.biceps > previousResult.biceps ? 'arrow-up' : 'arrow-down'} me-1"></i>
                                            ${Math.abs(latestResult.biceps - previousResult.biceps).toFixed(1)} cm
                                        </small>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="col-md-2 col-6 mb-3">
                                <div class="stat-box">
                                    <h6 class="text-muted mb-2">Cintura</h6>
                                    <h3 class="${latestResult.waist < 90 ? 'text-success' : 'text-warning'}">${latestResult.waist} cm</h3>
                                    ${previousResult ? `
                                        <small class="${latestResult.waist < previousResult.waist ? 'text-success' : 'text-danger'}">
                                            <i class="fas fa-${latestResult.waist < previousResult.waist ? 'arrow-down' : 'arrow-up'} me-1"></i>
                                            ${Math.abs(latestResult.waist - previousResult.waist).toFixed(1)} cm
                                        </small>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="col-md-2 col-6 mb-3">
                                <div class="stat-box">
                                    <h6 class="text-muted mb-2">Peito</h6>
                                    <h3>${latestResult.chest} cm</h3>
                                </div>
                            </div>
                            <div class="col-md-2 col-6 mb-3">
                                <div class="stat-box">
                                    <h6 class="text-muted mb-2">Quadril</h6>
                                    <h3>${latestResult.hips} cm</h3>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-3">
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-1"></i>Última medição: ${latestResult.date}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-history me-2"></i>Histórico Completo</h5>
                        <span class="badge bg-primary">${results.length} medições</span>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Peso (kg)</th>
                                        <th>Bíceps (cm)</th>
                                        <th>Cintura (cm)</th>
                                        <th>Peito (cm)</th>
                                        <th>Quadril (cm)</th>
                                        <th>IMC</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;
    
    results.slice().reverse().forEach(result => {
        html += `
            <tr>
                <td><strong>${result.date}</strong></td>
                <td>${result.weight}</td>
                <td>${result.biceps}</td>
                <td>${result.waist}</td>
                <td>${result.chest}</td>
                <td>${result.hips}</td>
                <td>
                    <span class="badge ${getBMIBadgeClass(result.bmi)}">
                        ${result.bmi}
                    </span>
                </td>
                <td>
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

// Global Functions for Event Handlers
window.toggleWorkout = function(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
        workout.completed = !workout.completed;
        saveData();
        renderWorkoutList();
        showToast(`Treino ${workout.completed ? 'concluído' : 'marcado como pendente'}!`, 'success');
    }
};

window.deleteWorkout = function(workoutId) {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
        workouts = workouts.filter(w => w.id !== workoutId);
        saveData();
        renderWorkoutList();
        showToast('Treino excluído com sucesso!', 'success');
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

// Save to Phone
window.saveToPhone = function() {
    showToast('Para instalar como app: no menu do navegador (⋯), selecione "Adicionar à tela inicial"', 'info');
    
    // Instructions based on device
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
    
    alert(`📱 Instalar como App:\n\n${instructions}\n\nDepois disso, o FitTrack Pro aparecerá como um app normal no seu celular!`);
};

// Show Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toasts
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
        
        // Auto remove after hiding
        toastElement.addEventListener('hidden.bs.toast', function() {
            if (toastContainer.parentNode) {
                toastContainer.remove();
            }
        });
    }
}

// Make loadPage available globally
window.loadPage = loadPage;

console.log('FitTrack Pro - Aplicativo carregado com sucesso!');