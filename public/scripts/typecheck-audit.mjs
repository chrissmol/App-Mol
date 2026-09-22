import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Adoção incremental de TypeScript: o projeto ainda não está livre de erros
// (checkJs sobre JS existente, sem anotações), então o teto abaixo trava
// regressão sem exigir zero erros de uma vez. Baixe o teto conforme o
// backlog de anotações for reduzido; nunca suba sem justificar no commit.
const CEILING = 443;

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
