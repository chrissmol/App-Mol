import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp, collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { confirmAction, setButtonLoading, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { syncAccessibilityForUser } from '../utils/accessibility.js';
import { BACKUP_COLLECTIONS, BACKUP_FILE_LIMIT, normalizeBackup, parsePersonalData } from '../modules/personal-data.js';
import { normalizeDietMeals } from '../modules/nutrition.js';
import { removeSessionItems } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);
let currentUser;
let currentProfile = {};
let preparedBackup = null;

function setPageState(state, message = '') {
  $('page-status').classList.toggle('hidden', state === 'ready');
  $('personal-content').classList.toggle('hidden', state !== 'ready');
  if (state !== 'ready') $('page-status').innerHTML = '';
  if (state === 'loading') $('page-status').textContent = message || 'Carregando seus dados…';
  if (state === 'error') {
    const text = document.createElement('span');
    text.textContent = message || 'Não foi possível carregar seus dados.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'mt-3 block min-h-10 w-full rounded-xl bg-white/5 text-sm font-bold text-white';
    retry.textContent = 'Tentar novamente';
    retry.onclick = loadProfile;
    $('page-status').append(text, retry);
  }
}

function fillProfile(profile) {
  $('height').value = Number(profile.alturaCm) > 0 ? profile.alturaCm : '';
  $('goal-weight').value = Number(profile.metaPesoKg) > 0 ? profile.metaPesoKg : '';
  $('goal').value = ['Hipertrofia', 'Força', 'Emagrecimento', 'Saúde'].includes(profile.objetivo) ? profile.objetivo : '';
  $('weekly').value = Number(profile.metaSemanal) >= 1 && Number(profile.metaSemanal) <= 7 ? profile.metaSemanal : '';
}

async function loadProfile() {
  if (!currentUser) return;
  setPageState('loading');
  try {
    const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
    currentProfile = snapshot.data() || {};
    fillProfile(currentProfile);
    setPageState('ready');
  } catch (error) {
    console.error('Dados pessoais não carregados:', error);
    setPageState('error', 'Não foi possível carregar seu perfil agora.');
  }
}

function restoreValue(value) {
  if (Array.isArray(value)) return value.map(restoreValue);
  if (!value || typeof value !== 'object') return value;
  const keys = Object.keys(value);
  if (keys.every(key => key === 'seconds' || key === 'nanoseconds' || key === 'type') && Number.isFinite(Number(value.seconds)) && Number.isFinite(Number(value.nanoseconds))) {
    return new Timestamp(Number(value.seconds), Number(value.nanoseconds));
  }
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== '__proto__' && key !== 'constructor' && key !== 'prototype').map(([key, item]) => [key, restoreValue(item)]));
}

async function exportBackup() {
  const profileSnapshot = await getDoc(doc(db, 'users', currentUser.uid));
  const records = await Promise.all(BACKUP_COLLECTIONS.map(async name => {
    if (name === 'dietas') {
      const snapshot = await getDoc(doc(db, name, currentUser.uid));
      return [name, snapshot.exists() ? [{ id: snapshot.id, data: snapshot.data() }] : []];
    }
    const snapshot = await getDocs(query(collection(db, name), where('userId', '==', currentUser.uid)));
    return [name, snapshot.docs.map(item => ({ id: item.id, data: item.data() }))];
  }));
  return {
    versao: 2,
    criadoEm: new Date().toISOString(),
    origem: 'Mol',
    perfil: profileSnapshot.data() || {},
    dados: Object.fromEntries(records)
  };
}

