import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const roots = ['js', 'pages', 'tests', 'e2e', 'css/style.css', 'index.html'];
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const forbidden = [
  /Ã[\u0080-\u00bf\u00a0-\u00ff]/,
  /Â[\u0080-\u00bf\u00a0-\u00ff]/,
  /â[\u0080-\u00bf\u00a0-\u00ff]{1,2}/,
  /\uFFFD/
];

async function filesFrom(entry) {
  const fullPath = join(projectRoot, entry);
  if (/\.(?:js|mjs|html|css)$/.test(fullPath) && !fullPath.includes('vendor') && !fullPath.includes('dist') && !fullPath.endsWith('tailwind.css')) {
    return [fullPath];
  }
  const result = [];
  async function walk(directory) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const file = join(directory, item.name);
      if (item.isDirectory()) {
        if (!['vendor', 'dist', 'node_modules'].includes(item.name)) await walk(file);
      } else if (/\.(?:js|mjs|html|css)$/.test(item.name) && item.name !== 'tailwind.css') {
        result.push(file);
      }
    }
  }
  await walk(fullPath);
  return result;
}

describe('integridade de texto', () => {
  it('não permite texto UTF-8 corrompido nos arquivos próprios do app', async () => {
    const files = (await Promise.all(roots.map(filesFrom))).flat();
    const offenders = [];
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      for (const pattern of forbidden) {
        if (pattern.test(content)) {
          offenders.push(relative(projectRoot, file));
          break;
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
