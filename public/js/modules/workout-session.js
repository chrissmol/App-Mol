export const WORKOUT_LIMITS = Object.freeze({
  weight: 2000,
  reps: 1000,
  rir: 10,
  rest: 3600,
  targetReps: 1000
});

export const WORKOUT_STRUCTURE_LIMITS = Object.freeze({
  routines: 100,
  exercises: 60,
  setsPerExercise: 60
});

export const SET_METHODS = Object.freeze({
  NORMAL: 'NORMAL',
  DROP_SET: 'DROP_SET',
  REST_PAUSE: 'REST_PAUSE',
  MYO_REPS: 'MYO_REPS',
  CLUSTER: 'CLUSTER',
  ISOMETRIC: 'ISOMETRIC'
});

export function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function boundedNumber(value, { min, max, integer = false }) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) return null;
  return number;
}

function normalizeLoadRepPair(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    kg: boundedNumber(source.kg, { min: 0, max: WORKOUT_LIMITS.weight }) ?? '',
    reps: boundedNumber(source.reps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true }) ?? ''
  };
}

export function setMethod(set = {}) {
  const method = String(set.method || '').toUpperCase();
  if (Object.values(SET_METHODS).includes(method)) return method;
  return String(set.tipo || '').toUpperCase() === 'D' ? SET_METHODS.DROP_SET : SET_METHODS.NORMAL;
}

export function defaultMethodDetails(method, set = {}) {
  const kg = boundedNumber(set.kg, { min: 0, max: WORKOUT_LIMITS.weight }) ?? '';
  const reps = boundedNumber(set.reps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true }) ?? '';
  if (method === SET_METHODS.DROP_SET) return { primary: { kg, reps }, drops: [{ kg: '', reps: '' }], restSeconds: 0, note: '' };
  if (method === SET_METHODS.REST_PAUSE) return { kg, blocks: [reps || '', '', ''], restSeconds: 20, note: '' };
  if (method === SET_METHODS.MYO_REPS) return { activation: { kg, reps }, miniSets: ['', '', '', ''], restSeconds: 15, note: '' };
  if (method === SET_METHODS.CLUSTER) return { kg, blocks: [3, 3, 3, 3], restSeconds: 15, note: '' };
  if (method === SET_METHODS.ISOMETRIC) return { kg, reps, holdSeconds: 20, note: '' };
  return {};
}

function normalizeSetDetails(method, details, set = {}) {
  const source = details && typeof details === 'object' ? details : defaultMethodDetails(method, set);
  const restSeconds = boundedNumber(source.restSeconds, { min: 0, max: WORKOUT_LIMITS.rest, integer: true }) ?? 0;
  const note = typeof source.note === 'string' ? source.note.slice(0, 240) : '';
  if (method === SET_METHODS.DROP_SET) return {
    primary: normalizeLoadRepPair(source.primary || set),
    drops: (Array.isArray(source.drops) ? source.drops : []).slice(0, 5).map(normalizeLoadRepPair),
    restSeconds,
    note
  };
  if (method === SET_METHODS.REST_PAUSE || method === SET_METHODS.CLUSTER) return {
    kg: boundedNumber(source.kg ?? set.kg, { min: 0, max: WORKOUT_LIMITS.weight }) ?? '',
    blocks: (Array.isArray(source.blocks) ? source.blocks : []).slice(0, 8).map(value => boundedNumber(value, { min: 1, max: WORKOUT_LIMITS.reps, integer: true }) ?? ''),
    restSeconds: restSeconds || (method === SET_METHODS.REST_PAUSE ? 20 : 15),
    note
  };
  if (method === SET_METHODS.MYO_REPS) return {
    activation: normalizeLoadRepPair(source.activation || set),
    miniSets: (Array.isArray(source.miniSets) ? source.miniSets : []).slice(0, 8).map(value => boundedNumber(value, { min: 1, max: WORKOUT_LIMITS.reps, integer: true }) ?? ''),
    restSeconds: restSeconds || 15,
    note
  };
  if (method === SET_METHODS.ISOMETRIC) return {
    kg: boundedNumber(source.kg ?? set.kg, { min: 0, max: WORKOUT_LIMITS.weight }) ?? '',
    reps: boundedNumber(source.reps ?? set.reps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true }) ?? '',
    holdSeconds: boundedNumber(source.holdSeconds, { min: 1, max: WORKOUT_LIMITS.rest, integer: true }) ?? '',
    note
  };
  return {};
}

