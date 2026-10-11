// Meta calórica e de macros a partir do corpo, da rotina e do objetivo (Mifflin-St Jeor).

export const ACTIVITY_LEVELS = [
  { id: 'sedentario', label: 'Fico sentado quase o dia todo', factor: 1.2 },
  { id: 'leve', label: 'Ando um pouco ou treino 1–2 vezes por semana', factor: 1.375 },
  { id: 'moderado', label: 'Treino 3–4 vezes por semana', factor: 1.55 },
  { id: 'alto', label: 'Treino 5–6 vezes ou trabalho em pé', factor: 1.725 },
  { id: 'muito-alto', label: 'Treino pesado todo dia ou trabalho braçal', factor: 1.9 }
];

export const SEXES = [{ id: 'masculino', label: 'Masculino' }, { id: 'feminino', label: 'Feminino' }];

// Ajuste da meta sobre o gasto e proteína em g/kg por objetivo.
const GOAL_RULES = {
  Emagrecimento: { adjust: -0.15, protein: 2.0, text: 'menos 15% para emagrecer' },
  Hipertrofia: { adjust: 0.10, protein: 1.8, text: 'mais 10% para ganhar massa' },
  'Força': { adjust: 0.05, protein: 1.8, text: 'mais 5% para ganhar força' },
  'Saúde': { adjust: 0, protein: 1.6, text: 'para manter o peso' },
  '': { adjust: 0, protein: 1.6, text: 'para manter o peso' }
};

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
 * @typedef {{ sexo?: string, nascimento?: string, alturaCm?: number, pesoKg?: number, nivelAtividade?: string, objetivo?: string }} GoalInputs
 */

/** O que falta para calcular; lista vazia = dá para calcular. @param {GoalInputs} [inputs] */
export function missingGoalInputs({ sexo, nascimento, alturaCm, pesoKg, nivelAtividade } = {}) {
  const age = ageFrom(nascimento);
  return [
    !SEXES.some(item => item.id === sexo) && 'sexo',
    !(age >= 14 && age <= 100) && 'data de nascimento',
    !(Number(alturaCm) >= 100 && Number(alturaCm) <= 250) && 'altura',
    !(Number(pesoKg) >= 20 && Number(pesoKg) <= 400) && 'peso atual',
    !ACTIVITY_LEVELS.some(item => item.id === nivelAtividade) && 'nível de atividade'
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
  const level = ACTIVITY_LEVELS.find(item => item.id === input.nivelAtividade);
  const rule = GOAL_RULES[input.objetivo] || GOAL_RULES[''];
  const gasto = Math.round(base * level.factor / 10) * 10;
  const floor = input.sexo === 'masculino' ? 1500 : 1200;
  const kcal = Math.max(floor, Math.round(gasto * (1 + rule.adjust) / 10) * 10);
  const protein = Math.round(weight * rule.protein);
  const fat = Math.round(weight * 0.8);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const explicacao = `Seu gasto estimado é de ${gasto.toLocaleString('pt-BR')} kcal por dia; a meta fica ${kcal === floor && gasto * (1 + rule.adjust) < floor ? 'no mínimo seguro' : rule.text}.`;
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
