# Instalação e operação

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Firebase CLI.
- Conta Google com acesso ao projeto Firebase.
- Java, somente se for rodar o Firebase Emulator para testar regras localmente.

## Setup local

```bash
git clone https://github.com/chrissmol/App-Mol.git
cd App-Mol/public
npm install
npm run dev
```

## Scripts principais

| Script | Uso |
| --- | --- |
| `npm run dev` | Servidor local de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes unitários |
| `npm run test:e2e` | Testes E2E mobile/tablet |
| `npm run test:html` | Validação dos HTMLs |
| `npm run security:check` | Audit e scan local |
| `npm run check:full` | Validação completa antes de deploy |
| `npm run check:rules` | Teste local das regras Firestore |

## Configuração Firebase

O projeto usa:

- Firebase Authentication.
- Cloud Firestore.
- Firebase Hosting.

A configuração web fica em `js/config/firebase-config.js`. A chave web do Firebase é pública por design, mas deve ser restringida por domínio no Google Cloud Console.

## Domínios autorizados

No Firebase Console, abrir Authentication > Settings > Authorized domains e manter:

- `localhost`
- `127.0.0.1`, se testar localmente por esse host
- `app-mol-5f3dc.web.app`
- `app-mol-5f3dc.firebaseapp.com`
- domínio próprio futuro, se existir

Não incluir porta, como `:5173` ou `:5500`.

## Deploy

Antes de publicar:

```bash
npm run check:full
```

Publicar regras, quando houver mudança em `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

Publicar site:

```bash
firebase deploy --only hosting
```

## Operação

Após deploy, validar manualmente:

- Login Google no domínio publicado.
- Criação de rotina.
- Edição de rotina.
- Início e conclusão de treino.
- Dieta carregando.
- Perfil carregando nome correto.
- Tema claro/escuro em navegação normal e ao voltar pelo celular.
- PWA instalado na tela inicial do iPhone e Android.

## Cache PWA

Quando houver comportamento antigo após deploy:

- Fechar e abrir o app instalado.
- Atualizar a página no navegador.
- Remover e adicionar novamente à tela inicial em caso de cache persistente no iOS.
