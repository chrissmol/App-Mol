export const MAX_CUSTOM_EXERCISES = 100;

function uniqueTextList(list, limit) {
  return [...new Set((Array.isArray(list) ? list : [])
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean))]
    .slice(0, limit);
}

export function normalizeExerciseLibraryPreferences(value = {}) {
  const names = new Set();
  const customExercises = (Array.isArray(value.exerciciosPersonalizados) ? value.exerciciosPersonalizados : [])
    .flatMap(item => {
      const nome = typeof item?.nome === 'string' ? item.nome.trim().slice(0, 80) : '';
      const grupo = typeof item?.grupo === 'string' ? item.grupo.trim().slice(0, 40) : '';
      const key = nome.toLocaleLowerCase('pt-BR');
      if (!nome || names.has(key)) return [];
      names.add(key);
      return [{ nome, grupo: grupo || 'Outros', personalizado: true }];
    })
    .slice(0, MAX_CUSTOM_EXERCISES);

  return {
    favoritosExercicios: uniqueTextList(value.favoritosExercicios, 250),
    recentesExercicios: uniqueTextList(value.recentesExercicios, 12),
    exerciciosPersonalizados: customExercises,
  };
}

export function buildExercisePerformanceHistory(sessions = []) {
  const history = new Map();
  const latest = new Map();
  const orderedSessions = [...(Array.isArray(sessions) ? sessions : [])]
    .sort((a, b) => Number(b?.concluidoEm?.seconds || 0) - Number(a?.concluidoEm?.seconds || 0));

  orderedSessions.forEach(session => {
    (Array.isArray(session?.exercicios) ? session.exercicios : []).forEach(exercise => {
      const set = [...(Array.isArray(exercise?.series) ? exercise.series : [])]
        .reverse()
        .find(item => item?.concluida && Number(item.kg) >= 0 && Number(item.reps) > 0);
      if (!set || !exercise?.nome) return;
      const record = {
        kg: Number(set.kg),
        reps: Number(set.reps),
        rir: set.rir === '' || set.rir == null ? null : Number(set.rir),
      };
      const records = history.get(exercise.nome) || [];
      records.push(record);
      history.set(exercise.nome, records);
      if (!latest.has(exercise.nome)) latest.set(exercise.nome, record);
    });
  });

  return { history, latest };
}
