
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Utiliza variáveis de ambiente injetadas pelo Vite/Vercel
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "SUA_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "seu-projeto",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "seu-projeto.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "SEU_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "SEU_APP_ID"
};

// Verifica se as credenciais são válidas antes de inicializar para evitar Permission Denied
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "SUA_API_KEY" && 
  firebaseConfig.projectId !== "seu-projeto" &&
  !!firebaseConfig.apiKey;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
