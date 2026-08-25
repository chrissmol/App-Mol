import { enhanceSelects } from './ui.js';
import { initializeAccessibility } from './accessibility.js';
import { renderIcons } from './icons.js';
import { setupMobileAppMode } from './mobile-app.js';

export function setupAppShell() {
  document.title = 'Mol';
  setupMobileAppMode();
  initializeAccessibility();
  enhanceSelects();
  const inPages = location.pathname.includes('/pages/');
  const faviconHref = `${inPages ? '../' : './'}assets/mol-mark.svg?v=2`;
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    document.head.appendChild(favicon);
  }
  favicon.href = faviconHref;
  try { document.documentElement.lang = localStorage.getItem('mol-language') || 'pt-BR'; }
  catch { document.documentElement.lang = 'pt-BR'; }
  if (!window.__molPwaPromptListener) {
    window.__molPwaPromptListener = true;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      window.__molInstallPrompt = event;
      window.dispatchEvent(new Event('mol-install-available'));
    });
  }
  // Folha compilada comum: mantém o mesmo tema também nas páginas legadas.
  if (!document.querySelector('link[data-mol-tailwind]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.dataset.molTailwind = 'true';
    css.href = location.pathname.includes('/pages/') ? '../css/tailwind.css' : './css/tailwind.css';
    document.head.appendChild(css);
  }
  const nav = document.querySelector('nav.fixed');
  if (nav) {
    document.body.classList.add('has-bottom-nav');
    nav.classList.add('mol-bottom-nav');
    const prefix = inPages ? '.' : './pages';
    nav.innerHTML = `<div class="mol-nav-inner">
      <a href="${inPages ? '../index.html' : './index.html'}" data-page="index.html"><i data-lucide="layout-dashboard"></i><span>Início</span></a>
      <a href="${prefix}/treino.html" data-page="treino.html"><i data-lucide="dumbbell"></i><span>Treino</span></a>
      <a href="${prefix}/dieta.html" data-page="dieta.html"><i data-lucide="apple"></i><span>Dieta</span></a>
      <a href="${prefix}/perfil.html" data-page="perfil.html"><i data-lucide="user"></i><span>Perfil</span></a>
    </div>`;
    nav.querySelectorAll('a').forEach(control => {
      const path = control.getAttribute('href')?.split('/').pop();
      const isActive = path === location.pathname.split('/').pop();
      control.classList.toggle('text-neon', isActive);
      control.classList.toggle('text-gray-500', !isActive);
      if (isActive) control.setAttribute('aria-current', 'page');
      control.classList.add('mol-nav-item');
    });
    renderIcons();
  }
  document.body.classList.add('mol-shell-ready');
}
