import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, limit, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config.js';
import { setupAppShell } from '../utils/app-shell.js';

const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const $ = id => document.getElementById(id);
setupAppShell();
const back = document.createElement('a');
back.href = './perfil.html';
back.className = 'mol-btn mol-btn-secondary min-h-9 rounded-xl px-3 text-xs';
back.textContent = 'Voltar ao perfil';
back.setAttribute('aria-label', 'Voltar ao perfil');
document.querySelector('header')?.prepend(back);
let errors = [];
const fmt = value => value?.toDate ? value.toDate().toLocaleString('pt-BR') : 'agora';
function denied() { $('admin-status').textContent = 'Acesso restrito ao administrador.'; }
function renderPresence(snapshot) { const active = snapshot.docs.map(item => ({ id: item.id, ...item.data() })).filter(item => item.online && (!item.lastSeen?.toDate || Date.now() - item.lastSeen.toDate().getTime() < 90000)); $('active-count').textContent = active.length; $('presence-updated').textContent = `Atualizado ${new Date().toLocaleTimeString('pt-BR')}`; $('presence-list').innerHTML = active.length ? active.map(item => `<article class="glass-card flex items-center justify-between gap-4 rounded-2xl p-4"><div><strong class="block text-sm">${item.name || 'Usuário'}</strong><span class="text-xs text-gray-500">${item.email || ''} · ${item.page || '/'}</span></div><span class="h-2.5 w-2.5 rounded-full bg-neon shadow-glow-sm" aria-label="online"></span></article>`).join('') : '<p class="rounded-2xl mol-soft p-4 text-sm text-gray-500">Nenhum usuário ativo agora.</p>'; }
function renderErrors() { $('error-count').textContent = errors.length; $('error-list').innerHTML = errors.length ? errors.map(item => `<article class="glass-card rounded-2xl p-4"><div class="flex items-start justify-between gap-3"><strong class="text-sm text-red-300">${item.message || 'Erro sem mensagem'}</strong><time class="shrink-0 text-[10px] text-gray-500">${fmt(item.createdAt)}</time></div><p class="mt-2 break-all text-xs text-gray-400">${item.email || ''} · ${item.page || ''}</p><details class="mt-2 text-xs text-gray-500"><summary>Detalhes</summary><pre class="mt-2 max-h-32 overflow-auto whitespace-pre-wrap">${item.stack || 'Sem stack trace'}</pre></details></article>`).join('') : '<p class="rounded-2xl mol-soft p-4 text-sm text-gray-500">Nenhum erro registrado.</p>'; }
onAuthStateChanged(auth, user => { if (!user || String(user.email || '').toLowerCase() !== ADMIN_EMAIL) return denied(); $('admin-status').classList.add('hidden'); $('admin-content').classList.remove('hidden'); onSnapshot(collection(db, 'presence'), renderPresence, () => { $('presence-list').innerHTML = '<p class="text-sm text-gray-500">Não foi possível carregar a presença.</p>'; }); onSnapshot(query(collection(db, 'clientErrors'), limit(100)), snapshot => { errors = snapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)); renderErrors(); }, () => { $('error-list').innerHTML = '<p class="text-sm text-gray-500">Não foi possível carregar os erros.</p>'; }); });
$('clear-errors').onclick = async () => { const copy = [...errors]; for (const item of copy) await deleteDoc(doc(db, 'clientErrors', item.id)); };
