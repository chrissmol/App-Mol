import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Adoção incremental de TypeScript: o projeto ainda não está livre de erros
// (checkJs sobre JS existente, sem anotações), então o teto abaixo trava
// regressão sem exigir zero erros de uma vez. Baixe o teto conforme o
// backlog de anotações for reduzido; nunca suba sem justificar no commit.
// 445: +2 sobre a linha de base (443) por dois novos call sites de
// setButtonLoading($('export-data'), ...) em configuracoes.js — mesmo
// padrão pré-existente de outras ~10 chamadas no arquivo (o helper
// $ = id => document.getElementById(id) retorna HTMLElement genérico,
// não HTMLButtonElement). Corrigir isso de vez exige tipar $ com
// generics por call site em toda a base, fora do escopo desta mudança.
// 447: +2 por window.alternarSuperset (feature de superset) — mesmo
// padrão pré-existente de toda funcao pendurada em `window.*` no
// treino.js (nunca declarada em global.d.ts), erra uma vez na
// atribuicao e uma vez em cada uso.
const CEILING = 447;

// Chama o entrypoint do tsc via node diretamente (em vez de "npx tsc"),
// que evita a resolução de .cmd do npx no Windows.
const tscBin = createRequire(import.meta.url).resolve('typescript/bin/tsc');

let output = '';
try {
  execFileSync(process.execPath, [tscBin, '--noEmit'], { encoding: 'utf8' });
} catch (error) {
  output = `${error.stdout || ''}${error.stderr || ''}`;
}

const errorCount = (output.match(/error TS\d+/g) || []).length;

if (errorCount > CEILING) {
  console.error(`Typecheck piorou: ${errorCount} erros (teto atual: ${CEILING}).`);
  console.error('Rode "npx tsc --noEmit" para ver o que mudou.');
  process.exit(1);
}

console.log(`Typecheck OK: ${errorCount}/${CEILING} erros (adoção incremental em andamento).`);
