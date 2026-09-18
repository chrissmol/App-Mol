import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const excluded = new Set([
  '.git',
  '.lighthouseci',
  'dist',
  'lighthouse-reports',
  'node_modules',
  'tests',
  'vendor',
  'playwright-report',
  'test-results'
]);
const extensions = new Set(['.js', '.mjs', '.html', '.json', '.rules']);
const rules = [
  ['segredo de servidor', /(?:private[_-]?key|client[_-]?secret|service[_-]?account|sk-[a-z0-9_-]{20,})\s*[:=]/i],
  ['eval', /\beval\s*\(/],
  ['Function dinâmica', /\bnew\s+Function\s*\(/],
  ['document.write', /\bdocument\.write\s*\(/],
  ['postMessage aberto', /\.postMessage\s*\([^\n,]+,\s*['"]\*['"]\s*\)/],
  ['requisição HTTP', /\bfetch\s*\(\s*[`'"]http:\/\//]
];

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (excluded.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (extensions.has(extname(entry.name)) && entry.name !== 'package-lock.json') result.push(path);
  }
  return result;
}

const findings = [];
for (const path of await files(root)) {
  const source = await readFile(path, 'utf8');
  source.split(/\r?\n/).forEach((line, index) => {
    for (const [label, expression] of rules) if (expression.test(line)) findings.push(`${relative(root, path)}:${index + 1} ${label}`);
  });
}
if (findings.length) {
  console.error(`Security scan encontrou ${findings.length} ocorrência(s):\n${findings.join('\n')}`);
  process.exitCode = 1;
} else console.log('Security scan: nenhum padrão de alto risco encontrado.');
