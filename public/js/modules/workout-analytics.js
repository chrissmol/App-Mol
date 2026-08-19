export function completedSets(session) {
  return (session.exercicios || []).flatMap(ex => (ex.series || []).filter(set => set.concluida).map(set => ({ ...set, exercicio: ex.nome, grupo: ex.grupo || 'Outros' })));
}

export function sessionMetrics(session) {
  const sets = completedSets(session);
  const volume = sets.reduce((sum, set) => sum + (Number(set.kg) || 0) * (Number(set.reps) || 0), 0);
  return { sets: sets.length, volume, durationSeconds: session.duracaoSegundos || 0 };
}

export function weeklyVolume(sessions) {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const result = {};
  sessions.filter(s => (s.concluidoEm?.toDate?.().getTime() || 0) >= since).forEach(session => completedSets(session).forEach(set => {
    if (set.tipo !== 'W') result[set.grupo] = (result[set.grupo] || 0) + 1;
  }));
  return result;
}

export function estimate1RM(weight, reps) {
  return weight > 0 && reps > 0 ? Math.round(weight * (1 + reps / 30) * 10) / 10 : 0;
}
