import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { setupAppShell } from '../utils/app-shell.js';

setupAppShell();

let currentUser;
let currentGoal = 3;
let latestProfile = {};
const $ = (id) => document.getElementById(id);
const dateFrom = (value) => value?.toDate?.() || (value?.seconds ? new Date(value.seconds * 1000) : null);
const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const weekStart = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
};
const addDays = (date, days) => { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; };

function workoutStats(sessions) {
  const dates = sessions.map((item) => dateFrom(item.concluidoEm)).filter(Boolean);
  const activeDays = new Set(dates.map(dayKey));
  const weeks = new Map();
  dates.forEach((date) => {
    const key = dayKey(weekStart(date));
    weeks.set(key, (weeks.get(key) || 0) + 1);
  });
  const now = new Date();
  const currentWeek = weekStart(now);
  let streak = 0;
  for (let start = currentWeek; ; start = addDays(start, -7)) {
    if ((weeks.get(dayKey(start)) || 0) < currentGoal) break;
    streak += 1;
  }
  const series = sessions.reduce((total, session) => total + (session.exercicios || []).reduce((sum, exercise) => sum + (exercise.series || []).filter((set) => set.concluida !== false).length, 0), 0);
  const volume = sessions.reduce((total, session) => total + Number(session.volumeTotal || 0), 0);
  return { activeDays, weeks, streak, series, volume, weekly: weeks.get(dayKey(currentWeek)) || 0 };
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
  $('series-total').textContent = `${stats.series} séries registradas`;
}

function renderCalendar(activeDays) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const first = new Date(year, month, 1);
  const count = new Date(year, month + 1, 0).getDate();
  $('calendar-title').textContent = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now);
  const cells = Array.from({ length: first.getDay() }, () => '<span></span>');
  for (let day = 1; day <= count; day += 1) {
    const date = new Date(year, month, day);
    const trained = activeDays.has(dayKey(date));
    const today = dayKey(date) === dayKey(now);
    cells.push(`<span class="flex aspect-square items-center justify-center rounded-lg text-xs ${trained ? 'bg-neon font-extrabold text-black' : 'bg-white/5 text-gray-400'} ${today && !trained ? 'ring-1 ring-neon' : ''}" aria-label="${day}${trained ? ', treino concluído' : ''}">${day}</span>`);
  }
  $('calendar').innerHTML = cells.join('');
}

function renderBadges(stats) {
  const badges = [
    ['Primeiro passo', 'Conclua 1 treino', stats.sessions >= 1],
    ['Ritmo criado', 'Conclua 10 treinos', stats.sessions >= 10],
    ['Volume de base', 'Registre 50 séries', stats.series >= 50],
    ['Consistência', 'Atinja a meta por 4 semanas', stats.streak >= 4],
    ['10 toneladas', 'Some 10.000 kg de volume', stats.volume >= 10000],
    ['Calendário vivo', 'Treine em 12 dias', stats.activeDays.size >= 12]
  ];
  $('badges').innerHTML = badges.map(([title, detail, earned]) => `<article class="rounded-2xl border p-3 ${earned ? 'border-neon/40 bg-neon/10' : 'border-white/10 bg-white/[.03] opacity-60'}"><span class="text-lg">${earned ? '✓' : '○'}</span><strong class="mt-1 block text-sm">${title}</strong><p class="mt-1 text-xs text-gray-500">${detail}</p></article>`).join('');
}

function renderWeight(items) {
  items.sort((a, b) => (dateFrom(a.registradoEm)?.getTime() || 0) - (dateFrom(b.registradoEm)?.getTime() || 0));
  const last = items.at(-1);
  $('last-weight').textContent = last ? `${last.pesoKg} kg` : '— kg';
  $('weight-change').textContent = items.length > 1 ? `${(last.pesoKg - items[0].pesoKg).toLocaleString('pt-BR', { signDisplay: 'always' })} kg desde o primeiro registro.` : 'Registre o primeiro peso para acompanhar.';
  $('history').innerHTML = items.length ? items.slice().reverse().map((item) => `<div class="flex justify-between rounded-xl bg-white/5 p-3"><span>${item.pesoKg} kg</span><span class="text-sm text-gray-500">${dateFrom(item.registradoEm)?.toLocaleDateString('pt-BR') || 'agora'}</span></div>`).join('') : '<p class="text-sm text-gray-500">Sem registros.</p>';
}

