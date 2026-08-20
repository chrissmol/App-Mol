/**
 * tailwind.config.js
 * ------------------------------------------------------------------
 * Configuração centralizada do tema Tailwind para o Mol.
 * Tema: Preto/Cinza com destaque em Verde (#1E7349) e texto branco.
 * ------------------------------------------------------------------
 */
const tailwind = globalThis.tailwind ??= {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'base-black': '#000000',   // Fundo absoluto
        'card-dark':  '#121212',   // Fundo dos cards
        'card-dark-2':'#1a1a1a',   // Fundo de cards secundários / inputs
        'neon':       '#1E7349',   // Verde de destaque principal
        'neon-soft':  '#278a59',   // Variação mais clara para gradientes/hover
        'danger':     '#ff3b5c',   // Erros / alertas
        'success':    '#00e08a',   // Confirmações
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px 0 rgba(30, 115, 73, 0.40)',
        'glow-md': '0 0 24px 2px rgba(30, 115, 73, 0.40)',
        'glow-lg': '0 0 40px 4px rgba(30, 115, 73, 0.30)',
      },
      keyframes: {
        'mol-glow': {
          '0%, 100%': { boxShadow: '0 0 20px 2px rgba(30, 115, 73, 0.40)' },
          '50%':      { boxShadow: '0 0 34px 6px rgba(30, 115, 73, 0.60)' },
        },
      },
      animation: {
        'mol-glow': 'mol-glow 2.6s ease-in-out infinite',
      },
    }
  }
};
