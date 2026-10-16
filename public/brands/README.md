# Marcas (white label)

Cada cliente é um arquivo `brands/<marca>.json` e um projeto Firebase próprio. O código é o mesmo para todos.

| Campo | O que é |
| --- | --- |
| `id` | Igual ao nome do arquivo (minúsculas, números e hífen) |
| `name` | Nome do app; substitui "Mol" nas telas no build |
| `adminEmail` | Quem vê o painel admin e os erros (também vai para `firestore.rules` no deploy) |
| `foodSearchUrl` | Worker da busca de alimentos (precisa liberar o domínio do cliente em `ALLOWED_ORIGINS`) |
| `appCheckSiteKey` | Chave reCAPTCHA Enterprise do App Check do projeto do cliente |
| `firebase` | Config web do app Firebase do cliente (`authDomain` = domínio onde o app roda) |

Novo cliente:

1. Copie `mol.json` para `<marca>.json` e preencha.
2. No GitHub, crie o Environment `<marca>` com `FIREBASE_PROJECT_ID` e `FIREBASE_TOKEN` do projeto do cliente.
3. Rode o workflow "Mol production deploy" com `brand = <marca>`.

Local: `BRAND=<marca> npm run build`.

Ainda fixos no código (próximas etapas): cores, logo e ícones, pets e textos legais.
