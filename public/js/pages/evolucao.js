import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { setupAppShell } from '../utils/app-shell.js';
import { activateDialog, confirmAction, escapeHTML, setButtonLoading, showToast } from '../utils/ui.js';
import { dateFrom, monthCalendar, workoutStats } from '../modules/evolution-analytics.js';
import { profileAchievements } from '../modules/profile-analytics.js';
import { removeSessionItems } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);
const PHOTO_LIMIT = 5;
const PHOTO_BYTES_LIMIT = 650 * 1024;
let currentUser;
let currentGoal = 3;
let latestProfile = {};
let sessions = [];
let weights = [];
let activeDays = new Set();
let now = new Date();
let visibleMonth = new Date(now.getFullYear(), now.getMonth(), 1);

function setPageState(state, message = '') {
  $('page-status').classList.toggle('hidden', state === 'ready');
  $('evolution-content').classList.toggle('hidden', state !== 'ready');
  if (state !== 'ready') $('page-status').innerHTML = '';
  if (state === 'loading') $('page-status').textContent = message || 'Carregando sua evolução…';
  if (state === 'error') {
    const text = document.createElement('span');
    text.textContent = message || 'Não foi possível carregar sua evolução.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'mt-3 block min-h-10 w-full rounded-xl bg-white/5 text-sm font-bold text-white';
    retry.textContent = 'Tentar novamente';
    retry.onclick = load;
    $('page-status').append(text, retry);
  }
}

function renderGoal(stats) {
  const done = stats.weekly;
  const percent = Math.min(100, Math.round((done / currentGoal) * 100));
  $('weekly-goal').textContent = currentGoal;
  $('goal-summary').textContent = `${done} de ${currentGoal} treino${currentGoal === 1 ? '' : 's'}`;
  $('week-percent').textContent = `${percent}%`;
  $('goal-progress').style.width = `${percent}%`;
  $('goal-message').textContent = done >= currentGoal ? 'Meta da semana concluída. Mantenha o ritmo.' : `Faltam ${currentGoal - done} treino${currentGoal - done === 1 ? '' : 's'} nesta semana.`;
  $('streak').textContent = `${stats.streak} semana${stats.streak === 1 ? '' : 's'}`;
  $('workout-total').textContent = stats.sessions;
  $('series-total').textContent = `${stats.series} ${stats.series === 1 ? 'série concluída' : 'séries concluídas'}`;
  $('goal-down').disabled = currentGoal <= 1;
  $('goal-up').disabled = currentGoal >= 7;
  $('goal-down').classList.toggle('opacity-30', currentGoal <= 1);
  $('goal-up').classList.toggle('opacity-30', currentGoal >= 7);
}

function renderCalendar() {
  const calendar = monthCalendar(visibleMonth, activeDays, now);
  $('calendar-title').textContent = visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const isCurrent = visibleMonth.getFullYear() === now.getFullYear() && visibleMonth.getMonth() === now.getMonth();
  $('next-month').disabled = isCurrent;
  $('next-month').classList.toggle('opacity-30', isCurrent);
  const blanks = Array.from({ length: calendar.leadingBlanks }, () => '<span aria-hidden="true"></span>');
  const days = calendar.days.map(item => `<span class="flex aspect-square items-center justify-center rounded-lg text-xs ${item.trained ? 'bg-neon font-extrabold text-black' : 'bg-white/5 text-gray-400'} ${item.today && !item.trained ? 'ring-1 ring-neon' : ''}" aria-label="${item.day}${item.trained ? ', treino concluído' : ''}${item.today ? ', hoje' : ''}">${item.day}</span>`);
  $('calendar').innerHTML = [...blanks, ...days].join('');
}

function renderBadges(stats) {
  const badges = profileAchievements({ workouts: stats.sessions, sets: stats.series, volume: stats.volume, seconds: stats.seconds, weekly: stats.weekly, goal: currentGoal, streak: stats.streak, activeDays: stats.activeDays.size });
  const unlocked = badges.filter(badge => badge.unlocked);
  $('badges-count').textContent = `${unlocked.length} de ${badges.length} desbloqueadas`;
  $('badges').innerHTML = badges.map(badge => `<article class="rounded-2xl border p-3 ${badge.unlocked ? 'border-neon/40 bg-neon/10' : 'border-white/10 bg-white/[.03] opacity-60'}"><span class="flex h-8 w-8 items-center justify-center rounded-xl ${badge.unlocked ? 'bg-neon text-black' : 'bg-white/10 text-gray-500'}"><i data-lucide="${badge.unlocked ? badge.icon : 'lock-keyhole'}" class="h-4 w-4"></i></span><strong class="mt-2 block text-sm">${badge.title}</strong><p class="mt-1 text-xs text-gray-500">${badge.description}</p></article>`).join('');
  window.lucide?.createIcons();
}

