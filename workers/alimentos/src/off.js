// Funções puras do Worker (testadas em public/tests/food-search-worker.test.js).

export const ALLOWED_ORIGINS = [
  'https://app-mol-5f3dc.web.app',
  'https://app-mol-5f3dc.firebaseapp.com',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

/** Termo de busca limpo (2 a 60 caracteres) ou null. */
export function cleanTerm(raw) {
  const term = String(raw || '').replace(/["\\:()]/g, ' ').replace(/\s+/g, ' ').trim();
  return term.length >= 2 && term.length <= 60 ? term : null;
}

/** URL da busca do Open Food Facts só com produtos vendidos no Brasil. */
export function searchUrl(term) {
  const query = `${term} countries_tags:"en:brazil"`;
  const params = new URLSearchParams({ q: query, langs: 'pt', page_size: '20', fields: 'code,product_name,brands,nutriments' });
  return `https://search.openfoodfacts.org/search?${params}`;
}

const round = value => (Number.isFinite(Number(value)) ? Math.round(Number(value) * 10) / 10 : null);

/** Resposta enxuta: só produtos com nome e calorias, até 12, sem repetir código. */
export function slimResults(data) {
  const seen = new Set();
  return (Array.isArray(data?.hits) ? data.hits : [])
    .map(hit => {
      const n = hit?.nutriments || {};
      return {
        codigo: String(hit?.code || ''),
        nome: String(hit?.product_name || '').trim().slice(0, 80),
        marca: (Array.isArray(hit?.brands) ? hit.brands.join(', ') : String(hit?.brands || '')).trim().slice(0, 60),
        kcal100: round(n['energy-kcal_100g']),
        proteina100: round(n.proteins_100g),
        carbo100: round(n.carbohydrates_100g),
        gordura100: round(n.fat_100g)
      };
    })
    .filter(item => item.nome && item.kcal100 !== null && item.kcal100 <= 1000 && !seen.has(item.codigo) && seen.add(item.codigo))
    .slice(0, 12);
}

/** Cabeçalhos de CORS só para as origens do app (`extra`: origens de outras marcas, vindas de ALLOWED_ORIGINS no Worker). */
export function corsHeaders(origin, extra = []) {
  return ALLOWED_ORIGINS.includes(origin) || extra.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : { Vary: 'Origin' };
}
