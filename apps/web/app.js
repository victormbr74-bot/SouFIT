import { auth, db, storage } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';

const MAIN_ROUTES = ['home', 'workout', 'diet', 'results', 'speed', 'profile'];
const AUTH_ROUTES = ['auth-login', 'auth-signup', 'auth-onboarding'];
const ALL_ROUTES = [...MAIN_ROUTES, ...AUTH_ROUTES];
const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const STORAGE_KEYS = {
  profile: 'soufit_profile_cache',
  plan: 'soufit_plan_cache',
  diet: 'soufit_diet_cache',
  settings: 'soufit_settings_cache',
  meta: 'soufit_meta_cache'
};
const muscleGroupsList = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];
const trainingLevels = ['iniciante', 'intermediario', 'avancado'];
const goalOptions = {
  deficit: 'Déficit Calórico',
  massa: 'Hipertrofia Controlada',
  manter: 'Manutenção Equilibrada'
};
const mealNames = ['Café da manhã', 'Almoço', 'Jantar', 'Lanches'];
const planSplits = {
  1: ['Full Body'],
  2: ['Full Body', 'Full Body'],
  3: ['Peito & Costas', 'Pernas & Core', 'Ombros & Braços'],
  4: ['Superior', 'Inferior', 'Push', 'Pull'],
  5: ['Push', 'Pull', 'Pernas', 'Core', 'Full Body'],
  6: ['Push', 'Pull', 'Pernas', 'Core', 'Push', 'Pull'],
  7: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Full Body']
};
const levelOrder = { iniciante: 0, intermediario: 1, avancado: 2 };
const exerciseLibrary = [
  {
    id: 'agachamento-livre',
    name: 'Agachamento Livre',
    group: 'Pernas',
    level: 'iniciante',
    equipment: 'Barra',
    defaultSets: '4x8',
    defaultReps: '8-10',
    load: '70% 1RM',
    notes: 'Desça até paralelo mantendo o core neutro.'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    group: 'Pernas',
    level: 'iniciante',
    equipment: 'Máquina',
    defaultSets: '3x12',
    defaultReps: '12',
    load: 'Carga controlada',
    notes: 'Passe o tempo em controle na fase excêntrica.'
  },
  {
    id: 'supino-reto',
    name: 'Supino Reto',
    group: 'Peito',
    level: 'iniciante',
    equipment: 'Barra',
    defaultSets: '4x8',
    defaultReps: '8-10',
    load: '72% 1RM',
    notes: 'Mantenha escápula retraída.'
  },
  {
    id: 'supino-inclinado',
    name: 'Supino Inclinado',
    group: 'Peito',
    level: 'intermediario',
    equipment: 'Barra',
    defaultSets: '3x10',
    defaultReps: '10',
    load: '65% 1RM',
    notes: 'Foco parte superior do peito.'
  },
  {
    id: 'remada-curvada',
    name: 'Remada Curvada',
    group: 'Costas',
    level: 'intermediario',
    equipment: 'Barra',
    defaultSets: '4x8',
    defaultReps: '8-10',
    load: 'Moderado',
    notes: 'Puxe o cotovelo para trás e contraia as escápulas.'
  },
  {
    id: 'puxada-frontal',
    name: 'Puxada Frontal',
    group: 'Costas',
    level: 'iniciante',
    equipment: 'Polia',
    defaultSets: '3x12',
    defaultReps: '12',
    load: 'Controle total',
    notes: 'Pescoço longo e tronco levemente inclinado.'
  },
  {
    id: 'desenvolvimento-ombros',
    name: 'Desenvolvimento com Halteres',
    group: 'Ombros',
    level: 'intermediario',
    equipment: 'Halteres',
    defaultSets: '3x10',
    defaultReps: '10',
    load: 'Leve a moderado',
    notes: 'Evite esticar demais o trapézio.'
  },
  {
    id: 'elevacao-lateral',
    name: 'Elevação Lateral',
    group: 'Ombros',
    level: 'iniciante',
    equipment: 'Halteres',
    defaultSets: '3x15',
    defaultReps: '15',
    load: 'Leve',
    notes: 'Suba até o nível dos ombros com controle.'
  },
  {
    id: 'rosca-biceps',
    name: 'Rosca Direta',
    group: 'Braços',
    level: 'iniciante',
    equipment: 'Barra',
    defaultSets: '3x12',
    defaultReps: '12',
    load: 'Técnica perfeita',
    notes: 'Não balance o corpo para puxar o peso.'
  },
  {
    id: 'triceps-corda',
    name: 'Tríceps na Corda',
    group: 'Braços',
    level: 'iniciante',
    equipment: 'Polia',
    defaultSets: '3x15',
    defaultReps: '15',
    load: 'Moderado',
    notes: 'Faça o pico de contração em cada repetição.'
  },
  {
    id: 'prancha',
    name: 'Prancha com Tempo',
    group: 'Core',
    level: 'iniciante',
    equipment: 'Peso corporal',
    defaultSets: '3x45s',
    defaultReps: '45s',
    load: 'Peso corporal',
    notes: 'Respire fundo e mantenha a lombar neutra.'
  },
  {
    id: 'abdominal-bicicleta',
    name: 'Abdominal Bicicleta',
    group: 'Core',
    level: 'iniciante',
    equipment: 'Peso corporal',
    defaultSets: '3x20',
    defaultReps: '20',
    load: 'Peso corporal',
    notes: 'Foco em rotacionar o tronco e ativar oblíquos.'
  }
];
const dietLibrary = {
  deficit: {
    'Café da manhã': [
      { name: 'Ovos mexidos com espinafre', portion: '2 ovos + 1 xícara', notes: 'Proteína magra e fibras' },
      { name: 'Chá verde', portion: '1 xícara', notes: 'Termogênico leve' }
    ],
    'Almoço': [
      { name: 'Peito de frango grelhado', portion: '180g', notes: 'Proteína e baixo sódio' },
      { name: 'Arroz integral', portion: '5 colheres de sopa', notes: 'Carboidrato complexo' },
      { name: 'Salada colorida', portion: 'à vontade', notes: 'Fibras e micronutrientes' }
    ],
    'Jantar': [
      { name: 'Salmão assado', portion: '160g', notes: 'Ômega-3 e proteína' },
      { name: 'Batata-doce', portion: '150g', notes: 'Carboidrato de baixo índice glicêmico' }
    ],
    'Lanches': [
      { name: 'Iogurte grego integral', portion: '1 pote', notes: 'Probióticos e proteína' },
      { name: 'Mix de nozes', portion: '30g', notes: 'Gordura saudável e saciedade' }
    ]
  },
  massa: {
    'Café da manhã': [
      { name: 'Panqueca de aveia com banana', portion: '2 unidades', notes: 'Carboidrato e proteína' },
      { name: 'Omelete 3 ovos', portion: '3 ovos', notes: 'Proteína total' }
    ],
    'Almoço': [
      { name: 'Arroz integral', portion: '6 colheres', notes: 'Base energética' },
      { name: 'Feijão', portion: '4 colheres', notes: 'Proteína vegetal' },
      { name: 'Bife de patinho', portion: '200g', notes: 'Proteína magra' },
      { name: 'Legumes no vapor', portion: 'à vontade', notes: 'Fibras' }
    ],
    'Jantar': [
      { name: 'Massa integral com molho leve', portion: '1 prato raso', notes: 'Carboidrato para recuperação' },
      { name: 'Frango desfiado', portion: '160g', notes: 'Proteína adicional' }
    ],
    'Lanches': [
      { name: 'Vitamina com leite + aveia', portion: '300ml', notes: 'Extra de calorias limpas' },
      { name: 'Sanduíche natural integral', portion: '2 fatias', notes: 'Carboidrato + proteína' }
    ]
  },
  manter: {
    'Café da manhã': [
      { name: 'Tapioca com cottage', portion: '2 colheres', notes: 'Proteína moderada' },
      { name: 'Smoothie de frutas vermelhas', portion: '250ml', notes: 'Antioxidantes' }
    ],
    'Almoço': [
      { name: 'Peixe grelhado', portion: '180g', notes: 'Proteína leve' },
      { name: 'Quinoa', portion: '4 colheres', notes: 'Carboidrato equilibrado' },
      { name: 'Brócolis no vapor', portion: 'à vontade', notes: 'Fibras' }
    ],
    'Jantar': [
      { name: 'Caldinho com legumes', portion: '250ml', notes: 'Baixo carboidrato' },
      { name: 'Omelete claro + vegetais', portion: '1 prato', notes: 'Proteína leve' }
    ],
    'Lanches': [
      { name: 'Castanhas', portion: '20g', notes: 'Gordura saudável' },
      { name: 'Fruta inteira com pasta de amendoim', portion: '1 unidade', notes: 'Equilíbrio energias' }
    ]
  }
};
const state = {
  route: 'auth-login',
  currentUser: null,
  profile: null,
  plan: null,
  dietPlan: null,
  settings: {
    themeMode: 'light',
    profileCompleted: false
  },
  dirty: {
    profile: false,
    plan: false,
    diet: false
  },
  needsSync: {
    profile: false,
    plan: false,
    diet: false
  },
  onboardingStep: 0,
  exerciseModalContext: null,
  dietModalContext: null,
  conflictPayload: null,
  online: navigator.onLine,
  meta: {
    lastSyncAt: null,
    appVersion: '1.0.0'
  }
};
const dom = {};
let bootstrapExerciseModal;
let bootstrapDietItemModal;
let bootstrapConflictModal;
function initApp() {
  dom.authContainer = document.getElementById('authContainer');
  dom.appShell = document.getElementById('appShell');
  dom.pageContent = document.getElementById('pageContent');
  dom.playerCard = document.getElementById('playerCard');
  dom.pageTitle = document.getElementById('pageTitle');
  dom.statusSubtitle = document.getElementById('statusSubtitle');
  dom.networkStatus = document.getElementById('networkStatus');
  dom.themeToggle = document.getElementById('themeToggle');
  dom.logoutBtn = document.getElementById('logoutBtn');
  dom.mobileNavToggle = document.getElementById('mobileNavToggle');
  dom.navButtons = document.querySelectorAll('.sidebar-nav button');
  dom.bottomLinks = document.querySelectorAll('.bottom-nav-link');
  dom.conflictModalElement = document.getElementById('conflictModal');
  dom.exerciseModalElement = document.getElementById('exerciseModal');
  dom.dietModalElement = document.getElementById('dietItemModal');
  dom.exerciseForm = document.getElementById('exerciseForm');
  dom.dietItemForm = document.getElementById('dietItemForm');
  dom.exerciseSelect = document.getElementById('exerciseSelect');
  dom.dietItemMealSelect = document.getElementById('dietItemMeal');
  dom.dietPdfInput = document.getElementById('dietPdfInput');
  dom.keepLocalBtn = document.getElementById('keepLocalBtn');
  dom.useServerBtn = document.getElementById('useServerBtn');
  dom.exportBackupBtn = document.getElementById('exportBackupBtn');
  dom.toastContainer = document.getElementById('toastContainer');

  bootstrapExerciseModal = new bootstrap.Modal(dom.exerciseModalElement);
  bootstrapDietItemModal = new bootstrap.Modal(dom.dietModalElement);
  bootstrapConflictModal = new bootstrap.Modal(dom.conflictModalElement, { backdrop: 'static' });

  loadLocalCache();
  applyTheme(state.settings.themeMode);
  updateNetworkIndicator();
  bindNavigation();
  bindGlobalActions();

  onAuthStateChanged(auth, handleAuthChange);
  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  handleHashChange();
}

