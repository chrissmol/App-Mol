const KEY = 'mol-reminders';
const notificationIcon = new URL('../../assets/mol-mark.svg', import.meta.url).href;

export function getReminderPreferences() {
  try {
    return { enabled: false, workoutTime: '18:00', mealTime: '12:00', ...(JSON.parse(localStorage.getItem(KEY) || '{}')) };
  } catch { return { enabled: false, workoutTime: '18:00', mealTime: '12:00' }; }
}

export function saveReminderPreferences(prefs) {
  localStorage.setItem(KEY, JSON.stringify({ ...getReminderPreferences(), ...prefs }));
}

async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const options = { body, icon: notificationIcon, tag: `mol-${title}`, renotify: false };
  const registration = await navigator.serviceWorker?.ready.catch(() => null);
  if (registration?.showNotification) await registration.showNotification(title, options);
  else new Notification(title, options);
}

export async function requestReminderPermission() {
  if (!('Notification' in window)) throw new Error('Este navegador n\u00e3o oferece notificações.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permiss\u00e3o de notificações n\u00e3o concedida.');
  return permission;
}

export async function sendTestReminder() {
  await notify('Mol', 'Lembretes ativados. Seu pr\u00f3ximo aviso aparecer\u00e1 no hor\u00e1rio escolhido.');
}

function due(type, time, now) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return false;
  if (now.getHours() !== hours || now.getMinutes() !== minutes) return false;
  const key = `mol-reminder-${type}`;
  const today = now.toISOString().slice(0, 10);
  if (localStorage.getItem(key) === today) return false;
  localStorage.setItem(key, today);
  return true;
}

export function startReminderMonitor() {
  if (window.__molReminderMonitor) return;
  window.__molReminderMonitor = true;
  const check = () => {
    const prefs = getReminderPreferences();
    if (!prefs.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    if (due('workout', prefs.workoutTime, now)) notify('Hora de treinar', 'Reserve alguns minutos para o seu treino de hoje.');
    if (due('meal', prefs.mealTime, now)) notify('Hora da refeição', 'Confira sua dieta e a próxima refeição planejada.');
  };
  check();
  window.setInterval(check, 30000);
}
