// Converte anexos do assistente em partes para o modelo. Foto e PDF vão como
// arquivo (o Gemini lê os dois); CSV, TXT e Excel viram texto antes, porque o
// modelo não lê planilha.
export const ASSISTANT_FILE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf,.csv,.txt,.xlsx';
export const MAX_FILE_BYTES = 7 * 1024 * 1024; // abaixo do limite de 20 MB do Gemini, já contando o base64
const MAX_TEXT_CHARS = 20000;

const INLINE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
const extension = name => String(name || '').toLowerCase().split('.').pop();

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

const textPart = (name, content) => ({ text: `Conteúdo do arquivo "${name}":\n${String(content).slice(0, MAX_TEXT_CHARS)}` });

const cell = value => String(value ?? '').replace(/[\r\n;]+/g, ' ').trim();

/** Planilha (abas e linhas) em texto separado por ";". */
export function sheetsToText(sheets) {
  return (Array.isArray(sheets) ? sheets : []).map(sheet => {
    const rows = (sheet?.data || []).filter(row => row.some(value => cell(value)));
    return `# Aba: ${sheet?.sheet || 'Planilha'}\n${rows.map(row => row.map(cell).join(';')).join('\n')}`;
  }).join('\n\n');
}

/**
 * Lê um File e devolve a parte para o modelo.
 * `readExcel(file)` é injetado para carregar a biblioteca de Excel só quando preciso.
 * @param {File} file
 * @param {{ readExcel?: (file: File) => Promise<any[]> }} [options]
 */
export async function fileToPart(file, { readExcel } = {}) {
  if (!file) throw new Error('Nenhum arquivo selecionado.');
  if (file.size > MAX_FILE_BYTES) throw new Error('O arquivo passa de 7 MB. Envie um menor ou uma foto da página.');
  const ext = extension(file.name);
  if (INLINE_TYPES.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp', 'heic', 'pdf'].includes(ext)) {
    const mimeType = INLINE_TYPES.includes(file.type) ? file.type : ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return { inlineData: { mimeType, data: toBase64(await file.arrayBuffer()) } };
  }
  if (ext === 'csv' || ext === 'txt' || file.type === 'text/csv' || file.type === 'text/plain') return textPart(file.name, await file.text());
  if (ext === 'xlsx') {
    if (!readExcel) throw new Error('Leitor de Excel indisponível.');
    return textPart(file.name, sheetsToText(await readExcel(file)));
  }
  throw new Error('Formato não aceito. Use foto, PDF, CSV ou Excel (.xlsx).');
}

/** Carrega a biblioteca de Excel sob demanda (fica fora do carregamento da página). */
export async function readExcelInBrowser(file) {
  const { default: readXlsxFile } = await import('read-excel-file/browser');
  return readXlsxFile(file);
}
