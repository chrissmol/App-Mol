<p align="center">
  <img src="public/assets/mol-mark.svg" width="72" alt="Mol">
</p>

<h1 align="center">Mol</h1>

<p align="center">
  Uma plataforma PWA para treino, dieta e acompanhamento de evolu&ccedil;&atilde;o pessoal.
</p>

<p align="center">
  <a href="#recursos">Recursos</a> &middot;
  <a href="#tecnologia">Tecnologia</a> &middot;
  <a href="#rodar-localmente">Rodar localmente</a> &middot;
  <a href="#publica%C3%A7%C3%A3o">Publica&ccedil;&atilde;o</a>
</p>

## Sobre o projeto

O Mol foi pensado primeiro para celular: uma experi&ecirc;ncia leve, direta e segura para quem treina. Ele organiza rotinas, registra s&eacute;ries e cargas, acompanha consist&ecirc;ncia, dieta, peso e medidas corporais em uma &uacute;nica conta privada.

O projeto usa somente servi&ccedil;os com camada gratuita e uma arquitetura est&aacute;tica, mantendo o custo de opera&ccedil;&atilde;o pr&oacute;ximo de zero.

## Recursos

- Rotinas de treino edit&aacute;veis, biblioteca de exerc&iacute;cios, favoritos e filtros por grupo muscular.
- Registro de s&eacute;ries, carga, repeti&ccedil;&otilde;es, RIR, descanso e hist&oacute;rico de sess&otilde;es.
- Metas semanais, streaks, badges e calend&aacute;rio de consist&ecirc;ncia.
- Comparativo de peso, meta, IMC e medidas corporais.
- Dietas e refei&ccedil;&otilde;es planejadas pelo pr&oacute;prio usu&aacute;rio.
- Fotos de progresso comprimidas e privadas.
- Backup e restaura&ccedil;&atilde;o de dados, unidades, acessibilidade, tema e prefer&ecirc;ncias.
- Lembretes locais e instala&ccedil;&atilde;o como PWA.
- Login Google, regras de acesso por usu&aacute;rio e exclus&atilde;o de conta protegida.

## Tecnologia

| Camada | Escolha |
| --- | --- |
| Interface | HTML, JavaScript modular e Tailwind CSS |
| Dados e autentica&ccedil;&atilde;o | Firebase Authentication e Cloud Firestore |
| Build | Vite, PostCSS e Tailwind CLI |
| PWA | vite-plugin-pwa e Workbox |
| Testes | Vitest |
| Hospedagem | Firebase Hosting |

## Rodar localmente

**Pr&eacute;-requisitos:** Node.js 20+ e um projeto Firebase configurado.

```bash
git clone https://github.com/chrissmol/App-Mol.git
cd App-Mol/public
npm install
npm run dev
```

Para gerar a vers&atilde;o de produ&ccedil;&atilde;o:

```bash
npm run test
npm run build
```

> O Firebase usa as configura&ccedil;&otilde;es em `public/js/config/firebase-config.js`. As regras de seguran&ccedil;a ficam em `public/firestore.rules`.

## Publica&ccedil;&atilde;o

Com o Firebase CLI autenticado:

```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

O build de produ&ccedil;&atilde;o &eacute; gerado em `public/dist/` e n&atilde;o &eacute; versionado.

## Privacidade

Cada documento do Firestore &eacute; associado ao `userId` do usu&aacute;rio autenticado. As regras bloqueiam leitura e escrita entre contas diferentes. Fotos de progresso s&atilde;o comprimidas no dispositivo e armazenadas apenas no documento privado do perfil.

Lembretes s&atilde;o locais ao dispositivo. Sem um servidor de push, navegadores n&atilde;o garantem alertas quando o aplicativo est&aacute; totalmente encerrado.

## Estrutura

```text
public/
├── assets/        # marca e ilustra&ccedil;&otilde;es
├── css/           # estilos globais e Tailwind
├── js/            # configura&ccedil;&atilde;o Firebase, p&aacute;ginas e utilit&aacute;rios
├── pages/         # telas do aplicativo
├── tests/         # testes unit&aacute;rios
├── firestore.rules
└── vite.config.js
```

## Status

Em desenvolvimento ativo. A prioridade &eacute; oferecer uma experi&ecirc;ncia profissional de treino no celular, com boa performance, privacidade e baixo custo de opera&ccedil;&atilde;o.
