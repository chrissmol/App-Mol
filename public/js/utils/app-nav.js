import { renderIcons } from './icons.js';
import { t } from './language.js';
import { getStoredAppModules, isPageAllowed } from './app-modules.js';

const NAV_ITEMS = [
  { page: 'index.html', icon: 'layout-dashboard', labelKey: 'home', fallback: 'Início' },
  { page: 'treino.html', icon: 'dumbbell', labelKey: 'workout', fallback: 'Treino' },
  { page: 'dieta.html', icon: 'apple', labelKey: 'diet', fallback: 'Dieta' },
  { page: 'assistente.html', icon: 'sparkles', labelKey: 'assistant', fallback: 'Assistente' },
  { page: 'perfil.html', icon: 'user', labelKey: 'profile', fallback: 'Perfil' },
];

function visibleNavItems() {
  const modules = getStoredAppModules();
  return NAV_ITEMS.filter(item => isPageAllowed(item.page, modules));
}

function hrefFor(page, inPages) {
  if (page === 'index.html') return inPages ? '../index.html' : './index.html';
  return `${inPages ? './' : './pages/'}${page}`;
}

function activePage() {
  const current = location.pathname.split('/').pop() || 'index.html';
  return current === '' ? 'index.html' : current;
}

function activeItem(current) {
  const items = visibleNavItems();
  return items.find(item => item.page === current) || items[0] || NAV_ITEMS[0];
}

function mobileDockMarkup(inPages, current) {
  const active = activeItem(current);
  const activeLabel = t(active.labelKey, active.fallback);

  return `
    <button class="mol-dock__trigger" type="button" aria-expanded="false" aria-controls="mol-dock-menu" aria-label="${t('openNavigation', 'Abrir navegação')}">
      <span class="mol-dock__pulse" aria-hidden="true"></span>
      <i data-lucide="${active.icon}" aria-hidden="true"></i>
      <span class="mol-dock__label">${activeLabel}</span>
    </button>
    <div class="mol-dock__scrim" data-mol-nav-close hidden></div>
    <div class="mol-dock__menu" id="mol-dock-menu" role="menu" aria-label="${t('mainNavigation', 'Navegação principal')}" hidden>
      <div class="mol-dock__menu-header">
        <span>MOL</span>
        <small>${t('goTo', 'Ir para')}</small>
      </div>
      <div class="mol-dock__items">
        ${visibleNavItems().map(item => {
          const isActive = item.page === current || (current === '' && item.page === 'index.html');
          const label = t(item.labelKey, item.fallback);
          return `
            <a class="mol-dock__item${isActive ? ' is-active' : ''}" href="${hrefFor(item.page, inPages)}" data-page="${item.page}" role="menuitem"${isActive ? ' aria-current="page"' : ''}>
              <i data-lucide="${item.icon}" aria-hidden="true"></i>
              <span data-i18n="${item.labelKey}">${label}</span>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function sidebarMarkup(inPages, current) {
  return `
    <aside class="mol-sidebar" data-mol-sidebar="true" aria-label="${t('mainNavigation', 'Navegação principal')}">
      <a class="mol-sidebar__brand" href="${hrefFor('index.html', inPages)}" aria-label="Mol, ir para o início">
        <img src="${inPages ? '../' : './'}assets/mol-mark.svg" alt="">
        <span>Mol</span>
      </a>
      <nav class="mol-sidebar__nav">
        ${visibleNavItems().map(item => {
          const isActive = item.page === current || (current === '' && item.page === 'index.html');
          const label = t(item.labelKey, item.fallback);
          return `
            <a class="mol-sidebar__item${isActive ? ' is-active' : ''}" href="${hrefFor(item.page, inPages)}" data-sidebar-page="${item.page}" aria-label="${label}"${isActive ? ' aria-current="page"' : ''}>
              <i data-lucide="${item.icon}" aria-hidden="true"></i>
              <span data-i18n="${item.labelKey}">${label}</span>
            </a>
          `;
        }).join('')}
      </nav>
    </aside>
  `;
}

function closeDock(nav) {
  const trigger = nav.querySelector('.mol-dock__trigger');
  const menu = nav.querySelector('.mol-dock__menu');
  const scrim = nav.querySelector('.mol-dock__scrim');
  nav.classList.remove('is-open');
  trigger?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('hidden', '');
  scrim?.setAttribute('hidden', '');
}

function openDock(nav) {
  const trigger = nav.querySelector('.mol-dock__trigger');
  const menu = nav.querySelector('.mol-dock__menu');
  const scrim = nav.querySelector('.mol-dock__scrim');
  nav.classList.add('is-open');
  trigger?.setAttribute('aria-expanded', 'true');
  menu?.removeAttribute('hidden');
  scrim?.removeAttribute('hidden');
}

function setupMobileDock(nav) {
  if (nav.dataset.molDockReady === 'true') return;
  nav.dataset.molDockReady = 'true';

  nav.addEventListener('click', event => {
    const trigger = event.target.closest('.mol-dock__trigger');
    if (trigger) {
      if (nav.classList.contains('is-open')) closeDock(nav);
      else openDock(nav);
      return;
    }
    if (event.target.closest('[data-mol-nav-close]')) closeDock(nav);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDock(nav);
  });
}

export function setupAppNavigation() {
  const nav = document.querySelector('nav[data-mol-app-nav], nav.mol-app-nav');
  if (!nav) return;

  const inPages = location.pathname.includes('/pages/');
  const current = activePage();

  document.body.classList.add('has-app-nav');
  nav.className = 'mol-app-nav';
  nav.dataset.molAppNav = 'true';
  nav.setAttribute('aria-label', t('mainNavigation', 'Navegação principal'));
  nav.setAttribute('role', 'navigation');
  nav.innerHTML = mobileDockMarkup(inPages, current);

  let sidebar = document.querySelector('[data-mol-sidebar]');
  if (!sidebar) {
    document.body.insertAdjacentHTML('afterbegin', sidebarMarkup(inPages, current));
    sidebar = document.querySelector('[data-mol-sidebar]');
  } else {
    sidebar.outerHTML = sidebarMarkup(inPages, current);
    sidebar = document.querySelector('[data-mol-sidebar]');
  }

  setupMobileDock(nav);
  renderIcons(nav);
  renderIcons(sidebar);
}

// Enquanto a pessoa digita, marca <html class="mol-typing">: no celular o dock some e
// barras "grudadas" soltam, porque o iOS as posicionava flutuando acima do teclado.
const TEXT_ENTRY = 'textarea, select, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]):not([type="file"])';
if (!window.__molTypingListener) {
  window.__molTypingListener = true;
  document.addEventListener('focusin', event => {
    if (/** @type {Element} */ (event.target)?.matches?.(TEXT_ENTRY)) document.documentElement.classList.add('mol-typing');
  });
  document.addEventListener('focusout', () => {
    // Espera o foco ir para o próximo elemento (ex.: tocar de um campo para outro).
    setTimeout(() => { if (!document.activeElement?.matches?.(TEXT_ENTRY)) document.documentElement.classList.remove('mol-typing'); }, 0);
  });
}

if (!window.__molAppNavModulesListener) {
  window.__molAppNavModulesListener = true;
  window.addEventListener('mol-app-modules-changed', () => setupAppNavigation());
}
