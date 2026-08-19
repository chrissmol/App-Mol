import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { sessionMetrics } from '../modules/workout-analytics.js';
import { escapeHTML, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';

setupAppShell();

document.documentElement.setAttribute('translate', 'no');

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = './login.html';
  try {
  const snapshot = await getDocs(query(collection(db, 'sessoes'), where('userId', '==', user.uid)));
  const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.concluidoEm?.seconds || 0) - (a.concluidoEm?.seconds || 0));
  const dates = new Set(sessions.map(s => s.concluidoEm?.toDate?.().toDateString()));
  const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); const days = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  document.getElementById('calendar').innerHTML = `<div class="flex justify-between"><h2 class="font-bold">${now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</h2><span class="text-sm text-neon">${sessions.length} treinos</span></div><div class="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-gray-500">${['D','S','T','Q','Q','S','S'].map(d=>`<span>${d}</span>`).join('')}${Array(first.getDay()).fill('<span></span>').join('')}${Array.from({length:days},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth(),i+1); return `<span class="mx-auto flex h-8 w-8 items-center justify-center rounded-full ${dates.has(d.toDateString())?'bg-neon text-black font-bold':'text-gray-400'}">${i+1}</span>`}).join('')}</div>`;
  document.getElementById('sessions').innerHTML = sessions.length ? sessions.map(s => { const m=sessionMetrics(s); const date=s.concluidoEm?.toDate?.().toLocaleDateString('pt-BR') || 'Hoje'; return `<article class="glass-card rounded-2xl p-4"><div class="flex justify-between"><div><h3 class="font-bold">${escapeHTML(s.nomeRotina)}</h3><p class="mt-1 text-xs text-gray-500">${date} · ${m.sets} séries · ${Math.round(m.volume).toLocaleString('pt-BR')} kg</p></div><i data-lucide="check-circle-2" class="h-5 w-5 text-neon"></i></div></article>`; }).join('') : '<p class="py-10 text-center text-sm text-gray-500">Conclua um treino para construir seu histórico.</p>';
  lucide.createIcons();
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    document.getElementById('sessions').innerHTML = '<p class="py-10 text-center text-sm text-gray-500">Não foi possível carregar o histórico agora.</p>';
    showToast('Não foi possível carregar o histórico.');
  }
});
document.title = 'Mol';
document.head.insertAdjacentHTML('beforeend', '<link rel="icon" type="image/svg+xml" href="../assets/mol-mark.svg">');
