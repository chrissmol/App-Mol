# Pulse — Sprint 1: Estrutura + Login

## Estrutura de pastas

```
pulse-app/
├── index.html                  ← (Sprint 2) Dashboard, futura tela inicial
├── pages/
│   └── login.html               ← Tela de login (Sprint 1)
├── css/
│   └── style.css                 ← Estilos globais compartilhados
├── js/
│   ├── config/
│   │   ├── firebase-config.js    ← Inicialização do Firebase (Auth + Firestore)
│   │   └── tailwind.config.js    ← Tema Tailwind compartilhado (cores, glow)
│   ├── modules/
│   │   └── auth.js               ← Lógica de autenticação (login, logout, guard)
│   ├── utils/
│   │   └── ui.js                 ← Helpers de UI (toast, loading de botão)
│   └── pages/
│       └── login.js               ← Controller da tela de login
└── assets/
    ├── icons/                     ← Ícones customizados (SVG/PNG), se precisar
    └── images/                    ← Imagens (fotos, ilustrações)
```

**Por que essa organização?**
- `config/` = tudo que é "ligar o motor" do app (Firebase, Tailwind).
- `modules/` = regras de negócio reutilizáveis (auth, treino, dieta — cada
  domínio vira um módulo no futuro: `workouts.js`, `diet.js`).
- `pages/` (dentro de `js/`) = um controller por tela HTML, só orquestra
  DOM + módulos, sem lógica de negócio duplicada.
- `utils/` = funções puramente de interface, sem relação com Firebase.

Isso separa **o que o app faz** (modules) de **como ele conversa com o
Firebase** (config) e **como a tela reage** (pages) — o padrão que
qualquer projeto JS Vanilla modular de verdade usa.

## Como rodar localmente

⚠️ **Diferente da Sprint anterior**: como agora usamos `<script type="module">`
e imports ES6, o navegador **bloqueia isso se você abrir o HTML direto
com duplo clique** (erro de CORS `file://`). É preciso servir os arquivos
por um mini servidor local — ainda 100% gratuito, sem instalar nada pesado:

**Opção 1 — VSCode (recomendado):**
1. Instale a extensão gratuita **"Live Server"** (by Ritwick Dey).
2. Clique com o botão direito em `pages/login.html` → **"Open with Live Server"**.
3. O navegador abre automaticamente em `http://127.0.0.1:5500/...`.

**Opção 2 — Terminal (sem VSCode):**
```bash
# Dentro da pasta pulse-app, com Python instalado:
python3 -m http.server 8000
# Depois acesse: http://localhost:8000/pages/login.html
```

## Configurar o Firebase (grátis, plano Spark)

Siga os comentários no topo do arquivo `js/config/firebase-config.js` —
o passo a passo completo está lá. Resumo:

1. Crie um projeto em https://console.firebase.google.com
2. Registre um app Web e copie o `firebaseConfig`.
3. Cole em `js/config/firebase-config.js`.
4. Ative o provedor **Google** em *Authentication → Sign-in method*.
5. Crie o banco em *Firestore Database → Criar banco de dados*.

Sem isso, o botão "Continuar com Google" vai gerar erro — é esperado até
você conectar seu próprio projeto Firebase.

## O que tem nesta Sprint

- ✅ Estrutura de pastas modular
- ✅ Tema Tailwind centralizado (`tailwind.config.js`)
- ✅ `firebase-config.js` pronto para receber suas chaves
- ✅ Módulo `auth.js` com `loginWithGoogle`, `logout`, `watchAuthState`, `requireAuth`
- ✅ Tela `login.html` com botão "Continuar com Google" funcional
- ✅ Criação automática do documento do usuário no Firestore no primeiro login

## Próxima Sprint (sugestão)

Sprint 2: Dashboard modular (`index.html`) consumindo dados reais do
Firestore, com `requireAuth()` protegendo a rota e botão de logout.
