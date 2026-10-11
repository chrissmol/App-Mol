// Leitor de código de barras pela câmera. Usa o BarcodeDetector nativo (Chrome e Android) e,
// onde ele não existe (Safari/iPhone), o mesmo leitor em WebAssembly servido pelo próprio app.
import { activateDialog } from './ui.js';
import { renderIcons } from './icons.js';

/** @type {any[]} */
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
const VALID_CODE = /^\d{8,14}$/;

async function createDetector() {
  const Native = /** @type {any} */ (window).BarcodeDetector;
  if (Native) {
    const supported = await Native.getSupportedFormats().catch(() => []);
    if (FORMATS.some(format => supported.includes(format))) return new Native({ formats: FORMATS });
  }
  const [{ BarcodeDetector, prepareZXingModule }, { default: wasmUrl }] = await Promise.all([
    import('barcode-detector/ponyfill'),
    import('zxing-wasm/reader/zxing_reader.wasm?url')
  ]);
  // O .wasm vem do próprio app (a CSP não libera CDN e funciona offline depois da primeira vez).
  prepareZXingModule({ overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) } });
  return new BarcodeDetector({ formats: FORMATS });
}

const cameraMessage = error => (error?.name === 'NotAllowedError'
  ? 'A câmera está bloqueada. Libere nas configurações do navegador ou digite o código abaixo.'
  : 'Não foi possível abrir a câmera. Digite o código abaixo.');

/**
 * Abre a câmera e chama `onCode(codigo)` com o primeiro código válido (8 a 14 números).
 * Sempre oferece digitar o código, para quem não tem câmera ou não quer liberar.
 * @param {{ onCode: (code: string) => void }} options
 */
export function openBarcodeScanner({ onCode }) {
  const overlay = document.createElement('div');
  overlay.className = 'barcode-overlay';
  overlay.setAttribute('aria-labelledby', 'barcode-title');
  overlay.innerHTML = `<section class="barcode-sheet">
    <header class="flex items-center justify-between gap-3"><h2 id="barcode-title" class="text-xl font-extrabold">Ler código de barras</h2><button type="button" class="assistant-icon-btn" data-close aria-label="Fechar leitor"><i data-lucide="x"></i></button></header>
    <div class="barcode-view"><video data-video playsinline muted aria-hidden="true"></video><span class="barcode-frame" aria-hidden="true"></span></div>
    <p class="mt-3 text-sm text-gray-400" data-status role="status">Abrindo a câmera…</p>
    <form class="mt-4 flex gap-2" data-manual><label class="sr-only" for="barcode-manual">Código de barras</label><input id="barcode-manual" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="Ou digite o código" class="min-h-12 min-w-0 flex-1 rounded-xl mol-field px-4"><button type="submit" class="mol-btn mol-btn-secondary min-h-12 rounded-xl px-4">Buscar</button></form>
  </section>`;
  document.body.append(overlay);
  const $ = selector => /** @type {any} */ (overlay.querySelector(selector));
  const video = $('[data-video]');
  const status = $('[data-status]');
  let stream = null;
  let timer = 0;
  let done = false;

  const stop = () => {
    done = true;
    clearTimeout(timer);
    stream?.getTracks().forEach(track => track.stop());
  };
  const close = activateDialog(overlay, { initialFocus: null, onCancel: () => { stop(); close(); } });
  const finish = code => { stop(); close(); onCode(code); };
  $('[data-close]').addEventListener('click', () => { stop(); close(); });
  $('[data-manual]').addEventListener('submit', event => {
    event.preventDefault();
    const code = $('#barcode-manual').value.replace(/\D/g, '');
    if (!VALID_CODE.test(code)) { status.textContent = 'O código tem de 8 a 14 números.'; return; }
    finish(code);
  });
  renderIcons(/** @type {any} */ (overlay));

  (async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('sem câmera');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (done) return stop();
      video.srcObject = stream;
      await video.play();
      status.textContent = 'Aponte para o código de barras da embalagem.';
      const detector = await createDetector();
      const scan = async () => {
        if (done) return;
        try {
          const found = (await detector.detect(video)).map(item => item.rawValue).find(value => VALID_CODE.test(value));
          if (found) return finish(found);
        } catch { /* quadro ainda sem imagem: tenta no próximo */ }
        timer = window.setTimeout(scan, 250);
      };
      scan();
    } catch (error) {
      if (done) return;
      status.textContent = cameraMessage(error);
      $('.barcode-view').hidden = true;
      $('#barcode-manual').focus();
    }
  })();
}
