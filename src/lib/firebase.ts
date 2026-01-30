import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBK9Jdgk9WZZ0fn67PgZMi8qCSyooZRI5U",
  authDomain: "abisinya-bet-bbm-2026.firebaseapp.com",
  projectId: "abisinya-bet-bbm-2026",
  storageBucket: "abisinya-bet-bbm-2026.firebasestorage.app",
  messagingSenderId: "258360771012",
  appId: "1:258360771012:web:6ebfa74ac59594acc7e491"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
