const TRUSTED_DEVICE_KEY = 'mol-trusted-device';

export function isTrustedDevice() {
  try { return localStorage.getItem(TRUSTED_DEVICE_KEY) === 'true'; }
  catch { return false; }
}

export function setTrustedDevice(value) {
  try {
    localStorage.setItem(TRUSTED_DEVICE_KEY, value === true ? 'true' : 'false');
    return true;
  } catch (error) {
    console.warn('Preferência offline não armazenada:', error.message);
    return false;
  }
}

export function connectivityState(online = navigator.onLine) {
  return online
    ? { online: true, label: 'Online', message: 'Dados sincronizados pela internet.' }
    : { online: false, label: 'Offline', message: 'Alterações serão sincronizadas quando a conexão voltar.' };
}
