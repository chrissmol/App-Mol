# Segurança

## Modelo atual

O Mol é um PWA estático. Não existe servidor próprio processando sessão, cookies ou dados sensíveis. A segurança depende de quatro camadas principais:

- Firebase Authentication para identidade.
- Firestore Rules para isolamento por usuário.
- Firebase Hosting com HTTPS.
- Validação e sanitização no front-end para reduzir erros e XSS.

## Chaves e segredos

A `apiKey` do Firebase Web é pública por design. Ela identifica o projeto, mas não autoriza acesso aos dados sem autenticação e regras corretas.

Nunca versionar:

- `.env` e `.env.*`.
- JSON de service account.
- Chaves `.pem`, `.key`, `.p12`, `.pfx`.
- Tokens GitHub, Firebase, CI/CD ou APIs privadas.
- Senhas, cookies ou exports de sessão.

## Firestore Rules

Todas as coleções privadas devem exigir:

- `request.auth != null`.
- `request.auth.uid == userId` do documento.
- Em criação, `request.auth.uid == request.resource.data.userId`.
- Em update, impedir troca de `userId`.

Coleções conhecidas:

- `treinos`.
- `sessoes`.
- `users`.
- `pesos` ou dados corporais equivalentes, conforme schema atual.
- Dieta/refeições, se persistidas em coleções próprias.

## Autenticação

- Login via Firebase Auth.
- Senhas não são armazenadas pelo Mol.
- Hash, salt e provedores OAuth ficam sob responsabilidade do Firebase.
- Sessão é persistida pelo SDK do Firebase no navegador.
- Páginas privadas validam usuário antes de carregar dados.

## Limitações de app estático

Não há cookies HttpOnly próprios, rate limit real por IP ou autenticação server-side no Mol atual. Essas proteções exigiriam backend, Cloud Functions, Cloudflare Workers ou camada equivalente.

Para manter custo zero/baixo, a estratégia atual é:

- Regras Firestore fortes.
- Domínios autorizados no Firebase Auth.
- Restrição da chave web por HTTP referrer.
- App Check quando o produto amadurecer.
- Testes automatizados e scan antes de deploy.

## XSS e validação

- Usar escape de HTML ao renderizar dados do usuário.
- Validar tamanho, tipo e formato de inputs.
- Evitar inserir dados crus com `innerHTML`.
- Sanitizar nomes de rotinas, exercícios, alimentos e observações.
- Limitar uploads de fotos por tipo e tamanho.

## Headers

O Firebase Hosting deve manter headers de segurança em `firebase.json`, incluindo quando compatível:

- Content-Security-Policy.
- X-Content-Type-Options.
- Referrer-Policy.
- Permissions-Policy.
- Cross-Origin-Opener-Policy compatível com login Google.

Atenção: CSP muito restritiva pode quebrar Firebase Auth/Google OAuth.

## Checklist antes de produção comercial

- Rodar `npm run check:full`.
- Rodar `npm run check:rules` com Java instalado.
- Validar login Google em produção.
- Validar usuário A sem acesso aos dados do usuário B.
- Restringir chave Firebase por domínio.
- Revisar regras Firestore antes de cada coleção nova.
- Criar política de privacidade e termos de uso.
- Definir processo de exclusão de conta e dados.
- Evitar coletar dados sensíveis desnecessários.

## LGPD

Dados de treino, peso, medidas e fotos podem ser sensíveis no contexto de saúde e bem-estar. Para vender o produto, é necessário explicar:

- Quais dados são coletados.
- Para que são usados.
- Onde são armazenados.
- Como excluir conta e dados.
- Quem tem acesso.
- Como solicitar suporte ou remoção.

## Auditoria

Comandos recomendados:

```bash
npm run security:check
npm run security:semgrep
npm run check:full
```

O Semgrep pode exigir instalação/configuração adicional no ambiente local.