function bindNavigation() {
  dom.navButtons.forEach((button) => {
    button.addEventListener('click', () => navigateTo(button.dataset.route));
  });
  dom.bottomLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigateTo(link.dataset.route);
    });
  });
}

function bindGlobalActions() {
  dom.pageContent.addEventListener('click', handlePageAction);
  dom.themeToggle?.addEventListener('click', toggleTheme);
  dom.logoutBtn?.addEventListener('click', handleLogout);
  dom.mobileNavToggle?.addEventListener('click', () => {
    dom.appShell.querySelector('.app-sidebar')?.classList.toggle('open');
  });
  dom.exerciseForm?.addEventListener('submit', handleExerciseFormSubmit);
  dom.dietItemForm?.addEventListener('submit', handleDietItemFormSubmit);
  dom.keepLocalBtn?.addEventListener('click', () => resolveConflict('local'));
  dom.useServerBtn?.addEventListener('click', () => resolveConflict('server'));
  dom.exportBackupBtn?.addEventListener('click', () => resolveConflict('export'));
  dom.dietPdfInput?.addEventListener('change', handleDietPdfSelected);
}

function handleOnline() {
  state.online = true;
  updateNetworkIndicator();
  showToast('Conectado ao Firebase. Sincronizando...', 'success');
  flushSync();
}

function handleOffline() {
  state.online = false;
  updateNetworkIndicator();
  showToast('Você está offline. Mudanças serão enviadas quando voltar.', 'warning');
}

function updateNetworkIndicator() {
  if (!dom.networkStatus) return;
  dom.networkStatus.innerHTML = `
    <i class="fas fa-wifi"></i>
    ${state.online ? 'Conectado' : 'Sem conexão'}
  `;
  dom.networkStatus.classList.toggle('text-danger', !state.online);
  dom.networkStatus.classList.toggle('text-success', state.online);
}

function getRouteFromHash() {
  const hash = window.location.hash.replace('#', '').trim();
  if (!hash) return 'home';
  return ALL_ROUTES.includes(hash) ? hash : 'home';
}

function navigateTo(route) {
  if (!route) return;
  window.location.hash = `#${route}`;
}

const routeTitleMap = {
  home: 'Dashboard do Jogador',
  workout: 'Treinos',
  diet: 'Dieta',
  results: 'Resultados',
  speed: 'Speed',
  profile: 'Perfil do Jogador',
  'auth-login': 'Entrar',
  'auth-signup': 'Cadastre-se',
  'auth-onboarding': 'Onboarding'
};

