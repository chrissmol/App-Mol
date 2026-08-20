/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './pages/**/*.html', './js/**/*.js'],
  safelist: [
    'min-h-11', 'min-h-12', 'min-h-13', 'min-h-14',
    'bg-neon', 'text-neon', 'bg-card-dark', 'bg-card-dark-2'
  ],
  theme: {
    extend: {
      spacing: { 13: '3.25rem' },
      colors: {
        'base-black': '#000000',
        'card-dark': '#121212',
        'card-dark-2': '#1a1a1a',
        neon: '#1E7349',
        'neon-soft': '#278a59',
        danger: '#ff3b5c',
        success: '#00e08a'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'glow-sm': '0 0 12px 0 rgba(30, 115, 73, 0.40)',
        'glow-md': '0 0 24px 2px rgba(30, 115, 73, 0.40)',
        'glow-lg': '0 0 40px 4px rgba(30, 115, 73, 0.30)'
      }
    }
  }
};
