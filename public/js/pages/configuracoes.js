import { setupAppShell } from '../utils/app-shell.js';
import { auth, db, googleProvider } from '../config/firebase-config.js';
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from 'firebase/auth';
import { clearIndexedDbPersistence, collection, doc, getCountFromServer, getDoc, getDocs, query, setDoc, terminate, waitForPendingWrites, where, writeBatch } from 'firebase/firestore';
import { activateDialog, confirmAction, setButtonLoading, showToast } from '../utils/ui.js';
import { applyAccessibilityPreferences, getAccessibilityPreferences, saveAccessibilityPreferences, syncAccessibilityForUser } from '../utils/accessibility.js';
import { applyLanguage, supportedLanguages } from '../utils/language.js';
import { removeLocalItemsWithPrefix } from '../utils/storage.js';
import { isTrustedDevice, setTrustedDevice } from '../utils/offline.js';
import { getReminderPreferences, requestReminderPermission, saveReminderPreferences, sendTestReminder } from '../utils/reminders.js';
import { watchProtectedPage } from '../modules/auth.js';
import { MODULE_DEFINITIONS, MODULE_PRESETS, normalizeAppModules, presetFromModules, saveAppModules, syncAppModulesForUser } from '../utils/app-modules.js';

setupAppShell();

const $ = id => document.getElementById(id);
const isStandalone = () => window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
const isIosDevice = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function renderInstallCard() {
  const card = $('install-card');
  const button = $('install-app');
  if (!card || !button) return;
  const installed = isStandalone();
  const hasPrompt = Boolean(window.__molInstallPrompt);
  const ios = isIosDevice();
  const shouldShow = !installed;
  card.classList.toggle('hidden', !shouldShow);
  if (!shouldShow) {
    $('app-status').textContent = installed ? 'Mol já está instalado neste aparelho.' : '';
    return;
  }
  $('install-title').textContent = ios ? 'Adicionar à Tela de Início' : 'Baixar o Mol neste aparelho';
  $('install-description').textContent = ios
    ? 'No iPhone ou iPad, toque em Compartilhar e escolha “Adicionar à Tela de Início”.'
    : hasPrompt
      ? 'Instale o Mol para abrir em tela cheia, com acesso mais rápido na academia.'
      : 'Se o botão nativo não abrir, use o ícone de instalar na barra do navegador ou o menu do Chrome.';
  button.disabled = false;
  button.querySelector('span').textContent = hasPrompt ? 'Instalar no dispositivo' : 'Como baixar o Mol';
  window.lucide?.createIcons();
}

async function installApplication() {
  const button = $('install-app');
  const ios = isIosDevice();
  if (ios && !window.__molInstallPrompt) {
    $('app-status').textContent = 'No Safari: toque em Compartilhar e depois em “Adicionar à Tela de Início”.';
    showToast('Use Compartilhar > Adicionar à Tela de Início.', 'success');
    return;
  }
  const prompt = window.__molInstallPrompt;
  if (!prompt) {
    $('app-status').textContent = 'No Chrome/Edge: clique no ícone de instalar na barra de endereço ou abra o menu do navegador e escolha “Instalar Mol”.';
    showToast('Use o ícone de instalar na barra do navegador.', 'success');
    return;
  }
  const original = button.innerHTML;
  setButtonLoading(button, true, original);
  try {
    await prompt.prompt();
    window.__molInstallPrompt = null;
    $('app-status').textContent = 'Se você confirmou, o Mol já foi instalado neste aparelho.';
    showToast('Instalação iniciada.', 'success');
    renderInstallCard();
  } catch {
    $('app-status').textContent = 'Não foi possível abrir a instalação agora.';
    showToast('Não foi possível instalar agora.');
  } finally {
    setButtonLoading(button, false, original);
    window.lucide?.createIcons();
  }
}

async function updateApplication() {
  if (!navigator.onLine) throw new Error('Conecte-se à internet para atualizar o aplicativo.');
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  const registration = await navigator.serviceWorker?.getRegistration?.();
  await registration?.unregister?.();
  location.reload();
}

