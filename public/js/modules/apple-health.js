// Lê os pesos da exportação do app Saúde do iPhone ("Exportar todos os dados de saúde").
// O arquivo é lido em fluxo, linha a linha: o export.xml passa fácil de centenas de MB.

const WEIGHT_TYPE = 'HKQuantityTypeIdentifierBodyMass';
const TO_KG = { kg: 1, g: 0.001, lb: 0.45359237 };

// "2024-01-05 07:30:00 -0300" -> Date
export function parseHealthDate(text) {
  const match = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/.exec(text || '');
  return match ? new Date(`${match[1]}T${match[2]}${match[3]}:${match[4]}`) : null;
}

export function weightFromLine(line) {
  if (!line.includes(WEIGHT_TYPE) || !line.trimStart().startsWith('<Record')) return null;
  const attr = name => new RegExp(`\\s${name}="([^"]*)"`).exec(line)?.[1];
  const kg = Number(attr('value')) * (TO_KG[attr('unit')] ?? NaN);
  const date = parseHealthDate(attr('startDate'));
  if (!date || !Number.isFinite(kg) || kg < 20 || kg > 400) return null;
  return { date, pesoKg: Math.round(kg * 10) / 10 };
}

const dayKey = date => date.toLocaleDateString('sv');

// Um peso por dia (o último medido), sem repetir dias que já têm peso no Mol.
export function newDailyWeights(records, existingDates = []) {
  const taken = new Set(existingDates.filter(Boolean).map(dayKey));
  const byDay = new Map();
  for (const record of records) {
    const key = dayKey(record.date);
    if (!taken.has(key) && !(byDay.get(key)?.date > record.date)) byDay.set(key, record);
  }
  return [...byDay.values()].sort((a, b) => a.date - b.date);
}

async function exportXmlStream(file) {
  if (!/\.zip$/i.test(file.name)) return file.stream();
  const tail = new DataView(await file.slice(Math.max(0, file.size - 65557)).arrayBuffer());
  let end = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) if (tail.getUint32(i, true) === 0x06054b50) { end = i; break; }
  if (end < 0) throw new Error('O arquivo não é um .zip válido.');
  const count = tail.getUint16(end + 10, true);
  const dirOffset = tail.getUint32(end + 16, true);
  // shortcut: zip64 (exportação acima de 4 GB) não é lido; nesse caso a pessoa envia o export.xml descompactado.
  if (dirOffset === 0xffffffff) throw new Error('Exportação grande demais: descompacte e envie o export.xml.');
  const dir = new DataView(await file.slice(dirOffset, dirOffset + tail.getUint32(end + 12, true)).arrayBuffer());
  for (let pos = 0, i = 0; i < count; i++) {
    const nameLength = dir.getUint16(pos + 28, true);
    const name = new TextDecoder().decode(new Uint8Array(dir.buffer, pos + 46, nameLength));
    if (/(^|\/)export\.xml$/.test(name)) {
      const size = dir.getUint32(pos + 20, true);
      const local = dir.getUint32(pos + 42, true);
      if (size === 0xffffffff || local === 0xffffffff) throw new Error('Exportação grande demais: descompacte e envie o export.xml.');
      const header = new DataView(await file.slice(local, local + 30).arrayBuffer());
      const start = local + 30 + header.getUint16(26, true) + header.getUint16(28, true);
      const data = file.slice(start, start + size).stream();
      return dir.getUint16(pos + 10, true) === 0 ? data : data.pipeThrough(new DecompressionStream('deflate-raw'));
    }
    pos += 46 + nameLength + dir.getUint16(pos + 30, true) + dir.getUint16(pos + 32, true);
  }
  throw new Error('Não achei o export.xml dentro do .zip.');
}

// Recebe o export.zip (ou o export.xml) e devolve todos os pesos encontrados.
export async function readHealthWeights(file) {
  const reader = (await exportXmlStream(file)).pipeThrough(new TextDecoderStream()).getReader();
  const records = [];
  let rest = '';
  for (;;) {
    const { value, done } = await reader.read();
    const lines = (rest + (value ?? '')).split('\n');
    rest = done ? '' : lines.pop();
    for (const line of lines) {
      const record = weightFromLine(line);
      if (record) records.push(record);
    }
    if (done) return records;
  }
}