function sortedWeights() {
  return [...weights].filter(item => {
    const date = dateFrom(item.registradoEm);
    const value = Number(item.pesoKg);
    return Number.isFinite(value) && value >= 20 && value <= 400 && date && date <= now;
  }).sort((a, b) => dateFrom(a.registradoEm) - dateFrom(b.registradoEm));
}

function renderWeight() {
  const ordered = sortedWeights();
  const last = ordered.at(-1);
  $('last-weight').textContent = last ? `${Number(last.pesoKg).toLocaleString('pt-BR')} kg` : '— kg';
  $('weight-change').textContent = ordered.length > 1 ? `${(Number(last.pesoKg) - Number(ordered[0].pesoKg)).toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 1 })} kg desde o primeiro registro.` : 'Registre o primeiro peso para acompanhar.';
  if (!ordered.length) {
    $('history').innerHTML = '<p class="text-sm text-gray-500">Sem registros.</p>';
    return;
  }
  $('history').innerHTML = ordered.reverse().map(item => `<article class="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3"><div><strong class="text-sm">${Number(item.pesoKg).toLocaleString('pt-BR')} kg</strong><p class="mt-1 text-xs text-gray-500">${dateFrom(item.registradoEm)?.toLocaleDateString('pt-BR') || 'agora'}</p></div><div class="flex gap-1"><button type="button" data-edit-weight="${escapeHTML(item.id)}" class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5" aria-label="Editar peso"><i data-lucide="pencil" class="h-4 w-4"></i></button><button type="button" data-delete-weight="${escapeHTML(item.id)}" class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-300" aria-label="Excluir peso"><i data-lucide="trash-2" class="h-4 w-4"></i></button></div></article>`).join('');
  window.lucide?.createIcons();
}

