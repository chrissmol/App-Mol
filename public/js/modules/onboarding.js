import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase-config.js';

const version = 'v1';
const key = uid => `mol-onboarding-${version}-${uid}`;
const pendingKey = uid => `mol-onboarding-pending-${uid}`;
const steps = [
  { title: 'Bem-vindo ao Mol', text: 'Um guia rápido para você aproveitar treino, dieta, evolução e seu perfil.', target: null, route: 'index.html' },
  { title: 'Seu treino', text: 'Acesse suas rotinas, registre séries e acompanhe seu progresso de carga.', target: '#btn-nova-rotina', route: 'pages/treino.html' },
  { title: 'Sua dieta', text: 'Planeje refeições, consulte nutrientes e configure sua janela de jejum.', target: '#food-search', route: 'pages/dieta.html' },
  { title: 'Seu perfil', text: 'Veja conquistas, medidas, fotos de evolução e preferências do app.', target: '#avatar-frame', route: 'pages/perfil.html' },
  { title: 'Personalize o início', text: 'No botão Editar painel, escolha os cards e a ordem que fazem sentido para você.', target: '#btn-edit-dashboard', route: 'index.html' }
];
let active = null;
const routeMatches = route => location.pathname.endsWith(`/${route}`) || (route === 'index.html' && (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')));
function openTour(uid, force = false, initialIndex = 0) {
  if (!force && localStorage.getItem(key(uid)) === 'done') return;
  active?.remove();
  let index = Math.max(0, Math.min(steps.length - 1, Number(initialIndex) || 0));
  const overlay = document.createElement('div'); overlay.className = 'mol-tour-overlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'mol-tour-title');
  const render = () => {
    document.querySelectorAll('.mol-tour-target').forEach(el => el.classList.remove('mol-tour-target'));
    const step = steps[index]; const target = step.target ? document.querySelector(step.target) : null;
    if (target) { target.classList.add('mol-tour-target'); target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    overlay.innerHTML = `<section class="mol-tour-card"><div class="flex items-center justify-between gap-3"><span class="text-xs font-bold uppercase tracking-wider text-neon">Guia Mol · ${index + 1}/${steps.length}</span><button type="button" data-skip class="text-xs font-bold text-gray-400">Pular</button></div><div class="mt-3 flex gap-1.5" aria-label="Progresso do tutorial">${steps.map((_, stepIndex) => `<span class="h-1.5 flex-1 rounded-full ${stepIndex <= index ? 'bg-neon' : 'bg-white/10'}"></span>`).join('')}</div><h2 id="mol-tour-title" class="mt-4 text-xl font-extrabold">${step.title}</h2><p class="mt-2 text-sm leading-relaxed text-gray-400">${step.text}</p><div class="mt-5 flex items-center justify-between gap-3">${index ? '<button type="button" data-back class="min-h-11 rounded-xl mol-soft px-4 text-sm font-bold">Voltar</button>' : '<span></span>'}<button type="button" data-next class="min-h-11 rounded-xl bg-neon px-5 text-sm font-bold text-white">${index === steps.length - 1 ? 'Começar' : 'Continuar'}</button></div></section>`;
    overlay.querySelector('[data-skip]').onclick = finish;
    const move = delta => {
      const nextIndex = index + delta;
      if (nextIndex < 0) return;
      if (nextIndex >= steps.length) return finish();
      const nextStep = steps[nextIndex];
      if (!routeMatches(nextStep.route)) { sessionStorage.setItem(pendingKey(uid), JSON.stringify({ index: nextIndex, force: true })); window.location.href = location.pathname.includes('/pages/') ? `../${nextStep.route}` : `./${nextStep.route}`; return; }
      index = nextIndex; render();
    };
    overlay.querySelector('[data-back]')?.addEventListener('click', () => move(-1));
    overlay.querySelector('[data-next]').onclick = () => move(1);
    const positionCard = () => {
      const card = overlay.querySelector('.mol-tour-card');
      if (!card) return;
      const margin = 16; const rect = target?.getBoundingClientRect(); const width = Math.min(card.offsetWidth || 448, window.innerWidth - margin * 2); const height = card.offsetHeight || 220;
      let left = (window.innerWidth - width) / 2; let top = (window.innerHeight - height) / 2;
      const below = !rect || rect.bottom + height + 18 <= window.innerHeight - margin;
      if (rect) { left = Math.max(margin, Math.min(window.innerWidth - width - margin, rect.left + rect.width / 2 - width / 2)); top = below ? rect.bottom + 18 : Math.max(margin, rect.top - height - 18); }
      card.classList.toggle('is-below', below && !!rect); card.classList.toggle('is-above', !below && !!rect);
      card.style.width = `${width}px`; card.style.left = `${left}px`; card.style.top = `${top}px`;
    };
    positionCard();
    window.requestAnimationFrame(positionCard);
    overlay.querySelector('[data-next]').focus();
  };
  const finish = () => { localStorage.setItem(key(uid), 'done'); sessionStorage.removeItem(pendingKey(uid)); document.querySelectorAll('.mol-tour-target').forEach(el => el.classList.remove('mol-tour-target')); document.body.classList.remove('mol-tour-active'); document.documentElement.classList.remove('mol-tour-active'); overlay.remove(); active = null; };
  active = overlay; document.body.classList.add('mol-tour-active'); document.documentElement.classList.add('mol-tour-active'); document.body.appendChild(overlay); render();
}
export function setupOnboarding() {
  if (window.__molOnboarding) return;
  window.__molOnboarding = true;
  window.__molOpenOnboarding = () => { const user = auth.currentUser; if (user) openTour(user.uid, true); };
  onAuthStateChanged(auth, user => { if (!user || location.pathname.endsWith('/login.html')) return; window.setTimeout(() => { const pending = JSON.parse(sessionStorage.getItem(pendingKey(user.uid)) || 'null'); if (pending && Number.isInteger(pending.index) && steps[pending.index] && routeMatches(steps[pending.index].route)) { sessionStorage.removeItem(pendingKey(user.uid)); openTour(user.uid, true, pending.index); } else openTour(user.uid); }, 700); });
}
