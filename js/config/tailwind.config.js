/**
 * tailwind.config.js
 * ------------------------------------------------------------------
 * Configuração ÚNICA e centralizada do tema Tailwind (via CDN).
 * Todas as páginas do Pulse importam este mesmo arquivo no <head>,
 * assim garantimos a mesma identidade visual (cores, fontes, glow)
 * em 100% do app sem duplicar código.
 *
 * IMPORTANTE: este script deve ser carregado DEPOIS do
 * <script src="https://cdn.tailwindcss.com"></script>
 * ------------------------------------------------------------------
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'base-black': '#000000',   // fundo absoluto das telas
        'card-dark':  '#121212',   // fundo dos cards
        'card-dark-2':'#1a1a1a',   // fundo de cards secundários / inputs
        'neon':       '#00d2ff',   // azul neon primário (CTAs, ícones ativos)
        'neon-soft':  '#00f0ff',   // variação mais clara do neon (gradientes)
        'danger':     '#ff3b5c',   // erros de validação / alertas
        'success':    '#00e08a',   // confirmações
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px 0 rgba(0, 210, 255, 0.35)',
        'glow-md': '0 0 24px 2px rgba(0, 210, 255, 0.35)',
        'glow-lg': '0 0 40px 4px rgba(0, 210, 255, 0.30)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px 2px rgba(0, 210, 255, 0.35)' },
          '50%':      { boxShadow: '0 0 34px 6px rgba(0, 210, 255, 0.55)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.6s ease-in-out infinite',
      },
    }
  }
}
