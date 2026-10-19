import { isRecoverableWorkoutDraft } from './workout-session.js';

const DAY = 86400000;

export function safeJSON(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

export function dateOf(value) {
  const source = value?.concluidoEm ?? value;
  if (source?.toDate) return source.toDate();
  if (Number.isFinite(Number(source?.seconds))) {
    const timestampDate = new Date(Number(source.seconds) * 1000);
    return Number.isNaN(timestampDate.getTime()) ? null : timestampDate;
  }
  if (source instanceof Date) return Number.isNaN(source.getTime()) ? null : source;
  if (typeof source === 'string' || typeof source === 'number') {
    const dateOnly = typeof source === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(source);
    const date = dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(source);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function monday(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function sessionsInWeek(sessions, reference = new Date()) {
  const start = monday(reference);
  const end = new Date(start.getTime() + 7 * DAY);
  const now = new Date(reference);
  return (Array.isArray(sessions) ? sessions : []).filter(session => {
    const date = dateOf(session);
    return date && date >= start && date < end && date <= now;
  });
}

export function weeklyStreak(sessions, reference = new Date(), goal = 1) {
  const target = Math.max(1, Math.min(7, Number(goal) || 1));
  const counts = new Map();
  (Array.isArray(sessions) ? sessions : []).map(dateOf).filter(date => date && date <= reference).forEach(date => {
    const key = monday(date).getTime();
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  let cursor = monday(reference);
  if ((counts.get(cursor.getTime()) || 0) < target) cursor = new Date(cursor.getTime() - 7 * DAY);
  let streak = 0;
  while ((counts.get(cursor.getTime()) || 0) >= target) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 7 * DAY);
  }
  return streak;
}

export function validWorkoutDraft(draft, routines, now = new Date()) {
  return isRecoverableWorkoutDraft(draft, (Array.isArray(routines) ? routines : []).map(routine => routine.id), now.getTime()) ? draft : null;
}

export function selectRoutine(routines, weekday = new Date().getDay()) {
  const ordered = [...(Array.isArray(routines) ? routines : [])].sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
  return ordered.find(routine => (Array.isArray(routine.diasSemana) ? routine.diasSemana : []).map(Number).includes(weekday)) || ordered[0] || null;
}

export function estimatedWorkoutMinutes(routine) {
  const exercises = Array.isArray(routine?.exercicios) ? routine.exercicios.slice(0, 60) : [];
  const sets = exercises.reduce((sum, exercise) => sum + (Array.isArray(exercise?.series) ? Math.min(60, exercise.series.length) : 0), 0);
  const rests = exercises.reduce((sum, exercise) => {
    const setCount = Array.isArray(exercise?.series) ? Math.min(60, exercise.series.length) : 0;
    const rest = Number(exercise?.descansoSegundos);
    return sum + Math.max(0, setCount - 1) * (Number.isFinite(rest) && rest >= 0 && rest <= 3600 ? rest : 90);
  }, 0);
  return Math.max(10, Math.round((sets * 75 + rests + exercises.length * 60) / 300) * 5);
}

export function recentWeightTrend(weights, now = new Date()) {
  const ordered = [...(weights || [])].filter(item => {
    const date = dateOf(item.registradoEm);
    const value = Number(item.pesoKg);
    return Number.isFinite(value) && value >= 20 && value <= 400 && date && date <= now;
  }).sort((a, b) => dateOf(a.registradoEm) - dateOf(b.registradoEm));
  const last = ordered.at(-1);
  if (!last) return { last: null, change: null };
  const cutoff = dateOf(last.registradoEm).getTime() - 30 * DAY;
  const baseline = ordered.find(item => dateOf(item.registradoEm).getTime() >= cutoff) || ordered[0];
  return { last, change: ordered.length > 1 ? Number(last.pesoKg) - Number(baseline.pesoKg) : null };
}
