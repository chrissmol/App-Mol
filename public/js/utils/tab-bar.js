import { renderIcons } from './icons.js';
import { t } from './language.js';

const TABS = [
  { page: 'index.html', icon: 'layout-dashboard', labelKey: 'home', fallback: 'Início' },
  { page: 'treino.html', icon: 'dumbbell', labelKey: 'workout', fallback: 'Treino' },
  { page: 'dieta.html', icon: 'apple', labelKey: 'diet', fallback: 'Dieta' },
  { page: 'perfil.html', icon: 'user', labelKey: 'profile', fallback: 'Perfil' },
];

function hrefFor(page, inPages) {
  if (page === 'index.html') return inPages ? '../index.html' : './index.html';
  return `${inPages ? './' : './pages/'}${page}`;
}

function activePage() {
  const current = location.pathname.split('/').pop() || 'index.html';
  return current === '' ? 'index.html' : current;
}

function tabMarkup(inPages, current) {
  const activeIndex = Math.max(0, TABS.findIndex(tab => tab.page === current));
  return `
    <div class="mol-tabbar__surface" style="--mol-tab-index:${activeIndex};--mol-tab-count:${TABS.length};">
      <span class="mol-tabbar__indicator" aria-hidden="true"></span>
      ${TABS.map(tab => {
        const isActive = tab.page === current || (current === '' && tab.page === 'index.html');
        const label = t(tab.labelKey, tab.fallback);
        return `
          <a class="mol-tabbar__item${isActive ? ' is-active' : ''}" href="${hrefFor(tab.page, inPages)}" data-page="${tab.page}" aria-label="${label}"${isActive ? ' aria-current="page"' : ''}>
            <i data-lucide="${tab.icon}" aria-hidden="true"></i>
            <span data-i18n="${tab.labelKey}">${label}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

export function setupTabBar() {
  const nav = document.querySelector('nav[data-mol-tabbar], nav.mol-tabbar, nav.mol-bottom-nav, nav.fixed');
  if (!nav) return;

  const inPages = location.pathname.includes('/pages/');
  const current = activePage();
  const activeIndex = Math.max(0, TABS.findIndex(tab => tab.page === current));

  document.body.classList.add('has-bottom-nav');
  nav.className = 'mol-tabbar';
  nav.dataset.molTabbar = 'true';
  nav.setAttribute('aria-label', t('mainNavigation', 'Navegação principal'));
  nav.setAttribute('role', 'navigation');

  if (!nav.querySelector('.mol-tabbar__surface')) {
    nav.innerHTML = tabMarkup(inPages, current);
  }

  const surface = nav.querySelector('.mol-tabbar__surface');
  surface?.style.setProperty('--mol-tab-index', String(activeIndex));
  surface?.style.setProperty('--mol-tab-count', String(TABS.length));

  nav.querySelectorAll('.mol-tabbar__item').forEach(item => {
    const page = item.dataset.page;
    const tab = TABS.find(entry => entry.page === page);
    const isActive = page === current || (current === '' && page === 'index.html');
    const label = tab ? t(tab.labelKey, tab.fallback) : item.textContent.trim();
    item.classList.toggle('is-active', isActive);
    item.href = hrefFor(page, inPages);
    item.setAttribute('aria-label', label);
    if (isActive) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
    const span = item.querySelector('span');
    if (span) span.textContent = label;
  });

  renderIcons(nav);
}