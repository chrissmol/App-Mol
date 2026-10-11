// Barra "Treino em andamento" nas outras telas: quem sai do treino no meio da sessão volta com um toque.
// O rascunho da sessão já fica no aparelho (mol-workout-draft-{uid}); a barra só lê e leva de volta.
import { renderIcons } from './icons.js';
import { getLocalItem } from './storage.js';

const STALE_MS = 12 * 60 * 60 * 1000; // sessão parada há mais de 12 h não é "em andamento"

/** Rascunho válido para a barra, ou null. Exportado para teste. */
export function activeWorkoutFrom(raw, now = Date.now()) {
  let draft;
  try { draft = JSON.parse(raw || 'null'); } catch { return null; }
  const started = new Date(draft?.iniciadaEm).getTime();
  const updated = new Date(draft?.atualizadoEm).getTime();
  if (draft?.versao !== 2 || !Number.isFinite(started) || !Number.isFinite(updated) || now - updated > STALE_MS) return null;
  return { name: String(draft.nomeRotina || 'Treino').slice(0, 60), startedAt: started };
}

export const formatElapsed = seconds => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(hours ? 2 : 1, '0');
  return `${hours ? `${hours}:` : ''}${minutes}:${String(total % 60).padStart(2, '0')}`;
};

let timer = 0;

export async function setupActiveWorkoutBar() {
  // Treino: já é a sessão. Início: o cartão "Treino em andamento" já faz esse papel.
  if (/\/(treino\.html|index\.html)?$/.test(location.pathname) && !location.pathname.endsWith('/pages/')) return;
  const { watchAuthState } = await import('../modules/auth.js');
  watchAuthState(user => {
    clearInterval(timer);
    document.getElementById('mol-active-workout')?.remove();
    document.body.classList.remove('has-active-workout');
    const active = user && activeWorkoutFrom(getLocalItem(`mol-workout-draft-${user.uid}`));
    if (!active) return;
    const inPages = location.pathname.includes('/pages/');
    const bar = document.createElement('a');
    bar.id = 'mol-active-workout';
    bar.className = 'mol-active-workout';
    bar.href = `${inPages ? './' : './pages/'}treino.html?retomar=1`;
    bar.innerHTML = `<i data-lucide="dumbbell" aria-hidden="true"></i><span class="min-w-0 flex-1"><strong>Treino em andamento</strong><span class="block truncate"></span></span><span class="mol-active-workout__time" aria-hidden="true"></span><span class="mol-active-workout__go">Voltar</span>`;
    bar.querySelector('.block').textContent = active.name;
    const time = bar.querySelector('.mol-active-workout__time');
    const tick = () => { time.textContent = formatElapsed((Date.now() - active.startedAt) / 1000); };
    tick();
    timer = window.setInterval(tick, 1000);
    document.body.append(bar);
    document.body.classList.add('has-active-workout');
    renderIcons(/** @type {any} */ (bar));
  });
}
