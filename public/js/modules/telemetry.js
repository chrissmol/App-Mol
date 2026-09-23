import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config.js';

const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const presenceRef = uid => doc(db, 'presence', uid);
let currentUser = null;
let heartbeat = 0;
let errorQueue = [];
const MAX_ERROR_QUEUE = 20;
const ERROR_DEDUP_WINDOW_MS = 60 * 1000;
const recentErrors = new Map();
// Retenção de 90 dias: tempo de sobra pra investigar um bug relatado
// sem guardar e-mail/stack de usuário indefinidamente. A limpeza em si
// depende de uma política de TTL ativada no console do Firestore para
// o campo expiresAt (não configurável por regra nem por código).
const CLIENT_ERROR_TTL_DAYS = 90;

function isAdmin(user) { return String(user?.email || '').toLowerCase() === ADMIN_EMAIL; }
function safeText(value, max = 2000) { return String(value || '').slice(0, max); }
async function writePresence(online) {
  if (!currentUser) return;
  try { await setDoc(presenceRef(currentUser.uid), { userId: currentUser.uid, email: safeText(currentUser.email, 254), name: safeText(currentUser.displayName || 'Usuário', 80), page: location.pathname, online, lastSeen: serverTimestamp() }, { merge: true }); } catch { /* telemetria nunca interrompe o app */ }
}
async function flushError(error) {
  if (!currentUser || isAdmin(currentUser)) return;
  const message = safeText(error.message || error, 1000);
  const dedupKey = `${location.pathname}:${message}`;
  const previous = recentErrors.get(dedupKey) || 0;
  if (Date.now() - previous < ERROR_DEDUP_WINDOW_MS) return;
  recentErrors.set(dedupKey, Date.now());
  if (recentErrors.size > 100) recentErrors.delete(recentErrors.keys().next().value);
  const expiresAt = Timestamp.fromMillis(Date.now() + CLIENT_ERROR_TTL_DAYS * 24 * 60 * 60 * 1000);
  const payload = { userId: currentUser.uid, email: safeText(currentUser.email, 254), message, stack: safeText(error.stack, 4000), page: location.pathname, url: safeText(`${location.origin}${location.pathname}`, 500), userAgent: navigator.userAgent.slice(0, 500), createdAt: serverTimestamp(), expiresAt };
  try { await addDoc(collection(db, 'clientErrors'), payload); } catch { errorQueue.push(payload); if (errorQueue.length > MAX_ERROR_QUEUE) errorQueue.shift(); }
}
async function retryQueuedErrors() {
  if (!currentUser || isAdmin(currentUser) || !errorQueue.length) return;
  const pending = errorQueue.splice(0, MAX_ERROR_QUEUE);
  for (const payload of pending) {
    try { await addDoc(collection(db, 'clientErrors'), payload); }
    catch { errorQueue.unshift(payload); break; }
  }
}
function captureError(message, source, line, column, error) { void flushError({ message: `${message}${source ? ` (${source}:${line || 0}:${column || 0})` : ''}`, stack: error?.stack }); }
export function setupTelemetry() {
  if (window.__molTelemetry) return;
  window.__molTelemetry = true;
  window.addEventListener('error', event => captureError(event.message, event.filename, event.lineno, event.colno, event.error));
  window.addEventListener('unhandledrejection', event => { void flushError(event.reason instanceof Error ? event.reason : { message: event.reason }); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void writePresence(true); });
  window.addEventListener('pagehide', () => { void writePresence(false); });
  onAuthStateChanged(auth, async user => { currentUser = user; clearInterval(heartbeat); if (!user) { errorQueue = []; recentErrors.clear(); return; } await writePresence(true); await retryQueuedErrors(); heartbeat = window.setInterval(() => { void writePresence(true); void retryQueuedErrors(); }, 90000); });
}
