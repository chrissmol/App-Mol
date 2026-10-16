// Leitura e gravação dos dados que o assistente usa. A gravação só acontece
// depois que a pessoa confirma uma proposta, e devolve `undo` para desfazer.
// Usa as mesmas coleções e formatos das telas, então passa pelas mesmas
// regras do Firestore (validDiet, validRoutine, validWeight, validDiary e o perfil).
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { normalizeDietMeals, normalizeFastingSettings } from './nutrition.js';
import { addFood, dayKey, diaryDocId, normalizeDiary } from './food-diary.js';
import { buildMemoryProposal, normalizeMemory } from './assistant.js';

export function createAssistantStore(db, uid) {
  const dietRef = doc(db, 'dietas', uid);

  async function loadDietDoc() {
    const snapshot = await getDoc(dietRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async function loadDiet() {
    const data = await loadDietDoc();
    return { meals: normalizeDietMeals(data?.refeicoes), fasting: normalizeFastingSettings(data?.jejum) };
  }

  async function loadRoutines() {
    const snapshot = await getDocs(query(collection(db, 'treinos'), where('userId', '==', uid)));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
  }

  async function applyDiet(proposal) {
    const previous = await loadDietDoc();
    await setDoc(dietRef, { userId: uid, refeicoes: proposal.meals, jejum: normalizeFastingSettings(previous?.jejum), atualizadoEm: serverTimestamp() });
    return async () => {
      if (previous) await setDoc(dietRef, { userId: uid, refeicoes: normalizeDietMeals(previous.refeicoes), jejum: normalizeFastingSettings(previous.jejum), atualizadoEm: serverTimestamp() });
      else await deleteDoc(dietRef);
    };
  }

  async function applyRoutine(proposal) {
    const fields = { nome: proposal.routine.nome, descricao: proposal.routine.descricao, horario: proposal.routine.horario, diasSemana: proposal.routine.diasSemana, exercicios: proposal.routine.exercicios };
    if (!proposal.routineId) {
      const created = await addDoc(collection(db, 'treinos'), { userId: uid, ...fields, criadoEm: serverTimestamp() });
      return async () => deleteDoc(doc(db, 'treinos', created.id));
    }
    const ref = doc(db, 'treinos', proposal.routineId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error('Rotina não encontrada.');
    const before = snapshot.data();
    await updateDoc(ref, fields);
    const restore = Object.fromEntries(Object.keys(fields).map(key => [key, before[key] ?? (key === 'exercicios' || key === 'diasSemana' ? [] : '')]));
    return async () => updateDoc(ref, restore);
  }

  async function loadDiary() {
    const snapshot = await getDoc(doc(db, 'diario', diaryDocId(uid)));
    return normalizeDiary(snapshot.exists() ? snapshot.data() : {});
  }

  async function applyDiary(proposal) {
    const key = dayKey();
    const ref = doc(db, 'diario', diaryDocId(uid, key));
    const snapshot = await getDoc(ref);
    const previous = snapshot.exists() ? normalizeDiary(snapshot.data()) : null;
    const time = new Date().toTimeString().slice(0, 5);
    const next = proposal.alimentos.reduce((day, food) => addFood(day, food, time), previous || normalizeDiary());
    await setDoc(ref, { userId: uid, data: key, ...next, atualizadoEm: serverTimestamp() });
    return async () => {
      if (previous) await setDoc(ref, { userId: uid, data: key, ...previous, atualizadoEm: serverTimestamp() });
      else await deleteDoc(ref);
    };
  }

  async function applyWeight(proposal) {
    const created = await addDoc(collection(db, 'pesos'), { userId: uid, pesoKg: proposal.pesoKg, registradoEm: serverTimestamp() });
    return async () => deleteDoc(doc(db, 'pesos', created.id));
  }

  const userRef = doc(db, 'users', uid);

  async function loadMemory() {
    const snapshot = await getDoc(userRef);
    return normalizeMemory(snapshot.data()?.assistenteMemoria);
  }

  async function applyMemory(proposal) {
    const previous = await loadMemory();
    const result = buildMemoryProposal(proposal, previous);
    if (result.error) throw new Error(result.error);
    await setDoc(userRef, { assistenteMemoria: result.memoria }, { merge: true });
    return async () => setDoc(userRef, { assistenteMemoria: previous }, { merge: true });
  }

  /** Grava a proposta confirmada e devolve uma função que desfaz a mudança. */
  async function applyProposal(proposal) {
    if (proposal?.tipo === 'dieta') return applyDiet(proposal);
    if (proposal?.tipo === 'rotina') return applyRoutine(proposal);
    if (proposal?.tipo === 'peso') return applyWeight(proposal);
    if (proposal?.tipo === 'diario') return applyDiary(proposal);
    if (proposal?.tipo === 'memoria') return applyMemory(proposal);
    throw new Error('Proposta desconhecida.');
  }

  return { loadDiet, loadRoutines, loadDiary, loadMemory, applyProposal };
}
