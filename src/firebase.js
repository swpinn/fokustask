import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === "demo-key";

let _app, _db, _auth, _googleProvider;

if (!DEMO_MODE) {
  _app = initializeApp(firebaseConfig);
  _db = getFirestore(_app);
  _auth = getAuth(_app);
  _googleProvider = new GoogleAuthProvider();
}

export const app = _app;
export const db = _db;
export const auth = _auth;
export const googleProvider = _googleProvider;
