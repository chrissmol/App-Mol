// Leitura e gravação dos dados que o assistente usa. A gravação só acontece
// depois que a pessoa confirma uma proposta, e devolve `undo` para desfazer.
// Usa as mesmas coleções e formatos das telas, então passa pelas mesmas
// regras do Firestore (validDiet, validRoutine, validWeight).
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { normalizeDietMeals, normalizeFastingSettings } from './nutrition.js';

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

  async function applyWeight(proposal) {
    const created = await addDoc(collection(db, 'pesos'), { userId: uid, pesoKg: proposal.pesoKg, registradoEm: serverTimestamp() });
    return async () => deleteDoc(doc(db, 'pesos', created.id));
  }

  /** Grava a proposta confirmada e devolve uma função que desfaz a mudança. */
  async function applyProposal(proposal) {
    if (proposal?.tipo === 'dieta') return applyDiet(proposal);
    if (proposal?.tipo === 'rotina') return applyRoutine(proposal);
    if (proposal?.tipo === 'peso') return applyWeight(proposal);
    throw new Error('Proposta desconhecida.');
  }

  return { loadDiet, loadRoutines, applyProposal };
}
