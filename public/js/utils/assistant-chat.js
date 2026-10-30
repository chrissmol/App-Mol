// Chat do assistente: usado na tela própria (assistente.html) e na gaveta
// aberta pelos botões da Dieta e do Treino. As mudanças só são gravadas
// quando a pessoa toca em "Confirmar" no cartão da proposta.
import { auth, getDb } from '../config/firebase-config.js';
import { createGeminiSend, describeAssistantError } from '../config/assistant-gemini.js';
import { ASSISTANT_SYSTEM_INSTRUCTION, ASSISTANT_TOOL_DECLARATIONS, MAX_MESSAGE_CHARS, createAssistantTools, memoryInstruction, runAssistantTurn, summarizeProposal } from '../modules/assistant.js';
import { ASSISTANT_FILE_ACCEPT, fileToPart, readExcelInBrowser } from '../modules/assistant-files.js';
import { activateDialog, escapeHTML, showToast } from './ui.js';
import { renderIcons } from './icons.js';
import { getLocalItem, setLocalItem } from './storage.js';
import { chatPetState, getPet, personaInstruction, petAvatarHTML, petAvatarSrc, petImageSrc, showPetMoment } from './pet.js';

const NOTICE_KEY = 'mol-assistant-notice-v1';
let chatCount = 0;
// any: renderIcons aceita qualquer nó, embora a assinatura diga Document.
const icons = node => renderIcons(/** @type {any} */ (node));
/** @returns {HTMLElement} */
const pick = (root, selector) => /** @type {HTMLElement} */ (root.querySelector(selector));

/** Negrito, listas e quebras de linha, sempre sobre texto já escapado. */
export function formatAssistantText(text) {
  const lines = escapeHTML(String(text || '')).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split('\n');
  let html = '';
  let inList = false;
  for (const line of lines) {
    const item = line.match(/^\s*[-*•]\s+(.*)$/);
    if (item && !inList) { html += '<ul>'; inList = true; }
    if (!item && inList) { html += '</ul>'; inList = false; }
    if (item) html += `<li>${item[1]}</li>`;
    else if (line.trim()) html += `<p>${line}</p>`;
  }
  return inList ? `${html}</ul>` : html;
}

const listHTML = lines => `<ul>${lines.map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ul>`;

/**
 * Monta o chat dentro de `container`.
 * @param {HTMLElement} container
 * @param {{ context?: string, intro?: string, suggestions?: string[], onDataChanged?: (tipo: string) => void, autofocus?: boolean }} [options]
 */
