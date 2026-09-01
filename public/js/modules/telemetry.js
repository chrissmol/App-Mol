import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config.js';

const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const presenceRef = uid => doc(db, 'presence', uid);
let currentUser = null;
let heartbeat = 0;
let errorQueue = [];

function isAdmin(user) { return String(user?.email || '').toLowerCase() === ADMIN_EMAIL; }
function safeText(value, max = 2000) { return String(value || '').slice(0, max); }
async function writePresence(online) {
  if (!currentUser) return;
  try { await setDoc(presenceRef(currentUser.uid), { userId: currentUser.uid, email: safeText(currentUser.email, 254), name: safeText(currentUser.displayName || 'Usuário', 80), page: location.pathname, online, lastSeen: serverTimestamp() }, { merge: true }); } catch { /* telemetria nunca interrompe o app */ }
}
async function flushError(error) {
  if (!currentUser || isAdmin(currentUser)) return;
  const payload = { userId: currentUser.uid, email: safeText(currentUser.email, 254), message: safeText(error.message || error, 1000), stack: safeText(error.stack, 4000), page: location.pathname, url: location.href.slice(0, 1000), userAgent: navigator.userAgent.slice(0, 500), createdAt: serverTimestamp() };
  try { await addDoc(collection(db, 'clientErrors'), payload); } catch { errorQueue.push(payload); }
}
function captureError(message, source, line, column, error) { void flushError({ message: `${message}${source ? ` (${source}:${line || 0}:${column || 0})` : ''}`, stack: error?.stack }); }
export function setupTelemetry() {
  if (window.__molTelemetry) return;
  window.__molTelemetry = true;
  window.addEventListener('error', event => captureError(event.message, event.filename, event.lineno, event.colno, event.error));
  window.addEventListener('unhandledrejection', event => { void flushError(event.reason instanceof Error ? event.reason : { message: event.reason }); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void writePresence(true); });
  window.addEventListener('pagehide', () => { void writePresence(false); });
  onAuthStateChanged(auth, async user => { currentUser = user; clearInterval(heartbeat); errorQueue = []; if (!user) return; await writePresence(true); heartbeat = window.setInterval(() => void writePresence(true), 30000); });
}
