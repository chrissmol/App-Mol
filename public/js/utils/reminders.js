const KEY = 'mol-reminders';
const notificationIcon = new URL('../../assets/mol-mark.svg', import.meta.url).href;
const defaults = { enabled: false, workoutTime: '18:00', mealTime: '12:00' };
const sentInMemory = new Map();

export function normalizeReminderPreferences(value = {}) {
  const validTime = (time, fallback) => {
    const match = /^(\d{2}):(\d{2})$/.exec(String(time || ''));
    if (!match) return fallback;
    const hours = Number(match[1]); const minutes = Number(match[2]);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 ? `${match[1]}:${match[2]}` : fallback;
  };
  return {
    enabled: value.enabled === true,
    workoutTime: validTime(value.workoutTime, defaults.workoutTime),
    mealTime: validTime(value.mealTime, defaults.mealTime)
  };
}

export function getReminderPreferences() {
  try {
    return normalizeReminderPreferences(JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch { return { ...defaults }; }
}

export function saveReminderPreferences(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(normalizeReminderPreferences({ ...getReminderPreferences(), ...prefs })));
    return true;
  } catch (error) {
    console.warn('Preferências de lembretes não armazenadas:', error.message);
    return false;
  }
}

async function notify(title, body) {
  if (!('Notification' in window)) throw new Error('Este navegador não oferece notificações.');
  if (Notification.permission !== 'granted') throw new Error('Permissão de notificações não concedida.');
  const options = { body, icon: notificationIcon, tag: `mol-${title}`, renotify: false, data: { url: '/' } };
  const registration = await navigator.serviceWorker?.getRegistration?.().catch(() => null);
  if (registration?.showNotification) {
    await registration.showNotification(title, options);
    return;
  }
  try { new Notification(title, options); }
  catch { throw new Error('Instale o Mol para usar notificações neste dispositivo.'); }
}

export async function requestReminderPermission() {
  if (!('Notification' in window)) throw new Error('Este navegador n\u00e3o oferece notificações.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permiss\u00e3o de notificações n\u00e3o concedida.');
  return permission;
}

export async function sendTestReminder() {
  if (!('Notification' in window)) throw new Error('Este navegador não oferece notificações.');
  if (Notification.permission !== 'granted') await requestReminderPermission();
  await notify('Mol', 'Lembretes ativados. Seu pr\u00f3ximo aviso aparecer\u00e1 no hor\u00e1rio escolhido.');
}

function due(type, time, now) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;
  if (now.getHours() !== hours || now.getMinutes() !== minutes) return false;
  const key = `mol-reminder-${type}`;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (sentInMemory.get(type) === today) return false;
  try { return localStorage.getItem(key) !== today; }
  catch { return true; }
}

function markSent(type, now) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  sentInMemory.set(type, today);
  try { localStorage.setItem(`mol-reminder-${type}`, today); }
  catch (error) { console.warn('Registro local do lembrete indisponível:', error.message); }
}

export function startReminderMonitor() {
  if (window.__molReminderMonitor) return;
  window.__molReminderMonitor = true;
  let checking = false;
  const check = async () => {
    if (checking) return;
    const prefs = getReminderPreferences();
    if (!prefs.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    checking = true;
    const now = new Date();
    try {
      if (due('workout', prefs.workoutTime, now)) { await notify('Hora de treinar', 'Reserve alguns minutos para o seu treino de hoje.'); markSent('workout', now); }
      if (due('meal', prefs.mealTime, now)) { await notify('Hora da refeição', 'Confira sua dieta e a próxima refeição planejada.'); markSent('meal', now); }
    } catch (error) { console.warn('Lembrete não enviado:', error.message); }
    finally { checking = false; }
  };
  void check();
  window.setInterval(() => void check(), 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void check(); });
}
