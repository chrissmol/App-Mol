import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase-config.js';

const version = 'v1';
const key = uid => `mol-onboarding-${version}-${uid}`;
const steps = [
  { title: 'Bem-vindo ao Mol', text: 'Um guia rápido para você aproveitar treino, dieta, evolução e seu perfil.', target: null },
  { title: 'Seu treino', text: 'Acesse suas rotinas, registre séries e acompanhe seu progresso de carga.', target: '[data-page="treino.html"]' },
  { title: 'Sua dieta', text: 'Planeje refeições, consulte nutrientes e configure sua janela de jejum.', target: '[data-page="dieta.html"]' },
  { title: 'Seu perfil', text: 'Veja conquistas, medidas, fotos de evolução e preferências do app.', target: '[data-page="perfil.html"]' },
  { title: 'Personalize o início', text: 'No botão Editar painel, escolha os cards e a ordem que fazem sentido para você.', target: '#btn-edit-dashboard' }
];
let active = null;
function openTour(uid, force = false) {
  if (!force && localStorage.getItem(key(uid)) === 'done') return;
  active?.remove();
  let index = 0;
  const overlay = document.createElement('div'); overlay.className = 'mol-tour-overlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'mol-tour-title');
  const render = () => {
    document.querySelectorAll('.mol-tour-target').forEach(el => el.classList.remove('mol-tour-target'));
    const step = steps[index]; const target = step.target ? document.querySelector(step.target) : null;
    if (target) { target.classList.add('mol-tour-target'); target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    overlay.innerHTML = `<section class="mol-tour-card"><div class="flex items-center justify-between gap-3"><span class="text-xs font-bold uppercase tracking-wider text-neon">Guia Mol · ${index + 1}/${steps.length}</span><button type="button" data-skip class="text-xs font-bold text-gray-400">Pular</button></div><div class="mt-3 flex gap-1.5" aria-label="Progresso do tutorial">${steps.map((_, stepIndex) => `<span class="h-1.5 flex-1 rounded-full ${stepIndex <= index ? 'bg-neon' : 'bg-white/10'}"></span>`).join('')}</div><h2 id="mol-tour-title" class="mt-4 text-xl font-extrabold">${step.title}</h2><p class="mt-2 text-sm leading-relaxed text-gray-400">${step.text}</p><div class="mt-5 flex items-center justify-between gap-3">${index ? '<button type="button" data-back class="min-h-11 rounded-xl mol-soft px-4 text-sm font-bold">Voltar</button>' : '<span></span>'}<button type="button" data-next class="min-h-11 rounded-xl bg-neon px-5 text-sm font-bold text-white">${index === steps.length - 1 ? 'Começar' : 'Continuar'}</button></div></section>`;
    overlay.querySelector('[data-skip]').onclick = finish;
    overlay.querySelector('[data-back]')?.addEventListener('click', () => { index -= 1; render(); });
    overlay.querySelector('[data-next]').onclick = () => { if (index === steps.length - 1) finish(); else { index += 1; render(); } };
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
  const finish = () => { localStorage.setItem(key(uid), 'done'); document.querySelectorAll('.mol-tour-target').forEach(el => el.classList.remove('mol-tour-target')); overlay.remove(); active = null; };
  active = overlay; document.body.appendChild(overlay); render();
}
export function setupOnboarding() {
  if (window.__molOnboarding) return;
  window.__molOnboarding = true;
  window.__molOpenOnboarding = () => { const user = auth.currentUser; if (user) openTour(user.uid, true); };
  onAuthStateChanged(auth, user => { if (!user || location.pathname.endsWith('/login.html')) return; window.setTimeout(() => openTour(user.uid), 700); });
}
