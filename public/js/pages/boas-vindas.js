// Boas-vindas guiadas pelo pet: objetivo, corpo e rotina → meta calórica explicada.
import { getDb } from '../config/firebase-config.js';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { watchProtectedPage } from '../modules/auth.js';
import { parsePersonalData } from '../modules/personal-data.js';
import { ACTIVITY_LEVELS, calculateNutritionGoals, goalSummaryHTML, missingGoalInputs } from '../modules/nutrition-goals.js';
import { setupAppShell } from '../utils/app-shell.js';
import { renderIcons } from '../utils/icons.js';
import { PETS, getPet, petAvatarHTML, petId, petPickerHTML, rememberPet } from '../utils/pet.js';
import { removeSessionItems, setLocalItem } from '../utils/storage.js';
import { setButtonLoading, showToast } from '../utils/ui.js';

setupAppShell();
document.title = 'Boas-vindas · Mol';

const db = await getDb();
const form = /** @type {HTMLFormElement} */ (document.querySelector('[data-form]'));
const $ = selector => /** @type {any} */ (document.querySelector(selector));
const field = name => /** @type {any} */ (form.elements.namedItem(name));
const steps = /** @type {HTMLElement[]} */ ([...document.querySelectorAll('[data-step]')]);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let index = 0;
let weekly = 3;
let user = null;
let saved = false;

const speechByStep = {
  goal: () => 'Me conta: o que você quer conquistar?',
  body: () => 'Agora uns dados rápidos para eu calcular sua meta.',
  routine: () => 'Quase lá. Como é o seu dia a dia?',
  plan: pet => pet.lines.plan
};

function pet() { return PETS[petId(field('pet')?.value || getPet().id)]; }

function renderPet(step) {
  const current = pet();
  // Cada passo tem um estado do pet: apresenta, pergunta, foca, fica pronto e comemora o plano.
  const state = { pet: 'principal', goal: 'curioso', body: 'focado', routine: 'pronto', plan: 'conquista' }[step];
  $('[data-pet-avatar]').innerHTML = petAvatarHTML(current, { size: 88, label: true, state });
  $('[data-speech]').textContent = step === 'pet' ? current.lines.welcome : speechByStep[step](current);
}

function goalInputs() {
  const data = new FormData(form);
  const text = name => String(data.get(name) || '');
  return { sexo: text('sex'), nascimento: text('birth'), alturaCm: Number(text('height')), pesoKg: Number(text('weight').replace(',', '.')), nivelAtividade: text('activity'), treinosSemana: weekly, objetivo: text('goal') };
}

function show(next) {
  const change = () => {
    steps.forEach((step, position) => { step.hidden = position !== next; });
    index = next;
    const name = steps[next].dataset.step;
    $('[data-progress]').value = next + 1;
    $('[data-progress]').textContent = `Passo ${next + 1} de ${steps.length}`;
    $('[data-progress]').setAttribute('aria-label', `Boas-vindas: passo ${next + 1} de ${steps.length}`);
    $('[data-back]').hidden = next === 0 || name === 'plan';
    $('[data-next]').hidden = name === 'plan';
    $('[data-skip]').hidden = name === 'plan';
    renderPet(name);
    /** @type {HTMLElement | null} */ (steps[next].querySelector('h1, h2'))?.focus({ preventScroll: true });
  };
  if (!reduceMotion && document.startViewTransition) document.startViewTransition(change);
  else change();
}

async function saveProfile({ complete }) {
  const choice = pet().id;
  rememberPet(choice);
  const data = { assistentePet: choice, onboardingConcluido: true };
  const inputs = goalInputs();
  if (complete) {
    const parsed = parsePersonalData({ sex: inputs.sexo, birth: inputs.nascimento, activity: inputs.nivelAtividade, height: field('height').value, goalWeight: '', goal: inputs.objetivo, weekly: String(weekly) });
    delete parsed.metaPesoKg; // a meta de peso não é perguntada aqui; não apaga uma já salva
    Object.assign(data, parsed);
    const goals = calculateNutritionGoals(inputs);
    if (goals) Object.assign(data, { metaCalorias: goals.kcal, dailyCalorieGoal: goals.kcal, macroGoals: goals.macroGoals });
  }
  await setDoc(doc(db, 'users', user.uid), data, { merge: true });
  if (complete && inputs.pesoKg >= 20 && inputs.pesoKg <= 400) await addDoc(collection(db, 'pesos'), { userId: user.uid, pesoKg: inputs.pesoKg, registradoEm: serverTimestamp() });
  removeSessionItems(`mol-profile-cache-${user.uid}`, `mol-profile-dashboard-${user.uid}`);
  setLocalItem(`mol-onboarding-done-${user.uid}`, '1');
  saved = true;
}