function showToast(message, type = 'info', duration = 3200) {
  if (!dom.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast-card ${type}`;
  toast.innerHTML = `${message}`;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, duration);
}

function applyTheme(mode) {
  document.body.classList.remove('theme-light', 'theme-dark');
  const safeMode = mode === 'dark' ? 'dark' : 'light';
  document.body.classList.add(`theme-${safeMode}`);
  state.settings.themeMode = safeMode;
  persistSettings();
}

function toggleTheme() {
  const next = state.settings.themeMode === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(`Tema ${next === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function persistMeta() {
  localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(state.meta));
}

function persistLocal(type) {
  const mapping = {
    profile: state.profile,
    plan: state.plan,
    diet: state.dietPlan
  };
  const key = STORAGE_KEYS[type];
  if (!key) return;
  const payload = mapping[type];
  if (payload) {
    localStorage.setItem(key, JSON.stringify(payload));
  }
}

function loadLocalCache() {
  try {
    const profileCache = localStorage.getItem(STORAGE_KEYS.profile);
    if (profileCache) {
      state.profile = JSON.parse(profileCache);
      state.settings.profileCompleted = Boolean(state.profile?.profileCompleted);
      if (state.profile?.theme_mode) {
        state.settings.themeMode = state.profile.theme_mode;
      }
    }
    const planCache = localStorage.getItem(STORAGE_KEYS.plan);
    if (planCache) {
      state.plan = JSON.parse(planCache);
    }
    const dietCache = localStorage.getItem(STORAGE_KEYS.diet);
    if (dietCache) {
      state.dietPlan = JSON.parse(dietCache);
    }
    const settingsCache = localStorage.getItem(STORAGE_KEYS.settings);
    if (settingsCache) {
      const parsed = JSON.parse(settingsCache);
      state.settings = { ...state.settings, ...parsed };
    }
    const metaCache = localStorage.getItem(STORAGE_KEYS.meta);
    if (metaCache) {
      state.meta = { ...state.meta, ...JSON.parse(metaCache) };
    }
  } catch (error) {
    console.warn('Não foi possível restaurar o cache local', error);
  }
}

function getStateProperty(type) {
  if (type === 'diet') return 'dietPlan';
  if (type === 'plan') return 'plan';
  return 'profile';
}

function markDirty(type) {
  state.dirty[type] = true;
  state.needsSync[type] = true;
}

async function handleAuthChange(user) {
  state.currentUser = user;
  if (user) {
    dom.appShell?.classList.remove('hidden');
    await loadRemoteData(user);
  } else {
    state.profile = null;
    state.plan = null;
    state.dietPlan = null;
    state.settings.profileCompleted = false;
    dom.appShell?.classList.add('hidden');
  }
  handleHashChange();
}

function handleHashChange() {
  const route = getRouteFromHash();
  state.route = route;
  if (!state.currentUser && !AUTH_ROUTES.includes(route)) {
    navigateTo('auth-login');
    return;
  }
  if (state.currentUser && !state.settings.profileCompleted && route !== 'auth-onboarding') {
    navigateTo('auth-onboarding');
    return;
  }
  if (state.currentUser && route === 'auth-onboarding' && state.settings.profileCompleted) {
    navigateTo('home');
    return;
  }
  renderRoute(route);
}

function renderRoute(route) {
  if (AUTH_ROUTES.includes(route)) {
    dom.appShell?.classList.add('hidden');
    dom.authContainer?.classList.remove('hidden');
    renderAuthRoute(route);
  } else {
    dom.appShell?.classList.remove('hidden');
    dom.authContainer?.classList.add('hidden');
    renderMainRoute(route);
  }
  highlightNavigation(route);
  const title = routeTitleMap[route] || 'SouFIT';
  document.title = `SouFIT · ${title}`;
}

function highlightNavigation(route) {
  dom.navButtons?.forEach((button) => {
    button.classList.toggle('active', button.dataset.route === route);
  });
  dom.bottomLinks?.forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });
}

function renderAuthRoute(route) {
  switch (route) {
    case 'auth-signup':
      renderAuthSignup();
      break;
    case 'auth-onboarding':
      renderAuthOnboarding();
      break;
    default:
      renderAuthLogin();
  }
}

function renderAuthLogin() {
  if (!dom.authContainer) return;
  dom.authContainer.innerHTML = `
    <div class="auth-card">
      <p class="text-uppercase text-muted">SouFIT</p>
      <h2>Login do Jogador</h2>
      <p class="text-muted">Entre com e-mail e senha para sincronizar seus dados.</p>
      <form id="loginForm" class="mt-4">
        <label class="form-label">E-mail</label>
        <input name="email" type="email" class="form-control mb-3" required placeholder="seu@exemplo.com">
        <label class="form-label">Senha</label>
        <input name="password" type="password" class="form-control mb-4" required minlength="8" placeholder="No mínimo 8 caracteres">
        <button type="submit" class="btn btn-primary w-100">Entrar</button>
      </form>
      <div class="d-flex justify-content-between mt-3">
        <button id="forgotPassword" class="btn btn-link p-0">Esqueci a senha</button>
        <button id="goToSignup" class="btn btn-link p-0">Criar conta</button>
      </div>
    </div>
  `;
  document.getElementById('loginForm')?.addEventListener('submit', handleLoginForm);
  document.getElementById('forgotPassword')?.addEventListener('click', handleForgotPassword);
  document.getElementById('goToSignup')?.addEventListener('click', () => navigateTo('auth-signup'));
}

function renderAuthSignup() {
  if (!dom.authContainer) return;
  dom.authContainer.innerHTML = `
    <div class="auth-card">
      <p class="text-uppercase text-muted">Nova conta</p>
      <h2>Cadastre-se como Jogador</h2>
      <p class="text-muted">Crie seu login para salvar treinos e dieta.</p>
      <form id="signupForm" class="mt-4">
        <label class="form-label">Nome completo</label>
        <input name="name" type="text" class="form-control mb-3" required placeholder="Seu nome">
        <label class="form-label">E-mail</label>
        <input name="email" type="email" class="form-control mb-3" required placeholder="seu@exemplo.com">
        <label class="form-label">Senha</label>
        <input name="password" type="password" class="form-control" required minlength="8" placeholder="8 caracteres ou mais">
        <button type="submit" class="btn btn-primary w-100 mt-4">Criar conta</button>
      </form>
      <div class="d-flex justify-content-between mt-3">
        <span class="text-muted">Já possui conta?</span>
        <button id="goToLogin" class="btn btn-link p-0">Entrar</button>
      </div>
    </div>
  `;
  document.getElementById('signupForm')?.addEventListener('submit', handleSignupForm);
  document.getElementById('goToLogin')?.addEventListener('click', () => navigateTo('auth-login'));
}