function renderBodyComparison() {
  const ordered = sortedWeights();
  const start = Number(ordered[0]?.pesoKg);
  const current = Number(ordered.at(-1)?.pesoKg);
  const target = Number(latestProfile.metaPesoKg);
  $('body-start').textContent = Number.isFinite(start) ? `${start.toLocaleString('pt-BR')} kg` : '—';
  $('body-current').textContent = Number.isFinite(current) ? `${current.toLocaleString('pt-BR')} kg` : '—';
  $('body-target').textContent = Number.isFinite(target) && target > 0 ? `${target.toLocaleString('pt-BR')} kg` : '—';
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    $('body-status').textContent = 'Sem meta';
    $('body-summary').textContent = 'Registre o peso e uma meta no perfil para ver sua trajetória.';
    return;
  }
  const difference = target - current;
  const reached = Math.abs(difference) < 0.1;
  $('body-status').textContent = reached ? 'Meta atingida' : `${Math.abs(difference).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
  const height = Number(latestProfile.alturaCm);
  const bmi = height > 0 ? current / ((height / 100) ** 2) : null;
  $('body-summary').textContent = reached ? 'Você atingiu a meta de peso registrada.' : `${difference > 0 ? 'Faltam' : 'Você está'} ${Math.abs(difference).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg ${difference > 0 ? 'para chegar à meta.' : 'além da meta.'}${bmi ? ` IMC atual: ${bmi.toFixed(1)}.` : ''}`;
}

function measureValue(value) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 20 && parsed <= 250 ? parsed : null;
}

function measurementHistory() {
  const keys = ['waist', 'chest', 'arm', 'hip'];
  return (Array.isArray(latestProfile.medidasHistorico) ? latestProfile.medidasHistorico : []).filter(item => {
    const date = dateFrom(item?.registradoEm);
    return item && typeof item === 'object' && date && date <= now && keys.some(key => measureValue(item[key]) !== null);
  }).sort((a, b) => dateFrom(a.registradoEm) - dateFrom(b.registradoEm));
}

function lastMeasure(history, key) {
  for (const item of [...history].reverse()) {
    const value = measureValue(item[key]);
    if (value !== null) return value;
  }
  return null;
}

function renderMeasurements() {
  const history = measurementHistory();
  const fields = [['waist', 'measure-waist', 'Cintura'], ['chest', 'measure-chest', 'Peito'], ['arm', 'measure-arm', 'Braço'], ['hip', 'measure-hip', 'Quadril']];
  fields.forEach(([key, input]) => { $(input).value = lastMeasure(history, key) ?? ''; });
  const changes = fields.map(([key, , label]) => {
    const first = history.map(item => measureValue(item[key])).find(value => value !== null);
    const last = lastMeasure(history, key);
    if (first === undefined || last === null) return null;
    const delta = Number(last) - Number(first);
    return `${label}: ${delta.toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 1 })} cm`;
  }).filter(Boolean);
  $('measurement-summary').textContent = changes.length ? `Desde a primeira medição — ${changes.join(' · ')}.` : 'Registre uma primeira medida para acompanhar as mudanças.';
  const recent = history.slice(-5).reverse();
  $('measure-history').innerHTML = recent.length ? `<p class="text-xs font-bold text-gray-400">Últimos registros</p>${recent.map(record => {
    const values = fields.map(([key, , label]) => { const value = measureValue(record[key]); return value !== null ? `${label} ${value.toLocaleString('pt-BR')} cm` : null; }).filter(Boolean);
    const date = dateFrom(record.registradoEm)?.toLocaleDateString('pt-BR') || 'Data não informada';
    return `<div class="rounded-xl bg-white/5 p-3"><p class="text-xs font-semibold">${date}</p><p class="mt-1 text-xs text-gray-500">${values.join(' · ')}</p></div>`;
  }).join('')}` : '';
}

function validPhotos() {
  return (Array.isArray(latestProfile.fotosProgresso) ? latestProfile.fotosProgresso : []).slice(0, PHOTO_LIMIT).filter(photo => photo && typeof photo.id === 'string' && photo.id.length <= 100 && typeof photo.dataUrl === 'string' && photo.dataUrl.length <= 140 * 1024 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(photo.dataUrl));
}

function photoBytes(photos) {
  return new Blob(photos.map(photo => photo.dataUrl)).size;
}

function renderProgressPhotos() {
  const photos = validPhotos();
  const used = photoBytes(photos);
  $('photo-storage').textContent = `${photos.length} de ${PHOTO_LIMIT} fotos · aproximadamente ${Math.round(used / 1024)} KB usados`;
  $('progress-photos').innerHTML = '';
  if (!photos.length) {
    $('progress-photos').innerHTML = '<p class="col-span-3 text-sm text-gray-500">Nenhuma foto registrada.</p>';
    return;
  }
  photos.forEach(photo => {
    const article = document.createElement('article');
    article.className = 'relative overflow-hidden rounded-xl bg-white/5';
    const image = document.createElement('img');
    image.className = 'aspect-square w-full object-cover';
    image.src = photo.dataUrl;
    image.alt = `Foto de progresso de ${dateFrom(photo.criadoEm)?.toLocaleDateString('pt-BR') || 'data não informada'}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.deletePhoto = photo.id;
    button.className = 'absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm';
    button.setAttribute('aria-label', 'Remover foto');
    button.textContent = '×';
    article.append(image, button);
    $('progress-photos').appendChild(article);
  });
}

async function compressPhoto(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Escolha uma imagem em JPG, PNG ou WebP.');
  if (file.size > 15 * 1024 * 1024) throw new Error('A imagem original deve ter no máximo 15 MB.');
  let source = null;
  if (typeof createImageBitmap === 'function') {
    try { source = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch {
      try { source = await createImageBitmap(file); }
      catch { source = null; }
    }
  }
  if (!source) source = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height, draw: (context, width, height) => context.drawImage(image, 0, 0, width, height), close: () => URL.revokeObjectURL(url) });
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível abrir a foto.')); };
    image.src = url;
  });
  const scale = Math.min(1, 720 / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível processar a foto neste navegador.');
  if (source.draw) source.draw(context, canvas.width, canvas.height);
  else context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();
  const canvasBlob = (quality) => new Promise(resolve => {
    if (typeof canvas.toBlob === 'function') { canvas.toBlob(resolve, 'image/jpeg', quality); return; }
    try {
      const [, data] = canvas.toDataURL('image/jpeg', quality).split(',');
      const bytes = atob(data); const values = new Uint8Array(bytes.length);
      for (let index = 0; index < bytes.length; index += 1) values[index] = bytes.charCodeAt(index);
      resolve(new Blob([values], { type: 'image/jpeg' }));
    } catch { resolve(null); }
  });
  let quality = 0.78;
  let image = await canvasBlob(quality);
  while (image && image.size > 90 * 1024 && quality > 0.32) {
    quality -= 0.08;
    image = await canvasBlob(quality);
  }
  if (!image || image.size > 90 * 1024) throw new Error('A foto ficou grande demais. Escolha uma imagem mais simples.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a foto.'));
    reader.readAsDataURL(image);
  });
}

