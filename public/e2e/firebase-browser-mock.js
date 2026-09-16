const listeners = new Set();

function readUser() {
  try {
    return localStorage.getItem('__mol_e2e_user')
      ? { uid: 'e2e-user', displayName: 'Christian Mol', email: 'christian@example.com', photoURL: '' }
      : null;
  } catch {
    return null;
  }
}

const authInstance = {
  currentUser: readUser(),
  authStateReady: async () => {},
};

function notifyAuthListeners() {
  listeners.forEach(listener => listener(authInstance.currentUser));
}

export const browserLocalPersistence = {};
export const browserPopupRedirectResolver = {};
export const indexedDBLocalPersistence = {};
export const inMemoryPersistence = {};
export class GoogleAuthProvider {}
export const EmailAuthProvider = { credential: () => ({}) };
export const initializeApp = config => ({ config });
export const initializeAuth = () => authInstance;
export const onAuthStateChanged = (_auth, listener) => {
  listeners.add(listener);
  queueMicrotask(() => listener(authInstance.currentUser));
  return () => listeners.delete(listener);
};
export const signInWithRedirect = async () => {
  localStorage.setItem('__mol_e2e_user', 'true');
  authInstance.currentUser = readUser();
  notifyAuthListeners();
};
export const signInWithPopup = async () => ({ user: authInstance.currentUser });
export const getRedirectResult = async () => ({ user: authInstance.currentUser });
export const signOut = async () => {
  localStorage.removeItem('__mol_e2e_user');
  authInstance.currentUser = null;
  notifyAuthListeners();
};
export const deleteUser = signOut;
export const reauthenticateWithCredential = async () => ({});
export const reauthenticateWithPopup = async () => ({});
export const getFirestore = () => ({});
export const initializeFirestore = () => ({});
export const persistentLocalCache = value => value;
export const persistentMultipleTabManager = () => ({});
export const collection = (...path) => ({ kind: 'collection', path });
export const doc = (...path) => ({ kind: 'doc', path });
export const where = (...args) => ({ kind: 'where', args });
export const query = (...args) => ({ kind: 'query', args, path: args[0]?.path || [] });
const mockRoutine = {
  userId: 'e2e-user',
  nome: 'Upper',
  diasSemana: [new Date().getDay()],
  exercicios: [
    {
      nome: 'Supino reto',
      grupo: 'Peito',
      repsMin: 8,
      repsMax: 12,
      rirAlvo: 2,
      descansoSegundos: 60,
      series: [
        { tipo: 'N', method: 'NORMAL', kg: '', reps: '', rir: '2', concluida: false }
      ]
    }
  ]
};
const mockDiet = {
  userId: 'e2e-user',
  refeicoes: [
    {
      id: 'meal-breakfast',
      nome: 'Café da manhã',
      hora: '08:00',
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      alimentos: [
        { id: 'banana', nome: 'Banana', gramas: 100, kcal100: 89, proteina100: 1.1, carbo100: 22.8, gordura100: 0.3 }
      ]
    },
    {
      id: 'meal-snack',
      nome: 'R3 - Lanche',
      hora: '16:00',
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      alimentos: [
        { id: 'bread', nome: 'Pão de forma', gramas: 75, kcal100: 253, proteina100: 9, carbo100: 49, gordura100: 3.2 }
      ]
    }
  ],
  jejum: { ativo: false }
};
const mockProfile = {
  name: 'Christian',
  metaCalorias: 2400,
  macroGoals: { protein: 180, carbs: 250, fat: 70 },
  metaSemanal: 3,
};
const documentSnapshot = data => ({ exists: () => Boolean(data), data: () => data || {} });
const querySnapshot = rows => ({ docs: rows.map(([id, data]) => ({ id, data: () => data })), empty: rows.length === 0, forEach(callback) { this.docs.forEach(callback); } });
function referencePath(reference) {
  const raw = reference?.path || [];
  const nested = reference?.args || [];
  return [...raw, ...nested].flatMap(item => item?.path ? item.path : item);
}
export const getDoc = async reference => {
  const path = referencePath(reference);
  if (path.includes('dietas')) return documentSnapshot(mockDiet);
  if (path.includes('users')) return documentSnapshot(mockProfile);
  return documentSnapshot(null);
};
export const getDocs = async reference => {
  const path = referencePath(reference);
  if (path.includes('treinos')) return querySnapshot([['routine-upper', mockRoutine]]);
  if (path.includes('dietas')) return querySnapshot([['diet-e2e', mockDiet]]);
  if (path.includes('sessoes')) return querySnapshot([]);
  if (path.includes('pesos')) return querySnapshot([]);
  return querySnapshot([]);
};
export const getCountFromServer = async reference => {
  const snapshot = await getDocs(reference);
  return { data: () => ({ count: snapshot.docs.length }) };
};
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const addDoc = async () => ({ id: 'e2e-document' });
export const serverTimestamp = () => new Date();
export const Timestamp = { now: () => new Date(), fromDate: date => date };
export const writeBatch = () => ({ delete() {}, set() {}, update() {}, commit: async () => {} });
export const waitForPendingWrites = async () => {};
export const terminate = async () => {};
export const clearIndexedDbPersistence = async () => {};
