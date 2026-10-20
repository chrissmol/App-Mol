import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadBrand } from './brand.mjs';

// Antes do deploy de outra marca: troca o admin das regras do Firestore e a origem da
// busca de alimentos no CSP. Roda num checkout limpo (o CI); para "mol" não muda nada.
const root = resolve(import.meta.dirname, '..');

export function applyBrand(rules, hosting, target, base = loadBrand('mol').brand) {
  const adminRule = /request\.auth\.token\.email == '[^']+'/g;
  if ((rules.match(adminRule) || []).length !== 1) throw new Error('firestore.rules: esperava uma regra de admin por e-mail');
  const baseOrigin = new URL(base.foodSearchUrl).origin;
  if (!hosting.includes(baseOrigin)) throw new Error(`firebase.json: CSP sem ${baseOrigin}`);
  const petRule = /assistentePet in \[[^\]]*\]/;
  if (target.pets && !petRule.test(rules)) throw new Error('firestore.rules: esperava a lista de pets');
  const petList = `assistentePet in [${[...(target.pets ?? []).map(pet => pet.id), 'nenhum'].map(id => `'${id}'`).join(', ')}]`;
  return {
    rules: rules.replace(adminRule, () => `request.auth.token.email == '${target.adminEmail.toLowerCase()}'`).replace(petRule, match => (target.pets ? petList : match)),
    hosting: hosting.replaceAll(baseOrigin, new URL(target.foodSearchUrl).origin),
  };
}

if (process.argv[1] === import.meta.filename) {
  const { brand } = loadBrand(process.env.BRAND);
  const rulesFile = resolve(root, 'firestore.rules');
  const hostingFile = resolve(root, 'firebase.json');
  const out = applyBrand(readFileSync(rulesFile, 'utf8'), readFileSync(hostingFile, 'utf8'), brand);
  writeFileSync(rulesFile, out.rules);
  writeFileSync(hostingFile, out.hosting);
  console.log(`Marca aplicada: ${brand.id} (${brand.name})`);
}
