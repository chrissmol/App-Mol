// Meta calórica e de macros a partir do corpo, da rotina, dos treinos e do objetivo (Mifflin-St Jeor).

// Rotina fora do treino (ocupação). O treino entra à parte, pelas sessões por semana.
export const ACTIVITY_LEVELS = [
  { id: 'sedentario', label: 'Fico sentado quase o dia todo', offset: 0 },
  { id: 'em-pe', label: 'Fico em pé ou ando bastante', offset: 0.1 },
  { id: 'bracal', label: 'Trabalho braçal ou muito esforço físico', offset: 0.2 }
];

// Valores salvos antes da separação (rotina + treino misturados) viram a rotina equivalente.
const LEGACY_ACTIVITY = { leve: 'sedentario', moderado: 'sedentario', alto: 'em-pe', 'muito-alto': 'bracal' };
export const normalizeActivity = id => LEGACY_ACTIVITY[id] || id;

// Fator de atividade = 1,2 (sedentário) + rotina + treino. Os acréscimos de treino reproduzem a tabela
// clássica de fatores (Harris-Benedict revisado, Roza e Shizgal 1984; usada com Mifflin-St Jeor):
// 1–2 treinos/semana 1,375 · 3–4 → 1,55 · 5–6 → 1,725 · 7 → 1,9. Limite de 1,9.
const TRAINING_ADD = [[0, 0], [2, 0.175], [4, 0.35], [6, 0.525], [7, 0.675]];
export function activityFactor(activity, trainingPerWeek) {
  const level = ACTIVITY_LEVELS.find(item => item.id === normalizeActivity(activity));
  const days = Math.max(0, Math.min(7, Math.round(Number(trainingPerWeek) || 0)));
  const add = TRAINING_ADD.find(([max]) => days <= max)[1];
  return Math.min(1.9, 1.2 + level.offset + add);
}

export const SEXES = [{ id: 'masculino', label: 'Masculino' }, { id: 'feminino', label: 'Feminino' }];

// Ajuste da meta sobre o gasto e proteína em g/kg por objetivo.
const GOAL_RULES = {
  Emagrecimento: { adjust: -0.15, protein: 2.0, text: 'menos 15% para emagrecer' },
  Hipertrofia: { adjust: 0.10, protein: 1.8, text: 'mais 10% para ganhar massa' },
  'Força': { adjust: 0.05, protein: 1.8, text: 'mais 5% para ganhar força' },
  'Saúde': { adjust: 0, protein: 1.6, text: 'para manter o peso' },
  '': { adjust: 0, protein: 1.6, text: 'para manter o peso' }
};

// Ritmo escolhido (kg por semana) troca o ajuste percentual: 1 kg ≈ 7.700 kcal.
export const GOAL_PACES = [0.25, 0.5];
const PACE_SIGN = { Emagrecimento: -1, Hipertrofia: 1, 'Força': 1 };
export const paceApplies = objetivo => objetivo in PACE_SIGN;

/** Idade em anos completos numa data ("AAAA-MM-DD"). */
export function ageFrom(birthDate, today = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthDate || ''));
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age;
}

/**
 * @typedef {{ sexo?: string, nascimento?: string, alturaCm?: number, pesoKg?: number, nivelAtividade?: string, treinosSemana?: number, objetivo?: string, ritmoMetaKg?: number | null }} GoalInputs
 */

/** O que falta para calcular; lista vazia = dá para calcular. @param {GoalInputs} [inputs] */
export function missingGoalInputs({ sexo, nascimento, alturaCm, pesoKg, nivelAtividade } = {}) {
  const age = ageFrom(nascimento);
  return [
    !SEXES.some(item => item.id === sexo) && 'sexo',
    !(age >= 14 && age <= 100) && 'data de nascimento',
    !(Number(alturaCm) >= 100 && Number(alturaCm) <= 250) && 'altura',
    !(Number(pesoKg) >= 20 && Number(pesoKg) <= 400) && 'peso atual',
    !ACTIVITY_LEVELS.some(item => item.id === normalizeActivity(nivelAtividade)) && 'nível de atividade'
  ].filter(Boolean);
}

/**
 * Devolve { kcal, macroGoals, gasto, explicacao } ou null se faltar dado.
 * Limites: nunca abaixo de 1.500 kcal (masculino) ou 1.200 kcal (feminino).
 * @param {GoalInputs} [input]
 */
export function calculateNutritionGoals(input = {}, today = new Date()) {
  if (missingGoalInputs(input).length) return null;
  const age = ageFrom(input.nascimento, today);
  const weight = Number(input.pesoKg);
  const base = 10 * weight + 6.25 * Number(input.alturaCm) - 5 * age + (input.sexo === 'masculino' ? 5 : -161);
  const rule = GOAL_RULES[input.objetivo] || GOAL_RULES[''];
  const gasto = Math.round(base * activityFactor(input.nivelAtividade, input.treinosSemana) / 10) * 10;
  const floor = input.sexo === 'masculino' ? 1500 : 1200;
  const pace = paceApplies(input.objetivo) && GOAL_PACES.includes(Number(input.ritmoMetaKg)) ? Number(input.ritmoMetaKg) : 0;
  const paceKcal = pace ? PACE_SIGN[input.objetivo] * Math.round(pace * 7700 / 7 / 10) * 10 : 0;
  const target = pace ? gasto + paceKcal : gasto * (1 + rule.adjust);
  const kcal = Math.max(floor, Math.round(target / 10) * 10);
  const protein = Math.round(weight * rule.protein);
  const fat = Math.round(weight * 0.8);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const explicacao = `Seu gasto estimado é de ${gasto.toLocaleString('pt-BR')} kcal por dia; a meta fica ${kcal === floor && target < floor ? 'no mínimo seguro' : pace ? `${paceKcal < 0 ? 'menos' : 'mais'} ${Math.abs(paceKcal)} kcal por dia, para um ritmo de cerca de ${pace.toLocaleString('pt-BR')} kg por semana` : rule.text}.`;
  return { kcal, macroGoals: { protein, carbs, fat }, gasto, explicacao };
}

/** Cartão com a meta e o porquê; sem meta, diz o que falta preencher. */
export function goalSummaryHTML(goals, missing = []) {
  if (!goals) return `<p>Para calcular sua meta, preencha: ${missing.join(', ')}.</p>`;
  const { kcal, macroGoals: { protein, carbs, fat }, explicacao } = goals;
  return `<p class="text-3xl font-extrabold text-white">${kcal.toLocaleString('pt-BR')} kcal</p>
    <p class="mt-1"><span class="whitespace-nowrap">Proteína ${protein} g</span> · <span class="whitespace-nowrap">Carboidrato ${carbs} g</span> · <span class="whitespace-nowrap">Gordura ${fat} g</span></p>
    <p class="mt-3 text-xs leading-relaxed text-gray-500">${explicacao} É uma estimativa: acompanhe seu peso por 2 a 3 semanas e ajuste. Não substitui nutricionista.</p>`;
}
