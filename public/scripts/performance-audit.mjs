import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const files = await readdir(dist);
const sizes = await Promise.all(files.filter(file => /\.(js|css)$/.test(file)).map(async file => ({ file, bytes: (await stat(join(dist, file))).size })));
const total = sizes.reduce((sum, item) => sum + item.bytes, 0);
const budget = 2_500_000;
if (total > budget) { console.error(`Performance budget excedido: ${total} bytes (limite ${budget})`); process.exit(1); }
console.log(`Performance audit OK: ${total} bytes em ${sizes.length} assets`);
