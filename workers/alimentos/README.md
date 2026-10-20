# mol-alimentos

Busca de alimentos por nome para o Mol (Cloudflare Worker gratuito em `https://mol-alimentos.chrisouzamol.workers.dev`).

- `GET /buscar?q=arroz` → produtos vendidos no Brasil no Open Food Facts, com nutrientes por 100 g.
- O navegador não pode chamar a busca do Open Food Facts direto (sem CORS); o Worker faz a ponte.
- CORS só para as origens do app (`src/off.js`; outras marcas entram pela variável `ALLOWED_ORIGINS`, ver `public/brands/README.md`), cache de 1 dia por termo, termo de 2 a 60 caracteres.
- Testes: `public/tests/food-search-worker.test.js` (rodam no `npm test` do app).

Publicar (precisa estar logado no wrangler da conta do Christian):

```bash
cd workers/alimentos && npx wrangler deploy
```
