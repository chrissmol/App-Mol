import { enhanceSelects } from './ui.js';
import { initializeAccessibility } from './accessibility.js';
import { setupMobileAppMode } from './mobile-app.js';
import { connectivityState, isTrustedDevice } from './offline.js';
import { startReminderMonitor } from './reminders.js';
import { applyLanguage, initializeLanguage, t } from './language.js';
import { setupTelemetry } from '../modules/telemetry.js';
import { setupAppNavigation } from './app-nav.js';
import { applyModuleVisibility, isPageAllowed, showDisabledModuleScreen, syncAppModulesForUser } from './app-modules.js';
import { watchAuthState } from '../modules/auth.js';
import { registerServiceWorker } from './service-worker.js';
import { renderIcons } from './icons.js';


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
      indicator.innerHTML = `<i data-lucide="wifi-off" aria-hidden="true"></i><strong>${t('offline', 'Offline')}</strong><small>${isTrustedDevice() ? t('offlineTrusted', 'Alterações aguardando sincronização') : t('offlineTemporary', 'Dados disponíveis até fechar o app')}</small>`;
      renderIcons(indicator);
      indicator.classList.remove('hidden');
      wasOffline = true;
      return;
    }
    if (wasOffline) {
      indicator.innerHTML = `<i data-lucide="wifi" aria-hidden="true"></i><strong>${t('onlineAgain', 'Online novamente')}</strong><small>${t('syncing', 'Sincronizando alterações')}</small>`;
      renderIcons(indicator);
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
  registerServiceWorker();
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
  setupAppNavigation();
  if (document.querySelector('nav[data-mol-app-nav]')) void import('./active-workout.js').then(module => module.setupActiveWorkoutBar());
  applyModuleVisibility();
  if (!window.__molAppModulesAuthListener) {
    window.__molAppModulesAuthListener = true;
    watchAuthState(user => {
      if (!user) return;
      syncAppModulesForUser(user).then(modules => {
        applyModuleVisibility(modules);
        if (!isPageAllowed(location.pathname.split('/').pop() || 'index.html', modules)) {
          showDisabledModuleScreen();
        }
      }).catch(error => console.warn('Módulos do app não sincronizados:', error.message));
    });
  }
  if (!window.__molAppModulesVisibilityListener) {
    window.__molAppModulesVisibilityListener = true;
    window.addEventListener('mol-app-modules-changed', event => applyModuleVisibility(event.detail));
  }
  document.body.classList.add('mol-shell-ready');
}
