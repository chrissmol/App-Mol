import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let currentUser;
const $ = (id) => document.getElementById(id);
const collectionsToBackup = ['treinos', 'sessoes', 'pesos', 'dietas'];
const numericValue = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

function addPreferences() {
  if ($('restore-file')) return;
  const host = $('save').closest('section');
  host.insertAdjacentHTML('afterend', `
    <section class="glass-card mt-4 rounded-3xl p-5">
      <h2 class="font-bold">Unidades</h2>
      <p class="mt-1 text-sm text-gray-500">Escolha como prefere ver peso e altura.</p>
      <div class="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Unidades de medida">
        <button data-unit="kg" class="unit min-h-11 rounded-xl text-sm font-bold">kg / cm</button>
        <button data-unit="lb" class="unit min-h-11 rounded-xl text-sm font-bold">lb / ft</button>
      </div>
    </section>
    <section class="glass-card mt-4 rounded-3xl p-5">
      <h2 class="font-bold">Privacidade e backup</h2>
      <p class="mt-1 text-sm text-gray-500">Os seus dados pertencem à sua conta. Nenhum perfil ou estatística fica público por padrão.</p>
      <label class="mt-4 flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 text-sm">
        <span>Manter perfil privado</span>
        <input id="profile-private" type="checkbox" class="h-5 w-5 accent-neon">
      </label>
      <label class="mt-2 flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 text-sm">
        <span>Compartilhar estatísticas</span>
        <input id="share-stats" type="checkbox" class="h-5 w-5 accent-neon">
      </label>
      <input id="restore-file" class="mt-4 block w-full text-sm" type="file" accept="application/json,.json" aria-label="Selecionar arquivo de backup">
      <p class="mt-2 text-xs text-gray-500">A restauração adiciona os registros à conta atual; ela não apaga o que você já tem.</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button id="export" class="min-h-12 rounded-xl bg-white/5 text-sm font-bold">Exportar</button>
        <button id="restore" class="min-h-12 rounded-xl bg-neon text-sm font-bold text-black">Restaurar</button>
      </div>
    </section>`);
}

function updateUnitButtons(unit) {
  document.querySelectorAll('.unit').forEach((button) => {
    const selected = button.dataset.unit === unit;
    button.classList.toggle('bg-neon', selected);
    button.classList.toggle('text-black', selected);
    button.classList.toggle('bg-white/5', !selected);
    button.classList.toggle('text-gray-300', !selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

async function exportBackup(profile) {
  const records = await Promise.all(collectionsToBackup.map(async (name) => {
    const snapshot = await getDocs(query(collection(db, name), where('userId', '==', currentUser.uid)));
    return [name, snapshot.docs.map((item) => item.data())];
  }));
  const backup = { versao: 1, criadoEm: new Date().toISOString(), perfil, dados: Object.fromEntries(records) };
  const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = `mol-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function validateBackup(backup) {
  if (backup?.versao !== 1 || !backup.dados || typeof backup.dados !== 'object') throw new Error('Arquivo inválido');
  const total = collectionsToBackup.reduce((count, name) => {
    if (!Array.isArray(backup.dados[name] || [])) throw new Error('Estrutura inválida');
    return count + (backup.dados[name] || []).length;
  }, 0);
  if (total > 1000) throw new Error('Backup muito grande');
}

function restoreValue(value) {
  if (Array.isArray(value)) return value.map(restoreValue);
  if (!value || typeof value !== 'object') return value;
  if (Object.keys(value).every((key) => key === 'seconds' || key === 'nanoseconds' || key === 'type') && Number.isFinite(Number(value.seconds)) && Number.isFinite(Number(value.nanoseconds))) {
    return new Timestamp(Number(value.seconds), Number(value.nanoseconds));
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, restoreValue(item)]));
}

async function restoreBackup() {
  const file = $('restore-file').files[0];
  if (!file) throw new Error('Escolha um arquivo');
  const backup = JSON.parse(await file.text());
  validateBackup(backup);
  if (!confirm('A restauração adiciona os dados do backup à conta atual e não remove dados existentes. Continuar?')) return false;
  for (const name of collectionsToBackup) {
    for (const item of backup.dados[name] || []) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Registro inválido');
      const record = { ...restoreValue(item), userId: currentUser.uid };
      await addDoc(collection(db, name), record);
    }
  }
  if (backup.perfil && typeof backup.perfil === 'object' && !Array.isArray(backup.perfil)) {
    await setDoc(doc(db, 'users', currentUser.uid), restoreValue(backup.perfil), { merge: true });
  }
  return true;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { location.href = './login.html'; return; }
  currentUser = user;
  const profile = (await getDoc(doc(db, 'users', user.uid))).data() || {};
  $('height').value = profile.alturaCm || '';
  $('goal-weight').value = profile.metaPesoKg || '';
  $('goal').value = profile.objetivo || '';
  $('weekly').value = profile.metaSemanal || '';
  addPreferences();
  updateUnitButtons(profile.unidades || 'kg');
  $('profile-private').checked = profile.privacidade?.perfilPrivado !== false;
  $('share-stats').checked = profile.privacidade?.compartilharEstatisticas === true;
  document.querySelectorAll('.unit').forEach((button) => {
    button.onclick = async () => {
      await setDoc(doc(db, 'users', user.uid), { unidades: button.dataset.unit }, { merge: true });
      updateUnitButtons(button.dataset.unit);
    };
  });
  $('profile-private').onchange = (event) => setDoc(doc(db, 'users', user.uid), { privacidade: { ...profile.privacidade, perfilPrivado: event.target.checked } }, { merge: true });
  $('share-stats').onchange = (event) => setDoc(doc(db, 'users', user.uid), { privacidade: { ...profile.privacidade, compartilharEstatisticas: event.target.checked } }, { merge: true });
  $('export').onclick = () => exportBackup(profile).catch(() => alert('Não foi possível exportar seus dados agora.'));
  $('restore').onclick = () => restoreBackup().then((restored) => { if (restored) alert('Backup restaurado com sucesso.'); }).catch((error) => alert(error.message || 'Não foi possível restaurar este backup.'));
});

$('save').onclick = async () => {
  await setDoc(doc(db, 'users', currentUser.uid), { alturaCm: numericValue($('height').value), metaPesoKg: numericValue($('goal-weight').value), objetivo: $('goal').value, metaSemanal: numericValue($('weekly').value) }, { merge: true });
  history.back();
};
$('back').onclick = () => history.back();
