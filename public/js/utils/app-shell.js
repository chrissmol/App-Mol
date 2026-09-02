import { enhanceSelects } from './ui.js';
import { initializeAccessibility } from './accessibility.js';
import { renderIcons } from './icons.js';
import { setupMobileAppMode } from './mobile-app.js';
import { connectivityState, isTrustedDevice } from './offline.js';
import { startReminderMonitor } from './reminders.js';
import { applyLanguage, initializeLanguage, t } from './language.js';
import { setupTelemetry } from '../modules/telemetry.js';


function setupSkipLink() {
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.id) main.id = 'conteudo-principal';
  if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
  if (document.getElementById('mol-skip-link')) return;
  const link = document.createElement('a');
  link.id = 'mol-skip-link';
  link.className = 'mol-skip-link';
  link.href = `#${main.id}`;
  link.textContent = 'Pular para o conteúdo';
  link.addEventListener('click', () => window.setTimeout(() => main.focus(), 0));
  document.body.prepend(link);
}

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
      indicator.innerHTML = `<span aria-hidden="true"></span><strong>${t('offline', 'Offline')}</strong><small>${isTrustedDevice() ? t('offlineTrusted', 'Alterações aguardando sincronização') : t('offlineTemporary', 'Dados disponíveis até fechar o app')}</small>`;
      indicator.classList.remove('hidden');
      wasOffline = true;
      return;
    }
    if (wasOffline) {
      indicator.innerHTML = `<span aria-hidden="true"></span><strong>${t('onlineAgain', 'Online novamente')}</strong><small>${t('syncing', 'Sincronizando alterações')}</small>`;
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
  setupSkipLink();
  initializeAccessibility();
  initializeLanguage();
  setupConnectivityIndicator();
  startReminderMonitor();
  setupTelemetry();
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
  applyLanguage();
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
      <a href="${inPages ? '../index.html' : './index.html'}" data-page="index.html" aria-label="${t('home', 'Início')}"><i data-lucide="layout-dashboard"></i><span data-i18n="home">${t('home', 'Início')}</span></a>
      <a href="${prefix}/treino.html" data-page="treino.html" aria-label="${t('workout', 'Treino')}"><i data-lucide="dumbbell"></i><span data-i18n="workout">${t('workout', 'Treino')}</span></a>
      <a href="${prefix}/dieta.html" data-page="dieta.html" aria-label="${t('diet', 'Dieta')}"><i data-lucide="apple"></i><span data-i18n="diet">${t('diet', 'Dieta')}</span></a>
      <a href="${prefix}/perfil.html" data-page="perfil.html" aria-label="${t('profile', 'Perfil')}"><i data-lucide="user"></i><span data-i18n="profile">${t('profile', 'Perfil')}</span></a>
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
