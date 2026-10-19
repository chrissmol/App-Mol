import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, getDb } from '../config/firebase-config.js';
const db = await getDb();
import { escapeHTML, showToast } from './ui.js';
import { getLocalItem, setLocalItem } from './storage.js';
import { withTimeout } from './timeout.js';

export const APP_MODULE_FIELD = 'appModules';
export const MODULE_PRESETS = {
  complete: { treino: true, dieta: true, progresso: true, evolucao: true, conquistas: true, assistente: true },
  training: { treino: true, dieta: false, progresso: false, evolucao: false, conquistas: false, assistente: true },
  trainingDiet: { treino: true, dieta: true, progresso: false, evolucao: false, conquistas: false, assistente: true },
  custom: null,
};

export const MODULE_DEFINITIONS = [
  { id: 'treino', label: 'Treinos', description: 'Rotinas, séries, descanso, histórico e execução na academia.', icon: 'dumbbell', required: true },
  { id: 'dieta', label: 'Dieta', description: 'Refeições, jejum e acompanhamento nutricional.', icon: 'apple' },
  { id: 'progresso', label: 'Progresso', description: 'Métricas, volume, tendências e evolução por exercício.', icon: 'chart-no-axes-combined' },
  { id: 'evolucao', label: 'Evolução corporal', description: 'Peso, medidas, consistência e evolução corporal.', icon: 'scale' },
  { id: 'conquistas', label: 'Conquistas', description: 'Badges, marcos, gamificação e molduras do perfil.', icon: 'trophy' },
  { id: 'assistente', label: 'Assistente de IA', description: 'Tira dúvidas e ajusta dieta e treino, sempre com a sua confirmação.', icon: 'sparkles' },
];

export const DEFAULT_APP_MODULES = { ...MODULE_PRESETS.complete };

const storageKey = uid => `mol-app-modules-${uid || 'guest'}`;
const VALID_IDS = MODULE_DEFINITIONS.map(item => item.id);

export function normalizeAppModules(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return VALID_IDS.reduce((result, id) => {
    result[id] = id === 'treino' ? true : source[id] !== false;
    return result;
  }, {});
}

export function presetFromModules(value = {}) {
  const modules = normalizeAppModules(value);
  const same = preset => Object.entries(preset).every(([key, enabled]) => modules[key] === enabled);
  if (same(MODULE_PRESETS.complete)) return 'complete';
  if (same(MODULE_PRESETS.training)) return 'training';
  if (same(MODULE_PRESETS.trainingDiet)) return 'trainingDiet';
  return 'custom';
}

export function getStoredAppModules(uid = auth.currentUser?.uid) {
  try { return normalizeAppModules(JSON.parse(getLocalItem(storageKey(uid)) || '{}')); }
  catch { return { ...DEFAULT_APP_MODULES }; }
}

export function cacheAppModules(value, uid = auth.currentUser?.uid) {
  const modules = normalizeAppModules(value);
  setLocalItem(storageKey(uid), JSON.stringify(modules));
  window.dispatchEvent(new CustomEvent('mol-app-modules-changed', { detail: modules }));
  return modules;
}

export async function syncAppModulesForUser(user = auth.currentUser) {
  if (!user) return cacheAppModules(getStoredAppModules());
  const snapshot = await withTimeout(getDoc(doc(db, 'users', user.uid)), 'Os módulos do app');
  const remote = snapshot.data()?.[APP_MODULE_FIELD];
  if (remote) return cacheAppModules(remote, user.uid);
  const local = getStoredAppModules(user.uid);
  await setDoc(doc(db, 'users', user.uid), { [APP_MODULE_FIELD]: local }, { merge: true });
  return cacheAppModules(local, user.uid);
}

export async function saveAppModules(value, user = auth.currentUser) {
  const modules = cacheAppModules(value, user?.uid);
  if (user) await setDoc(doc(db, 'users', user.uid), { [APP_MODULE_FIELD]: modules }, { merge: true });
  return modules;
}

export function pageModule(page = location.pathname.split('/').pop() || 'index.html') {
  const normalized = page === '' ? 'index.html' : page;
  if (normalized === 'dieta.html') return 'dieta';
  if (['progresso.html', 'historico.html'].includes(normalized)) return 'progresso';
  if (['evolucao.html'].includes(normalized)) return 'evolucao';
  if (normalized === 'assistente.html') return 'assistente';
  return null;
}

export function isPageAllowed(page, modules = getStoredAppModules()) {
  const module = pageModule(page);
  return !module || normalizeAppModules(modules)[module] !== false;
}

export function cardAllowed(cardId, modules = getStoredAppModules()) {
  const m = normalizeAppModules(modules);
  if (['next-meal-card', 'fasting-card'].includes(cardId)) return m.dieta;
  if (['weekly-card', 'last-session-card', 'insights-card'].includes(cardId)) return m.progresso;
  if (cardId === 'weight-card') return m.evolucao;
  return true;
}

export function moduleDisabledMessage(page = location.pathname.split('/').pop() || 'index.html') {
  const module = pageModule(page);
  const definition = MODULE_DEFINITIONS.find(item => item.id === module);
  return definition ? `${definition.label} está desativado no seu perfil.` : 'Este módulo está desativado no seu perfil.';
}

export function showDisabledModuleScreen({ page = location.pathname.split('/').pop() || 'index.html', inPages = location.pathname.includes('/pages/') } = {}) {
  const main = document.querySelector('main');
  if (!main) return;
  const settingsHref = `${inPages ? './' : './pages/'}configuracoes.html#experience`;
  const homeHref = inPages ? '../index.html' : './index.html';
  main.innerHTML = `
    <section class="glass-card mx-auto mt-10 max-w-md rounded-3xl p-6 text-center">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neon/10 text-neon"><i data-lucide="sliders-horizontal" class="h-6 w-6"></i></span>
      <p class="mt-5 text-xs font-bold uppercase tracking-[.16em] text-neon">Experiência personalizada</p>
      <h1 class="mt-2 text-2xl font-extrabold">${escapeHTML(moduleDisabledMessage(page))}</h1>
      <p class="mt-3 text-sm leading-relaxed text-gray-500">Você pode reativar essa área a qualquer momento nas Configurações.</p>
      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <a href="${settingsHref}" class="flex min-h-12 items-center justify-center rounded-2xl bg-neon px-4 text-sm font-bold text-black">Ativar módulo</a>
        <a href="${homeHref}" class="flex min-h-12 items-center justify-center rounded-2xl mol-soft px-4 text-sm font-bold text-gray-300">Ir para início</a>
      </div>
    </section>`;
  document.body.setAttribute('aria-busy', 'false');
  window.lucide?.createIcons();
  showToast(moduleDisabledMessage(page));
}

export function applyModuleVisibility(modules = getStoredAppModules(), root = document) {
  const normalized = normalizeAppModules(modules);
  root.querySelectorAll('[data-requires-module]').forEach(element => {
    const required = String(element.dataset.requiresModule || '').split(',').map(item => item.trim()).filter(Boolean);
    const visible = required.every(id => normalized[id] !== false);
    element.classList.toggle('hidden', !visible);
  });
}
