import { sessionMetrics, workoutDate } from './workout-analytics.js';

function validSessions(sessions, now = new Date()) {
  return (sessions || []).filter(session => { const date = workoutDate(session); return date && date <= now; });
}

export function historySummary(sessions, now = new Date()) {
  return validSessions(sessions, now).reduce((summary, session) => {
    const metrics = sessionMetrics(session);
    summary.workouts += 1;
    summary.sets += metrics.sets;
    summary.volume += metrics.volume;
    return summary;
  }, { workouts: 0, sets: 0, volume: 0 });
}

export function sessionsByDay(sessions, month, now = new Date()) {
  const result = new Map();
  validSessions(sessions, now).forEach(session => {
    const date = workoutDate(session);
    if (!date || date.getFullYear() !== month.getFullYear() || date.getMonth() !== month.getMonth()) return;
    result.set(date.getDate(), (result.get(date.getDate()) || 0) + 1);
  });
  return result;
}

export function filterHistory(sessions, { month = null, day = null, query = '', now = new Date() } = {}) {
  const term = String(query).trim().toLocaleLowerCase('pt-BR');
  return validSessions(sessions, now).filter(session => {
    const date = workoutDate(session);
    if (month && (!date || date.getFullYear() !== month.getFullYear() || date.getMonth() !== month.getMonth())) return false;
    if (day && date?.getDate() !== day) return false;
    if (!term) return true;
    const haystack = [session.nomeRotina, ...(session.exercicios || []).map(exercise => exercise.nome)].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    return haystack.includes(term);
  });
}

export function sortSessionsNewest(sessions, now = new Date()) {
  return validSessions(sessions, now).sort((a, b) => workoutDate(b) - workoutDate(a));
}
