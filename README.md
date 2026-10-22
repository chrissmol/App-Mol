<p align="center">
  <img src="public/assets/mol-mark.svg" width="72" alt="Mol">
</p>

<h1 align="center">Mol</h1>

<p align="center">
  PWA mobile-first para treino, dieta e evolução corporal, criado para funcionar como app instalado na tela inicial.
</p>

<p align="center">
  <a href="https://app-mol-5f3dc.web.app">Demo</a> ·
  <a href="public/docs/PRODUTO.md">Produto</a> ·
  <a href="public/docs/COMERCIAL.md">Comercial</a> ·
  <a href="public/docs/PRECIFICACAO.md">Preços</a> ·
  <a href="public/docs/PITCH.md">Pitch</a> ·
  <a href="public/docs/SEGURANCA.md">Segurança</a>
</p>

## Visão geral

O Mol é uma plataforma fitness pensada primeiro para celular. A proposta é entregar uma experiência simples, bonita e útil para quem treina musculação, organiza dieta e acompanha evolução física sem precisar instalar um app nativo.

O projeto roda como PWA, usa Firebase Authentication, Cloud Firestore e Firebase Hosting, e foi desenhado para manter custo operacional baixo usando camadas gratuitas enquanto o produto ainda está em validação.

## Principais recursos

- Rotinas de treino editáveis, duplicáveis e reutilizáveis.
- Biblioteca de exercícios com filtros, favoritos e detalhes técnicos.
- Registro de séries, carga, repetições, RIR, descanso e histórico.
- Métricas de volume, séries, sessões concluídas, consistência e evolução.
- Dieta por refeições, horários, alimentos e totais nutricionais.
- Assistente de IA (Gemini, camada gratuita) que responde sobre treino e dieta e ajusta os dados da pessoa (dieta, rotinas, peso) a partir de conversa, foto, PDF ou planilha, sempre com confirmação e desfazer. Atalhos na Dieta e no Treino.
- Perfil com peso, altura, objetivo, unidades, progresso corporal e backup.
- Tema claro, escuro e opção de seguir o sistema do aparelho.
- Experiência mobile/PWA com bloqueio de zoom, safe-area e botão flutuante de acesso rápido.
- Login com Google ou e-mail e senha, com recuperação de senha.
- Testes unitários, testes E2E mobile, validação HTML, build e checks de segurança.
- Revisão automática de código por IA em todo pull request.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end | HTML, CSS e JavaScript modular |
| UI | Tailwind CSS + design system próprio |
| Build | Vite |
| PWA | Service worker próprio (cache do app shell) + manifest |
| Autenticação | Firebase Authentication (Google e e-mail/senha) |
| Banco | Cloud Firestore |
| IA | Firebase AI Logic (Gemini Developer API, sem custo) com App Check |
| Hospedagem | Firebase Hosting |
| Busca de alimentos | Cloudflare Worker (`workers/alimentos`) sobre o Open Food Facts |
| Testes | Vitest, Playwright, html-validate |
| Segurança | Firestore Rules, npm audit, scan local |

## Rodar localmente

Pré-requisitos: Node.js 20+ (a CI usa o LTS).

```bash
git clone https://github.com/chrissmol/App-Mol.git
cd App-Mol/public
npm install
npm run dev
```

Sem login real, com Firebase e IA simulados (os mesmos dos testes E2E): `MOL_E2E=1 npm run dev`.

Para testar o assistente com o Gemini real no `localhost`, o App Check exige um token de depuração: gere um UUID, salve como `VITE_APPCHECK_DEBUG_TOKEN=<uuid>` em `public/.env.local` (ignorado pelo git) e cadastre o mesmo valor no console do Firebase em App Check > Apps > Gerenciar tokens de depuração.

## Validação

```bash
npm run check:full
```

Esse comando executa lint, testes unitários, validação HTML, build, auditoria de dependências, scan de segurança e testes E2E mobile/tablet.

## Deploy

A publicação é manual, pelo workflow **Mol production deploy** (Actions > Run workflow): informe `confirm = DEPLOY-V2` e a `brand` (`mol` por padrão). Ele roda a validação, monta o build com a marca escolhida e publica regras e Hosting. Merge na `main` não publica sozinho.

## White label

Cada cliente é um arquivo `public/brands/<marca>.json` (nome, cores, textos legais, pets, projeto Firebase) e um GitHub Environment próprio. O código é o mesmo para todas as marcas. Veja [public/brands/README.md](public/brands/README.md). O Worker de busca de alimentos está em [workers/alimentos](workers/alimentos/README.md).

## Documentação

- [Produto](public/docs/PRODUTO.md)
- [Comercial](public/docs/COMERCIAL.md)
- [Precificação](public/docs/PRECIFICACAO.md)
- [Pitch](public/docs/PITCH.md)
- [Instalação e operação](public/docs/INSTALACAO.md)
- [Segurança](public/docs/SEGURANCA.md)
- [Roadmap](public/docs/ROADMAP.md)
- [Privacidade](public/docs/PRIVACIDADE.md)
- [Termos de uso](public/docs/TERMOS.md)
- [Contribuindo](CONTRIBUTING.md) e [Segurança](SECURITY.md)
- [Persona do assistente](docs/ASSISTENTE_PERSONA.md)

## Licença

Código proprietário. Todos os direitos reservados; veja [LICENSE](LICENSE).

## Status

Produto em desenvolvimento ativo. O foco atual é estabilidade mobile, qualidade visual, dados privados por usuário e fluxo profissional para treino e dieta.
