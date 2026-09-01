# Segurança do Mol

O Mol é um PWA estático hospedado no Firebase Hosting, com autenticação pelo Firebase Auth e dados no Cloud Firestore.

A documentação completa está em [public/docs/SEGURANCA.md](public/docs/SEGURANCA.md).

## Modelo de segurança

- A chave `apiKey` do Firebase Web é pública por design. Ela identifica o projeto para o SDK do navegador, mas não concede acesso aos dados sozinha.
- O controle de acesso real fica nas regras do Firestore, que exigem usuário autenticado e restringem documentos por `request.auth.uid`.
- Senhas não são armazenadas pelo Mol. O armazenamento, hash e autenticação ficam sob responsabilidade do Firebase Auth.
- O app não possui backend próprio nem cookies de sessão HttpOnly. Como é uma aplicação estática, as proteções equivalentes são Firebase Auth, HTTPS, regras Firestore e headers de segurança.

## O que nunca deve ir para o Git

- `.env` e `.env.*`.
- JSON de service account do Firebase Admin.
- Chaves privadas, `.pem`, `.key`, `.p12`, `.pfx`.
- Tokens pessoais, credenciais de CI/CD e arquivos de conta de produção.

## Checks antes de deploy

```bash
cd public
npm run check:full
```

Para regras do Firestore:

```bash
cd public
npm run check:rules
```

O teste de regras usa Firebase Emulator e precisa de Java instalado no PATH.

## Deploy

Quando houver mudança em regras:

```bash
firebase deploy --only firestore:rules
```

Quando houver mudança no app ou headers:

```bash
firebase deploy --only hosting
```
