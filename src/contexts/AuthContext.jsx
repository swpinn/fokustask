import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Sign in with Google ────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  // ── Sign in with Email ─────────────────────────────────────────────────────
  const signInWithEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // ── Sign up with Email ─────────────────────────────────────────────────────
  const signUpWithEmail = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
