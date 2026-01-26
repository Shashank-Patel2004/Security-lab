// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCB3kFOaHCja9RgL3khAXhXr_qRr3RqA0Y",
  authDomain: "security-lab-2026.firebaseapp.com",
  projectId: "security-lab-2026",
  storageBucket: "security-lab-2026.firebasestorage.app",
  messagingSenderId: "697104899775",
  appId: "1:697104899775:web:e1aa9dd1a59e3392f6b00a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { doc, getDoc, setDoc };