function renderPlan() {
  const inputs = goalInputs();
  const goals = calculateNutritionGoals(inputs);
  const current = pet();
  $('[data-plan]').innerHTML = `<p class="app-page-header__eyebrow">Meta diária</p>${goalSummaryHTML(goals, missingGoalInputs(inputs))}${goals ? '' : '<p class="mt-2">Você pode completar depois em Perfil › Dados pessoais.</p>'}<p class="mt-4 border-t border-white/5 pt-4">Meta de treino: <strong class="text-white">${weekly} ${weekly === 1 ? 'treino' : 'treinos'} por semana</strong>.</p>`;
  const who = current.id === 'nenhum' ? 'o assistente' : current.name;
  $('[data-plan-actions]').innerHTML = `
    <button type="button" class="mol-btn mol-btn-primary onboarding__next" data-start>Começar a usar o Mol</button>
    <button type="button" class="mol-btn mol-btn-secondary" data-ai="treino"><i data-lucide="sparkles" aria-hidden="true"></i> Montar meu primeiro treino com ${who}</button>
    <button type="button" class="mol-btn mol-btn-secondary" data-ai="dieta"><i data-lucide="sparkles" aria-hidden="true"></i> Montar minha dieta com ${who}</button>`;
  $('[data-start]').onclick = () => location.replace('../index.html');
  document.querySelectorAll('[data-ai]').forEach((/** @type {HTMLButtonElement} */ button) => {
    button.onclick = async () => {
      const kind = button.dataset.ai;
      const { openAssistantSheet } = await import('../utils/assistant-chat.js');
      const profile = `Objetivo: ${inputs.objetivo || 'não informado'}. Treinos por semana: ${weekly}.${goals ? ` Meta: ${goals.kcal} kcal, proteína ${goals.macroGoals.protein} g, carboidrato ${goals.macroGoals.carbs} g, gordura ${goals.macroGoals.fat} g.` : ''}`;
      openAssistantSheet({
        title: current.id === 'nenhum' ? 'Assistente' : current.name,
        context: `A pessoa acabou de criar a conta e passou pelas boas-vindas. ${profile} Ajude a montar ${kind === 'treino' ? 'a primeira rotina de treino (use propor_rotina)' : 'a primeira dieta dentro da meta (use propor_dieta)'}. Faça no máximo duas perguntas antes de propor.`,
        intro: kind === 'treino' ? 'Vamos montar seu primeiro treino. Me diga onde você treina (academia, casa) e quanto tempo tem por sessão.' : 'Vamos montar sua dieta dentro da meta. Me diga quantas refeições você faz por dia e o que não pode faltar.',
        suggestions: kind === 'treino' ? ['Treino na academia, 1 hora', 'Treino em casa, sem equipamento'] : ['4 refeições por dia', 'Tenho uma dieta em foto ou PDF']
      });
    };
  });
  renderIcons();
}

function validStep(name) {
  const data = new FormData(form);
  if (name === 'body') {
    const height = Number(data.get('height')), weight = Number(String(data.get('weight') || '').replace(',', '.'));
    if (data.get('height') && !(height >= 100 && height <= 250)) return 'A altura deve ficar entre 100 e 250 cm.';
    if (data.get('weight') && !(weight >= 20 && weight <= 400)) return 'O peso deve ficar entre 20 e 400 kg.';
    try { parsePersonalData({ birth: data.get('birth') || '' }); } catch (error) { return error.message; }
  }
  return '';
}

$('[data-pet-picker]').innerHTML = petPickerHTML('pet', getPet().id);
$('[data-activity]').innerHTML = ACTIVITY_LEVELS.map(level => `<label class="onboarding-choice onboarding-choice--compact"><input type="radio" class="sr-only" name="activity" value="${level.id}"><span><strong>${level.label}</strong></span></label>`).join('');
form.addEventListener('change', event => { if (/** @type {HTMLInputElement} */ (event.target).name === 'pet') renderPet('pet'); });
document.querySelectorAll('[data-weekly]').forEach((/** @type {HTMLButtonElement} */ button) => {
  button.addEventListener('click', () => {
    weekly = Math.min(7, Math.max(1, weekly + Number(button.dataset.weekly)));
    $('[data-weekly-value]').textContent = String(weekly);
  });
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!user) return showToast('Aguarde o carregamento da conta.');
  const name = steps[index].dataset.step;
  const problem = validStep(name);
  if (problem) return showToast(problem);
  if (steps[index + 1]?.dataset.step === 'plan') {
    const button = $('[data-next]');
    setButtonLoading(button, true);
    try { await saveProfile({ complete: true }); }
    catch (error) { console.error('Boas-vindas não salvas:', error); setButtonLoading(button, false); return showToast(error?.message?.includes('deve') ? error.message : 'Não foi possível salvar agora. Tente de novo.'); }
    setButtonLoading(button, false);
    renderPlan();
  }
  show(index + 1);
});

$('[data-back]').addEventListener('click', () => show(Math.max(0, index - 1)));
$('[data-skip]').addEventListener('click', async () => {
  if (!user) return;
  // Marca no aparelho também: sem conexão, o perfil ainda não diz que terminou e o Início traria a pessoa de volta.
  setLocalItem(`mol-onboarding-done-${user.uid}`, '1');
  try { if (!saved) await saveProfile({ complete: false }); } catch (error) { console.warn('Pular boas-vindas:', error.message); }
  location.replace('../index.html');
});

steps.forEach(step => step.querySelector('h1, h2')?.setAttribute('tabindex', '-1'));
show(0);
renderIcons();

watchProtectedPage(current => { user = current; });
