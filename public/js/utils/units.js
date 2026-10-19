// Unidades de exibição. Tudo continua gravado em kg e cm; só a tela converte.
const LB_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;

/** 'metric' ou 'imperial', lido das preferências deste aparelho. */
export function unitSystem() {
  try { return JSON.parse(localStorage.getItem('mol-accessibility') || '{}').units === 'imperial' ? 'imperial' : 'metric'; }
  catch { return 'metric'; }
}

export const weightUnit = (system = unitSystem()) => system === 'imperial' ? 'lb' : 'kg';
export const lengthUnit = (system = unitSystem()) => system === 'imperial' ? 'pol' : 'cm';

const round = (value, step) => Math.round(value / step) * step;

/** kg gravado → número na unidade da tela (lb com 1 casa); vazio continua vazio. */
export function toDisplayWeight(kg, system = unitSystem()) {
  if (kg === '' || kg == null || !Number.isFinite(Number(kg))) return kg ?? '';
  return system === 'imperial' ? Number(round(Number(kg) * LB_PER_KG, 0.1).toFixed(1)) : Number(kg);
}

/** Valor digitado na unidade da tela → kg para gravar (2 casas para voltar ao mesmo lb). */
export function fromDisplayWeight(value, system = unitSystem()) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (text === '') return '';
  const number = Number(text);
  if (!Number.isFinite(number)) return value;
  return system === 'imperial' ? Number((number / LB_PER_KG).toFixed(2)) : number;
}

/** "80 kg" ou "176,4 lb"; options vão para toLocaleString (ex.: signDisplay). */
export function formatWeight(kg, options = {}, system = unitSystem()) {
  const value = Number(toDisplayWeight(kg, system));
  return `${kg === '' || kg == null || !Number.isFinite(value) ? '-' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1, ...options })} ${weightUnit(system)}`;
}

/** "92 cm" ou "36,2 pol". */
export function formatLength(cm, options = {}, system = unitSystem()) {
  const value = Number(toDisplayLength(cm, system));
  return `${cm === '' || cm == null || !Number.isFinite(value) ? '-' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1, ...options })} ${lengthUnit(system)}`;
}

export const toDisplayLength = (cm, system = unitSystem()) => cm === '' || cm == null ? '' : system === 'imperial' ? Number((Number(cm) / CM_PER_IN).toFixed(1)) : Number(cm);
export function fromDisplayLength(value, system = unitSystem()) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (text === '') return '';
  return system === 'imperial' ? Number((Number(text) * CM_PER_IN).toFixed(1)) : Number(text);
}

/** Troca o texto de [data-weight-unit] e [data-length-unit] pela unidade escolhida. */
export function applyUnitLabels(root = document) {
  root.querySelectorAll('[data-weight-unit]').forEach(item => { item.textContent = weightUnit(); });
  root.querySelectorAll('[data-length-unit]').forEach(item => { item.textContent = lengthUnit(); });
  root.querySelectorAll('[data-length-placeholder]').forEach(item => { item.setAttribute('placeholder', lengthUnit()); });
}
