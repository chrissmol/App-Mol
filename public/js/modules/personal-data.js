export const BACKUP_COLLECTIONS = ['treinos', 'sessoes', 'pesos', 'dietas'];
export const BACKUP_RECORD_LIMIT = 400;
export const BACKUP_FILE_LIMIT = 5 * 1024 * 1024;

const goals = ['', 'Hipertrofia', 'Força', 'Emagrecimento', 'Saúde'];
const sexes = ['', 'masculino', 'feminino'];
const activityLevels = ['', 'sedentario', 'leve', 'moderado', 'alto', 'muito-alto'];

function optionalNumber(value, { min, max, integer = false, label }) {
  if (String(value ?? '').trim() === '') return null;
  const parsed = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${label} deve estar entre ${min} e ${max}${integer ? ', sem casas decimais' : ''}.`);
  }
  return parsed;
}

function parsePace(value) {
  if (String(value ?? '').trim() === '') return null;
  const pace = Number(value);
  if (![0.25, 0.5].includes(pace)) throw new Error('Escolha um ritmo de 0,25 ou 0,5 kg por semana.');
  return pace;
}

export function parsePersonalData(values) {
  const objetivo = String(values.goal || '');
  if (!goals.includes(objetivo)) throw new Error('Selecione um objetivo válido.');
  const sexo = String(values.sex || '');
  if (!sexes.includes(sexo)) throw new Error('Selecione um sexo válido.');
  const nivelAtividade = String(values.activity || '');
  if (!activityLevels.includes(nivelAtividade)) throw new Error('Selecione um nível de atividade válido.');
  const nascimento = String(values.birth || '');
  const birthYear = Number(nascimento.slice(0, 4));
  if (nascimento && (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento) || birthYear < 1920 || birthYear > new Date().getFullYear() - 10)) throw new Error('Confira a data de nascimento.');
  return {
    sexo,
    nascimento,
    nivelAtividade,
    alturaCm: optionalNumber(values.height, { min: 100, max: 250, integer: true, label: 'A altura' }),
    metaPesoKg: optionalNumber(values.goalWeight, { min: 20, max: 400, label: 'A meta de peso' }),
    objetivo,
    metaSemanal: optionalNumber(values.weekly, { min: 1, max: 7, integer: true, label: 'A meta semanal' }),
    ritmoMetaKg: parsePace(values.pace)
  };
}

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function validateRecord(collectionName, record) {
  if (!plainObject(record)) throw new Error(`Registro inválido em ${collectionName}.`);
  if (collectionName === 'treinos' && (typeof record.nome !== 'string' || !record.nome.trim() || record.nome.length > 80 || !Array.isArray(record.exercicios) || record.exercicios.length > 60)) throw new Error('Treino inválido no backup.');
  if (collectionName === 'sessoes' && (typeof record.nomeRotina !== 'string' || record.nomeRotina.length > 80 || !Array.isArray(record.exercicios) || record.exercicios.length > 60)) throw new Error('Sessão inválida no backup.');
  if (collectionName === 'pesos' && (!Number.isFinite(Number(record.pesoKg)) || Number(record.pesoKg) < 20 || Number(record.pesoKg) > 400)) throw new Error('Peso inválido no backup.');
  if (collectionName === 'dietas' && (!Array.isArray(record.refeicoes) || record.refeicoes.length > 12)) throw new Error('Dieta inválida no backup.');
}

export function normalizeBackup(backup) {
  if (![1, 2].includes(backup?.versao) || !plainObject(backup.dados)) throw new Error('Arquivo de backup inválido.');
  const profile = plainObject(backup.perfil) ? backup.perfil : {};
  const entries = {};
  let total = 0;
  BACKUP_COLLECTIONS.forEach(name => {
    const source = backup.dados[name] || [];
    if (!Array.isArray(source)) throw new Error(`Estrutura inválida em ${name}.`);
    entries[name] = source.map(item => {
      const wrapped = backup.versao === 2 && plainObject(item) && plainObject(item.data);
      const data = wrapped ? item.data : item;
      const id = wrapped && typeof item.id === 'string' && /^[A-Za-z0-9_-]{1,150}$/.test(item.id) ? item.id : null;
      validateRecord(name, data);
      total += 1;
      return { id, data };
    });
  });
  if (total > BACKUP_RECORD_LIMIT) throw new Error(`O backup excede o limite seguro de ${BACKUP_RECORD_LIMIT} registros.`);
  return { version: backup.versao, profile, entries, total };
}
