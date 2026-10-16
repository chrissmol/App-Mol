import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const REQUIRED = ['id', 'name', 'adminEmail', 'foodSearchUrl', 'appCheckSiteKey', 'firebase'];

// Lê e valida brands/<id>.json. O id vem de variável de ambiente, então só aceita slug.
export function loadBrand(id = 'mol') {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`BRAND inválida: "${id}" (use letras minúsculas, números e hífen)`);
  const file = resolve(root, 'brands', `${id}.json`);
  if (!existsSync(file)) throw new Error(`Marca não encontrada: brands/${id}.json`);
  const brand = JSON.parse(readFileSync(file, 'utf8'));
  const missing = REQUIRED.filter(key => !brand[key]);
  if (missing.length) throw new Error(`brands/${id}.json sem: ${missing.join(', ')}`);
  if (brand.id !== id) throw new Error(`brands/${id}.json tem id "${brand.id}"`);
  return { file, brand };
}
