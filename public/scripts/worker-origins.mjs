import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { workerOrigins } from './brand.mjs';

// Origens de todas as marcas, para o Worker de busca: wrangler deploy --var ALLOWED_ORIGINS:"$(node public/scripts/worker-origins.mjs)"
const dir = resolve(import.meta.dirname, '..', 'brands');
const brands = readdirSync(dir).filter(file => file.endsWith('.json')).map(file => JSON.parse(readFileSync(resolve(dir, file), 'utf8')));
console.log(workerOrigins(brands).join(','));
