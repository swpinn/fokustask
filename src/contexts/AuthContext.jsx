import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider, DEMO_MODE } from "../firebase";

const AuthContext = createContext(null);

// Demo user — hanya dipakai jika DEMO_MODE = true (tidak ada .env)
const DEMO_USER = {
  uid: "demo-user-123",
  displayName: "Demo User",
  email: "demo@focustask.app",
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Mode demo: baca dari localStorage
      const saved = localStorage.getItem("focustask_demo_user");
      setCurrentUser(saved ? JSON.parse(saved) : null);
      setLoading(false);
      return;
    }

    // Mode Firebase: pantau state login sungguhan
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Sign in with Google ────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (DEMO_MODE) {
      setCurrentUser(DEMO_USER);
      localStorage.setItem("focustask_demo_user", JSON.stringify(DEMO_USER));
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  // ── Sign in with Email ─────────────────────────────────────────────────────
  const signInWithEmail = async (email, password) => {
    if (DEMO_MODE) {
      const user = { uid: "demo-user-123", displayName: email.split("@")[0], email };
      setCurrentUser(user);
      localStorage.setItem("focustask_demo_user", JSON.stringify(user));
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  // ── Sign up with Email ─────────────────────────────────────────────────────
  const signUpWithEmail = async (email, password) => {
    if (DEMO_MODE) {
      const user = { uid: "demo-user-123", displayName: email.split("@")[0], email };
      setCurrentUser(user);
      localStorage.setItem("focustask_demo_user", JSON.stringify(user));
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    if (DEMO_MODE) {
      setCurrentUser(null);
      localStorage.removeItem("focustask_demo_user");
      return;
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, DEMO_MODE, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
