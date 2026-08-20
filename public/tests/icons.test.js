import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { registeredIconNames } from '../js/utils/icons.js';

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? sourceFiles(join(directory, entry.name))
    : /\.(?:html|js)$/.test(entry.name) ? [join(directory, entry.name)] : []));
  return nested.flat();
}

describe('ícones', () => {
  it('registra todo ícone literal usado pelas páginas', async () => {
    const root = new URL('..', import.meta.url).pathname.replace(/^\/(.:\/)/, '$1');
    const files = [join(root, 'index.html'), ...await sourceFiles(join(root, 'pages')), ...await sourceFiles(join(root, 'js'))];
    const used = new Set(['monitor', 'moon', 'sun', 'eye', 'eye-off', 'triangle-alert', 'circle-help']);
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const match of source.matchAll(/data-lucide="([^"$]+)"/g)) used.add(match[1]);
    }
    const missing = [...used].filter(name => !registeredIconNames.includes(name)).sort();
    expect(missing).toEqual([]);
  });
});
