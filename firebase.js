// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ⚙️ Configuración de tu proyecto Firebase (ya creada)
const firebaseConfig = {
  apiKey: "AIzaSyDc2HwD1H4H6IDrBSKic813J1cFtOzbe5k",
  authDomain: "truelove-4af1e.firebaseapp.com",
  projectId: "truelove-4af1e",
  storageBucket: "truelove-4af1e.firebasestorage.app",
  messagingSenderId: "44113359749",
  appId: "1:44113359749:web:6d1cbfdd4c10d5048b4aec",
  measurementId: "G-L6X3V44L06",
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Firestore
export const db = getFirestore(app);

// 👤 Auth (por si se usa luego)
export const auth = getAuth(app);

// 🗂️ Storage
export const storage = getStorage(app);
