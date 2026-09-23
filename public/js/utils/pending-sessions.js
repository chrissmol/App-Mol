import { getLocalItem, setLocalItem } from './storage.js';

const KEY = 'mol-pending-sessions';

function read() {
  try { const list = JSON.parse(getLocalItem(KEY) || '[]'); return Array.isArray(list) ? list : []; }
  catch { return []; }
}

export function pendingSessions(uid) {
  return read().filter(item => item?.session?.userId === uid);
}

export function queueSession(entry) {
  return setLocalItem(KEY, JSON.stringify([...read(), entry].slice(-20)));
}

// Envia cada treino guardado com `send(entry)`; o que falhar continua na fila.
export async function flushPendingSessions(uid, send) {
  const mine = pendingSessions(uid);
  const failed = [];
  for (const entry of mine) {
    try { await send(entry); } catch { failed.push(entry); }
  }
  setLocalItem(KEY, JSON.stringify([...read().filter(item => item?.session?.userId !== uid), ...failed]));
  return mine.length - failed.length;
}