function renderAuthOnboarding() {
  if (!dom.authContainer) return;
  const muscleInputs = muscleGroupsList
    .map((group) => `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" name="muscle_groups" id="muscle-${group}" value="${group}">
        <label class="form-check-label" for="muscle-${group}">${group}</label>
      </div>
    `)
    .join('');
  dom.authContainer.innerHTML = `
    <div class="auth-card onboarding-card">
      <p class="text-uppercase text-muted">Onboarding</p>
      <h2>Monte seu perfil de Jogador</h2>
      <div class="onboarding-stepper">
        <span class="active"></span>
        <span></span>
        <span></span>
      </div>
      <form id="onboardingForm">
        <div class="onboarding-step active" data-step="0">
          <div class="mb-3">
            <label class="form-label">Nome</label>
            <input name="name" type="text" class="form-control" value="${state.profile?.name || state.currentUser?.displayName || ''}" required>
          </div>
          <div class="row gx-2">
            <div class="col">
              <label class="form-label">Idade</label>
              <input name="age" type="number" class="form-control" min="12" required>
            </div>
            <div class="col">
              <label class="form-label">Altura (cm)</label>
              <input name="height_cm" type="number" class="form-control" min="120" required>
            </div>
            <div class="col">
              <label class="form-label">Peso (kg)</label>
              <input name="weight_kg" type="number" class="form-control" min="30" required>
            </div>
          </div>
        </div>
        <div class="onboarding-step" data-step="1">
          <div class="row gx-2">
            <div class="col">
              <label class="form-label">Peito (cm)</label>
              <input name="chest_cm" type="number" class="form-control" min="60">
            </div>
            <div class="col">
              <label class="form-label">Cintura (cm)</label>
              <input name="waist_cm" type="number" class="form-control" min="60">
            </div>
          </div>
          <div class="row gx-2 mt-3">
            <div class="col">
              <label class="form-label">Quadril (cm)</label>
              <input name="hips_cm" type="number" class="form-control" min="70">
            </div>
            <div class="col">
              <label class="form-label">Braços (cm)</label>
              <input name="arm_cm" type="number" class="form-control" min="20">
            </div>
          </div>
          <div class="mt-4">
            <label class="form-label">Objetivo principal</label>
            <select name="goal" class="form-select" required>
              ${Object.entries(goalOptions)
                .map(([value, label]) => `<option value="${value}">${label}</option>`)
                .join('')}
            </select>
          </div>
        </div>
        <div class="onboarding-step" data-step="2">
          <div class="row gx-2">
            <div class="col">
              <label class="form-label">Frequência semanal</label>
              <input name="weekly_frequency" type="number" class="form-control" min="1" max="7" value="3" required>
            </div>
            <div class="col">
              <label class="form-label">Nível de treino</label>
              <select name="training_level" class="form-select" required>
                ${trainingLevels
                  .map((level) => `<option value="${level}">${level.charAt(0).toUpperCase() + level.slice(1)}</option>`)
                  .join('')}
              </select>
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label d-block">Grupos musculares prioritários</label>
            <div class="flex-gap">
              ${muscleInputs}
            </div>
          </div>
          <div class="mt-4">
            <label class="form-label">Tema preferido</label>
            <input type="hidden" name="theme_mode" value="${state.settings.themeMode}">
            <div class="d-flex gap-2">
              <button type="button" class="theme-pill ${state.settings.themeMode === 'light' ? 'active' : ''}" data-theme="light">Claro</button>
              <button type="button" class="theme-pill ${state.settings.themeMode === 'dark' ? 'active' : ''}" data-theme="dark">Escuro</button>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between mt-4">
          <button type="button" id="onboardingBack" class="btn btn-outline-light">Voltar</button>
          <div>
            <button type="button" id="onboardingNext" class="btn btn-outline-primary me-2">Próximo</button>
            <button type="submit" id="onboardingSubmit" class="btn btn-primary d-none">Finalizar</button>
          </div>
        </div>
      </form>
    </div>
  `;
  onboardingSections = [];
  updateOnboardingStep();
  document.getElementById('onboardingNext')?.addEventListener('click', handleOnboardingNext);
  document.getElementById('onboardingBack')?.addEventListener('click', handleOnboardingBack);
  document.getElementById('onboardingForm')?.addEventListener('submit', handleOnboardingFinish);
  document.querySelectorAll('.theme-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.theme-pill').forEach((item) => item.classList.remove('active'));
      pill.classList.add('active');
      const themeInput = document.querySelector('input[name="theme_mode"]');
      if (themeInput) {
        themeInput.value = pill.dataset.theme;
      }
      applyTheme(pill.dataset.theme);
    });
  });
}

let onboardingSections = [];

function updateOnboardingStep() {
  if (!onboardingSections.length) {
    onboardingSections = Array.from(document.querySelectorAll('.onboarding-step'));
  }
  onboardingSections.forEach((section) => {
    section.classList.toggle('active', Number(section.dataset.step) === state.onboardingStep);
  });
  document.querySelectorAll('.onboarding-stepper span').forEach((span, index) => {
    span.classList.toggle('active', index <= state.onboardingStep);
  });
  document.getElementById('onboardingNext')?.classList.toggle('d-none', state.onboardingStep >= onboardingSections.length - 1);
  document.getElementById('onboardingSubmit')?.classList.toggle('d-none', state.onboardingStep < onboardingSections.length - 1);
}

function handleOnboardingNext() {
  if (!validateOnboardingStep(state.onboardingStep)) return;
  state.onboardingStep = Math.min(state.onboardingStep + 1, onboardingSections.length - 1);
  updateOnboardingStep();
}

function handleOnboardingBack() {
  state.onboardingStep = Math.max(0, state.onboardingStep - 1);
  updateOnboardingStep();
}

function validateOnboardingStep(step) {
  const section = document.querySelector(`.onboarding-step[data-step="${step}"]`);
  if (!section) return true;
  const inputs = section.querySelectorAll('input[required], select[required]');
  for (const input of inputs) {
    if (!input.value) {
      input.focus();
      showToast('Preencha todos os campos obrigatórios.', 'warning');
      return false;
    }
  }
  return true;
}

