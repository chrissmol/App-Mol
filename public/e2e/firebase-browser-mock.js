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
export const query = (...args) => ({ kind: 'query', args });
export const getDoc = async () => ({ exists: () => false, data: () => ({}) });
export const getDocs = async () => ({ docs: [], empty: true, forEach() {} });
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const addDoc = async () => ({ id: 'e2e-document' });
export const serverTimestamp = () => new Date();
export const writeBatch = () => ({ delete() {}, set() {}, update() {}, commit: async () => {} });
export const waitForPendingWrites = async () => {};
export const terminate = async () => {};
export const clearIndexedDbPersistence = async () => {};
