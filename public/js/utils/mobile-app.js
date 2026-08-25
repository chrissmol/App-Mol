const APP_VIEWPORT = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';

function ensureMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function isEditableTarget(target) {
  return target?.closest?.('input, textarea, select, [contenteditable="true"]');
}

function preventZoomGesture(event) {
  if (!isEditableTarget(event.target)) event.preventDefault();
}

export function setupMobileAppMode() {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.content = APP_VIEWPORT;

  ensureMeta('mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  ensureMeta('format-detection', 'telephone=no,date=no,address=no,email=no');

  document.documentElement.classList.add('mol-mobile-app');
  const isStandalone = window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
  document.documentElement.classList.toggle('mol-standalone', Boolean(isStandalone));

  if (window.__molMobileAppMode) return;
  window.__molMobileAppMode = true;

  ['gesturestart', 'gesturechange', 'gestureend'].forEach(type => {
    document.addEventListener(type, preventZoomGesture, { passive: false });
  });

  document.addEventListener('touchmove', event => {
    if (event.touches?.length > 1) preventZoomGesture(event);
  }, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', event => {
    const now = Date.now();
    if (now - lastTouchEnd <= 350 && !isEditableTarget(event.target)) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('dblclick', preventZoomGesture, { passive: false });

  window.visualViewport?.addEventListener('resize', () => {
    const keyboardLikelyOpen = window.visualViewport.height < window.innerHeight * 0.78;
    document.body.classList.toggle('mol-keyboard-open', keyboardLikelyOpen);
  });
}
