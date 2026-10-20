import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brandReplacer, loadBrand, workerOrigins } from '../scripts/brand.mjs';
import { corsHeaders } from '../../workers/alimentos/src/off.js';
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

  it('troca nome e cores do Mol numa passada, sem tocar em classes nem em outras cores', () => {
    const mol = loadBrand('mol').brand;
    const fit = { name: 'FitPro', colors: { green: '#AA0000', mint: '#1e7349', forest: '#0f5f3a', soft: '#278a59' } };
    const swap = brandReplacer(fit, mol);
    expect(swap('<a class="mol-brand">Mol</a> Moldrian')).toBe('<a class="mol-brand">FitPro</a> Moldrian');
    expect(swap('color:#1E7349;fill:#57d493')).toBe('color:#AA0000;fill:#1e7349');
    expect(swap('rgba(30, 115, 73, .4) rgba(30,115,73,.4) rgba(130, 115, 73)')).toBe('rgba(170, 0, 0, .4) rgba(170, 0, 0,.4) rgba(130, 115, 73)');
    expect(brandReplacer(mol, mol)('Mol #1e7349')).toBe('Mol #1e7349');
  });

  it('troca a lista de pets nas regras só quando a marca define pets', () => {
    const { rules } = applyBrand(read('firestore.rules'), read('firebase.json'), { ...client, pets: [{ id: 'leo' }, { id: 'ana' }] });
    expect(rules).toContain("assistentePet in ['leo', 'ana', 'nenhum']");
    expect(rules).not.toContain('moldrian');
  });

  it('junta as origens das marcas para o Worker e libera só elas', () => {
    const origins = workerOrigins([loadBrand('mol').brand, { firebase: { authDomain: 'app.cliente.com' }, allowedOrigins: ['https://www.cliente.com'] }]);
    expect(origins).toEqual(['https://app-mol-5f3dc.web.app', 'https://app.cliente.com', 'https://www.cliente.com']);
    expect(corsHeaders('https://app.cliente.com', origins)['Access-Control-Allow-Origin']).toBe('https://app.cliente.com');
    expect(corsHeaders('https://app.cliente.com')['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
