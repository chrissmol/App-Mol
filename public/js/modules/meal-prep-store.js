import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDb } from '../config/firebase-config.js';
import { withTimeout } from '../utils/timeout.js';

export async function loadPrepPeople(user) {
  const db = await getDb();
  const ownShare = (await withTimeout(getDoc(doc(db, 'mealShares', user.uid)), 'O vínculo das marmitas')).data();
  const people = [{ id: user.uid, name: user.displayName || 'Você' }];
  if (ownShare?.partnerId) {
    try {
      const otherShare = (await withTimeout(getDoc(doc(db, 'mealShares', ownShare.partnerId)), 'O vínculo compartilhado')).data();
      if (otherShare?.partnerId === user.uid) people.push({ id: ownShare.partnerId, name: otherShare.name || 'Parceiro(a)' });
    } catch (error) {
      if (error.code !== 'permission-denied') throw error;
    }
  }
  return Promise.all(people.map(async person => ({ ...person,
    meals: (await withTimeout(getDoc(doc(db, 'dietas', person.id)), 'A dieta')).data()?.refeicoes || []
  })));
}

export async function createPrepInvite(user) {
  const code = crypto.randomUUID().replaceAll('-', '');
  await setDoc(doc(await getDb(), 'mealInvites', code), { ownerId: user.uid, ownerName: user.displayName || 'Parceiro(a)', guestId: null, createdAt: serverTimestamp() });
  return code;
}

export async function readPrepInvite(code) {
  if (!/^[a-f0-9]{32}$/.test(code)) throw new Error('Confira o código do convite.');
  const snapshot = await withTimeout(getDoc(doc(await getDb(), 'mealInvites', code)), 'O convite');
  if (!snapshot.exists()) throw new Error('Convite não encontrado.');
  return snapshot.data();
}

export async function acceptPrepInvite(user, code) {
  const invitation = await readPrepInvite(code);
  if (invitation.ownerId === user.uid) throw new Error('Abra este convite no outro perfil.');
  const db = await getDb();
  await updateDoc(doc(db, 'mealInvites', code), { guestId: user.uid });
  await setDoc(doc(db, 'mealShares', user.uid), { partnerId: invitation.ownerId, name: user.displayName || 'Parceiro(a)' });
}

export async function confirmPrepInvite(user, code) {
  const invitation = await readPrepInvite(code);
  if (invitation.ownerId !== user.uid || !invitation.guestId) throw new Error('O outro perfil ainda precisa aceitar o convite.');
  await setDoc(doc(await getDb(), 'mealShares', user.uid), { partnerId: invitation.guestId, name: user.displayName || 'Parceiro(a)' });
  await deleteDoc(doc(await getDb(), 'mealInvites', code));
}

export async function disconnectPrepPartner(user) {
  await deleteDoc(doc(await getDb(), 'mealShares', user.uid));
}

export async function loadPreparations(user) {
  const db = await getDb();
  const results = await Promise.all([
    withTimeout(getDocs(query(collection(db, 'mealPreparations'), where('userId', '==', user.uid))), 'Seus cardápios'),
    withTimeout(getDocs(query(collection(db, 'mealPreparations'), where('partnerId', '==', user.uid))), 'Os cardápios compartilhados')
  ]);
  return results.flatMap(snapshot => snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
    .sort((a, b) => b.preparedOn.localeCompare(a.preparedOn));
}

export async function savePreparation(user, { title, preparation, ingredients, partnerId, notes, rating }) {
  const id = crypto.randomUUID();
  const value = {
    userId: user.uid, partnerId: partnerId || null, title: title.trim().slice(0, 100),
    preparedOn: [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, '0'), String(new Date().getDate()).padStart(2, '0')].join('-'),
    ingredients, preparation, notes: String(notes || '').slice(0, 500), rating: rating || '', createdAt: serverTimestamp()
  };
  await setDoc(doc(await getDb(), 'mealPreparations', id), value);
  return { ...value, id };
}