export function mountAssistantChat(container, { context = '', intro = '', suggestions = [], onDataChanged, autofocus = false, pickFile = '' } = {}) {
  const id = `assistant-${++chatCount}`;
  const pet = getPet();
  container.classList.add('assistant-chat');
  if (pet.id !== 'nenhum') { container.dataset.pet = pet.id; container.style.setProperty('--assistant-pet', `url("${petAvatarSrc(pet)}")`); }
  container.innerHTML = `
    <div class="assistant-notice" data-notice hidden>
      <p><strong>Antes de começar:</strong> as conversas passam pelo Gemini, do Google, que pode usá-las para melhorar os serviços dele. Envie só o necessário sobre a sua saúde.</p>
      <button type="button" class="mol-btn mol-btn-secondary" data-notice-ok>Entendi</button>
    </div>
    <button type="button" class="assistant-new" data-new hidden><i data-lucide="plus" aria-hidden="true"></i> Nova conversa</button>
    <ol class="assistant-messages" data-messages aria-live="polite" aria-label="Conversa com o assistente"></ol>
    <!-- Estado vazio no padrão dos apps de chat: saudação ao centro e sugestões logo acima da caixa. -->
    <section class="assistant-empty" data-empty aria-label="Comece uma conversa">
      ${pet.id === 'nenhum' ? '<span class="assistant-empty__icon" aria-hidden="true"><i data-lucide="sparkles"></i></span>' : petAvatarHTML(pet, { size: 48, className: 'assistant-empty__pet', label: true })}
      <h2 class="assistant-empty__title">Como posso ajudar?</h2>
      ${intro ? `<div class="assistant-empty__intro">${formatAssistantText(intro)}</div>` : ''}
      <div class="assistant-suggestions" data-suggestions>${suggestions.map(text => `<button type="button" class="assistant-chip" data-suggestion>${escapeHTML(text)}</button>`).join('')}</div>
    </section>
    <form class="assistant-composer" data-form>
      <div class="assistant-attachment" data-attachment hidden><i data-lucide="paperclip" aria-hidden="true"></i><span data-attachment-name></span><button type="button" class="assistant-icon-btn" data-attachment-remove aria-label="Remover anexo"><i data-lucide="x"></i></button></div>
      <div class="assistant-composer__row">
        <button type="button" class="assistant-icon-btn" data-attach aria-label="Anexar foto, PDF ou planilha"><i data-lucide="paperclip"></i></button>
        <label class="sr-only" for="${id}-input">Mensagem para o assistente</label>
        <textarea id="${id}-input" data-input rows="1" maxlength="${MAX_MESSAGE_CHARS}" placeholder="Escreva sua pergunta…" autocomplete="off"></textarea>
        <button type="submit" class="assistant-send" data-send aria-label="Enviar"><i data-lucide="send"></i></button>
      </div>
      <input type="file" data-file accept="${ASSISTANT_FILE_ACCEPT}" hidden>
    </form>
    <p class="assistant-disclaimer">A IA pode errar e não substitui médico, nutricionista ou educador físico.</p>`;
  const $ = selector => container.querySelector(selector);
  const messages = $('[data-messages]');
  const input = $('[data-input]');
  const form = $('[data-form]');
  const fileInput = $('[data-file]');
  let attachment = null;
  let busy = false;
  let sendPromise = null;
  let storePromise = null;
  let lastRequest = null;

  const notice = $('[data-notice]');
  if (!getLocalItem(NOTICE_KEY)) notice.hidden = false;
  $('[data-notice-ok]').onclick = () => { setLocalItem(NOTICE_KEY, '1'); notice.hidden = true; input.focus(); };

  function getStore() {
    storePromise ||= (async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('Entre na sua conta para usar o assistente.');
      const { createAssistantStore } = await import('../modules/assistant-store.js');
      return createAssistantStore(await getDb(), user.uid);
    })();
    return storePromise;
  }

  function getSend() {
    sendPromise ||= (async () => {
      // Preferências guardadas entram na instrução; sem elas a conversa segue normal.
      const memory = await getStore().then(store => store.loadMemory()).catch(() => []);
      const base = ASSISTANT_SYSTEM_INSTRUCTION + personaInstruction(pet) + memoryInstruction(memory);
      const systemInstruction = context ? `${base}\n\nCONTEXTO DA TELA: ${context}` : base;
      return createGeminiSend({ systemInstruction, toolDeclarations: ASSISTANT_TOOL_DECLARATIONS });
    })().catch(error => { sendPromise = null; throw error; });
    return sendPromise;
  }

  function scrollToEnd() {
    const last = messages.lastElementChild;
    last?.scrollIntoView?.({ block: 'end', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function addMessage(role, html) {
    const item = document.createElement('li');
    item.className = `assistant-msg assistant-msg--${role}`;
    item.innerHTML = html;
    messages.append(item);
    scrollToEnd();
    return item;
  }

  async function renderProposal(proposal, store) {
    let current = {};
    try {
      if (proposal.tipo === 'dieta') current = await store.loadDiet();
      if (proposal.tipo === 'rotina') current = { routines: await store.loadRoutines() };
    } catch { /* sem o "antes" o cartão ainda mostra o "depois" */ }
    const summary = summarizeProposal(proposal, current);
    const card = addMessage('proposal', `
      <article class="assistant-proposal" aria-label="${escapeHTML(summary.titulo)}">
        <p class="assistant-proposal__eyebrow"><i data-lucide="sparkles" aria-hidden="true"></i> Proposta do assistente</p>
        <h3>${escapeHTML(summary.titulo)}</h3>
        ${summary.resumo ? `<p class="assistant-proposal__summary">${escapeHTML(summary.resumo)}</p>` : ''}
        ${summary.antes.length ? `<div class="assistant-proposal__block assistant-proposal__block--before"><p>Antes</p>${listHTML(summary.antes)}${summary.totais?.antes ? `<p class="assistant-proposal__totals">${escapeHTML(summary.totais.antes)}</p>` : ''}</div>` : ''}
        <div class="assistant-proposal__block assistant-proposal__block--after"><p>${summary.antes.length ? 'Depois' : 'Vai ficar assim'}</p>${listHTML(summary.depois)}${summary.totais?.depois ? `<p class="assistant-proposal__totals">${escapeHTML(summary.totais.depois)}</p>` : ''}</div>
        <div class="assistant-proposal__actions" data-actions>
          <button type="button" class="mol-btn mol-btn-secondary" data-discard>Descartar</button>
          <button type="button" class="mol-btn mol-btn-primary" data-confirm>Confirmar</button>
        </div>
      </article>`);
    icons(card);
    const actions = pick(card, '[data-actions]');
    // Os botões somem ao responder: o foco vai para o aviso que os substitui, não para o topo da página.
    const showStatus = html => { actions.innerHTML = html; icons(actions); pick(actions, '[data-undo]')?.focus() ?? pick(actions, '.assistant-proposal__status').focus(); };
    pick(card, '[data-discard]').onclick = () => showStatus('<p class="assistant-proposal__status" tabindex="-1">Descartada. Nada foi alterado.</p>');
    pick(card, '[data-confirm]').onclick = async event => {
      const button = /** @type {HTMLButtonElement} */ (event.currentTarget);
      button.disabled = true;
      try {
        const undo = await store.applyProposal(proposal);
        onDataChanged?.(proposal.tipo);
        showStatus('<p class="assistant-proposal__status assistant-proposal__status--ok"><i data-lucide="check-circle-2" aria-hidden="true"></i> Salvo.</p><button type="button" class="mol-btn mol-btn-secondary" data-undo><i data-lucide="undo-2" aria-hidden="true"></i> Desfazer</button>');
        showPetMoment({ state: 'animado', message: 'Alteração salva.' });
        pick(actions, '[data-undo]').onclick = async () => {
          try { await undo(); onDataChanged?.(proposal.tipo); showStatus('<p class="assistant-proposal__status" tabindex="-1">Desfeito. Voltou como estava.</p>'); showToast('Alteração desfeita.', 'success'); }
          catch (error) { console.error('[Mol] Desfazer falhou:', error); showToast('Não foi possível desfazer agora.'); }
        };
      } catch (error) {
        console.error('[Mol] Proposta não salva:', error);
        button.disabled = false;
        showToast(error?.code === 'permission-denied' ? 'Os dados passam dos limites permitidos.' : 'Não foi possível salvar agora.');
      }
    };
  }

  function newConversation() {
    if (busy) return;
    messages.innerHTML = '';
    sendPromise = null;
    lastRequest = null;
    setAttachment(null);
    $('[data-empty]').hidden = false;
    $('[data-new]').hidden = true;
    container.classList.remove('assistant-chat--active');
    showToast('Nova conversa iniciada.', 'success');
    input.focus();
  }

  async function copyReply(text, button) {
    try { await navigator.clipboard.writeText(text); showToast('Resposta copiada.', 'success'); button.focus(); }
    catch { showToast('Não foi possível copiar a resposta.'); }
  }

  function showError(item, text) {
    item.classList.add('assistant-msg--error');
    item.innerHTML = `<i data-lucide="triangle-alert" aria-hidden="true"></i><div><span>${escapeHTML(text)}</span><br><button type="button" class="assistant-action" data-retry><i data-lucide="rotate-ccw" aria-hidden="true"></i> Tentar de novo</button></div>`;
    icons(item);
    pick(item, '[data-retry]').onclick = () => {
      if (busy || !lastRequest) return;
      item.previousElementSibling?.remove();
      item.remove();
      setAttachment(lastRequest.attachment);
      submit(lastRequest.message);
    };
  }

  function setAttachment(value) {
    attachment = value;
    $('[data-attachment]').hidden = !value;
    $('[data-attachment-name]').textContent = value?.name || '';
  }

  async function submit(text) {
    const message = String(text || '').trim();
    if (busy || (!message && !attachment)) return;
    busy = true;
    $('[data-send]').disabled = true;
    $('[data-empty]').hidden = true;
    $('[data-new]').hidden = false;
    $('[data-new]').disabled = true;
    container.classList.add('assistant-chat--active');
    const sentAttachment = attachment;
    lastRequest = { message, attachment: sentAttachment };
    addMessage('user', `${message ? formatAssistantText(message) : ''}${sentAttachment ? `<p class="assistant-msg__file"><i data-lucide="paperclip" aria-hidden="true"></i> ${escapeHTML(sentAttachment.name)}</p>` : ''}`);
    icons(messages.lastElementChild);
    input.value = '';
    input.style.height = '';
    setAttachment(null);
    const typing = addMessage('assistant', `<span class="assistant-typing"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">${escapeHTML(pet.name)} está escrevendo</span></span>`);
    // O avatar ao lado da resposta muda de estado: focado escrevendo, depois apoio, curioso ou feliz.
    const setPetState = state => { if (pet.id !== 'nenhum') typing.style.setProperty('--assistant-pet', `url("${petImageSrc(pet, state, { small: true })}")`); };
    setPetState('focado');
    let rewind = () => {};
    try {
      const [send, store] = await Promise.all([getSend(), getStore()]);
      rewind = () => send.rewind?.();
      send.mark?.();
      const { executors, proposals, sources } = createAssistantTools({ loadDiet: store.loadDiet, loadRoutines: store.loadRoutines, loadDiary: store.loadDiary, loadMemory: store.loadMemory });
      const attachments = sentAttachment ? [await fileToPart(sentAttachment.file, { readExcel: readExcelInBrowser })] : [];
      const result = await runAssistantTurn({ send, executors, message, attachments });
      const links = sources.length ? `<p class="assistant-sources">Fontes: ${sources.map(source => `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.titulo || source.fonte)}</a>`).join(' · ')}</p>` : '';
      typing.innerHTML = formatAssistantText(result.text || 'Pronto.') + links + '<button type="button" class="assistant-action" data-copy><i data-lucide="copy" aria-hidden="true"></i> Copiar resposta</button>';
      icons(typing);
      pick(typing, '[data-copy]').onclick = event => copyReply(result.text || 'Pronto.', /** @type {HTMLElement} */ (event.currentTarget));
      setPetState(chatPetState(message, result.text));
      for (const proposal of proposals) await renderProposal(proposal, store);
    } catch (error) {
      console.error('[Mol] Assistente falhou:', error);
      rewind();
      showError(typing, error?.message?.startsWith('Entre na sua conta') || /Formato|7 MB|Excel/.test(error?.message || '') ? error.message : describeAssistantError(error));
    } finally {
      busy = false;
      $('[data-new]').disabled = false;
      $('[data-send]').disabled = false;
      scrollToEnd();
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submit(input.value); }
  });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = `${Math.min(input.scrollHeight, 160)}px`; });
  container.querySelectorAll('[data-suggestion]').forEach(button => { button.addEventListener('click', () => submit(button.textContent)); });
  $('[data-new]').onclick = newConversation;
  $('[data-attach]').onclick = () => fileInput.click();
  $('[data-attachment-remove]').onclick = () => { setAttachment(null); fileInput.value = ''; };
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) setAttachment({ file, name: file.name });
    fileInput.value = '';
    input.focus();
  });
  icons(container);
  // pickFile: abre o seletor já no clique (o navegador só deixa dentro do gesto) e deixa o pedido escrito.
  if (pickFile) { input.value = pickFile; fileInput.click(); }
  if (autofocus) requestAnimationFrame(() => input.focus());
  return { submit };
}

