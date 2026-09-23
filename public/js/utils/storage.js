// Caches de dados (mol-*-cache-*) ficam no localStorage: sobrevivem ao fechar o app e as
// telas abrem já preenchidas. Precisam ser apagados no logout (clearUserCaches).
const cacheArea = key => String(key).includes('-cache-') ? window.localStorage : window.sessionStorage;

export function clearUserCaches() {
  try { Object.keys(window.localStorage).filter(key => /^mol-.*-cache-/.test(key)).forEach(key => window.localStorage.removeItem(key)); }
  catch (error) { console.warn('Caches locais não puderam ser limpos:', error.message); }
}

export function getSessionItem(key) {
  try { return cacheArea(key).getItem(key); }
  catch { return null; }
}

export function setSessionItem(key, value) {
  try { cacheArea(key).setItem(key, value); return true; }
  catch (error) { console.warn('Cache da sessão indisponível:', error.message); return false; }
}

export function removeSessionItems(...keys) {
  try { keys.forEach(key => cacheArea(key).removeItem(key)); return true; }
  catch (error) { console.warn('Cache da sessão não pôde ser limpo:', error.message); return false; }
}

export function getLocalItem(key) {
  try { return window.localStorage.getItem(key); }
  catch { return null; }
}

export function setLocalItem(key, value) {
  try { window.localStorage.setItem(key, value); return true; }
  catch (error) { console.warn('Armazenamento local indisponível:', error.message); return false; }
}

export function removeLocalItems(...keys) {
  try { keys.forEach(key => window.localStorage.removeItem(key)); return true; }
  catch (error) { console.warn('Dados locais não puderam ser removidos:', error.message); return false; }
}

export function removeLocalItemsWithPrefix(prefix) {
  try {
    Object.keys(window.localStorage).filter(key => key.startsWith(prefix)).forEach(key => window.localStorage.removeItem(key));
    return true;
  } catch (error) { console.warn('Dados locais não puderam ser limpos:', error.message); return false; }
}
