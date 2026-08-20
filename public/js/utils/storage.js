export function getSessionItem(key) {
  try { return window.sessionStorage.getItem(key); }
  catch { return null; }
}

export function setSessionItem(key, value) {
  try { window.sessionStorage.setItem(key, value); return true; }
  catch (error) { console.warn('Cache da sessão indisponível:', error.message); return false; }
}

export function removeSessionItems(...keys) {
  try { keys.forEach(key => window.sessionStorage.removeItem(key)); return true; }
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
