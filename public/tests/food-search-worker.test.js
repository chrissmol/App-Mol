import { describe, expect, it } from 'vitest';
import { cleanTerm, corsHeaders, searchUrl, slimResults } from '../../workers/alimentos/src/off.js';

describe('Worker de busca de alimentos', () => {
  it('limpa e valida o termo', () => {
    expect(cleanTerm('  arroz   integral ')).toBe('arroz integral');
    expect(cleanTerm('a')).toBeNull();
    expect(cleanTerm('x'.repeat(61))).toBeNull();
    expect(cleanTerm('arroz" OR countries_tags:(x)')).toBe('arroz OR countries_tags x');
  });

  it('busca só produtos do Brasil', () => {
    const url = new URL(searchUrl('granola'));
    expect(url.hostname).toBe('search.openfoodfacts.org');
    expect(url.searchParams.get('q')).toBe('granola countries_tags:"en:brazil"');
  });

  it('devolve produtos com nome e calorias, sem repetir', () => {
    const hits = [
      { code: '1', product_name: 'Granola', brands: ['Marca'], nutriments: { 'energy-kcal_100g': 390, proteins_100g: 9.46, carbohydrates_100g: 66.7, fat_100g: 10 } },
      { code: '1', product_name: 'Granola repetida', nutriments: { 'energy-kcal_100g': 390 } },
      { code: '2', product_name: '', nutriments: { 'energy-kcal_100g': 100 } },
      { code: '3', product_name: 'Sem calorias', nutriments: {} }
    ];
    expect(slimResults({ hits })).toEqual([{ codigo: '1', nome: 'Granola', marca: 'Marca', kcal100: 390, proteina100: 9.5, carbo100: 66.7, gordura100: 10 }]);
  });

  it('libera CORS só para o app', () => {
    expect(corsHeaders('https://app-mol-5f3dc.web.app')['Access-Control-Allow-Origin']).toBe('https://app-mol-5f3dc.web.app');
    expect(corsHeaders('https://site-qualquer.com')['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
