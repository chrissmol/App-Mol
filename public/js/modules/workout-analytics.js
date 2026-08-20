export function completedSets(session) {
  return (Array.isArray(session?.exercicios) ? session.exercicios : []).slice(0, 60).flatMap(ex => (Array.isArray(ex?.series) ? ex.series : []).slice(0, 60).filter(set => set?.concluida === true).map(set => ({ ...set, exercicio: String(ex.nome || '').slice(0, 80), grupo: String(ex.grupo || 'Outros').slice(0, 40) })));
}

export function workoutDate(value) {
  const source = value?.concluidoEm ?? value;
  if (source == null || source === '') return null;
  const localDateMatch = typeof source === 'string' ? source.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  const date = source?.toDate?.() || (Number.isFinite(source?.seconds)
    ? new Date(source.seconds * 1000)
    : localDateMatch
      ? new Date(Number(localDateMatch[1]), Number(localDateMatch[2]) - 1, Number(localDateMatch[3]))
      : new Date(source));
  return date instanceof Date && Number.isFinite(date.getTime()) ? date : null;
}

export function normalizedExerciseName(value) {
  return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

export function normalizedGroup(value) {
  const original = String(value || 'Outros').trim().slice(0, 40) || 'Outros';
  const key = normalizedExerciseName(original);
  const aliases = { braco: 'Braços', bracos: 'Braços', biceps: 'Braços', triceps: 'Braços', antebraco: 'Braços', antebracos: 'Braços', perna: 'Pernas', pernas: 'Pernas', quadriceps: 'Quadríceps', posterior: 'Posterior', posteriores: 'Posterior', gluteo: 'Glúteos', gluteos: 'Glúteos', abdomen: 'Abdômen', abdominal: 'Abdômen', peito: 'Peito', peitoral: 'Peito', costas: 'Costas', dorsal: 'Costas', ombro: 'Ombros', ombros: 'Ombros', outro: 'Outros', outros: 'Outros' };
  return aliases[key] || original.charAt(0).toLocaleUpperCase('pt-BR') + original.slice(1).toLocaleLowerCase('pt-BR');
}

export function sessionMetrics(session) {
  const sets = completedSets(session);
  const volume = sets.reduce((sum, set) => {
    const weight = Number(set.kg); const repetitions = Number(set.reps);
    return sum + (Number.isFinite(weight) && weight >= 0 && Number.isFinite(repetitions) && repetitions > 0 ? weight * repetitions : 0);
  }, 0);
  const duration = Number(session?.duracaoSegundos);
  return { sets: sets.length, volume, durationSeconds: Number.isFinite(duration) ? Math.max(0, duration) : 0 };
}

export function volumeByGroup(sessions, days = 7, now = new Date()) {
  const source = Array.isArray(sessions) ? sessions : [];
  const end = now.getTime();
  const period = Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : 7;
  const since = end - period * 24 * 60 * 60 * 1000;
  const result = {};
  source.filter(session => { const time = workoutDate(session)?.getTime(); return time >= since && time <= end; }).forEach(session => completedSets(session).forEach(set => {
    if (String(set.tipo || 'N').toUpperCase() === 'W') return;
    const group = normalizedGroup(set.grupo);
    result[group] = (result[group] || 0) + 1;
  }));
  return result;
}

export function weeklyVolume(sessions, now = new Date()) { return volumeByGroup(sessions, 7, now); }

export function estimate1RM(weight, reps) {
  const load = Number(weight);
  const repetitions = Number(reps);
  return Number.isFinite(load) && Number.isFinite(repetitions) && load > 0 && repetitions > 0 && repetitions <= 15 ? Math.round(load * (1 + repetitions / 30) * 10) / 10 : 0;
}

export function personalRecords(sessions, now = new Date()) {
  const grouped = new Map();
  (Array.isArray(sessions) ? sessions : []).forEach(session => {
    const date = workoutDate(session);
    if (!date || date > now) return;
    completedSets(session).forEach(set => {
      const name = String(set.exercicio || '').trim();
      const key = normalizedExerciseName(name);
      const weight = Number(set.kg); const reps = Number(set.reps); const e1rm = estimate1RM(weight, reps);
      if (!key || !e1rm) return;
      const list = grouped.get(key) || []; list.push({ name, weight, reps, e1rm, date }); grouped.set(key, list);
    });
  });
  return [...grouped.values()].map(entries => {
    entries.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
    let best = null; let previousBest = null;
    entries.forEach(entry => { if (!best || entry.e1rm > best.e1rm) { previousBest = best; best = entry; } });
    return { ...best, name: entries[0].name, previousE1rm: previousBest?.e1rm || null, improvement: previousBest ? Math.round(((best.e1rm - previousBest.e1rm) / previousBest.e1rm) * 1000) / 10 : null };
  }).sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0) || a.name.localeCompare(b.name, 'pt-BR'));
}
