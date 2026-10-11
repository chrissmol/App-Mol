// Pesquisa na internet sem conta e sem chave: Wikipedia (pt) e Open Food Facts.
// Código de barras vai direto (a API libera CORS); a busca por nome passa pelo Worker
// mol-alimentos (workers/alimentos), porque essa API do Open Food Facts não libera CORS.
const TIMEOUT_MS = 8000;
export const FOOD_SEARCH_URL = 'https://mol-alimentos.chrisouzamol.workers.dev/buscar';
const cut = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/** Resumo do artigo da Wikipedia em português mais próximo do termo. */
export async function searchWikipedia(term, fetchImpl = fetch) {
  const query = cut(term, 120);
  if (!query) return { encontrado: false };
  const search = await getJson(`https://pt.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch=${encodeURIComponent(query)}`, fetchImpl);
  const title = search?.query?.search?.[0]?.title;
  if (!title) return { encontrado: false };
  const page = await getJson(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`, fetchImpl);
  return { encontrado: true, fonte: 'Wikipedia', titulo: cut(page?.title || title, 120), resumo: cut(page?.extract, 1200), url: page?.content_urls?.mobile?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(title)}` };
}

/** Nutrientes por 100 g de um produto pelo código de barras (Open Food Facts). */
export async function lookupBarcode(code, fetchImpl = fetch) {
  const digits = String(code || '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 14) return { encontrado: false, erro: 'O código de barras deve ter de 8 a 14 números.' };
  const data = await getJson(`https://world.openfoodfacts.org/api/v2/product/${digits}.json?fields=product_name,brands,nutriments`, fetchImpl);
  const product = data?.product;
  const n = product?.nutriments || {};
  if (!product || n['energy-kcal_100g'] == null) return { encontrado: false };
  const value = key => (Number.isFinite(Number(n[key])) ? Math.round(Number(n[key]) * 10) / 10 : null);
  return {
    encontrado: true, fonte: 'Open Food Facts', nome: cut(product.product_name, 80), marca: cut(product.brands, 60),
    porCemGramas: { kcal: value('energy-kcal_100g'), proteinaG: value('proteins_100g'), carboG: value('carbohydrates_100g'), gorduraG: value('fat_100g') },
    url: `https://world.openfoodfacts.org/product/${digits}`
  };
}

/** Produtos vendidos no Brasil por nome (Open Food Facts, via Worker), com nutrientes por 100 g. */
export async function searchFoodsOnline(term, fetchImpl = fetch) {
  const query = cut(term, 60);
  if (query.length < 2) return { encontrado: false, produtos: [] };
  const data = await getJson(`${FOOD_SEARCH_URL}?q=${encodeURIComponent(query)}`, fetchImpl);
  const produtos = Array.isArray(data?.produtos) ? data.produtos : [];
  return { encontrado: produtos.length > 0, fonte: 'Open Food Facts', produtos, url: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}` };
}