export function setSummary(set = {}) {
  const method = setMethod(set);
  const details = normalizeSetDetails(method, set.details, set);
  if (method === SET_METHODS.DROP_SET) {
    const parts = [details.primary, ...(details.drops || [])].filter(item => item.kg !== '' && item.reps !== '').map(item => `${item.kg} kg × ${item.reps}`);
    return parts.join(' → ') || 'Configure o drop set';
  }
  if (method === SET_METHODS.REST_PAUSE) {
    const blocks = (details.blocks || []).filter(item => item !== '');
    return details.kg !== '' && blocks.length ? `${details.kg} kg · ${blocks.join(' + ')} · ${details.restSeconds}s` : 'Configure o rest-pause';
  }
  if (method === SET_METHODS.MYO_REPS) {
    const minis = (details.miniSets || []).filter(item => item !== '');
    return details.activation.kg !== '' && details.activation.reps !== '' ? `${details.activation.kg} kg · ${[details.activation.reps, ...minis].join(' + ')}` : 'Configure o myo-reps';
  }
  if (method === SET_METHODS.CLUSTER) {
    const blocks = (details.blocks || []).filter(item => item !== '');
    return details.kg !== '' && blocks.length ? `${details.kg} kg · ${blocks.join(' + ')} · ${details.restSeconds}s` : 'Configure o cluster';
  }
  if (method === SET_METHODS.ISOMETRIC) {
    return details.kg !== '' && details.reps !== '' && details.holdSeconds !== '' ? `${details.kg} kg · ${details.reps} reps + ${details.holdSeconds}s` : 'Configure a isometria';
  }
  return `${set.kg || '-'} kg × ${set.reps || '-'}`;
}

export function validateContextualSet(set = {}) {
  const method = setMethod(set);
  if (method === SET_METHODS.NORMAL) return validateSet(set);
  const details = normalizeSetDetails(method, set.details, set);
  const pairs = method === SET_METHODS.DROP_SET ? [details.primary, ...(details.drops || [])] : [];
  if (method === SET_METHODS.DROP_SET && pairs.filter(item => item.kg !== '' || item.reps !== '').some(item => item.kg === '' || item.reps === '')) return { valid: false, message: 'Complete carga e repetições em cada etapa do drop set.' };
  if (method === SET_METHODS.DROP_SET && pairs.filter(item => item.kg !== '' && item.reps !== '').length < 2) return { valid: false, message: 'O drop set precisa da série principal e pelo menos um drop.' };
  if ((method === SET_METHODS.REST_PAUSE || method === SET_METHODS.CLUSTER) && (details.kg === '' || (details.blocks || []).filter(item => item !== '').length < 2)) return { valid: false, message: 'Complete a carga e pelo menos dois blocos.' };
  if (method === SET_METHODS.MYO_REPS && (details.activation.kg === '' || details.activation.reps === '' || (details.miniSets || []).filter(item => item !== '').length < 1)) return { valid: false, message: 'Complete a ativação e pelo menos uma mini-série.' };
  if (method === SET_METHODS.ISOMETRIC && (details.kg === '' || details.reps === '' || details.holdSeconds === '')) return { valid: false, message: 'Complete carga, repetições e tempo de isometria.' };
  return { valid: true, values: { details } };
}

export function setVolume(set = {}) {
  const method = setMethod(set);
  if (method === SET_METHODS.NORMAL) {
    const weight = Number(set.kg); const repetitions = Number(set.reps);
    return Number.isFinite(weight) && weight >= 0 && Number.isFinite(repetitions) && repetitions > 0 ? weight * repetitions : 0;
  }
  const details = normalizeSetDetails(method, set.details, set);
  const pairVolume = item => Number(item.kg) >= 0 && Number(item.reps) > 0 ? Number(item.kg) * Number(item.reps) : 0;
  if (method === SET_METHODS.DROP_SET) return [details.primary, ...(details.drops || [])].reduce((sum, item) => sum + pairVolume(item), 0);
  if (method === SET_METHODS.MYO_REPS) return Number(details.activation.kg) >= 0 ? Number(details.activation.kg) * [details.activation.reps, ...(details.miniSets || [])].reduce((sum, reps) => sum + (Number(reps) || 0), 0) : 0;
  if (method === SET_METHODS.REST_PAUSE || method === SET_METHODS.CLUSTER) return Number(details.kg) >= 0 ? Number(details.kg) * (details.blocks || []).reduce((sum, reps) => sum + (Number(reps) || 0), 0) : 0;
  if (method === SET_METHODS.ISOMETRIC) return Number(details.kg) >= 0 && Number(details.reps) > 0 ? Number(details.kg) * Number(details.reps) : 0;
  return 0;
}

