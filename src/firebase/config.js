import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHTbgVkAk_yHV0m75WAiQFPFCTQkUj-lA",
  authDomain: "taskflow-13676.firebaseapp.com",
  projectId: "taskflow-13676",
  storageBucket: "taskflow-13676.firebasestorage.app",
  messagingSenderId: "370069150425",
  appId: "1:370069150425:web:ced9521bce0142f152bcc8",
  measurementId: "G-62EWRJ0X80"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);