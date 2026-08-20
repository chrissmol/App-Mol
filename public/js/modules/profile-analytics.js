const DAY = 86400000;

export function profileDate(value) {
  const source = value?.concluidoEm ?? value;
  if (source == null || source === '') return null;
  if (source?.toDate) return source.toDate();
  if (Number.isFinite(Number(source?.seconds))) {
    const timestampDate = new Date(Number(source.seconds) * 1000);
    return Number.isNaN(timestampDate.getTime()) ? null : timestampDate;
  }
  const match = typeof source === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(source);
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(source);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function profileWeekStart(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function formatTrainingTime(seconds) {
  const minutes = Math.max(0, Math.round((Number(seconds) || 0) / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

export function profileStats(sessions, goal = 3, now = new Date()) {
  const valid = (Array.isArray(sessions) ? sessions : []).filter(session => {
    const date = profileDate(session);
    return date && date <= now;
  });
  let sets = 0; let volume = 0; let seconds = 0;
  valid.forEach(session => {
    const duration = Number(session.duracaoSegundos);
    seconds += Number.isFinite(duration) ? Math.max(0, duration) : 0;
    let calculatedVolume = 0;
    (session.exercicios || []).forEach(exercise => (exercise.series || []).forEach(set => {
      if (set.concluida !== true) return;
      sets += 1;
      const weight = Number(set.kg); const repetitions = Number(set.reps);
      if (Number.isFinite(weight) && weight >= 0 && Number.isFinite(repetitions) && repetitions > 0) calculatedVolume += weight * repetitions;
    }));
    volume += Number.isFinite(Number(session.volumeTotal)) ? Math.max(0, Number(session.volumeTotal)) : calculatedVolume;
  });
  const start = profileWeekStart(now);
  const end = new Date(start.getTime() + 7 * DAY);
  const weekly = valid.filter(session => { const date = profileDate(session); return date >= start && date < end; }).length;
  const target = Math.max(1, Math.min(7, Number(goal) || 3));
  return { workouts: valid.length, sets, volume, seconds, weekly, goal: target, percent: Math.min(100, Math.round((weekly / target) * 100)) };
}

export function profileMilestone(workouts) {
  const achieved = [100, 50, 25, 10].find(value => workouts >= value);
  if (achieved) return `🏅 Marco de ${achieved} treinos conquistado.`;
  const next = [10, 25, 50, 100].find(value => workouts < value) || 100;
  const remaining = next - workouts;
  return `${remaining === 1 ? 'Falta' : 'Faltam'} ${remaining} treino${remaining === 1 ? '' : 's'} para o marco de ${next}.`;
}

export function readProfileCache(raw, now = Date.now(), maxAge = 5 * 60 * 1000) {
  try {
    const cache = JSON.parse(raw || 'null');
    const savedAt = Number(cache?.savedAt);
    if (!Number.isFinite(savedAt) || savedAt <= 0 || savedAt > now + 5 * 60 * 1000 || now - savedAt > maxAge || !cache.stats || typeof cache.stats !== 'object') return null;
    const nonNegative = (value, integer = false) => {
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0) return 0;
      return integer ? Math.floor(number) : number;
    };
    const workouts = nonNegative(cache.stats.workouts, true);
    const weekly = nonNegative(cache.stats.weekly, true);
    const goal = Math.max(1, Math.min(7, Number(cache.stats.goal) || 3));
    return {
      workouts,
      sets: nonNegative(cache.stats.sets, true),
      volume: nonNegative(cache.stats.volume),
      seconds: nonNegative(cache.stats.seconds),
      weekly,
      goal,
      percent: Math.min(100, Math.round((weekly / goal) * 100))
    };
  } catch { return null; }
}
