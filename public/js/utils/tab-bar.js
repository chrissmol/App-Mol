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

  nav.innerHTML = `
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

  renderIcons(nav);
}