async function handleLoginForm(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email?.value.trim();
  const password = form.password?.value;
  if (!email || !password) {
    showToast('Informe e-mail e senha.', 'warning');
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    form.reset();
    showToast('Bem-vindo de volta, Jogador!', 'success');
    navigateTo('home');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleSignupForm(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name?.value.trim();
  const email = form.email?.value.trim();
  const password = form.password?.value;
  if (!name || !email || !password) {
    showToast('Preencha todos os campos.', 'warning');
    return;
  }
  if (password.length < 8) {
    showToast('Use no mínimo 8 caracteres na senha.', 'warning');
    return;
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    state.currentUser = credential.user;
    showToast('Conta criada! Complete o onboarding.', 'success');
    navigateTo('auth-onboarding');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.querySelector('#loginForm input[name="email"]')?.value.trim();
  if (!email) {
    showToast('Informe o e-mail para recuperar.', 'warning');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Link de redefinição enviado no e-mail.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function handleOnboardingFinish(event) {
  event.preventDefault();
  if (!validateOnboardingStep(state.onboardingStep)) return;
  const form = event.target;
  const formData = new FormData(form);
  const profile = {
    name: formData.get('name')?.trim() || state.currentUser?.displayName || 'Jogador',
    email: state.currentUser?.email || '',
    age: Number(formData.get('age')) || null,
    height_cm: Number(formData.get('height_cm')) || null,
    weight_kg: Number(formData.get('weight_kg')) || null,
    measures: {
      chest: Number(formData.get('chest_cm')) || null,
      waist: Number(formData.get('waist_cm')) || null,
      hips: Number(formData.get('hips_cm')) || null,
      arm: Number(formData.get('arm_cm')) || null
    },
    goal: formData.get('goal') || 'manter',
    weekly_frequency: Math.min(Math.max(Number(formData.get('weekly_frequency')) || 3, 1), 7),
    muscle_groups: formData.getAll('muscle_groups')?.length ? formData.getAll('muscle_groups') : muscleGroupsList,
    training_level: formData.get('training_level') || 'iniciante',
    theme_mode: formData.get('theme_mode') || state.settings.themeMode,
    profileCompleted: true,
    updatedAt: new Date().toISOString()
  };
  state.profile = profile;
  state.settings.profileCompleted = true;
  applyTheme(profile.theme_mode);
  state.plan = generateWeeklyPlan(profile);
  state.dietPlan = generateDietPlan(profile);
  persistLocal('profile');
  persistLocal('plan');
  persistLocal('diet');
  markDirty('profile');
  markDirty('plan');
  markDirty('diet');
  flushSync();
  showToast('Perfil pronto! Gerando treino e dieta.', 'success');
  navigateTo('home');
}

async function flushSync() {
  if (!state.currentUser || !state.online) return;
  await syncProfileToFirestore();
  await syncPlanToFirestore();
  await syncDietToFirestore();
  state.meta.lastSyncAt = new Date().toISOString();
  persistMeta();
}

async function syncProfileToFirestore() {
  if (!state.currentUser || !state.profile) return;
  const payload = {
    profile: {
      ...state.profile,
      updatedAt: new Date().toISOString()
    }
  };
  try {
    await setDoc(doc(db, 'users', state.currentUser.uid), payload, { merge: true });
    state.dirty.profile = false;
    state.needsSync.profile = false;
    persistLocal('profile');
  } catch (error) {
    console.warn('Erro ao sincronizar perfil', error);
    state.needsSync.profile = true;
  }
}

async function syncPlanToFirestore() {
  if (!state.currentUser || !state.plan) return;
  const payload = {
    currentPlan: {
      ...state.plan,
      updatedAt: new Date().toISOString()
    }
  };
  try {
    await setDoc(doc(db, 'users', state.currentUser.uid), payload, { merge: true });
    state.dirty.plan = false;
    state.needsSync.plan = false;
    persistLocal('plan');
  } catch (error) {
    console.warn('Erro ao sincronizar plano', error);
    state.needsSync.plan = true;
  }
}

async function syncDietToFirestore() {
  if (!state.currentUser || !state.dietPlan) return;
  const payload = {
    dietPlan: {
      ...state.dietPlan,
      updatedAt: new Date().toISOString()
    }
  };
  try {
    await setDoc(doc(db, 'users', state.currentUser.uid), payload, { merge: true });
    state.dirty.diet = false;
    state.needsSync.diet = false;
    persistLocal('diet');
  } catch (error) {
    console.warn('Erro ao sincronizar dieta', error);
    state.needsSync.diet = true;
  }
}

function normalizeTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value.toDate) return value.toDate().toISOString();
  return new Date(value).toISOString();
}

async function loadRemoteData(user) {
  const userDoc = doc(db, 'users', user.uid);
  try {
    const snapshot = await getDoc(userDoc);
    if (!snapshot.exists()) {
      await setDoc(userDoc, { meta: { appVersion: state.meta.appVersion, lastSyncAt: serverTimestamp() } }, { merge: true });
      return;
    }
    const data = snapshot.data();
    if (data.profile) {
      const remoteProfile = { ...data.profile, updatedAt: normalizeTimestamp(data.profile.updatedAt) || new Date().toISOString() };
      if (!handleConflict('profile', remoteProfile)) {
        state.profile = remoteProfile;
        state.settings.profileCompleted = Boolean(remoteProfile.profileCompleted);
        state.settings.themeMode = remoteProfile.theme_mode || state.settings.themeMode;
        applyTheme(state.settings.themeMode);
        persistLocal('profile');
      }
    }
    if (data.currentPlan) {
      const remotePlan = { ...data.currentPlan, updatedAt: normalizeTimestamp(data.currentPlan.updatedAt) || new Date().toISOString() };
      if (!handleConflict('plan', remotePlan)) {
        state.plan = remotePlan;
        persistLocal('plan');
      }
    }
    if (data.dietPlan) {
      const remoteDiet = { ...data.dietPlan, updatedAt: normalizeTimestamp(data.dietPlan.updatedAt) || new Date().toISOString() };
      if (!handleConflict('diet', remoteDiet)) {
        state.dietPlan = remoteDiet;
        persistLocal('diet');
      }
    }
    state.meta.lastSyncAt = normalizeTimestamp(data.meta?.lastSyncAt) || new Date().toISOString();
    persistMeta();
  } catch (error) {
    console.warn('Erro ao carregar dados do Firebase', error);
  }
}

function handleConflict(type, remote) {
  if (!remote) return false;
  const property = getStateProperty(type);
  const local = state[property];
  const remoteTs = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
  const localTs = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0;
  if (local && state.dirty[type] && remoteTs && localTs && remoteTs > localTs) {
    state.conflictPayload = { type, remote, local };
    document.getElementById('conflictMessage').textContent = `O ${type === 'plan' ? 'treino' : type === 'diet' ? 'plano de dieta' : 'perfil'} mudou em outro dispositivo.`;
    bootstrapConflictModal.show();
    return true;
  }
  return false;
}

function resolveConflict(mode) {
  if (!state.conflictPayload) return;
  const { type, remote } = state.conflictPayload;
  const property = getStateProperty(type);
  if (mode === 'local') {
    markDirty(type);
    flushSync();
    showToast('Mantendo dados deste dispositivo.', 'success');
  } else if (mode === 'server') {
    state[property] = remote;
    state.dirty[type] = false;
    state.needsSync[type] = false;
    persistLocal(type);
    showToast('Dados atualizados com os do servidor.', 'success');
    renderRoute(state.route);
  } else if (mode === 'export') {
    downloadJson(state[property], `soufit-${type}-backup`);
  }
  bootstrapConflictModal.hide();
  state.conflictPayload = null;
}

function downloadJson(payload, prefix) {
  if (!payload) return;
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prefix}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderMainRoute(route) {
  if (!dom.pageContent || !dom.pageTitle || !dom.statusSubtitle) return;
  dom.pageTitle.textContent = routeTitleMap[route] || '';
  dom.statusSubtitle.textContent = state.profile && state.profile.name ? `Olá, Jogador ${state.profile.name}` : 'Recarregando dados';
  switch (route) {
    case 'home':
      renderHome();
      break;
    case 'workout':
      renderWorkout();
      break;
    case 'diet':
      renderDiet();
      break;
    case 'results':
      renderResults();
      break;
    case 'speed':
      renderSpeed();
      break;
    case 'profile':
      renderProfile();
      break;
    default:
      renderHome();
  }
  updatePlayerCard();
}

function renderHome() {
  const planCount = state.plan?.weekPlan?.length || 0;
  const exerciseCount = state.plan?.weekPlan?.reduce((sum, day) => sum + (day.exercises?.length || 0), 0) || 0;
  const macros = state.dietPlan?.macros;
  const goals = state.profile?.goal ? goalOptions[state.profile.goal] : 'Metas do Jogador';
  dom.pageContent.innerHTML = `
    <div class="cards-grid">
      <div class="paper-panel">
        <p class="text-muted mb-1">Plano Atual</p>
        <h3>${planCount} dias</h3>
        <p>${exerciseCount} exercícios programados</p>
        <button class="btn btn-sm btn-outline-light mt-3" data-action="regenerate-plan">Regenerar plano</button>
      </div>
      <div class="paper-panel">
        <p class="text-muted mb-1">Dieta ${goals}</p>
        <h3>${macros ? `${macros.calories} kcal` : 'Sem dados'}</h3>
        <p>${macros ? `${macros.protein}g proteína • ${macros.carbs}g carbs • ${macros.fat}g gorduras` : 'Finalize o onboarding'}</p>
        <button class="btn btn-sm btn-outline-light mt-3" data-action="sync-now">Sincronizar</button>
      </div>
      <div class="paper-panel">
        <p class="text-muted mb-1">Última sincronização</p>
        <h3>${state.meta.lastSyncAt ? new Date(state.meta.lastSyncAt).toLocaleString('pt-BR') : 'Ainda não sincronizado'}</h3>
        <p class="text-muted">${state.online ? 'Online' : 'Offline'}</p>
      </div>
    </div>
    <div class="paper-panel mt-3">
      <p class="text-muted mb-2">Resumo semanal</p>
      ${state.plan?.weekPlan?.map((day, index) => `
        <div class="plan-day">
          <div class="plan-day-header">
            <span><strong>${DAY_LABELS[index]}</strong> · ${day.focus}</span>
            <small>${day.exercises?.length || 0} ex.</small>
          </div>
          <ul>
            ${(day.exercises || []).map((exercise, eIndex) => `
              <li>
                <span>${exercise.name} (${exercise.sets} x ${exercise.reps})</span>
                <div class="small-btns">
                  <button class="btn btn-sm btn-outline-primary" data-action="edit-exercise" data-day-index="${index}" data-exercise-index="${eIndex}">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" data-action="delete-exercise" data-day-index="${index}" data-exercise-index="${eIndex}">Excluir</button>
                </div>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-sm btn-outline-success" data-action="add-exercise" data-day-index="${index}">Adicionar exercício</button>
        </div>
      `).join('') || '<p class="text-muted">Nenhum treino gerado ainda.</p>'}
    </div>
  `;
}

function renderWorkout() {
  if (!dom.pageContent) return;
  const plan = state.plan || { weekPlan: [] };
  dom.pageContent.innerHTML = `
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <p class="text-muted mb-1">Treinos semanais</p>
        <h3>${plan.weekPlan?.length || 0} dias carregados</h3>
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-light" data-action="regenerate-plan">Regenerar plano</button>
      </div>
    </div>
    <div class="cards-grid">
      ${plan.weekPlan?.map((day, index) => `
        <div class="plan-day">
          <div class="plan-day-header">
            <div>
              <strong>${DAY_LABELS[index] || 'Dia'}</strong>
              <div class="text-muted">Foco: ${day.focus}</div>
            </div>
            <span>${day.exercises?.length || 0} ex.</span>
          </div>
          <ul>
            ${(day.exercises || []).map((exercise, eIndex) => `
              <li>
                <div>
                  <strong>${exercise.name}</strong>
                  <small class="text-muted">${exercise.sets} · ${exercise.reps}</small>
                  <div class="text-muted" style="font-size:.8rem">${exercise.loadSuggestion || ''}</div>
                </div>
                <div class="small-btns">
                  <button class="btn btn-sm btn-outline-primary" data-action="edit-exercise" data-day-index="${index}" data-exercise-index="${eIndex}">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" data-action="delete-exercise" data-day-index="${index}" data-exercise-index="${eIndex}">Excluir</button>
                </div>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-sm btn-outline-success" data-action="add-exercise" data-day-index="${index}">Adicionar exercício</button>
        </div>
      `).join('') || '<p class="text-muted">Nenhum treino disponível.</p>'}
    </div>
  `;
}

function renderDiet() {
  if (!dom.pageContent) return;
  const diet = state.dietPlan;
  const macros = diet?.macros;
  const meals = diet?.meals || [];
  dom.pageContent.innerHTML = `
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <p class="text-muted mb-1">Plano de refeições</p>
        <h3>${macros ? `${macros.calories} kcal` : 'Sem dados'}</h3>
        <small class="text-muted">${macros ? `Proteína ${macros.protein}g · Carbs ${macros.carbs}g · Gorduras ${macros.fat}g` : 'Complete o onboarding'}</small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-light" data-action="upload-pdf" id="dietPdfTrigger">Upload PDF</button>
        <button class="btn btn-outline-danger" data-action="remove-pdf" id="removePdfBtn">Remover PDF</button>
      </div>
    </div>
    <div class="paper-panel">
      <div class="d-flex gap-2 mb-3 flex-wrap">
        <input id="newMealInput" class="form-control form-control-sm" placeholder="Nome da nova refeição">
        <button id="addMealBtn" class="btn btn-sm btn-success">Criar refeição</button>
      </div>
      <div class="flex-gap">
        ${meals
          .map((meal, mealIndex) => `
            <div class="plan-day">
              <div class="plan-day-header">
                <strong>${meal.name}</strong>
                <div class="small-btns">
                  <button class="btn btn-sm btn-outline-primary" data-action="add-diet-item" data-meal-index="${mealIndex}">+ item</button>
                  <button class="btn btn-sm btn-outline-danger" data-action="delete-meal" data-meal-index="${mealIndex}">Excluir refeição</button>
                </div>
              </div>
              <ul>
                ${meal.items?.map((item, itemIndex) => `
                  <li>
                    <div>
                      <strong>${item.name}</strong>
                      <div class="text-muted" style="font-size:.8rem">${item.portion || ''}</div>
                      <div class="text-muted" style="font-size:.7rem">${item.notes || ''}</div>
                    </div>
                    <div class="small-btns">
                      <button class="btn btn-sm btn-outline-primary" data-action="edit-diet-item" data-meal-index="${mealIndex}" data-item-index="${itemIndex}">Editar</button>
                      <button class="btn btn-sm btn-outline-danger" data-action="delete-diet-item" data-meal-index="${mealIndex}" data-item-index="${itemIndex}">Excluir</button>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `)
          .join('')}
      </div>
    </div>
    <div class="pdf-preview mt-4" id="dietPdfPreview"></div>
  `;
  renderDietPdfPreview();
}

function renderResults() {
  if (!dom.pageContent) return;
  const measures = state.profile?.measures;
  dom.pageContent.innerHTML = `
    <div class="paper-panel">
      <p class="text-muted mb-3">Medidas e status</p>
      <div class="cards-grid">
        <div>
          <strong>Peso</strong>
          <p>${state.profile?.weight_kg ? `${state.profile.weight_kg} kg` : '—'}</p>
        </div>
        <div>
          <strong>Altura</strong>
          <p>${state.profile?.height_cm ? `${state.profile.height_cm} cm` : '—'}</p>
        </div>
        <div>
          <strong>Cintura</strong>
          <p>${measures?.waist ? `${measures.waist} cm` : '—'}</p>
        </div>
        <div>
          <strong>Peito</strong>
          <p>${measures?.chest ? `${measures.chest} cm` : '—'}</p>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-muted mb-1">Objetivo atual</p>
        <h4>${state.profile?.goal ? goalOptions[state.profile.goal] : 'Defina no onboarding'}</h4>
      </div>
    </div>
  `;
}

function renderSpeed() {
  if (!dom.pageContent) return;
  dom.pageContent.innerHTML = `
    <div class="paper-panel">
      <h3>Velocidade & Corridas</h3>
      <p class="text-muted">Registre corridas, acompanhe ritmos e conquiste metas de speed. Ainda mais conteúdo chegando em breve.</p>
      <button class="btn btn-outline-light" data-action="sync-now">Atualizar Speed</button>
    </div>
  `;
}

function renderProfile() {
  if (!dom.pageContent) return;
  const profile = state.profile;
  dom.pageContent.innerHTML = `
    <div class="paper-panel">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <p class="text-muted mb-1">Jogador</p>
          <h3>${profile?.name || 'Team SouFIT'}</h3>
          <p class="text-muted">${profile?.email || 'Sem e-mail'}</p>
        </div>
        <div class="text-end">
          <p class="text-muted mb-1">Tema atual</p>
          <strong>${state.settings.themeMode === 'dark' ? 'Escuro' : 'Claro'}</strong>
          <br>
          <button class="btn btn-sm btn-outline-light mt-2" data-action="toggle-theme">Alternar</button>
        </div>
      </div>
      <div class="mt-4 cards-grid">
        <div>
          <small class="text-muted">Frequência semanal</small>
          <h4>${profile?.weekly_frequency || '-'}</h4>
        </div>
        <div>
          <small class="text-muted">Nível</small>
          <h4>${profile?.training_level || '-'}</h4>
        </div>
        <div>
          <small class="text-muted">Muscle focus</small>
          <h4>${(profile?.muscle_groups || []).join(', ') || '-'}</h4>
        </div>
      </div>
      <div class="mt-4 d-flex flex-wrap gap-2">
        <button class="btn btn-outline-success" data-action="regenerate-plan">Regenerar treino</button>
        <button class="btn btn-outline-success" data-action="regenerate-diet">Regenerar dieta</button>
        <button class="btn btn-outline-light" data-action="sync-now">Sincronizar agora</button>
      </div>
    </div>
  `;
}

function updatePlayerCard() {
  if (!dom.playerCard) return;
  dom.playerCard.innerHTML = `
    <div>
      <strong>${state.profile?.name || 'Jogador'}</strong>
      <p class="text-muted mb-1">${state.profile?.goal ? goalOptions[state.profile.goal] : 'Defina seu objetivo'}</p>
      <p class="text-muted">${state.profile?.weekly_frequency || '0'} treinos/semana</p>
    </div>
    <div>
      <span class="network-status" style="font-size:.8rem">${state.settings.profileCompleted ? 'Perfil completo' : 'Complete o onboarding'}</span>
    </div>
  `;
}

function renderDietPdfPreview() {
  const container = document.getElementById('dietPdfPreview');
  if (!container) return;
  const url = state.dietPlan?.dietPdfUrl;
  if (url) {
    container.innerHTML = `<object data="${url}" type="application/pdf">Documento disponível em <a href="${url}" target="_blank" rel="noreferrer">nova aba</a></object>`;
    return;
  }
  container.innerHTML = `<p class="text-muted">Nenhum PDF enviado ainda.</p>`;
}

function handleDietPdfSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploadDietPdf(file);
  event.target.value = '';
}

async function uploadDietPdf(file) {
  if (!state.currentUser) return;
  const storageRef = ref(storage, `diets/${state.currentUser.uid}/current.pdf`);
  try {
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    if (!state.dietPlan) state.dietPlan = generateDietPlan(state.profile || {});
    state.dietPlan.dietPdfUrl = url;
    state.dietPlan.uploadedAt = new Date().toISOString();
    markDirty('diet');
    persistLocal('diet');
    flushSync();
    renderRoute(state.route);
    showToast('PDF enviado com sucesso.', 'success');
  } catch (error) {
    showToast('Erro ao enviar PDF', 'error');
    console.warn(error);
  }
}

function removeDietPdf() {
  if (!state.dietPlan) return;
  state.dietPlan.dietPdfUrl = null;
  state.dietPlan.uploadedAt = null;
  markDirty('diet');
  persistLocal('diet');
  flushSync();
  showToast('PDF removido.', 'warning');
  renderRoute(state.route);
}

function handleRegeneratePlan() {
  state.plan = generateWeeklyPlan(state.profile || {});
  markDirty('plan');
  persistLocal('plan');
  flushSync();
  showToast('Plano regenerado com base no perfil.', 'success');
  renderRoute(state.route);
}

function handlePageAction(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  if (button.id === 'addMealBtn') {
    return handleAddMeal();
  }
  if (!action) return;
  switch (action) {
    case 'regenerate-plan':
      handleRegeneratePlan();
      break;
    case 'regenerate-diet':
      state.dietPlan = generateDietPlan(state.profile || {});
      markDirty('diet');
      persistLocal('diet');
      flushSync();
      showToast('Dieta regenerada.', 'success');
      renderRoute(state.route);
      break;
    case 'add-exercise':
      openExerciseModal({ dayIndex: Number(button.dataset.dayIndex) });
      break;
    case 'edit-exercise':
      openExerciseModal({ dayIndex: Number(button.dataset.dayIndex), exerciseIndex: Number(button.dataset.exerciseIndex) });
      break;
    case 'delete-exercise':
      deleteExercise(Number(button.dataset.dayIndex), Number(button.dataset.exerciseIndex));
      break;
    case 'add-diet-item':
      openDietItemModal({ mealIndex: Number(button.dataset.mealIndex) });
      break;
    case 'edit-diet-item':
      openDietItemModal({ mealIndex: Number(button.dataset.mealIndex), itemIndex: Number(button.dataset.itemIndex) });
      break;
    case 'delete-diet-item':
      deleteDietItem(Number(button.dataset.mealIndex), Number(button.dataset.itemIndex));
      break;
    case 'delete-meal':
      deleteMeal(Number(button.dataset.mealIndex));
      break;
    case 'upload-pdf':
      dom.dietPdfInput?.click();
      break;
    case 'remove-pdf':
      removeDietPdf();
      break;
    case 'sync-now':
      flushSync();
      showToast('Sincronização disparada.', 'success');
      break;
    case 'toggle-theme':
      toggleTheme();
      break;
    default:
      break;
  }
}

function populateExerciseSelect() {
  if (!dom.exerciseSelect) return;
  dom.exerciseSelect.innerHTML = exerciseLibrary
    .map((exercise) => `<option value="${exercise.id}">${exercise.name} · ${exercise.group}</option>`)
    .join('');
}

function deleteExercise(dayIndex, exerciseIndex) {
  const plan = state.plan;
  if (!plan?.weekPlan?.[dayIndex]) return;
  plan.weekPlan[dayIndex].exercises.splice(exerciseIndex, 1);
  plan.updatedAt = new Date().toISOString();
  markDirty('plan');
  persistLocal('plan');
  flushSync();
  renderRoute(state.route);
  showToast('Exercício removido.', 'warning');
}

function openExerciseModal(context) {
  if (context.dayIndex == null) return;
  state.exerciseModalContext = context;
  const { dayIndex, exerciseIndex } = context;
  const planDay = state.plan?.weekPlan?.[dayIndex];
  const setsInput = document.getElementById('exerciseSets');
  const repsInput = document.getElementById('exerciseReps');
  const loadInput = document.getElementById('exerciseLoad');
  const notesInput = document.getElementById('exerciseNotes');
  if (exerciseIndex != null && planDay?.exercises?.[exerciseIndex]) {
    const existing = planDay.exercises[exerciseIndex];
    document.getElementById('exerciseModalLabel').textContent = 'Editar Exercício';
    document.getElementById('exerciseSelect').value = exerciseLibrary.find((ex) => ex.name === existing.name)?.id || document.getElementById('exerciseSelect').value;
    if (setsInput) setsInput.value = existing.sets || '';
    if (repsInput) repsInput.value = existing.reps || '';
    if (loadInput) loadInput.value = existing.loadSuggestion || '';
    if (notesInput) notesInput.value = existing.notes || '';
  } else {
    document.getElementById('exerciseModalLabel').textContent = 'Adicionar Exercício';
    if (setsInput) setsInput.value = '';
    if (repsInput) repsInput.value = '';
    if (loadInput) loadInput.value = '';
    if (notesInput) notesInput.value = '';
  }
  bootstrapExerciseModal.show();
}

function handleExerciseFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const dayIndex = state.exerciseModalContext?.dayIndex;
  const exerciseIndex = state.exerciseModalContext?.exerciseIndex;
  if (dayIndex == null) return;
  const sets = form.querySelector('#exerciseSets')?.value || '';
  const reps = form.querySelector('#exerciseReps')?.value || '';
  const loadSuggestion = form.querySelector('#exerciseLoad')?.value || '';
  const notes = form.querySelector('#exerciseNotes')?.value || '';
  const templateId = form.querySelector('#exerciseSelect')?.value;
  const template = exerciseLibrary.find((item) => item.id === templateId);
  const exerciseData = {
    id: `${templateId || 'manual'}-${Date.now()}`,
    name: template?.name || form.querySelector('#exerciseSelect')?.selectedOptions?.[0]?.text || 'Exercício',
    group: template?.group || 'Core',
    sets: sets || template?.defaultSets || '',
    reps: reps || template?.defaultReps || '',
    loadSuggestion: loadSuggestion || template?.load || '',
    notes: notes || template?.notes || ''
  };
  if (!state.plan) state.plan = generateWeeklyPlan(state.profile || {});
  if (!state.plan.weekPlan[dayIndex]) state.plan.weekPlan[dayIndex] = { exercises: [] };
  if (exerciseIndex != null && state.plan.weekPlan[dayIndex].exercises[exerciseIndex]) {
    state.plan.weekPlan[dayIndex].exercises[exerciseIndex] = exerciseData;
  } else {
    state.plan.weekPlan[dayIndex].exercises = state.plan.weekPlan[dayIndex].exercises || [];
    state.plan.weekPlan[dayIndex].exercises.push(exerciseData);
  }
  state.plan.updatedAt = new Date().toISOString();
  markDirty('plan');
  persistLocal('plan');
  flushSync();
  bootstrapExerciseModal.hide();
  renderRoute(state.route);
  showToast('Exercício salvo.', 'success');
}

function refreshDietMealOptions() {
  if (!dom.dietItemMealSelect) return;
  const meals = state.dietPlan?.meals || [];
  dom.dietItemMealSelect.innerHTML = meals
    .map((meal, index) => `<option value="${index}">${meal.name}</option>`)
    .join('');
}

function openDietItemModal(context) {
  if (!state.dietPlan) state.dietPlan = generateDietPlan(state.profile || {});
  refreshDietMealOptions();
  state.dietModalContext = context;
  const mealIndex = context.mealIndex ?? 0;
  const meal = state.dietPlan.meals?.[mealIndex];
  const nameInput = document.getElementById('dietItemName');
  const portionInput = document.getElementById('dietItemPortion');
  const notesInput = document.getElementById('dietItemNotes');
  document.getElementById('dietItemModalLabel').textContent = context.itemIndex != null ? 'Editar item' : 'Adicionar item';
  if (context.itemIndex != null && meal?.items?.[context.itemIndex]) {
    const existing = meal.items[context.itemIndex];
    if (nameInput) nameInput.value = existing.name;
    if (portionInput) portionInput.value = existing.portion || '';
    if (notesInput) notesInput.value = existing.notes || '';
    dom.dietItemMealSelect.value = mealIndex.toString();
  } else {
    if (nameInput) nameInput.value = '';
    if (portionInput) portionInput.value = '';
    if (notesInput) notesInput.value = '';
    dom.dietItemMealSelect.value = mealIndex.toString();
  }
  bootstrapDietItemModal.show();
}

function handleDietItemFormSubmit(event) {
  event.preventDefault();
  const mealIndex = Number(document.getElementById('dietItemMeal')?.value || 0);
  if (!mealNames[mealIndex] && !state.dietPlan.meals?.[mealIndex]) return;
  const meal = state.dietPlan.meals[mealIndex];
  if (!meal) return;
  const name = document.getElementById('dietItemName')?.value?.trim();
  if (!name) {
    showToast('Informe o alimento.', 'warning');
    return;
  }
  const item = {
    id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    portion: document.getElementById('dietItemPortion')?.value || '',
    notes: document.getElementById('dietItemNotes')?.value || ''
  };
  if (state.dietModalContext?.itemIndex != null) {
    meal.items[state.dietModalContext.itemIndex] = item;
  } else {
    meal.items = meal.items || [];
    meal.items.push(item);
  }
  state.dietPlan.updatedAt = new Date().toISOString();
  markDirty('diet');
  persistLocal('diet');
  flushSync();
  bootstrapDietItemModal.hide();
  renderRoute(state.route);
  showToast('Item salvo na dieta.', 'success');
}

function deleteDietItem(mealIndex, itemIndex) {
  const meal = state.dietPlan?.meals?.[mealIndex];
  if (!meal?.items?.[itemIndex]) return;
  meal.items.splice(itemIndex, 1);
  state.dietPlan.updatedAt = new Date().toISOString();
  markDirty('diet');
  persistLocal('diet');
  flushSync();
  showToast('Item excluído.', 'warning');
  renderRoute(state.route);
}

function deleteMeal(mealIndex) {
  if (!state.dietPlan?.meals) return;
  state.dietPlan.meals.splice(mealIndex, 1);
  state.dietPlan.updatedAt = new Date().toISOString();
  markDirty('diet');
  persistLocal('diet');
  flushSync();
  showToast('Refeição removida.', 'warning');
  renderRoute(state.route);
}

function handleAddMeal() {
  const input = document.getElementById('newMealInput');
  const name = input?.value.trim();
  if (!name) {
    showToast('Informe o nome da refeição.', 'warning');
    return;
  }
  if (!state.dietPlan) state.dietPlan = generateDietPlan(state.profile || {});
  state.dietPlan.meals = state.dietPlan.meals || [];
  state.dietPlan.meals.push({ id: `meal-${Date.now()}`, name, items: [] });
  state.dietPlan.updatedAt = new Date().toISOString();
  markDirty('diet');
  persistLocal('diet');
  flushSync();
  if (input) input.value = '';
  renderRoute(state.route);
  showToast('Refeição adicionada.', 'success');
}

async function handleLogout() {
  try {
    await signOut(auth);
    state.profile = null;
    state.plan = null;
    state.dietPlan = null;
    state.settings.profileCompleted = false;
    showToast('Sessão encerrada.', 'success');
    navigateTo('auth-login');
  } catch (error) {
    showToast('Erro ao sair.', 'error');
  }
}

function generateWeeklyPlan(profile) {
  const frequency = Math.max(1, Math.min(profile?.weekly_frequency || 3, 7));
  const focusList = planSplits[frequency] || planSplits[3];
  const plan = {
    weekPlan: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  for (let i = 0; i < frequency; i += 1) {
    const focus = focusList[i] || focusList[focusList.length - 1];
    const groups = getFocusGroups(focus, profile?.muscle_groups || muscleGroupsList);
    const exercises = pickExercises(groups, profile?.training_level || 'iniciante', 4);
    plan.weekPlan.push({ focus, dayLabel: DAY_LABELS[i], exercises });
  }
  return plan;
}

function getFocusGroups(focus, preferred) {
  const mapping = {
    'Peito & Costas': ['Peito', 'Costas'],
    'Pernas & Core': ['Pernas', 'Core'],
    'Ombros & Braços': ['Ombros', 'Braços'],
    Superior: ['Peito', 'Costas', 'Ombros'],
    Inferior: ['Pernas', 'Core'],
    Push: ['Peito', 'Ombros', 'Braços'],
    Pull: ['Costas', 'Braços'],
    'Full Body': ['Peito', 'Costas', 'Pernas', 'Core'],
    Peito: ['Peito'],
    Costas: ['Costas'],
    Pernas: ['Pernas'],
    Ombros: ['Ombros'],
    Braços: ['Braços'],
    Core: ['Core']
  };
  const defaults = mapping[focus] || ['Peito', 'Costas', 'Pernas'];
  const prioritized = preferred.filter((group) => defaults.includes(group));
  return Array.from(new Set([...prioritized, ...defaults, ...preferred]));
}

function pickExercises(groups, level, count) {
  const levelIdx = levelOrder[level] ?? 0;
  const candidate = exerciseLibrary.filter((exercise) => groups.includes(exercise.group));
  const filtered = candidate.filter((exercise) => (levelOrder[exercise.level] ?? 0) <= levelIdx);
  const pool = filtered.length ? filtered : exerciseLibrary;
  const result = [];
  const copy = [...pool];
  while (result.length < count && copy.length) {
    const index = Math.floor(Math.random() * copy.length);
    const [picked] = copy.splice(index, 1);
    result.push(createExerciseInstance(picked));
  }
  return result;
}

function createExerciseInstance(template) {
  return {
    id: `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: template.name,
    group: template.group,
    sets: template.defaultSets,
    reps: template.defaultReps,
    loadSuggestion: template.load,
    notes: template.notes
  };
}

function generateDietPlan(profile) {
  const goal = profile?.goal || 'manter';
  const macros = calculateMacros(profile);
  const mealTemplate = dietLibrary[goal] || dietLibrary.manter;
  const meals = mealNames.map((name, index) => ({
    id: `${name.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
    name,
    items: (mealTemplate[name] || []).map((item) => ({ ...item }))
  }));
  return {
    goalType: goal,
    macros,
    meals,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function calculateMacros(profile) {
  const weight = profile?.weight_kg || 70;
  const height = profile?.height_cm || 170;
  const age = profile?.age || 25;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  const tdee = Math.round(bmr * 1.35);
  const goal = profile?.goal || 'manter';
  let calories = tdee;
  if (goal === 'deficit') calories -= 350;
  if (goal === 'massa') calories += 300;
  const protein = Math.max(60, Math.round(weight * 2));
  const carbs = Math.max(80, Math.round((calories * (goal === 'massa' ? 0.5 : goal === 'deficit' ? 0.35 : 0.4)) / 4));
  const fat = Math.max(25, Math.round((calories * 0.25) / 9));
  return { calories, protein, carbs, fat };
}

document.addEventListener('DOMContentLoaded', initApp);
