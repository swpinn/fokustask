import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// ── Rate limiting config ───────────────────────────────────────────────────
const MAX_ATTEMPTS  = 5;   // maks percobaan login gagal
const LOCKOUT_MS    = 30 * 1000; // lockout 30 detik

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // ── Rate limiting state ────────────────────────────────────────────────────
  const attemptsRef  = useRef(0);
  const lockedUntil  = useRef(null);
  const [lockRemain, setLockRemain] = useState(0); // detik sisa cooldown

  // Hitung sisa waktu lockout secara real-time
  const startCountdown = (until) => {
    const tick = () => {
      const remain = Math.ceil((until - Date.now()) / 1000);
      if (remain <= 0) {
        setLockRemain(0);
        attemptsRef.current = 0;
        lockedUntil.current = null;
        return;
      }
      setLockRemain(remain);
      setTimeout(tick, 1000);
    };
    tick();
  };

  const isLockedOut = () => {
    if (!lockedUntil.current) return false;
    if (Date.now() >= lockedUntil.current) {
      lockedUntil.current = null;
      attemptsRef.current = 0;
      return false;
    }
    return true;
  };

  const recordFailedAttempt = () => {
    attemptsRef.current += 1;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS;
      lockedUntil.current = until;
      startCountdown(until);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    if (isLockedOut()) return;
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (e) {
      recordFailedAttempt();
      setError("Gagal login dengan Google. Coba lagi.");
    }
    setLoading(false);
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (isLockedOut()) return;
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate("/");
    } catch (err) {
      recordFailedAttempt();
      setError(
        err.code === "auth/wrong-password"      ? "Password salah." :
        err.code === "auth/user-not-found"      ? "Email tidak ditemukan." :
        err.code === "auth/email-already-in-use"? "Email sudah terdaftar." :
        err.code === "auth/weak-password"       ? "Password terlalu lemah (min 6 karakter)." :
        err.code === "auth/invalid-email"       ? "Format email tidak valid." :
        err.code === "auth/too-many-requests"   ? "Terlalu banyak percobaan. Coba lagi nanti." :
        "Terjadi kesalahan. Coba lagi."
      );
    }
    setLoading(false);
  };

  const locked = lockRemain > 0;

  return (
    <div className="min-h-screen bg-[#f7faf9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#b0efe5] rounded-2xl mb-4 shadow-md">
            <span className="material-symbols-outlined text-[#26665f] filled-icon text-4xl">task_alt</span>
          </div>
          <h1 className="text-3xl font-bold text-[#26665f] mb-1">FocusTask</h1>
          <p className="text-sm text-[#5b5f5f]">Stay focused. Get things done.</p>
        </div>

        {/* Rate limit warning */}
        {attemptsRef.current > 0 && attemptsRef.current < MAX_ATTEMPTS && !locked && (
          <div className="bg-[#fff3e0] border border-[#ffb74d] rounded-xl p-3 mb-4 text-center">
            <p className="text-xs font-semibold text-[#e65100]">
              ⚠️ {MAX_ATTEMPTS - attemptsRef.current} percobaan tersisa sebelum akun sementara dikunci
            </p>
          </div>
        )}

        {/* Lockout banner */}
        {locked && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a] rounded-xl p-3 mb-4 text-center">
            <p className="text-xs font-semibold text-[#ba1a1a]">
              🔒 Terlalu banyak percobaan gagal. Coba lagi dalam {lockRemain} detik.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#dee4e3] p-6">
          <h2 className="text-lg font-bold text-[#181c1c] mb-5 text-center">
            {isSignUp ? "Buat Akun Baru" : "Selamat Datang Kembali"}
          </h2>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading || locked}
            className="w-full h-11 rounded-full border border-[#dee4e3] flex items-center justify-center gap-3 text-sm font-semibold text-[#181c1c] hover:bg-[#f1f4f4] transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#dee4e3]" />
            <span className="text-xs text-[#5b5f5f]">atau dengan email</span>
            <div className="flex-1 h-px bg-[#dee4e3]" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3f4947] mb-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={locked}
                className="w-full border border-[#dee4e3] rounded-xl px-4 py-2.5 text-sm text-[#181c1c] focus:outline-none focus:border-[#26665f] transition-colors disabled:opacity-50 disabled:bg-[#f1f4f4]"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3f4947] mb-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={locked}
                className="w-full border border-[#dee4e3] rounded-xl px-4 py-2.5 text-sm text-[#181c1c] focus:outline-none focus:border-[#26665f] transition-colors disabled:opacity-50 disabled:bg-[#f1f4f4]"
                placeholder="Minimal 6 karakter"
              />
            </div>
            {error && (
              <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full h-11 rounded-full bg-[#26665f] text-white font-semibold text-sm hover:bg-[#296861] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locked   ? `🔒 Terkunci ${lockRemain}s` :
               loading  ? "Loading..." :
               isSignUp ? "Buat Akun" : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-[#5b5f5f] mt-4">
            {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-[#26665f] font-semibold hover:underline"
            >
              {isSignUp ? "Masuk" : "Daftar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