function renderAll() {
  now = new Date();
  const stats = workoutStats(sessions, currentGoal, now);
  activeDays = stats.activeDays;
  renderGoal(stats);
  renderCalendar();
  renderBadges(stats);
  renderWeight();
  renderBodyComparison();
  renderMeasurements();
  renderProgressPhotos();
}

async function load() {
  if (!currentUser) return;
  setPageState('loading');
  try {
    const [profileSnapshot, weightSnapshot, sessionSnapshot] = await Promise.all([
      getDoc(doc(db, 'users', currentUser.uid)),
      getDocs(query(collection(db, 'pesos'), where('userId', '==', currentUser.uid))),
      getDocs(query(collection(db, 'sessoes'), where('userId', '==', currentUser.uid)))
    ]);
    latestProfile = profileSnapshot.data() || {};
    currentGoal = Math.max(1, Math.min(7, Number(latestProfile.metaSemanal) || 3));
    sessions = sessionSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    weights = weightSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderAll();
    setPageState('ready');
  } catch (error) {
    console.error('Não foi possível carregar evolução:', error);
    setPageState('error', 'Não foi possível carregar seus dados agora.');
  }
}

async function saveGoal(change) {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const previous = currentGoal;
  currentGoal = Math.max(1, Math.min(7, currentGoal + change));
  if (currentGoal === previous) return;
  renderGoal(workoutStats(sessions, currentGoal));
  $('goal-down').disabled = $('goal-up').disabled = true;
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { metaSemanal: currentGoal }, { merge: true });
    latestProfile.metaSemanal = currentGoal;
    removeSessionItems(`mol-profile-cache-${currentUser.uid}`);
    showToast('Meta semanal atualizada.', 'success');
  } catch (error) {
    currentGoal = previous;
    showToast('Não foi possível atualizar a meta.');
  } finally { renderGoal(workoutStats(sessions, currentGoal)); }
}

function requestWeight(title, initial = '') {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[1000] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
    modal.setAttribute('aria-labelledby', 'weight-dialog-title');
    modal.setAttribute('aria-describedby', 'weight-dialog-description');
    modal.innerHTML = `<section class="w-full max-w-sm rounded-3xl mol-dialog-surface p-6"><h2 id="weight-dialog-title" class="text-lg font-bold">${title}</h2><p id="weight-dialog-description" class="mt-2 text-sm text-gray-400">Informe um valor entre 20 e 400 kg.</p><input data-value inputmode="decimal" class="mt-5 min-h-12 w-full rounded-xl mol-field px-4 text-white" aria-label="Peso em quilogramas"><div class="mt-5 grid grid-cols-2 gap-3"><button type="button" data-cancel class="rounded-xl mol-soft py-3 text-sm font-bold">Cancelar</button><button type="button" data-confirm class="rounded-xl bg-neon py-3 text-sm font-bold text-black">Salvar</button></div></section>`;
    document.body.appendChild(modal);
    const input = modal.querySelector('[data-value]');
    input.value = initial;
    let closeDialog;
    const close = value => { closeDialog(); resolve(value); };
    closeDialog = activateDialog(modal, { initialFocus: input, onCancel: () => close(null) });
    modal.querySelector('[data-cancel]').onclick = () => close(null);
    modal.querySelector('[data-confirm]').onclick = () => close(input.value);
    input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); close(input.value); } };
    modal.onclick = event => { if (event.target === modal) close(null); };
  });
}

watchProtectedPage(user => {
  currentUser = user;
  load();
});

$('goal-down').onclick = () => saveGoal(-1);
$('goal-up').onclick = () => saveGoal(1);
$('previous-month').onclick = () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); renderCalendar(); };
$('next-month').onclick = () => { if (!$('next-month').disabled) { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); renderCalendar(); } };

