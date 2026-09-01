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
- Perfil com peso, altura, objetivo, unidades, progresso corporal e backup.
- Tema claro, escuro e opção de seguir o sistema do aparelho.
- Experiência mobile/PWA com bloqueio de zoom, safe-area e navegação inferior.
- Testes unitários, testes E2E mobile, validação HTML, build e checks de segurança.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end | HTML, CSS e JavaScript modular |
| UI | Tailwind CSS + design system próprio |
| Build | Vite |
| PWA | vite-plugin-pwa + Workbox |
| Autenticação | Firebase Authentication |
| Banco | Cloud Firestore |
| Hospedagem | Firebase Hosting |
| Testes | Vitest, Playwright, html-validate |
| Segurança | Firestore Rules, npm audit, scan local |

## Rodar localmente

```bash
git clone https://github.com/chrissmol/App-Mol.git
cd App-Mol/public
npm install
npm run dev
```

## Validação

```bash
npm run check:full
```

Esse comando executa lint, testes unitários, validação HTML, build, auditoria de dependências, scan de segurança e testes E2E mobile/tablet.

## Deploy

```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

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

## Status

Produto em desenvolvimento ativo. O foco atual é estabilidade mobile, confiabilidade do login, qualidade visual, dados privados por usuário e fluxo profissional para treino e dieta.
