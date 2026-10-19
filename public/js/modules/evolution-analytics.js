export function dateFrom(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = value?.toDate?.() || (value?.seconds ? new Date(value.seconds * 1000) : (match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : (value ? new Date(value) : null)));
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
}

export function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekStart(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function sessionVolume(session) {
  if (session.volumeTotal !== null && session.volumeTotal !== '' && Number.isFinite(Number(session.volumeTotal))) return Math.max(0, Number(session.volumeTotal));
  return (session.exercicios || []).reduce((total, exercise) => total + (exercise.series || []).reduce((sum, set) => {
    if (set.concluida !== true) return sum;
    const weight = Number(set.kg); const repetitions = Number(set.reps);
    return sum + (Number.isFinite(weight) && weight >= 0 && Number.isFinite(repetitions) && repetitions > 0 ? weight * repetitions : 0);
  }, 0), 0);
}

export function workoutStats(sessions, goal, now = new Date()) {
  const currentGoal = Math.max(1, Math.min(7, Number(goal) || 3));
  const validSessions = (sessions || []).filter(item => { const date = dateFrom(item.concluidoEm); return date && date <= now; });
  const dates = validSessions.map(item => dateFrom(item.concluidoEm));
  const activeDays = new Set(dates.map(dayKey));
  const weeks = new Map();
  const weekVolumes = new Map();
  validSessions.forEach(session => {
    const key = dayKey(weekStart(dateFrom(session.concluidoEm)));
    weeks.set(key, (weeks.get(key) || 0) + 1);
    weekVolumes.set(key, (weekVolumes.get(key) || 0) + sessionVolume(session));
  });
  const currentWeek = weekStart(now);
  const weekly = weeks.get(dayKey(currentWeek)) || 0;
  let streak = 0;
  let cursor = weekly >= currentGoal ? currentWeek : new Date(currentWeek.getTime() - 7 * 86400000);
  while ((weeks.get(dayKey(cursor)) || 0) >= currentGoal) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 7 * 86400000);
  }
  const series = validSessions.reduce((total, session) => total + (session.exercicios || []).reduce((sum, exercise) => {
    return sum + (exercise.series || []).filter(set => set.concluida === true).length;
  }, 0), 0);
  const volume = validSessions.reduce((total, session) => total + sessionVolume(session), 0);
  const seconds = validSessions.reduce((total, session) => {
    const duration = Number(session.duracaoSegundos);
    return total + (Number.isFinite(duration) ? Math.max(0, duration) : 0);
  }, 0);
  // Últimas 8 semanas, da mais antiga para a atual (setDate evita o erro de horário de verão).
  const weeklyVolume = Array.from({ length: 8 }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (7 - index) * 7);
    return { start, kg: Math.round(weekVolumes.get(dayKey(start)) || 0) };
  });
  return { activeDays, weeks, weeklyVolume, streak, series, volume, seconds, weekly, sessions: validSessions.length };
}

/** Média dos registros dos 7 dias que terminam em cada ponto; `points` em ordem de data. */
export function sevenDayAverage(points) {
  return points.map(point => {
    const from = point.date.getTime() - 6 * 86400000;
    const window = points.filter(item => item.date <= point.date && item.date.getTime() >= from);
    return window.reduce((sum, item) => sum + item.kg, 0) / window.length;
  });
}

export function monthCalendar(monthDate, activeDays, today = new Date()) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  return {
    leadingBlanks: new Date(year, month, 1).getDay(),
    days: Array.from({ length: count }, (_, index) => {
      const date = new Date(year, month, index + 1);
      return { day: index + 1, trained: activeDays.has(dayKey(date)), today: dayKey(date) === dayKey(today) };
    })
  };
}
