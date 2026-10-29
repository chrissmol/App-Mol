import { LEGAL_DOCUMENTS } from '../modules/login-utils.js';

export function openLegalDocument(kind, opener) {
  document.getElementById('mol-legal-dialog')?.remove();
  const documentData = LEGAL_DOCUMENTS[kind];
  if (!documentData) return;
  const modal = document.createElement('div');
  modal.id = 'mol-legal-dialog';
  modal.className = 'fixed inset-0 z-[200] flex items-end bg-black/75 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
  modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="legal-title" aria-describedby="legal-updated" class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl mol-dialog-surface p-6"><h2 id="legal-title" class="text-xl font-extrabold"></h2><p id="legal-updated" class="mt-1 text-xs text-gray-500"></p><div data-sections class="mt-5 space-y-5 text-sm leading-relaxed text-gray-400"></div><button type="button" data-close class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Entendi</button></section>`;
  modal.querySelector('#legal-title').textContent = documentData.title;
  modal.querySelector('#legal-updated').textContent = documentData.updated;
  const sections = modal.querySelector('[data-sections]');
  documentData.sections.forEach(([title, copy]) => {
    const section = document.createElement('section');
    const heading = document.createElement('h3'); heading.className = 'font-bold text-white'; heading.textContent = title;
    const paragraph = document.createElement('p'); paragraph.className = 'mt-1'; paragraph.textContent = copy;
    section.append(heading, paragraph); sections.appendChild(section);
  });
  const close = () => { modal.remove(); opener?.focus(); };
  modal.querySelector('[data-close]').onclick = close;
  modal.onclick = event => { if (event.target === modal) close(); };
  modal.onkeydown = event => {
    if (event.key === 'Escape') return close();
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button:not(:disabled), a[href]')];
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.body.appendChild(modal);
  modal.querySelector('[data-close]').focus();
}
