# Mol

Aplicativo web responsivo para organizar rotinas de treino, registrar sessões, acompanhar evolução corporal, planejar refeições e manter os dados sincronizados com a conta Google.

## Funcionalidades

- Dashboard com treino do dia, sequência semanal, última sessão, peso e próxima refeição.
- Biblioteca de exercícios, rotinas editáveis, check-in, cronômetro, descanso e recuperação de treino em andamento.
- Histórico, progresso por grupo muscular, recordes estimados e evolução corporal.
- Dieta com refeições, alimentos, porções, calorias e macronutrientes.
- Perfil, dados pessoais, backup/restauração e exclusão completa da conta.
- Tema claro/escuro, contraste elevado e texto ampliado sincronizados com o perfil.
- PWA instalável e lembretes locais enquanto o Mol estiver aberto.

## Desenvolvimento local

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

O Vite informa o endereço local. Não abra os arquivos HTML diretamente por `file://`, pois o app usa módulos ES.

## Qualidade e produção

```bash
npm run check
npm audit --omit=dev
```

`npm run check` executa lint, testes de lógica, acessibilidade estrutural, validação HTML e o build. A produção é gerada em `dist/`; os arquivos-fonte ficam em `index.html`, `pages/`, `js/`, `css/` e `assets/`.

Com Firebase CLI e Java instalados, `npm run check:rules` valida localmente o isolamento entre contas e os limites das regras do Firestore.

## Firebase

O projeto usa Firebase Authentication e Cloud Firestore. As instruções de ambiente e publicação estão em `FIREBASE_SETUP.md`; as regras versionadas ficam em `firestore.rules`.

Antes de publicar, execute `npm run check`, confirme os domínios autorizados no Firebase Authentication e implante as regras junto com o site. O deploy pode ser iniciado nesta pasta ou na raiz do repositório; ambas as configurações publicam o mesmo conteúdo de `dist/`.
