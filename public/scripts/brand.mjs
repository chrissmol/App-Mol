import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const REQUIRED = ['id', 'name', 'colors', 'adminEmail', 'foodSearchUrl', 'appCheckSiteKey', 'firebase'];
const COLORS = ['green', 'mint', 'forest', 'soft'];

// Lê e valida brands/<id>.json. O id vem de variável de ambiente, então só aceita slug.
export function loadBrand(id = 'mol') {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`BRAND inválida: "${id}" (use letras minúsculas, números e hífen)`);
  const file = resolve(root, 'brands', `${id}.json`);
  if (!existsSync(file)) throw new Error(`Marca não encontrada: brands/${id}.json`);
  const brand = JSON.parse(readFileSync(file, 'utf8'));
  const missing = REQUIRED.filter(key => !brand[key]);
  if (missing.length) throw new Error(`brands/${id}.json sem: ${missing.join(', ')}`);
  const badColors = COLORS.filter(key => !/^#[0-9a-f]{6}$/i.test(brand.colors?.[key] || ''));
  if (badColors.length) throw new Error(`brands/${id}.json com cor inválida (use #rrggbb): ${badColors.join(', ')}`);
  const pets = brand.pets ?? [];
  if (!Array.isArray(pets) || pets.some(pet => !/^[a-z0-9-]+$/.test(pet?.id || '') || pet.id === 'nenhum' || !pet.name || !['m', 'f'].includes(pet.gender))) throw new Error(`brands/${id}.json: pets precisa de lista com id (slug), name e gender ("m" ou "f")`);
  if (brand.pets && !pets.length) throw new Error(`brands/${id}.json: pets vazio (tire o campo para usar Moldrian e Marlô)`);
  if ((brand.allowedOrigins ?? []).some(origin => !/^https:\/\/[^/]+$/.test(origin))) throw new Error(`brands/${id}.json: allowedOrigins só aceita https://dominio, sem barra no fim`);
  if (brand.id !== id) throw new Error(`brands/${id}.json tem id "${brand.id}"`);
  return { file, brand };
}

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

// Troca nome e cores do Mol pelos da marca (hex e "r, g, b") numa passada só. Para o próprio Mol devolve o texto igual.
// shortcut: troca por texto em vez de tokens/placeholders; rever se algum texto usar "Mol" ou essas cores fora do sentido de marca.
export function brandReplacer(brand, base) {
  const name = brand.name === base.name ? null : new RegExp(`\\b${base.name}\\b`, 'g');
  const table = new Map();
  const parts = [];
  for (const key of COLORS) {
    const from = base.colors[key].toLowerCase(), to = brand.colors[key];
    if (from === to.toLowerCase()) continue;
    table.set(from, to);
    table.set(rgb(from).join(','), rgb(to).join(', '));
    parts.push(from, `(?<!\\d)${rgb(from).join(',\\s*')}(?!\\d)`);
  }
  const colors = parts.length ? new RegExp(parts.join('|'), 'gi') : null;
  return text => {
    const named = name ? text.replace(name, () => brand.name) : text;
    return colors ? named.replace(colors, match => table.get(match.toLowerCase().replace(/\s/g, ''))) : named;
  };
}

/** Origens que o Worker de busca precisa liberar: app de cada marca (domínio do Firebase + allowedOrigins). */
export const workerOrigins = brands => [...new Set(brands.flatMap(brand => [`https://${brand.firebase.authDomain}`, ...(brand.allowedOrigins ?? [])]))];
