import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadBrand } from '../scripts/brand.mjs';
import { applyBrand } from '../scripts/apply-brand.mjs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const client = { adminEmail: 'Dono@Cliente.com', foodSearchUrl: 'https://busca.cliente.com/buscar' };

describe('white label', () => {
  it('carrega a marca padrão e recusa id fora do formato', () => {
    expect(loadBrand().brand.name).toBe('Mol');
    expect(() => loadBrand('../mol')).toThrow('BRAND inválida');
    expect(() => loadBrand('nao-existe')).toThrow('Marca não encontrada');
  });

  it('troca admin das regras e origem da busca no CSP', () => {
    const { rules, hosting } = applyBrand(read('firestore.rules'), read('firebase.json'), client);
    expect(rules).toContain("request.auth.token.email == 'dono@cliente.com'");
    expect(rules).not.toContain('chrisouzamol@gmail.com');
    expect(hosting).toContain('https://busca.cliente.com;');
    expect(hosting).not.toContain('mol-alimentos');
    JSON.parse(hosting);
  });

  it('para a própria marca Mol não muda nada', () => {
    const rules = read('firestore.rules'), hosting = read('firebase.json');
    expect(applyBrand(rules, hosting, loadBrand('mol').brand)).toEqual({ rules, hosting });
  });
});
