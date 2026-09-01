import { enhanceSelects } from './ui.js';
import { initializeAccessibility } from './accessibility.js';
import { renderIcons } from './icons.js';
import { setupMobileAppMode } from './mobile-app.js';
import { connectivityState, isTrustedDevice } from './offline.js';
import { startReminderMonitor } from './reminders.js';

function setupConnectivityIndicator() {
  let indicator = document.getElementById('mol-connectivity');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'mol-connectivity';
    indicator.className = 'mol-connectivity hidden';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    document.body.appendChild(indicator);
  }
  let wasOffline = !navigator.onLine;
  let hideTimer = 0;
  const render = () => {
    window.clearTimeout(hideTimer);
    const state = connectivityState(navigator.onLine);
    indicator.classList.toggle('is-offline', !state.online);
    if (!state.online) {
      indicator.innerHTML = `<span aria-hidden="true"></span><strong>Offline</strong><small>${isTrustedDevice() ? 'Alterações aguardando sincronização' : 'Dados disponíveis até fechar o app'}</small>`;
      indicator.classList.remove('hidden');
      wasOffline = true;
      return;
    }
    if (wasOffline) {
      indicator.innerHTML = '<span aria-hidden="true"></span><strong>Online novamente</strong><small>Sincronizando alterações</small>';
      indicator.classList.remove('hidden');
      hideTimer = window.setTimeout(() => indicator.classList.add('hidden'), 2800);
    } else indicator.classList.add('hidden');
    wasOffline = false;
  };
  if (!window.__molConnectivityListener) {
    window.__molConnectivityListener = true;
    window.addEventListener('online', render);
    window.addEventListener('offline', render);
    window.addEventListener('pageshow', render);
  }
  render();
}

export function setupAppShell() {
  document.title = 'Mol';
  setupMobileAppMode();
  initializeAccessibility();
  setupConnectivityIndicator();
  startReminderMonitor();
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
    // Algumas páginas antigas traziam utilitários próprios (inclusive
    // backdrop-filter) na barra. Em iOS instalado isso criava outro plano de
    // composição e fazia o rodapé terminar acima da área segura.
    nav.className = 'fixed bottom-0 left-0 right-0 z-50 mol-bottom-nav';
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
