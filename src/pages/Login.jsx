import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DEMO_MODE } from "../firebase";

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (e) {
      setError("Gagal login dengan Google. Coba lagi.");
    }
    setLoading(false);
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate("/");
    } catch (e) {
      setError(
        e.code === "auth/wrong-password" ? "Password salah." :
        e.code === "auth/user-not-found" ? "Email tidak ditemukan." :
        e.code === "auth/email-already-in-use" ? "Email sudah terdaftar." :
        e.code === "auth/weak-password" ? "Password terlalu lemah (min 6 karakter)." :
        "Terjadi kesalahan. Coba lagi."
      );
    }
    setLoading(false);
  };

  const handleDemo = async () => {
    setLoading(true);
    await signInWithEmail("demo@focustask.app", "demo123");
    navigate("/");
    setLoading(false);
  };

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

        {/* Demo Mode Banner */}
        {DEMO_MODE && (
          <div className="bg-[#b0efe5]/50 border border-[#94d2c9] rounded-xl p-3 mb-4 text-center">
            <p className="text-xs font-semibold text-[#26665f]">⚡ Mode Demo — data tersimpan di browser ini</p>
            <p className="text-xs text-[#5b5f5f] mt-0.5">Hubungkan Firebase untuk sync multi-device</p>
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
            disabled={loading}
            className="w-full h-11 rounded-full border border-[#dee4e3] flex items-center justify-center gap-3 text-sm font-semibold text-[#181c1c] hover:bg-[#f1f4f4] transition-colors mb-3 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {DEMO_MODE ? "Demo — Login dengan Google" : "Lanjutkan dengan Google"}
          </button>

          {DEMO_MODE && (
            <button
              onClick={handleDemo}
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#b0efe5] text-[#00201d] font-semibold text-sm hover:bg-[#94d2c9] transition-colors mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Coba Demo Sekarang
            </button>
          )}

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
                className="w-full border border-[#dee4e3] rounded-xl px-4 py-2.5 text-sm text-[#181c1c] focus:outline-none focus:border-[#26665f] transition-colors"
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
                className="w-full border border-[#dee4e3] rounded-xl px-4 py-2.5 text-sm text-[#181c1c] focus:outline-none focus:border-[#26665f] transition-colors"
                placeholder="Minimal 6 karakter"
              />
            </div>
            {error && (
              <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#26665f] text-white font-semibold text-sm hover:bg-[#296861] transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? "Loading..." : isSignUp ? "Buat Akun" : "Masuk"}
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
