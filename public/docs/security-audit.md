# Auditoria de segurança do Mol

Última revisão local: 2026-08-25.

## Resultado rápido

- `npm audit --audit-level=moderate`: sem vulnerabilidades conhecidas.
- Busca local por secrets: nenhum token privado encontrado.
- `apiKey` do Firebase Web encontrada em `js/config/firebase-config.js`: esperado e público por design do Firebase Web SDK.
- Semgrep instalado localmente, mas o binário Windows falhou neste ambiente com erro de certificado do repositório X509 do sistema antes de iniciar o scan. O comando do projeto já está preparado em `npm run security:scan`.

## Variáveis de ambiente e chaves expostas

O projeto é um PWA estático. Qualquer variável embutida no front-end é pública para quem abre o navegador.

Regras adotadas:

- Não colocar tokens privados, service accounts ou `.env` no front-end.
- Manter `.env`, service accounts e chaves privadas no `.gitignore`.
- Tratar a chave pública do Firebase Web como identificador de projeto, não como segredo.
- Proteger dados reais com Firebase Auth + regras Firestore.

Busca local recomendada:

```bash
rg -n "sk_|PRIVATE_KEY|SERVICE_ACCOUNT|api_secret|client_secret|BEGIN PRIVATE KEY|ghp_|password|secret" .
```

## Autenticação e sessão

O Mol usa Firebase Auth no navegador. Em app estático não há cookie de sessão HttpOnly próprio.

Proteções adotadas:

- Páginas privadas chamam `onAuthStateChanged` e redirecionam usuários sem sessão para `login.html`.
- Dados no Firestore exigem `request.auth.uid`.
- Exclusão de conta exige reautenticação.

Teste manual recomendado:

1. Entrar no app.
2. Abrir DevTools > Application.
3. Limpar dados do site: Local Storage, Session Storage, IndexedDB e Cookies.
4. Recarregar uma página privada.
5. Resultado esperado: redirecionar para login.

Observação: apagar apenas cookies pode não encerrar Firebase Auth, porque a sessão pode usar IndexedDB/localStorage.

## Rate limiting e bots

O front-end não consegue aplicar rate limiting real por IP/usuário contra bots, porque qualquer regra no cliente pode ser burlada.

Camadas aplicadas/indicadas:

- Firebase Auth já aplica proteção contra abuso em provedores de autenticação.
- O app adiciona um cooldown local para tentativas repetidas de login, evitando spam de popup e abuso básico no dispositivo.
- Para produção, considerar Firebase App Check com reCAPTCHA Enterprise/Play Integrity quando o app estiver em domínio final.

## Semgrep

Comando padrão:

```bash
npm run security:scan
```

Se o Semgrep falhar no Windows com erro de certificados X509, testar em um novo terminal ou em ambiente Linux/CI. O projeto ignora `node_modules`, `dist`, `vendor`, `css/tailwind.css` e `package-lock.json`.

## Ferramentas citadas e decisão para o Mol

- Playwright CLI: útil e gratuito para testes E2E futuros. Ainda não é obrigatório porque os testes atuais cobrem HTML, acessibilidade e módulos.
- Supabase: não recomendado agora. O projeto já usa Firebase; migrar duplicaria stack e regras.
- Strix: interessante para auditoria ofensiva, mas não foi adotado por custo/risco/desconhecimento da procedência.
- Skill UI: útil para design system, mas o Mol já tem tokens e padrões próprios em CSS.
- Context7: útil quando houver bibliotecas/frameworks novas. Para este projeto vanilla/Firebase, consultar docs oficiais já cobre bem.