export function normalizeRoutineExercises(exercises) {
  return (Array.isArray(exercises) ? exercises : []).slice(0, WORKOUT_STRUCTURE_LIMITS.exercises).flatMap(exercise => {
    if (!exercise || typeof exercise !== 'object') return [];
    const nome = typeof exercise.nome === 'string' ? exercise.nome.trim().slice(0, 80) : '';
    const grupo = typeof exercise.grupo === 'string' ? exercise.grupo.trim().slice(0, 40) : '';
    const repsMin = boundedNumber(exercise.repsMin, { min: 1, max: WORKOUT_LIMITS.targetReps, integer: true }) ?? 8;
    const repsMaxCandidate = boundedNumber(exercise.repsMax, { min: 1, max: WORKOUT_LIMITS.targetReps, integer: true }) ?? 12;
    const repsMax = Math.max(repsMin, repsMaxCandidate);
    const rirAlvo = boundedNumber(exercise.rirAlvo, { min: 0, max: WORKOUT_LIMITS.rir, integer: true }) ?? 2;
    const descansoSegundos = boundedNumber(exercise.descansoSegundos, { min: 15, max: WORKOUT_LIMITS.rest, integer: true }) ?? 90;
    const series = (Array.isArray(exercise.series) ? exercise.series : []).slice(0, WORKOUT_STRUCTURE_LIMITS.setsPerExercise).map(set => {
      const source = set && typeof set === 'object' ? set : {};
      const kg = boundedNumber(source.kg, { min: 0, max: WORKOUT_LIMITS.weight });
      const reps = boundedNumber(source.reps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true });
      const rir = boundedNumber(source.rir, { min: 0, max: WORKOUT_LIMITS.rir, integer: true });
      const anteriorKg = boundedNumber(source.anteriorKg, { min: 0, max: WORKOUT_LIMITS.weight });
      const anteriorReps = boundedNumber(source.anteriorReps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true });
      const anteriorRir = boundedNumber(source.anteriorRir, { min: 0, max: WORKOUT_LIMITS.rir, integer: true });
      return {
        ...source,
        tipo: ['N', 'W', 'D', 'F'].includes(String(source.tipo).toUpperCase()) ? String(source.tipo).toUpperCase() : 'N',
        method: setMethod(source),
        details: normalizeSetDetails(setMethod(source), source.details, source),
        kg: kg ?? '',
        reps: reps ?? '',
        rir: rir ?? '',
        anteriorKg: anteriorKg ?? '',
        anteriorReps: anteriorReps ?? '',
        anteriorRir: anteriorRir ?? '',
        concluida: source.concluida === true && kg !== null && reps !== null
      };
    });
    return [{
      ...exercise,
      nome: nome || 'Exercício',
      grupo: grupo || 'Outros',
      notas: typeof exercise.notas === 'string' ? exercise.notas.slice(0, 500) : '',
      repsMin,
      repsMax,
      rirAlvo,
      descansoSegundos,
      series
    }];
  });
}

export function normalizeRoutineRecord(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const nome = typeof source.nome === 'string' ? source.nome.trim().slice(0, 80) : '';
  const diasSemana = [...new Set((Array.isArray(source.diasSemana) ? source.diasSemana : []).map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6))];
  const horario = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(source.horario || '')) ? source.horario : '';
  return {
    ...source,
    nome: nome || 'Rotina sem nome',
    descricao: typeof source.descricao === 'string' ? source.descricao.slice(0, 240) : '',
    horario,
    diasSemana,
    exercicios: normalizeRoutineExercises(source.exercicios)
  };
}

export function elapsedSeconds(startedAt, now = Date.now()) {
  const start = startedAt instanceof Date ? startedAt.getTime() : new Date(startedAt).getTime();
  return Number.isFinite(start) ? Math.max(0, Math.floor((now - start) / 1000)) : 0;
}