$('save').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const value = Number(String($('weight').value).replace(',', '.'));
  if (!Number.isFinite(value) || value < 20 || value > 400) return showToast('Informe um peso entre 20 e 400 kg.');
  const button = $('save');
  setButtonLoading(button, true);
  try {
    await addDoc(collection(db, 'pesos'), { userId: currentUser.uid, pesoKg: value, registradoEm: serverTimestamp() });
    $('weight').value = '';
    await load();
    showToast('Peso registrado.', 'success');
  } catch (error) {
    showToast('Não foi possível registrar o peso.');
  } finally { setButtonLoading(button, false); }
};

$('history').onclick = async event => {
  const editId = event.target.closest('[data-edit-weight]')?.dataset.editWeight;
  const deleteId = event.target.closest('[data-delete-weight]')?.dataset.deleteWeight;
  if (editId) {
    const item = weights.find(weight => weight.id === editId);
    const response = await requestWeight('Editar peso', item?.pesoKg ?? '');
    if (response === null) return;
    const value = Number(String(response).replace(',', '.'));
    if (!Number.isFinite(value) || value < 20 || value > 400) return showToast('Informe um peso entre 20 e 400 kg.');
    try { await updateDoc(doc(db, 'pesos', editId), { pesoKg: value }); await load(); showToast('Peso atualizado.', 'success'); }
    catch { showToast('Não foi possível atualizar o peso.'); }
  }
  if (deleteId) {
    const confirmed = await confirmAction({ title: 'Excluir este peso?', message: 'O registro será removido do histórico e dos comparativos.', confirmText: 'Excluir', danger: true });
    if (!confirmed) return;
    try { await deleteDoc(doc(db, 'pesos', deleteId)); await load(); showToast('Peso removido.', 'success'); }
    catch { showToast('Não foi possível remover o peso.'); }
  }
};

$('save-measures').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const inputs = [['waist', 'measure-waist'], ['chest', 'measure-chest'], ['arm', 'measure-arm'], ['hip', 'measure-hip']];
  const entered = inputs.filter(([, id]) => $(id).value.trim() !== '');
  if (!entered.length) return showToast('Preencha pelo menos uma medida.');
  const record = { registradoEm: new Date().toISOString() };
  for (const [key, id] of entered) {
    const value = measureValue($(id).value);
    if (value === null) return showToast('As medidas devem estar entre 20 e 250 cm.');
    record[key] = value;
  }
  const history = measurementHistory();
  const button = $('save-measures');
  setButtonLoading(button, true);
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { medidasHistorico: [...history, record].slice(-50) }, { merge: true });
    await load();
    showToast('Medidas registradas.', 'success');
  } catch { showToast('Não foi possível registrar as medidas.'); }
  finally { setButtonLoading(button, false); }
};

$('save-photo').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const file = $('progress-photo').files[0];
  if (!file) return showToast('Escolha uma foto primeiro.');
  const photos = validPhotos();
  if (photos.length >= PHOTO_LIMIT) return showToast('Remova uma foto antes de adicionar outra.');
  const button = $('save-photo');
  setButtonLoading(button, true);
  try {
    const dataUrl = await compressPhoto(file);
    const next = [...photos, { id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, dataUrl, criadoEm: new Date().toISOString() }];
    if (photoBytes(next) > PHOTO_BYTES_LIMIT) throw new Error('O espaço reservado para fotos está cheio. Remova uma foto antes de continuar.');
    await setDoc(doc(db, 'users', currentUser.uid), { fotosProgresso: next }, { merge: true });
    $('progress-photo').value = '';
    await load();
    showToast('Foto adicionada.', 'success');
  } catch (error) {
    console.error('Foto de evolução não salva:', error);
    const message = error?.code === 'permission-denied'
      ? 'O perfil ainda não tem permissão para salvar fotos. Atualize a página e tente novamente.'
      : (error.message || 'Não foi possível salvar a foto.');
    showToast(message);
  }
  finally { setButtonLoading(button, false); }
};

$('progress-photos').onclick = async event => {
  const id = event.target.closest('[data-delete-photo]')?.dataset.deletePhoto;
  if (!id) return;
  const confirmed = await confirmAction({ title: 'Remover esta foto?', message: 'A foto será excluída permanentemente do seu perfil.', confirmText: 'Remover', danger: true });
  if (!confirmed) return;
  const photos = validPhotos().filter(photo => photo.id !== id);
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { fotosProgresso: photos }, { merge: true });
    await load();
    showToast('Foto removida.', 'success');
  } catch { showToast('Não foi possível remover a foto.'); }
};

window.lucide?.createIcons();
