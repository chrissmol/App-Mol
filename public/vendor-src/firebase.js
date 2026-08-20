export { initializeApp } from 'firebase/app';
export {
  deleteUser, EmailAuthProvider, getAuth, GoogleAuthProvider,
  onAuthStateChanged, reauthenticateWithCredential, reauthenticateWithPopup,
  signInWithPopup, signInWithRedirect, signOut
} from 'firebase/auth';
export {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, initializeFirestore,
  persistentLocalCache, persistentMultipleTabManager, query, serverTimestamp,
  setDoc, Timestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
