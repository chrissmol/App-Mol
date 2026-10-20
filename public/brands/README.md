# Marcas (white label)

Cada cliente é um arquivo `brands/<marca>.json` e um projeto Firebase próprio. O código é o mesmo para todos.

| Campo | O que é |
| --- | --- |
| `id` | Igual ao nome do arquivo (minúsculas, números e hífen) |
| `name` | Nome do app; substitui "Mol" nas telas no build |
| `colors` | `green` (ação), `mint` (destaque no escuro), `forest` (verde do tema claro), `soft` (hover); `#rrggbb`. Substituem as cores do Mol no CSS e no JS |
| `adminEmail` | Quem vê o painel admin e os erros (também vai para `firestore.rules` no deploy) |
| `foodSearchUrl` | Worker da busca de alimentos (precisa liberar o domínio do cliente em `ALLOWED_ORIGINS`) |
| `appCheckSiteKey` | Chave reCAPTCHA Enterprise do App Check do projeto do cliente |
| `pets` | Opcional. Troca Moldrian e Marlô: lista de `{ id, name, gender ("m" ou "f"), style, hint, ready, excited, lines }` (frases que faltarem ficam neutras). Arte em `brands/<marca>/pets/<id>/<estado>.webp`, mesmos nomes de `pwa/assets/pets/moldrian/`. "Sem pet" sempre existe |
| `legal` | Opcional. `{ terms, privacy }` no formato de `LEGAL_DOCUMENTS` (`js/modules/login-utils.js`: `title`, `updated`, `sections` de pares título/texto). Sem o campo ficam os textos do Mol |
| `allowedOrigins` | Opcional. Origens extras (`https://dominio`) que o Worker de busca libera, além do `authDomain` do Firebase |
| `firebase` | Config web do app Firebase do cliente (`authDomain` = domínio onde o app roda) |

Novo cliente:

1. Copie `mol.json` para `<marca>.json` e preencha.
2. Coloque a logo em `brands/<marca>/logo.svg` (sem ela, fica a do Mol). Vale para favicon, cabeçalho, login e notificações.
3. No GitHub, crie o Environment `<marca>` com `FIREBASE_PROJECT_ID` e `FIREBASE_TOKEN` do projeto do cliente.
4. Rode o workflow "Mol production deploy" com `brand = <marca>`.

Local: `BRAND=<marca> npm run build`.

No `npm run dev` a logo continua a do Mol nos caminhos estáticos; confira a marca com `npm run build` + `npm run preview`.

Worker de busca (um só para todas as marcas): `cd workers/alimentos && npx wrangler deploy --var ALLOWED_ORIGINS:"$(node ../../public/scripts/worker-origins.mjs)"`.

Os textos legais do Mol ainda são rascunho: cliente deve trazer os próprios em `legal`.
