
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Utiliza variáveis de ambiente injetadas pelo Vite/Vercel
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "SUA_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "seu-projeto",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "seu-projeto.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "SEU_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "SEU_APP_ID"
};

// Verifica se as credenciais são válidas antes de inicializar para evitar Permission Denied no log
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "SUA_API_KEY" && 
  firebaseConfig.projectId !== "seu-projeto";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
