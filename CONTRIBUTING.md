# Contribuindo com o Mol

## Setup

Node.js 20+. Dentro de `public/`: `npm ci` e `npm run dev`. Veja o [README](README.md).

## Antes de abrir um Pull Request

Execute `npm run check:full` dentro de `public/`. Para alterações nas regras, execute também `npm run check:rules` com Java instalado.

## Commits

Use o formato `tipo: resumo`, com verbos no imperativo. Tipos comuns: `feat`, `fix`, `refactor`, `test`, `docs` e `chore`.

Exemplos: `fix: ajustar grid do iPad` e `feat: adicionar tema gamer`.

## Interface

Toda alteração visual deve ser conferida em desktop, tablet e celular, nos temas claro e escuro, com teclado e leitor de tela quando o fluxo for interativo.

## Pull requests

Abra o PR contra a `main` a partir de uma branch própria e preencha o template. O check `Mol quality gate` precisa estar verde. Merge na `main` não publica: o deploy é manual (README, seção Deploy).

## Marcas (white label)

Não escreva "Mol" nem cores fixas em código novo sem checar `public/brands/README.md`: o build troca nome e cores por marca.
