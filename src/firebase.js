import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDopN4PyUjeCfeOQe3SeCPYy_jehOHNgUA",
  authDomain: "taseera-8ccdd.firebaseapp.com",
  projectId: "taseera-8ccdd",
  storageBucket: "taseera-8ccdd.firebasestorage.app",
  messagingSenderId: "732996943611",
  appId: "1:732996943611:web:d3c773c8c8c0af16083a5e",
  measurementId: "G-671G0L79CV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