export function isRecoverableWorkoutDraft(draft, routineIds, now = Date.now()) {
  if (!draft || typeof draft !== 'object' || draft.versao !== 2) return false;
  if (typeof draft.rotinaId !== 'string' || !routineIds?.includes(draft.rotinaId)) return false;
  if (!Array.isArray(draft.exercicios) || draft.exercicios.length > WORKOUT_STRUCTURE_LIMITS.exercises) return false;
  if (draft.exercicios.some(exercise => !exercise || typeof exercise !== 'object' || !Array.isArray(exercise.series) || exercise.series.length > WORKOUT_STRUCTURE_LIMITS.setsPerExercise)) return false;
  const updatedAt = new Date(draft.atualizadoEm).getTime();
  const startedAt = new Date(draft.iniciadaEm).getTime();
  const clockTolerance = 5 * 60 * 1000;
  if (!Number.isFinite(updatedAt) || !Number.isFinite(startedAt)) return false;
  if (updatedAt > now + clockTolerance || startedAt > now + clockTolerance) return false;
  if (now - updatedAt > 7 * 86400000 || startedAt > updatedAt + clockTolerance) return false;
  return true;
}

export function validateSet({ kg, reps, rir }) {
  const weight = Number(kg);
  const repetitions = Number(reps);
  const reserve = rir === '' || rir == null ? null : Number(rir);
  if (kg === '' || !Number.isFinite(weight) || weight < 0 || weight > WORKOUT_LIMITS.weight) return { valid: false, message: `Informe uma carga entre 0 e ${WORKOUT_LIMITS.weight} kg.` };
  if (reps === '' || !Number.isInteger(repetitions) || repetitions < 1 || repetitions > WORKOUT_LIMITS.reps) return { valid: false, message: `Informe entre 1 e ${WORKOUT_LIMITS.reps} repetições inteiras.` };
  if (reserve !== null && (!Number.isInteger(reserve) || reserve < 0 || reserve > WORKOUT_LIMITS.rir)) return { valid: false, message: 'O RIR deve ser um número inteiro entre 0 e 10.' };
  return { valid: true, values: { kg: weight, reps: repetitions, rir: reserve } };
}

export function validateExerciseTargets(exercise, field, rawValue) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 0) return { valid: false, message: 'Use somente números inteiros positivos.' };
  if (field === 'rirAlvo' && value > WORKOUT_LIMITS.rir) return { valid: false, message: 'O RIR alvo deve ficar entre 0 e 10.' };
  if (field === 'descansoSegundos' && (value < 15 || value > WORKOUT_LIMITS.rest)) return { valid: false, message: 'O descanso deve ficar entre 15 segundos e 60 minutos.' };
  if ((field === 'repsMin' || field === 'repsMax') && (value < 1 || value > WORKOUT_LIMITS.targetReps)) return { valid: false, message: `A meta deve ficar entre 1 e ${WORKOUT_LIMITS.targetReps} repetições.` };
  const next = { ...exercise, [field]: value };
  if ((next.repsMin ?? 1) > (next.repsMax ?? WORKOUT_LIMITS.targetReps)) return { valid: false, message: 'A meta mínima não pode ser maior que a máxima.' };
  return { valid: true, value };
}

export function cleanRoutineExercises(exercises) {
  return normalizeRoutineExercises(cloneValue(exercises || [])).map(exercise => ({
    ...exercise,
    series: (exercise.series || []).map(set => ({
      ...set,
      anteriorKg: set.concluida ? set.kg : set.anteriorKg,
      anteriorReps: set.concluida ? set.reps : set.anteriorReps,
      anteriorRir: set.concluida ? set.rir : set.anteriorRir,
      concluida: false,
      kg: '',
      reps: '',
      rir: '',
      details: defaultMethodDetails(setMethod(set), set)
    }))
  }));
}

export function completedWorkoutSnapshot(exercises) {
  return normalizeRoutineExercises(cloneValue(exercises || []));
}

export function workoutTotals(exercises) {
  const sets = (exercises || []).flatMap(exercise => exercise.series || []);
  const completed = sets.filter(set => set.concluida);
  return {
    total: sets.length,
    completed: completed.length,
    volume: completed.reduce((sum, set) => {
      return sum + setVolume(set);
    }, 0)
  };
}