function clearTemporaryData() {
  removeLocalItemsWithPrefix('mol-profile-cache-');
  removeLocalItemsWithPrefix('mol-progress-cache-');
  removeLocalItemsWithPrefix('mol-history-cache-');
  try { window.sessionStorage.clear(); } catch { /* armazenamento pode estar indisponível */ }
}

$('refresh-app')?.addEventListener('click', async () => {
  const confirmed = await confirmAction({ title: 'Atualizar aplicativo?', message: 'O Mol vai buscar os arquivos mais recentes e recarregar esta tela. Seus dados e preferências serão preservados.', confirmText: 'Atualizar' });
  if (!confirmed) return;
  const button = $('refresh-app');
  const original = button.innerHTML;
  setButtonLoading(button, true, original);
  try { await updateApplication(); }
  catch (error) { setButtonLoading(button, false, original); window.lucide?.createIcons(); $('app-status').textContent = error.message || 'Não foi possível atualizar o aplicativo.'; showToast(error.message || 'Não foi possível atualizar o aplicativo.'); }
});

$('clear-temporary')?.addEventListener('click', async () => {
  const confirmed = await confirmAction({ title: 'Limpar dados temporários?', message: 'Serão removidos caches de carregamento e histórico local da sessão. Seus treinos, dieta, conta e preferências serão preservados.', confirmText: 'Limpar' });
  if (!confirmed) return;
  clearTemporaryData();
  $('app-status').textContent = 'Dados temporários removidos deste aparelho.';
  showToast('Dados temporários limpos.', 'success');
});

$('install-app')?.addEventListener('click', installApplication);
window.addEventListener('mol-install-available', renderInstallCard);
window.addEventListener('appinstalled', () => {
  window.__molInstallPrompt = null;
  renderInstallCard();
  showToast('Mol instalado neste aparelho.', 'success');
});

let appearance = getAccessibilityPreferences();
const themeChoices = [
  ['system', 'monitor', 'Sistema'],
  ['dark', 'moon', 'Escuro'],
  ['light', 'sun', 'Claro']
];
const visualStyleChoices = [
  ['classic', 'star', 'Clássico', 'Mol limpo, foco no treino e verde como assinatura.'],
  ['gamer', 'monitor', 'Gamer neon', 'Mais brilho, contraste de LED e energia noturna.'],
  ['cave', 'lock-keyhole', 'Caveira', 'Mais escuro, seco e concentrado, sem trocar o verde.']
];
const languageChoices = [
  ['system', 'smartphone', 'Sistema'],
  ...supportedLanguages.map(language => [language.code, 'languages', language.label])
];
const modulePresetChoices = [
  ['complete', 'sparkles', 'Completo', 'Tudo ativo: treino, dieta, progresso, evolução e conquistas.'],
  ['training', 'dumbbell', 'Modo caverna', 'Só o essencial para abrir, treinar e registrar.'],
  ['trainingDiet', 'apple', 'Treino + dieta', 'Mantém treino e alimentação, sem módulos extras.'],
  ['custom', 'sliders-horizontal', 'Personalizado', 'Você escolhe exatamente o que aparece no app.'],
];
let appModules = normalizeAppModules();
let selectedModulePreset = null;