function renderBodyComparison(weights, profile) {
  const ordered = [...weights].sort((a, b) => (dateFrom(a.registradoEm)?.getTime() || 0) - (dateFrom(b.registradoEm)?.getTime() || 0));
  const start = ordered[0]?.pesoKg;
  const current = ordered.at(-1)?.pesoKg;
  const target = Number(profile.metaPesoKg);
  $('body-start').textContent = Number.isFinite(start) ? `${start} kg` : '—';
  $('body-current').textContent = Number.isFinite(current) ? `${current} kg` : '—';
  $('body-target').textContent = Number.isFinite(target) && target > 0 ? `${target} kg` : '—';
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    $('body-status').textContent = 'Sem meta';
    $('body-summary').textContent = 'Registre o peso e uma meta para ver sua trajetória.';
    return;
  }
  const difference = target - current;
  const reached = Math.abs(difference) < 0.1;
  $('body-status').textContent = reached ? 'Meta atingida' : `${Math.abs(difference).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
  const height = Number(profile.alturaCm);
  const bmi = height > 0 ? current / ((height / 100) ** 2) : null;
  $('body-summary').textContent = reached ? 'Você atingiu a meta de peso registrada.' : `${difference > 0 ? 'Faltam' : 'Você está'} ${Math.abs(difference).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg ${difference > 0 ? 'para chegar à meta.' : 'além da meta.'}${bmi ? ` IMC atual: ${bmi.toFixed(1)}.` : ''}`;
}

function measureValue(value) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 20 && parsed <= 250 ? parsed : null;
}

function renderMeasurements(profile) {
  const history = Array.isArray(profile.medidasHistorico) ? profile.medidasHistorico.filter((item) => item && typeof item === 'object') : [];
  const last = history.at(-1) || {};
  const first = history[0] || {};
  const fields = [['waist', 'measure-waist', 'Cintura'], ['chest', 'measure-chest', 'Peito'], ['arm', 'measure-arm', 'Braço'], ['hip', 'measure-hip', 'Quadril']];
  fields.forEach(([key, input]) => { $(input).value = last[key] ?? ''; });
  if (!history.length) return;
  const changes = fields.map(([key, , label]) => {
    if (!Number.isFinite(Number(first[key])) || !Number.isFinite(Number(last[key]))) return null;
    const delta = Number(last[key]) - Number(first[key]);
    return `${label}: ${delta.toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 1 })} cm`;
  }).filter(Boolean);
  $('measurement-summary').textContent = changes.length ? `Desde a primeira medição — ${changes.join(' · ')}.` : 'Atualize as medidas que deseja comparar.';
}

function renderProgressPhotos(profile) {
  const photos = Array.isArray(profile.fotosProgresso) ? profile.fotosProgresso : [];
  $('progress-photos').innerHTML = photos.length ? photos.map((photo) => `<article class="relative overflow-hidden rounded-xl bg-white/5"><img class="aspect-square w-full object-cover" src="${photo.dataUrl}" alt="Foto de progresso de ${new Date(photo.criadoEm).toLocaleDateString('pt-BR')}"><button data-delete-photo="${photo.id}" class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm" aria-label="Remover foto">×</button></article>`).join('') : '<p class="col-span-3 text-sm text-gray-500">Nenhuma foto registrada.</p>';
}

async function compressPhoto(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Escolha uma imagem em JPG, PNG ou WebP.');
  const source = typeof createImageBitmap === 'function' ? await createImageBitmap(file) : await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height, draw: (context, width, height) => context.drawImage(image, 0, 0, width, height), close: () => URL.revokeObjectURL(url) });
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível abrir a foto.')); };
    image.src = url;
  });
  const scale = Math.min(1, 720 / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const context = canvas.getContext('2d');
  if (source.draw) source.draw(context, canvas.width, canvas.height);
  else context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();
  let quality = 0.8;
  let image = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  while (image && image.size > 120 * 1024 && quality > 0.35) {
    quality -= 0.1;
    image = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  }
  if (!image || image.size > 120 * 1024) throw new Error('A foto ficou grande demais. Escolha uma imagem mais simples.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a foto.'));
    reader.readAsDataURL(image);
  });
}

