// Espelho do treino em andamento (rascunho local) em treinoRascunho/{uid}, para continuar em outro aparelho.
// Vale o mais recente (atualizadoEm). Ao terminar/descartar fica um marcador (draft: null) para o outro aparelho não ressuscitar o treino.
import { getDb } from '../config/firebase-config.js';
import { getLocalItem, removeLocalItems, setLocalItem } from './storage.js';
import { withTimeout } from './timeout.js';

const COLLECTION = 'treinoRascunho';
const PUSH_EVERY_MS = 10000;
let lastPush = 0;
const localKey = uid => `mol-workout-draft-${uid}`;
const stamp = raw => { try { return new Date(JSON.parse(raw)?.atualizadoEm).getTime() || 0; } catch { return 0; } };

async function write(uid, draft, atualizadoEm) {
  const [db, { doc, setDoc }] = await Promise.all([getDb(), import('firebase/firestore')]);
  await setDoc(doc(db, COLLECTION, uid), { userId: uid, draft, atualizadoEm });
}

/** @param {string} raw rascunho já serializado (o mesmo gravado no aparelho) */
export function pushWorkoutDraft(uid, raw, { force = false } = {}) {
  if (!force && Date.now() - lastPush < PUSH_EVERY_MS) return;
  lastPush = Date.now();
  write(uid, raw, new Date().toISOString()).catch(error => console.warn('Treino em andamento não sincronizado:', error.message));
}

export function clearWorkoutDraftRemote(uid) {
  lastPush = 0;
  write(uid, null, new Date().toISOString()).catch(error => console.warn('Treino em andamento não sincronizado:', error.message));
}

/** Traz o rascunho da conta para o aparelho se for mais novo; devolve se há um treino em andamento. */
export async function pullWorkoutDraft(uid) {
  try {
    const [db, { doc, getDoc }] = await Promise.all([getDb(), import('firebase/firestore')]);
    const remote = (await withTimeout(getDoc(doc(db, COLLECTION, uid)), 'O treino em andamento')).data();
    if (!remote) return;
    const local = getLocalItem(localKey(uid));
    const remoteTime = new Date(remote.atualizadoEm).getTime() || 0;
    if (remote.draft == null) { if (local && remoteTime > stamp(local)) removeLocalItems(localKey(uid)); return; }
    if (!local || stamp(remote.draft) > stamp(local)) setLocalItem(localKey(uid), remote.draft);
  } catch (error) { console.warn('Treino em andamento da conta não carregado:', error.message); }
}