function downloadBackup(backup) {
  const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = `mol-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function uniqueMeals(current, incoming) {
  const result = [...current];
  const seen = new Set(current.map(item => JSON.stringify(item)));
  incoming.forEach(item => {
    const key = JSON.stringify(item);
    if (!seen.has(key) && result.length < 12) { result.push(item); seen.add(key); }
  });
  return result;
}

async function portableDocumentId(collectionName, entry, index) {
  const source = `${currentUser.uid}|${collectionName}|${entry.id || index}|${JSON.stringify(entry.data)}`;
  if (crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return `restored_${[...new Uint8Array(digest)].slice(0, 16).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
  }
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  return `restored_${(hash >>> 0).toString(16)}`;
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

async function restoreReferences(collectionName, entries) {
  return Promise.all(entries.map(async (entry, index) => {
    const sameAccount = entry.data.userId === currentUser.uid;
    const id = entry.id && sameAccount ? entry.id : await portableDocumentId(collectionName, entry, index);
    return { entry, sameAccount, reference: doc(db, collectionName, id) };
  }));
}

async function prepareRestoreWrites(backup) {
  const batch = writeBatch(db);
  let added = 0;
  let skipped = 0;
  const routineIds = new Map();
  const profile = restoreValue(backup.profile);
  if (Object.keys(profile).length) batch.set(doc(db, 'users', currentUser.uid), profile, { merge: true });

  const routines = await restoreReferences('treinos', backup.entries.treinos);
  routines.forEach(({ entry, reference }) => { if (entry.id) routineIds.set(entry.id, reference.id); });
  const routineSnapshots = await mapWithConcurrency(routines, 20, ({ reference }) => getDoc(reference));
  routines.forEach(({ entry, reference }, index) => {
    if (routineSnapshots[index].exists()) { skipped += 1; return; }
    batch.set(reference, { ...restoreValue(entry.data), userId: currentUser.uid });
    added += 1;
  });

  const restoredSessions = await restoreReferences('sessoes', backup.entries.sessoes);
  const sessionSnapshots = await mapWithConcurrency(restoredSessions, 20, ({ reference }) => getDoc(reference));
  restoredSessions.forEach(({ entry, reference, sameAccount }, index) => {
    if (sessionSnapshots[index].exists()) { skipped += 1; return; }
    const data = { ...restoreValue(entry.data), userId: currentUser.uid };
    data.rotinaId = routineIds.get(entry.data.rotinaId) || (sameAccount ? entry.data.rotinaId || null : null);
    batch.set(reference, data);
    added += 1;
  });

  const restoredWeights = await restoreReferences('pesos', backup.entries.pesos);
  const weightSnapshots = await mapWithConcurrency(restoredWeights, 20, ({ reference }) => getDoc(reference));
  restoredWeights.forEach(({ entry, reference }, index) => {
    if (weightSnapshots[index].exists()) { skipped += 1; return; }
    batch.set(reference, { ...restoreValue(entry.data), userId: currentUser.uid });
    added += 1;
  });

  const dietReference = doc(db, 'dietas', currentUser.uid);
  const currentDiet = (await getDoc(dietReference)).data() || {};
  const incomingMeals = normalizeDietMeals(backup.entries.dietas.flatMap(entry => restoreValue(entry.data).refeicoes || []));
  if (incomingMeals.length) {
    const currentMeals = normalizeDietMeals(currentDiet.refeicoes);
    const meals = uniqueMeals(currentMeals, incomingMeals);
    batch.set(dietReference, { userId: currentUser.uid, refeicoes: meals, atualizadoEm: new Date().toISOString() });
    added += Math.max(0, meals.length - currentMeals.length);
  }
  return { batch, added, skipped };
}

$('save').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  let data;
  try {
    data = parsePersonalData({ height: $('height').value, goalWeight: $('goal-weight').value, goal: $('goal').value, weekly: $('weekly').value });
  } catch (error) { return showToast(error.message); }
  const button = $('save');
  setButtonLoading(button, true);
  try {
    await writeBatch(db).set(doc(db, 'users', currentUser.uid), data, { merge: true }).commit();
    currentProfile = { ...currentProfile, ...data };
    removeSessionItems(`mol-profile-cache-${currentUser.uid}`);
    showToast('Dados salvos.', 'success');
  } catch (error) {
    console.error('Dados pessoais não salvos:', error);
    showToast('Não foi possível salvar seus dados.');
  } finally { setButtonLoading(button, false); }
};

$('export').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const button = $('export');
  setButtonLoading(button, true);
  try {
    downloadBackup(await exportBackup());
    showToast('Backup exportado.', 'success');
  } catch (error) {
    console.error('Backup não exportado:', error);
    showToast('Não foi possível exportar seus dados.');
  } finally { setButtonLoading(button, false); window.lucide?.createIcons(); }
};

$('restore-file').onchange = async () => {
  preparedBackup = null;
  $('restore').disabled = true;
  $('restore').classList.add('opacity-50');
  const file = $('restore-file').files[0];
  if (!file) { $('restore-summary').textContent = 'Selecione um arquivo JSON gerado pelo Mol.'; return; }
  if (file.size > BACKUP_FILE_LIMIT) { $('restore-summary').textContent = 'O arquivo excede o limite de 5 MB.'; return; }
  try {
    preparedBackup = normalizeBackup(JSON.parse(await file.text()));
    $('restore-summary').textContent = `Backup v${preparedBackup.version} válido, com ${preparedBackup.total} registros. Pronto para restaurar.`;
    $('restore').disabled = false;
    $('restore').classList.remove('opacity-50');
  } catch (error) {
    $('restore-summary').textContent = error.message || 'Arquivo de backup inválido.';
  }
};

$('restore').onclick = async () => {
  if (!preparedBackup || !currentUser) return;
  const confirmed = await confirmAction({ title: 'Restaurar este backup?', message: `O arquivo contém ${preparedBackup.total} registros. Dados com o mesmo ID serão ignorados; novos registros serão adicionados e refeições diferentes serão mescladas.`, confirmText: 'Restaurar' });
  if (!confirmed) return;
  const button = $('restore');
  setButtonLoading(button, true);
  try {
    const operation = await prepareRestoreWrites(preparedBackup);
    await operation.batch.commit();
    removeSessionItems(
      `mol-profile-cache-${currentUser.uid}`,
      `mol-progress-cache-${currentUser.uid}`,
      `mol-history-cache-${currentUser.uid}`
    );
    await syncAccessibilityForUser(currentUser).catch(error => console.warn('Acessibilidade será sincronizada novamente:', error.message));
    await loadProfile();
    $('restore-file').value = '';
    preparedBackup = null;
    $('restore-summary').textContent = `Restauração concluída: ${operation.added} itens adicionados${operation.skipped ? ` e ${operation.skipped} duplicados ignorados` : ''}.`;
    showToast('Backup restaurado com sucesso.', 'success');
  } catch (error) {
    console.error('Backup não restaurado:', error);
    showToast('Nenhum dado foi alterado. Não foi possível restaurar o backup.');
  } finally {
    setButtonLoading(button, false);
    button.disabled = !preparedBackup;
    button.classList.toggle('opacity-50', !preparedBackup);
    window.lucide?.createIcons();
  }
};

onAuthStateChanged(auth, user => {
  if (!user) { location.href = './login.html'; return; }
  currentUser = user;
  loadProfile();
});

window.lucide?.createIcons();