async function load() {
  const [profileSnapshot, weightSnapshot, sessionSnapshot] = await Promise.all([
    getDoc(doc(db, 'users', currentUser.uid)),
    getDocs(query(collection(db, 'pesos'), where('userId', '==', currentUser.uid))),
    getDocs(query(collection(db, 'sessoes'), where('userId', '==', currentUser.uid)))
  ]);
  const profile = profileSnapshot.data() || {};
  latestProfile = profile;
  currentGoal = Math.max(1, Math.min(7, Number(profile.metaSemanal) || 3));
  const sessions = sessionSnapshot.docs.map((item) => item.data());
  const stats = workoutStats(sessions);
  stats.sessions = sessions.length;
  renderGoal(stats);
  renderCalendar(stats.activeDays);
  renderBadges(stats);
  const weights = weightSnapshot.docs.map((item) => item.data());
  renderWeight(weights);
  renderBodyComparison(weights, profile);
  renderMeasurements(profile);
  renderProgressPhotos(profile);
}

async function saveGoal(change) {
  currentGoal = Math.max(1, Math.min(7, currentGoal + change));
  await setDoc(doc(db, 'users', currentUser.uid), { metaSemanal: currentGoal }, { merge: true });
  await load();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { location.href = './login.html'; return; }
  currentUser = user;
  try { await load(); } catch (error) { console.warn('Não foi possível carregar evolução:', error.message); }
});

$('goal-down').onclick = () => saveGoal(-1);
$('goal-up').onclick = () => saveGoal(1);
$('save').onclick = async () => {
  const value = Number(String($('weight').value).replace(',', '.'));
  if (!Number.isFinite(value) || value < 20 || value > 400) return;
  $('save').disabled = true;
  try {
    await addDoc(collection(db, 'pesos'), { userId: currentUser.uid, pesoKg: value, registradoEm: serverTimestamp() });
    $('weight').value = '';
    await load();
  } finally { $('save').disabled = false; }
};
$('save-measures').onclick = async () => {
  const history = Array.isArray(latestProfile.medidasHistorico) ? latestProfile.medidasHistorico : [];
  const record = { ...(history.at(-1) || {}), registradoEm: new Date().toISOString() };
  [['waist', 'measure-waist'], ['chest', 'measure-chest'], ['arm', 'measure-arm'], ['hip', 'measure-hip']].forEach(([key, input]) => {
    const value = measureValue($(input).value);
    if (value !== null) record[key] = value;
  });
  if (Object.keys(record).length === 1) return;
  $('save-measures').disabled = true;
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { medidasHistorico: [...history, record].slice(-50) }, { merge: true });
    await load();
  } finally { $('save-measures').disabled = false; }
};
$('save-photo').onclick = async () => {
  const file = $('progress-photo').files[0];
  if (!file) return;
  $('save-photo').disabled = true;
  try {
    const dataUrl = await compressPhoto(file);
    const photos = Array.isArray(latestProfile.fotosProgresso) ? latestProfile.fotosProgresso : [];
    if (photos.length >= 5) throw new Error('Remova uma foto antes de adicionar outra.');
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    await setDoc(doc(db, 'users', currentUser.uid), { fotosProgresso: [...photos, { id, dataUrl, criadoEm: new Date().toISOString() }] }, { merge: true });
    $('progress-photo').value = '';
    await load();
  } catch (error) { alert(error.message || 'Não foi possível salvar a foto.'); }
  finally { $('save-photo').disabled = false; }
};
$('progress-photos').onclick = async (event) => {
  const id = event.target.closest('[data-delete-photo]')?.dataset.deletePhoto;
  if (!id || !confirm('Remover esta foto de progresso?')) return;
  const photos = (latestProfile.fotosProgresso || []).filter((photo) => photo.id !== id);
  await setDoc(doc(db, 'users', currentUser.uid), { fotosProgresso: photos }, { merge: true });
  await load();
};
$('back').onclick = () => history.back();
