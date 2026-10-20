// Busca de alimentos por nome para o Mol. O navegador não pode chamar o Open Food Facts direto
// (sem CORS), então este Worker faz a ponte, filtra produtos do Brasil e guarda em cache por 1 dia.
import { cleanTerm, corsHeaders, searchUrl, slimResults } from './off.js';

// Origens de outras marcas (var ALLOWED_ORIGINS, separadas por vírgula); igual em todas as requisições do deploy.
let brandOrigins = [];

const json = (body, status, origin, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin, brandOrigins), ...extra }
});

export default {
  async fetch(request, env, ctx) {
    brandOrigins = String(env.ALLOWED_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...corsHeaders(origin, brandOrigins), 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' } });
    if (request.method !== 'GET' || url.pathname !== '/buscar') return json({ erro: 'Não encontrado.' }, 404, origin);
    const term = cleanTerm(url.searchParams.get('q'));
    if (!term) return json({ erro: 'Digite de 2 a 60 caracteres.' }, 400, origin);

    // Cache por termo (sem a origem), compartilhado entre as pessoas.
    const cacheKey = new Request(`https://cache.mol/buscar?q=${encodeURIComponent(term.toLocaleLowerCase('pt-BR'))}`);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return json(await cached.json(), 200, origin, { 'Cache-Control': 'public, max-age=3600', 'X-Mol-Cache': 'hit' });

    let upstream;
    try {
      upstream = await fetch(searchUrl(term), { headers: { 'User-Agent': 'MolApp/1.0 (+https://github.com/chrissmol/App-Mol)' }, signal: AbortSignal.timeout(8000) });
    } catch {
      return json({ erro: 'O Open Food Facts não respondeu. Tente de novo.' }, 502, origin);
    }
    if (!upstream.ok) return json({ erro: 'O Open Food Facts está indisponível agora.' }, 502, origin);
    const body = { termo: term, fonte: 'Open Food Facts', produtos: slimResults(await upstream.json()) };
    ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' } })));
    return json(body, 200, origin, { 'Cache-Control': 'public, max-age=3600', 'X-Mol-Cache': 'miss' });
  }
};