function applyAppearance() {
  appearance = applyAccessibilityPreferences(appearance);
  $('theme-segments').querySelectorAll('button').forEach(button => {
    const selected = button.dataset.theme === appearance.theme;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('visual-style-segments').querySelectorAll('button').forEach(button => {
    const selected = button.dataset.visualStyle === appearance.visualStyle;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('contrast').checked = appearance.contrast;
  $('large-text').checked = appearance.largeText;
  $('reduce-motion').checked = appearance.reduceMotion;
  ['animations', 'sound', 'vibration'].forEach(id => { if ($(id)) $(id).checked = appearance[id]; });
  [['density-segments', 'density'], ['card-style-segments', 'cardStyle'], ['dashboard-layout-segments', 'dashboardLayout']].forEach(([id, key]) => $(id)?.querySelectorAll('button').forEach(button => button.classList.toggle('is-active', button.dataset.value === appearance[key])));
  $('language-segments').querySelectorAll('button').forEach(button => {
    const selected = button.dataset.language === appearance.language.mode;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const language = applyLanguage(appearance.language);
  $('language-status').textContent = appearance.language.mode === 'system'
    ? `Usando o idioma do aparelho: ${language}.`
    : `Idioma fixado em ${language}.`;
}

async function persistAppearance() {
  applyAppearance();
  try {
    appearance = await saveAccessibilityPreferences(appearance);
  } catch (error) {
    console.warn('Preferências salvas apenas neste dispositivo:', error.message);
    // Preferências visuais continuam aplicadas localmente sem interromper a troca de tema.
  }
}

themeChoices.forEach(([value, icon, label]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.theme = value;
  button.className = 'flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold';
  button.innerHTML = `<i data-lucide="${icon}" class="h-4 w-4"></i><span>${label}</span>`;
  button.onclick = () => { appearance.theme = value; persistAppearance(); };
  $('theme-segments').appendChild(button);
});

visualStyleChoices.forEach(([value, icon, label, description]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.visualStyle = value;
  button.className = `visual-style-choice visual-style-choice--${value}`;
  button.innerHTML = `<span class="visual-style-choice__swatch" aria-hidden="true"></span><span class="min-w-0"><strong>${label}</strong><small>${description}</small></span><i data-lucide="${icon}" class="h-4 w-4 shrink-0"></i>`;
  button.onclick = () => { appearance.visualStyle = value; persistAppearance(); };
  $('visual-style-segments').appendChild(button);
});

const preferenceSegments = [
  ['density-segments', 'density', [['comfortable', 'Confortável'], ['compact', 'Compacta']]],
  ['card-style-segments', 'cardStyle', [['discreet', 'Discreto'], ['elevated', 'Elevado'], ['neon', 'Neon']]],
  ['dashboard-layout-segments', 'dashboardLayout', [['automatic', 'Automática'], ['custom', 'Personalizada']]]
];
preferenceSegments.forEach(([id, key, choices]) => choices.forEach(([value, label]) => {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.value = value; button.className = 'theme-segment'; button.textContent = label;
  button.onclick = () => { appearance[key] = value; persistAppearance(); }; $(id)?.appendChild(button);
}));

const frameChoices = [['plastic', 'Base', true], ['wood', 'Madeira', false], ['bronze', 'Bronze', false], ['silver', 'Prata', false], ['gold', 'Ouro', false], ['diamond', 'Diamante', false], ['boss', 'Chefão', String(auth.currentUser?.email || '').toLowerCase() === 'chrisouzamol@gmail.com']];
let selectedFrame = null;
let frameProgress = 0;
async function renderUnlockedFrameChoices(user) {
  const root = $('frame-choices');
  if (!root || !user) return;
  const profileSnapshot = await getDoc(doc(db, 'users', user.uid));
  const sessionCount = await getCountFromServer(query(collection(db, 'sessoes'), where('userId', '==', user.uid)));
  frameProgress = Number(sessionCount.data().count || 0);
  const admin = String(user.email || '').toLowerCase() === 'chrisouzamol@gmail.com';
  const requirements = [0, 5, 15, 30, 60, 100, 0];
  const options = frameChoices.map(([id, label], index) => [id, label, requirements[index]]);
  const current = selectedFrame || profileSnapshot.data()?.avatarFrame || (admin ? 'boss' : 'plastic');
  root.innerHTML = options.map(([id, label, required]) => {
    const unlocked = id === 'boss' ? admin : frameProgress >= required;
    const detail = unlocked ? (current === id ? 'Em uso' : 'Disponivel') : `Desbloqueie com ${required} treinos`;
    return `<button type="button" data-frame="${id}" class="avatar-frame-choice avatar-frame-choice--${id} ${current === id ? 'is-active' : ''}" ${unlocked ? '' : 'disabled'} aria-pressed="${current === id}"><span class="frame-choice__dot"></span><span><strong>${label}</strong><small>${detail}</small></span></button>`;
  }).join('');
  root.querySelectorAll('[data-frame]:not(:disabled)').forEach(button => button.onclick = async () => {
    selectedFrame = button.dataset.frame;
    await setDoc(doc(db, 'users', user.uid), { avatarFrame: selectedFrame }, { merge: true });
    renderUnlockedFrameChoices(user);
  });
}

$('contrast').onchange = () => { appearance.contrast = $('contrast').checked; persistAppearance(); };
$('large-text').onchange = () => { appearance.largeText = $('large-text').checked; persistAppearance(); };
$('reduce-motion').onchange = () => { appearance.reduceMotion = $('reduce-motion').checked; persistAppearance(); };
$('animations')?.addEventListener('change', () => { appearance.animations = $('animations').checked; persistAppearance(); });
$('sound')?.addEventListener('change', () => { appearance.sound = $('sound').checked; persistAppearance(); });
$('vibration')?.addEventListener('change', () => { appearance.vibration = $('vibration').checked; persistAppearance(); });

languageChoices.forEach(([value, icon, label]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.language = value;
  button.className = 'flex min-h-14 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold';
  button.innerHTML = `<i data-lucide="${icon}" class="h-4 w-4"></i><span>${label}</span>`;
  button.onclick = () => {
    appearance.language = { mode: value, value: value === 'system' ? appearance.language.value : value };
    persistAppearance();
  };
  $('language-segments').appendChild(button);
});

function moduleToggleTemplate(module) {
  const checked = appModules[module.id] !== false;
  const disabled = module.required ? 'disabled' : '';
  return `<label class="flex min-h-20 cursor-pointer items-center justify-between gap-4 ${module.required ? 'opacity-80' : ''}"><span class="flex min-w-0 items-start gap-3"><span class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon/10 text-neon"><i data-lucide="${module.icon}" class="h-4 w-4"></i></span><span><strong class="block text-sm">${module.label}</strong><small class="mt-1 block text-xs leading-relaxed text-gray-500">${module.description}${module.required ? ' Sempre ativo para manter o Mol funcional.' : ''}</small></span></span><span class="relative shrink-0"><input data-module="${module.id}" type="checkbox" class="peer sr-only" ${checked ? 'checked' : ''} ${disabled}><span class="block h-7 w-12 rounded-full bg-white/10 transition-colors peer-checked:bg-neon"></span><span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span></span></label>`;
}

function renderAppModules() {
  const preset = selectedModulePreset || presetFromModules(appModules);
  $('module-presets').innerHTML = modulePresetChoices.map(([id, icon, label, description]) => {
    const selected = preset === id;
    return `<button type="button" data-preset="${id}" aria-pressed="${selected}" class="rounded-2xl border ${selected ? 'border-neon bg-neon/10 text-neon' : 'border-white/10 mol-soft text-gray-300'} p-3 text-left transition-colors"><i data-lucide="${icon}" class="h-4 w-4"></i><strong class="mt-2 block text-sm">${label}</strong><small class="mt-1 block text-xs leading-relaxed text-gray-500">${description}</small></button>`;
  }).join('');
  $('module-toggles').classList.toggle('hidden', preset !== 'custom');
  $('module-toggles').innerHTML = preset === 'custom' ? MODULE_DEFINITIONS.map(moduleToggleTemplate).join('') : '';
  $('module-status').textContent = preset === 'custom' ? 'Personalizado: escolha abaixo o que quer ver no app.' : 'Modo salvo na sua conta e aplicado ao navegar.';
  $('module-presets').querySelectorAll('[data-preset]').forEach(button => {
    button.onclick = () => {
      if (button.dataset.preset === 'custom') {
        selectedModulePreset = 'custom';
        appModules = normalizeAppModules(appModules);
        renderAppModules();
        return;
      }
      selectedModulePreset = null;
      appModules = normalizeAppModules(MODULE_PRESETS[button.dataset.preset]);
      persistAppModules();
    };
  });
  $('module-toggles').querySelectorAll('[data-module]').forEach(input => {
    input.onchange = () => {
      selectedModulePreset = 'custom';
      appModules = normalizeAppModules({ ...appModules, [input.dataset.module]: input.checked });
      persistAppModules();
    };
  });
  window.lucide?.createIcons();
}

async function persistAppModules() {
  appModules = normalizeAppModules(appModules);
  if (presetFromModules(appModules) !== 'custom') selectedModulePreset = null;
  renderAppModules();
  try {
    appModules = await saveAppModules(appModules);
    $('module-status').textContent = 'Experiência atualizada.';
  } catch (error) {
    console.warn('Módulos salvos apenas neste dispositivo:', error.message);
    $('module-status').textContent = 'Aplicado neste dispositivo.';
  }
}


const reminderPreferences = getReminderPreferences();
$('trusted-device').checked = isTrustedDevice();
$('reminders-enabled').checked = reminderPreferences.enabled;

function persistReminderControls() {
  saveReminderPreferences({
    enabled: $('reminders-enabled').checked
  });
}

$('trusted-device').onchange = async () => {
  const enabled = $('trusted-device').checked;
  $('trusted-device').disabled = true;
  try {
    if (enabled) {
      if (!setTrustedDevice(true)) throw new Error('Armazenamento local indisponível.');
      $('device-status').textContent = 'Modo offline ativado. Reiniciando o Mol…';
      window.setTimeout(() => location.reload(), 500);
      return;
    }
    if (!navigator.onLine) throw new Error('Conecte-se à internet antes de remover os dados offline deste aparelho.');
    await waitForPendingWrites(db);
    await terminate(db);
    await clearIndexedDbPersistence(db);
    setTrustedDevice(false);
    $('device-status').textContent = 'Dados offline removidos deste aparelho. Reiniciando…';
    window.setTimeout(() => location.reload(), 500);
  } catch (error) {
    $('trusted-device').checked = isTrustedDevice();
    $('trusted-device').disabled = false;
    $('device-status').textContent = error.message || 'Não foi possível alterar o modo offline.';
    showToast(error.message || 'Não foi possível alterar o modo offline.');
  }
};

$('reminders-enabled').onchange = async () => {
  try {
    if ($('reminders-enabled').checked) await requestReminderPermission();
    persistReminderControls();
    $('device-status').textContent = $('reminders-enabled').checked
      ? 'Lembretes ativados neste aparelho.'
      : 'Lembretes desativados neste aparelho.';
  } catch (error) {
    $('reminders-enabled').checked = false;
    persistReminderControls();
    showToast(error.message || 'Não foi possível ativar os lembretes.');
  }
};
$('test-reminder').onclick = async () => {
  try { await sendTestReminder(); showToast('Lembrete enviado.', 'success'); }
  catch (error) { showToast(error.message || 'Não foi possível enviar o lembrete.'); }
};
async function deleteUserData(user) {
  const names = ['treinos', 'sessoes', 'pesos'];
  const dietReference = doc(db, 'dietas', user.uid);
  // Todas as leituras terminam antes da primeira exclusão, evitando apagar só parte dos dados por falha de consulta.
  const [snapshots, diet] = await Promise.all([
    Promise.all(names.map(name => getDocs(query(collection(db, name), where('userId', '==', user.uid))))),
    getDoc(dietReference)
  ]);
  for (const snapshot of snapshots) {
    for (let index = 0; index < snapshot.docs.length; index += 450) {
      const batch = writeBatch(db);
      snapshot.docs.slice(index, index + 450).forEach(item => batch.delete(item.ref));
      await batch.commit();
    }
  }
  const finalBatch = writeBatch(db);
  if (diet.exists()) finalBatch.delete(dietReference);
  finalBatch.delete(doc(db, 'users', user.uid));
  await finalBatch.commit();
}

function requestPassword() {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[1000] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
    modal.setAttribute('aria-labelledby', 'password-dialog-title');
    modal.setAttribute('aria-describedby', 'password-dialog-description');
    modal.innerHTML = '<section class="w-full max-w-sm rounded-3xl mol-dialog-surface p-6 shadow-2xl"><h2 id="password-dialog-title" class="text-lg font-bold">Confirme sua senha</h2><p id="password-dialog-description" class="mt-2 text-sm text-gray-400">Precisamos confirmar sua identidade antes da exclusão.</p><label class="mt-5 block text-xs font-bold text-gray-400">Senha<input data-password type="password" autocomplete="current-password" class="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white"></label><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-cancel class="rounded-xl mol-soft py-3 text-sm font-bold">Cancelar</button><button type="button" data-confirm class="rounded-xl bg-red-500 py-3 text-sm font-bold text-white">Continuar</button></div></section>';
    document.body.appendChild(modal);
    const input = modal.querySelector('[data-password]');
    let closeDialog;
    const close = value => { closeDialog(); resolve(value); };
    closeDialog = activateDialog(modal, { initialFocus: input, onCancel: () => close('') });
    modal.querySelector('[data-cancel]').onclick = () => close('');
    modal.querySelector('[data-confirm]').onclick = () => close(input.value);
    input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); close(input.value); } };
    modal.onclick = event => { if (event.target === modal) close(''); };
  });
}

async function reauthenticate(user) {
  if (user.providerData.some(provider => provider.providerId === 'google.com')) {
    await reauthenticateWithPopup(user, googleProvider);
    return;
  }
  if (user.providerData.some(provider => provider.providerId === 'password')) {
    const password = await requestPassword();
    if (!password) throw new Error('Exclusão cancelada.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    return;
  }
  throw new Error('Entre novamente antes de excluir sua conta.');
}

function authErrorMessage(error, fallback) {
  if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') return 'Senha incorreta.';
  if (error?.code === 'auth/popup-closed-by-user') return 'Confirmação cancelada.';
  if (error?.code === 'auth/popup-blocked') return 'O navegador bloqueou a confirmação. Libere pop-ups para o Mol e tente novamente.';
  if (error?.code === 'auth/requires-recent-login') return 'Entre novamente e tente de novo.';
  return error?.message || fallback;
}

watchProtectedPage(async user => {
  try {
    appearance = await syncAccessibilityForUser(user);
    await renderUnlockedFrameChoices(user);
    applyAppearance();
  } catch (error) {
    console.warn('Preferências da conta não carregadas:', error.message);
  }
  try {
    appModules = await syncAppModulesForUser(user);
    renderAppModules();
  } catch (error) {
    console.warn('Módulos da conta não carregados:', error.message);
    renderAppModules();
  }
  $('session-email').textContent = user.email || user.displayName || 'Conta conectada';

  $('sign-out').onclick = async () => {
    const confirmed = await confirmAction({ title: 'Sair desta conta?', message: 'Você precisará entrar novamente para acessar seus dados.', confirmText: 'Sair' });
    if (!confirmed) return;
    const button = $('sign-out');
    setButtonLoading(button, true);
    try {
      await signOut(auth);
      location.href = './login.html';
    } catch (error) {
      setButtonLoading(button, false);
      window.lucide?.createIcons();
      showToast(authErrorMessage(error, 'Não foi possível sair da conta.'));
    }
  };

  $('delete-account').onclick = async () => {
    const confirmed = await confirmAction({ title: 'Excluir conta permanentemente?', message: 'Perfil, fotos, treinos, sessões, pesos e dieta serão apagados. Essa ação não pode ser desfeita.', confirmText: 'Excluir tudo', danger: true });
    if (!confirmed) return;
    const button = $('delete-account');
    setButtonLoading(button, true);
    try {
      await reauthenticate(user);
      await deleteUserData(user);
      await deleteUser(user);
      removeLocalItemsWithPrefix('mol-');
      location.href = './login.html';
    } catch (error) {
      setButtonLoading(button, false);
      window.lucide?.createIcons();
      if (error?.message !== 'Exclusão cancelada.') showToast(authErrorMessage(error, 'Não foi possível excluir a conta.'));
    }
  };
});

applyAppearance();
renderAppModules();
renderInstallCard();
window.lucide?.createIcons();
