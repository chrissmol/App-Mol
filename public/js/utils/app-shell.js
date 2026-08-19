const labels = { 'index.html': 'Início', 'treino.html': 'Treino', 'dieta.html': 'Dieta', 'perfil.html': 'Perfil', 'historico.html': 'Histórico', 'progresso.html': 'Progresso' };

import { startReminderMonitor } from './reminders.js';

export function setupAppShell() {
  startReminderMonitor();
  document.documentElement.lang = localStorage.getItem('mol-language') || 'pt-BR';
  if (!window.__molPwaPromptListener) {
    window.__molPwaPromptListener = true;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      window.__molInstallPrompt = event;
      window.dispatchEvent(new Event('mol-install-available'));
    });
  }
  const accessibility = JSON.parse(localStorage.getItem('mol-accessibility') || '{}');
  const applyTheme = () => { const theme = accessibility.theme || 'system'; document.body.dataset.theme = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? '' : 'light') : theme; };
  applyTheme();
  if ((accessibility.theme || 'system') === 'system') matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
  if (accessibility.contrast) document.body.dataset.highContrast = accessibility.contrast;
  if (accessibility.largeText) document.body.dataset.largeText = 'true';
  // Folha compilada comum: mantém o mesmo tema também nas páginas legadas.
  if (!document.querySelector('link[data-mol-tailwind]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.dataset.molTailwind = 'true';
    css.href = location.pathname.includes('/pages/') ? '../css/tailwind.css' : './css/tailwind.css';
    document.head.appendChild(css);
  }
  const nav = document.querySelector('nav.fixed');
  if (nav) {
    nav.classList.add('mol-bottom-nav');
    nav.querySelectorAll('a,button').forEach(control => {
      const path = control.getAttribute('href')?.split('/').pop();
      const isDiet = control.dataset.comingSoon === 'Dieta' || control.querySelector('[data-lucide="apple"]');
      const dietHref = location.pathname.includes('/pages/') ? './dieta.html' : './pages/dieta.html';
      if (isDiet && control.tagName === 'A') control.setAttribute('href', dietHref);
      if (isDiet && control.tagName === 'BUTTON') control.onclick = () => window.location.href = dietHref;
      const label = labels[path] || (isDiet ? 'Dieta' : control.dataset.comingSoon);
      const isActive = path === location.pathname.split('/').pop() || (isDiet && location.pathname.endsWith('/dieta.html'));
      control.classList.toggle('text-neon', isActive);
      control.classList.toggle('text-gray-500', !isActive);
      if (isActive) control.setAttribute('aria-current', 'page');
      if (label && !control.querySelector('span')) {
        const text = document.createElement('span'); text.className = 'text-[10px] font-semibold'; text.textContent = label; control.appendChild(text);
      }
      control.classList.add('mol-nav-item');
    });
  }
  document.body.classList.add('mol-shell-ready');
}
