import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDo_49ukgSc32Dc1wqbRbQA3yGLk8bblR0",
  authDomain: "creature-62507.firebaseapp.com",
  projectId: "creature-62507",
  storageBucket: "creature-62507.firebasestorage.app",
  messagingSenderId: "746633251563",
  appId: "1:746633251563:web:53cde0d618efc09e538cae",
  measurementId: "G-VKZCYWH4VF"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
