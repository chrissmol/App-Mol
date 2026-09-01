function finite(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundedLoad(value) {
  return Math.max(0, Math.round(value * 2) / 2);
}

export function nextLoadIncrement(load) {
  const weight = finite(load) || 0;
  if (weight < 20) return 1;
  if (weight < 60) return 2.5;
  return 5;
}

export function progressionAdvice(exercise = {}, history = []) {
  const entries = (Array.isArray(history) ? history : []).map(item => ({
    kg: finite(item?.kg), reps: finite(item?.reps), rir: finite(item?.rir)
  })).filter(item => item.kg != null && item.kg >= 0 && item.reps != null && item.reps > 0).slice(0, 3);
  const min = Math.max(1, finite(exercise.repsMin) || 8);
  const max = Math.max(min, finite(exercise.repsMax) || 12);
  const targetRir = Math.max(0, finite(exercise.rirAlvo) ?? 2);
  if (!entries.length) return { state: 'new', title: 'Primeira referência', message: `Comece com uma carga controlável para ${min}–${max} reps e registre o RIR.` };

  const latest = entries[0];
  const rirAllowsProgress = latest.rir == null || latest.rir >= targetRir;
  if (latest.kg > 0 && latest.reps >= max && rirAllowsProgress) {
    const suggestedWeight = roundedLoad(latest.kg + nextLoadIncrement(latest.kg));
    return { state: 'increase', title: 'Pronto para progredir', suggestedWeight, message: `Você atingiu o topo da faixa. Próxima sessão: tente ${suggestedWeight.toLocaleString('pt-BR')} kg mantendo RIR ${targetRir}.` };
  }

  if (latest.kg > 0 && (latest.reps < min || (latest.rir != null && latest.rir < Math.max(0, targetRir - 1)))) {
    const suggestedWeight = roundedLoad(latest.kg * .95);
    return { state: 'reduce', title: 'Priorize a execução', suggestedWeight, message: `A série ficou abaixo do alvo. Tente ${suggestedWeight.toLocaleString('pt-BR')} kg e recupere a faixa de repetições.` };
  }

  if (entries.length >= 3) {
    const scores = entries.map(item => item.kg * (1 + Math.min(item.reps, 15) / 30));
    const best = Math.max(...scores); const worst = Math.min(...scores);
    if (best > 0 && (best - worst) / best < .015) {
      return { state: 'plateau', title: 'Estável há 3 sessões', message: `Mantenha ${latest.kg.toLocaleString('pt-BR')} kg e tente acrescentar uma repetição com a mesma técnica.` };
    }
  }

  return { state: 'maintain', title: 'Continue consolidando', message: `Mantenha ${latest.kg.toLocaleString('pt-BR')} kg até alcançar ${max} reps com RIR ${targetRir}.` };
}

export function classifyEquipment(name = '') {
  const value = String(name).toLocaleLowerCase('pt-BR');
  if (/máquina|cadeira|smith|hack|leg press/.test(value)) return 'Máquina';
  if (/polia|cabo/.test(value)) return 'Polia';
  if (/halter/.test(value)) return 'Halteres';
  if (/barra/.test(value)) return 'Barra';
  if (/elástico|band/.test(value)) return 'Elástico';
  return 'Peso corporal';
}

export function rankExerciseSubstitutes(source, catalog, detailedGroup) {
  const sourceEquipment = classifyEquipment(source?.nome);
  return (Array.isArray(catalog) ? catalog : [])
    .filter(item => item?.nome && item.nome !== source?.nome && detailedGroup(item) === detailedGroup(source))
    .map(item => ({ ...item, score: classifyEquipment(item.nome) === sourceEquipment ? 2 : 1 }))
    .sort((a, b) => b.score - a.score || String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
}
const normalizedSearchText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, ' ').trim();

export function matchesExerciseSearch(exercise, query, detailedGroup = () => '', equipment = () => '') {
  const aliases = { peitoral: 'peito', chest: 'peito', dorsal: 'costas', lombar: 'costas', biceps: 'biceps', triceps: 'triceps', perna: 'quadriceps' };
  const tokens = normalizedSearchText(query).split(' ').filter(Boolean).map(token => aliases[token] || token);
  if (!tokens.length) return true;
  const haystack = normalizedSearchText([exercise?.nome, exercise?.grupo, detailedGroup(exercise), equipment(exercise)].filter(Boolean).join(' '));
  return tokens.every(token => haystack.includes(token));
}
