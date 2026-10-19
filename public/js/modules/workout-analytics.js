import { setVolume } from './workout-session.js';
import { primaryMuscleZone, secondaryMuscleZones } from './exercise-presentation.js';

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
  const volume = sets.reduce((sum, set) => sum + setVolume(set), 0);
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

// Pontuação por zona do mapa muscular: 1 ponto por série concluída no
// músculo primário, 0.5 nos secundários (estímulo parcial). Ignora
// séries de aquecimento (tipo W), igual volumeByGroup.
export function muscleZoneScores(sets) {
  /** @type {Record<string, number>} */
  const scores = {};
  (Array.isArray(sets) ? sets : []).forEach(set => {
    if (String(set.tipo || 'N').toUpperCase() === 'W') return;
    const exercise = { nome: set.exercicio, grupo: set.grupo };
    const primary = primaryMuscleZone(exercise);
    if (primary !== 'outros') scores[primary] = (scores[primary] || 0) + 1;
    secondaryMuscleZones(exercise).forEach(zone => { scores[zone] = (scores[zone] || 0) + 0.5; });
  });
  return scores;
}

export function volumeByMuscleZone(sessions, days = 7, now = new Date()) {
  const source = Array.isArray(sessions) ? sessions : [];
  const end = now.getTime();
  const period = Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : 7;
  const since = end - period * 24 * 60 * 60 * 1000;
  const sets = source.filter(session => { const time = workoutDate(session)?.getTime(); return time >= since && time <= end; }).flatMap(completedSets);
  return muscleZoneScores(sets);
}

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

export function exerciseTrends(sessions, days = 90, now = new Date()) {
  const end = now.getTime();
  const period = Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : 90;
  const since = end - period * 24 * 60 * 60 * 1000;
  const grouped = new Map();
  (Array.isArray(sessions) ? sessions : []).forEach(session => {
    const date = workoutDate(session);
    if (!date || date.getTime() < since || date.getTime() > end) return;
    const sessionBest = new Map();
    completedSets(session).forEach(set => {
      const name = String(set.exercicio || '').trim();
      const key = normalizedExerciseName(name);
      const e1rm = estimate1RM(set.kg, set.reps);
      if (!key || !e1rm) return;
      const current = sessionBest.get(key);
      if (!current || e1rm > current.e1rm) sessionBest.set(key, { name, e1rm, date });
    });
    sessionBest.forEach((entry, key) => {
      const list = grouped.get(key) || [];
      list.push(entry);
      grouped.set(key, list);
    });
  });

  return [...grouped.values()].filter(entries => entries.length >= 2).map(entries => {
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const first = entries[0]; const latest = entries.at(-1);
    const deltaPercent = Math.round(((latest.e1rm - first.e1rm) / first.e1rm) * 1000) / 10;
    const state = deltaPercent > 2 ? 'improving' : deltaPercent < -2 ? 'declining' : 'stable';
    return { name: latest.name, state, deltaPercent, recentE1rm: latest.e1rm, sessions: entries.length };
  }).sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent) || a.name.localeCompare(b.name, 'pt-BR'));
}

export function trainingBalance(volume = {}) {
  const entries = Object.entries(volume).filter(([, sets]) => Number(sets) > 0).sort((a, b) => b[1] - a[1]);
  const totalSets = entries.reduce((sum, [, sets]) => sum + Number(sets), 0);
  if (!entries.length) return { state: 'empty', title: 'Sem leitura ainda', message: 'Conclua séries para receber uma leitura da distribuição do treino.' };
  if (entries.length === 1) return { state: 'focused', title: `Foco em ${entries[0][0]}`, message: 'Só um grupo aparece neste período. Isso pode ser esperado pelo seu programa; confira os outros dias da semana.' };
  const [topGroup, topSets] = entries[0];
  const share = totalSets ? topSets / totalSets : 0;
  if (share >= .5) return { state: 'concentrated', title: `Maior concentração em ${topGroup}`, message: `${Math.round(share * 100)}% das séries do período foram para esse grupo. Compare com o objetivo do seu programa.` };
  return { state: 'distributed', title: 'Distribuição consistente', message: `${entries.length} grupos receberam estímulo no período, sem um único grupo concentrar metade das séries.` };
}

export function exerciseNames(sessions) {
  const names = new Set();
  (Array.isArray(sessions) ? sessions : []).forEach(session => completedSets(session).forEach(set => set.exercicio && names.add(set.exercicio)));
  return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// Um ponto por treino: maior carga, melhor 1RM estimado e volume do exercício, em ordem cronológica.
export function exerciseProgress(sessions, name) {
  return (Array.isArray(sessions) ? sessions : []).map(session => {
    const date = workoutDate(session);
    const sets = completedSets(session).filter(set => set.exercicio === name && Number(set.kg) >= 0 && Number(set.reps) > 0);
    if (!date || !sets.length) return null;
    return {
      date,
      kg: Math.max(...sets.map(set => Number(set.kg))),
      oneRM: Math.max(...sets.map(set => estimate1RM(set.kg, set.reps))),
      volume: sets.reduce((sum, set) => sum + Number(set.kg) * Number(set.reps), 0)
    };
  }).filter(Boolean).sort((a, b) => a.date - b.date);
}

// Chaves "sessão:exercício:série" das séries que superaram o melhor 1RM estimado anterior do exercício.
export function recordSetKeys(sessions) {
  const best = new Map(); const keys = new Set();
  (Array.isArray(sessions) ? sessions : []).map(session => ({ session, date: workoutDate(session) })).filter(item => item.date).sort((a, b) => a.date.getTime() - b.date.getTime()).forEach(({ session }) => {
    (Array.isArray(session.exercicios) ? session.exercicios : []).slice(0, 60).forEach((exercise, exerciseIndex) => {
      const name = normalizedExerciseName(exercise?.nome);
      if (!name) return;
      (Array.isArray(exercise.series) ? exercise.series : []).slice(0, 60).forEach((set, setIndex) => {
        const e1rm = set?.concluida === true ? estimate1RM(set.kg, set.reps) : 0;
        if (!e1rm) return;
        if (best.has(name) && e1rm > best.get(name)) keys.add(`${session.id}:${exerciseIndex}:${setIndex}`);
        if (!best.has(name) || e1rm > best.get(name)) best.set(name, e1rm);
      });
    });
  });
  return keys;
}