/**
 * Gaveta com o chat, aberta pelos botões da Dieta e do Treino.
 * @param {{ title?: string, context?: string, intro?: string, suggestions?: string[], onDataChanged?: (tipo: string) => void }} [options]
 */
export function openAssistantSheet({ title = 'Assistente', ...options } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'assistant-sheet-overlay';
  overlay.innerHTML = `<section class="assistant-sheet" role="dialog" aria-modal="true" aria-labelledby="assistant-sheet-title">
    <header class="assistant-sheet__header"><h2 id="assistant-sheet-title"><i data-lucide="sparkles" aria-hidden="true"></i> ${escapeHTML(title)}</h2><button type="button" class="assistant-icon-btn" data-close aria-label="Fechar assistente"><i data-lucide="x"></i></button></header>
    <div class="assistant-sheet__body" data-chat></div>
  </section>`;
  document.body.append(overlay);
  const close = activateDialog(overlay, { initialFocus: null });
  mountAssistantChat(overlay.querySelector('[data-chat]'), { ...options, autofocus: true });
  overlay.querySelector('[data-close]').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  icons(overlay);
  return close;
}

/**
 * Botão "Ajustar com o assistente" para colocar dentro de outras telas.
 * @param {string} label
 * @param {{ block?: boolean, title?: string, context?: string, intro?: string, suggestions?: string[], onDataChanged?: (tipo: string) => void }} [options]
 */
export function createAssistantButton(label, { block = false, ...options } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = block ? 'assistant-entry assistant-entry--block' : 'assistant-entry';
  button.innerHTML = `<i data-lucide="sparkles" aria-hidden="true"></i><span>${escapeHTML(label)}</span>`;
  button.addEventListener('click', () => openAssistantSheet(options));
  return button;
}
