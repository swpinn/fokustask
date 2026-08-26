import { useState, useEffect, useRef, useCallback } from "react";
import TopAppBar from "../components/layout/TopAppBar";
import MobileBottomNav from "../components/layout/MobileBottomNav";

// ── Web Audio beep ──────────────────────────────────────────────────────────
function playBeep(times = 3, freq = 880) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  let t = ctx.currentTime;
  for (let i = 0; i < times; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.4);
    t += 0.55;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(Math.floor(Math.max(0, n))).padStart(2, "0");

function formatStopwatch(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const cs = Math.floor((ms % 1_000) / 10);
  return { h: pad(h), m: pad(m), s: pad(s), cs: pad(cs) };
}

// ── Circular ring SVG ─────────────────────────────────────────────────────────
function ProgressRing({ progress, size = 300, stroke = 8, color = "#26665f" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e0e3e2" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s linear, stroke 0.3s" }}
      />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STOPWATCH
// ══════════════════════════════════════════════════════════════════════════════
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    setElapsed(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    startRef.current = Date.now() - elapsed;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };
  const pause = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  };
  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const lap = () => {
    const prevTotal = laps.reduce((a, l) => a + l.split, 0);
    setLaps((old) => [{ id: old.length + 1, total: elapsed, split: elapsed - prevTotal }, ...old]);
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const { h, m, s, cs } = formatStopwatch(elapsed);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={running ? (elapsed % 60_000) / 60_000 : 0} size={300} stroke={8} color={running ? "#26665f" : "#bfc9c6"} />
        <div className="absolute flex flex-col items-center">
          <div className="flex items-end gap-1">
            {h !== "00" && (
              <>
                <span className="text-4xl font-bold text-[#181c1c] tabular-nums">{h}</span>
                <span className="text-2xl font-bold text-[#5b5f5f] mb-0.5">:</span>
              </>
            )}
            <span className="text-4xl font-bold text-[#181c1c] tabular-nums">{m}</span>
            <span className="text-2xl font-bold text-[#5b5f5f] mb-0.5">:</span>
            <span className="text-4xl font-bold text-[#181c1c] tabular-nums">{s}</span>
            <span className="text-xl font-semibold text-[#5b5f5f] mb-0.5">.{cs}</span>
          </div>
          <span className="text-xs font-semibold text-[#8a9290] mt-1 tracking-widest uppercase">
            {running ? "Running" : elapsed === 0 ? "Ready" : "Paused"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="w-14 h-14 rounded-full border-2 border-[#dee4e3] text-[#5b5f5f] flex items-center justify-center hover:bg-[#f1f4f4] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">restart_alt</span>
        </button>
        <button
          onClick={running ? pause : start}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
            running
              ? "bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab]"
              : "bg-[#26665f] text-white hover:bg-[#296861] shadow-[0_4px_20px_rgba(38,102,95,0.35)]"
          }`}
        >
          <span className="material-symbols-outlined text-[32px]">{running ? "pause" : "play_arrow"}</span>
        </button>
        <button
          onClick={lap}
          disabled={!running}
          className="w-14 h-14 rounded-full border-2 border-[#dee4e3] text-[#5b5f5f] flex items-center justify-center hover:bg-[#f1f4f4] transition-colors disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[22px]">flag</span>
        </button>
      </div>

      {laps.length > 0 && (
        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-bold text-[#8a9290] uppercase tracking-widest px-1">
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
            {laps.map((l, idx) => {
              const { m: tm, s: ts, cs: tcs } = formatStopwatch(l.total);
              const { m: sm, s: ss, cs: scs } = formatStopwatch(l.split);
              const fastest = laps.length > 2 && l.split === Math.min(...laps.map((x) => x.split));
              const slowest = laps.length > 2 && l.split === Math.max(...laps.map((x) => x.split));
              return (
                <div
                  key={l.id}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm font-semibold tabular-nums border ${
                    idx === 0
                      ? "bg-[#b0efe5]/40 border-[#94d2c9]"
                      : fastest
                      ? "bg-[#b0efe5]/20 border-[#b0efe5] text-[#26665f]"
                      : slowest
                      ? "bg-[#ffdad6]/20 border-[#ffdad6] text-[#ba1a1a]"
                      : "bg-white border-[#dee4e3]"
                  }`}
                >
                  <span className="w-8 text-[#5b5f5f]">#{l.id}</span>
                  <span>
                    {sm}:{ss}
                    <span className="text-xs">.{scs}</span>
                  </span>
                  <span className="text-[#8a9290]">
                    {tm}:{ts}
                    <span className="text-xs">.{tcs}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// POMODORO CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const POMODORO_PHASES = [
  { key: "focus", label: "Fokus", ring: "#26665f" },
  { key: "short", label: "Istirahat", ring: "#8a9290" },
  { key: "long",  label: "Istirahat Panjang", ring: "#26504b" },
];
const POM_DEFAULTS = [25 * 60, 5 * 60, 15 * 60];

// ══════════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ══════════════════════════════════════════════════════════════════════════════
function CountdownTimer() {
  const [mode, setMode] = useState("manual");

  // Manual inputs
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState(0);

  // Pomodoro state
  const [pomDurations, setPomDurations] = useState([...POM_DEFAULTS]);
  const [pomPhaseIdx, setPomPhaseIdx] = useState(0);
  const [pomCount, setPomCount] = useState(0);
  const [pomAutoNext, setPomAutoNext] = useState(false);

  // Countdown core state
  const [totalSec, setTotalSec] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const intervalRef = useRef(null);
  const runningRef = useRef(false);
  runningRef.current = running;

  const clear = useCallback(() => clearInterval(intervalRef.current), []);

  // ── Pomodoro duration helpers ──────────────────────────────────────────────
  const pomH = (i) => Math.floor(pomDurations[i] / 3600);
  const pomM = (i) => Math.floor((pomDurations[i] % 3600) / 60);
  const pomS = (i) => pomDurations[i] % 60;
  const setPomDur = (i, h, m, s) => {
    const sec = Math.max(1, h * 3600 + m * 60 + s);
    setPomDurations((prev) => {
      const next = [...prev];
      next[i] = sec;
      return next;
    });
  };

  // ── Apply duration ─────────────────────────────────────────────────────────
  const applyDuration = useCallback(
    (sec) => {
      clear();
      setRunning(false);
      setFinished(false);
      setTotalSec(sec);
      setRemaining(sec);
    },
    [clear]
  );

  // Manual: input → duration
  const prevManualSec = useRef(300);
  useEffect(() => {
    if (mode !== "manual" || runningRef.current) return;
    const sec = Math.max(1, inputH * 3600 + inputM * 60 + inputS);
    if (sec === prevManualSec.current) return;
    prevManualSec.current = sec;
    setTotalSec(sec);
    setRemaining(sec);
    setFinished(false);
  }, [inputH, inputM, inputS, mode]);

  // Pomodoro: phase change → apply phase duration
  useEffect(() => {
    if (mode !== "pomodoro") return;
    applyDuration(pomDurations[pomPhaseIdx]);
  }, [pomPhaseIdx, mode]); // eslint-disable-line

  // Pomodoro: user edits current phase duration while stopped → apply
  useEffect(() => {
    if (mode !== "pomodoro" || runningRef.current) return;
    applyDuration(pomDurations[pomPhaseIdx]);
  }, [pomDurations]); // eslint-disable-line

  // ── Switch mode ────────────────────────────────────────────────────────────
  const switchMode = (newMode) => {
    clear();
    setRunning(false);
    setFinished(false);
    setPomPhaseIdx(0);
    setPomCount(0);
    setMode(newMode);
    if (newMode === "manual") {
      const sec = Math.max(1, inputH * 3600 + inputM * 60 + inputS);
      prevManualSec.current = sec;
      setTotalSec(sec);
      setRemaining(sec);
    }
  };

  // ── Timer tick (using ref to always access latest callback) ────────────────
  const onFinishRef = useRef(null);

  const onFinish = useCallback(() => {
    clear();
    setRunning(false);
    setFinished(true);

    if (mode === "pomodoro") {
      const nextIdx = pomPhaseIdx === 0 ? ((pomCount + 1) % 4 === 0 ? 2 : 1) : 0;
      const nextCount = pomPhaseIdx === 0 ? pomCount + 1 : pomCount;
      const nextDur = pomDurations[nextIdx];

      playBeep(pomPhaseIdx === 0 ? 3 : 2, pomPhaseIdx === 0 ? 660 : 880);
      setPomCount(nextCount);

      if (pomAutoNext) {
        // Auto-next ON: switch phase and start countdown immediately after 1 second
        setTimeout(() => {
          setPomPhaseIdx(nextIdx);
          setFinished(false);
          setTotalSec(nextDur);
          setRemaining(nextDur);
          setRunning(true);
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
              if (prev <= 1) {
                onFinishRef.current?.();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }, 1000);
      } else {
        // Auto-next OFF: switch phase and update remaining time, but DO NOT start
        setTimeout(() => {
          setPomPhaseIdx(nextIdx);
          setFinished(false);
          setTotalSec(nextDur);
          setRemaining(nextDur);
        }, 1500);
      }
    } else {
      playBeep(3);
    }
  }, [clear, mode, pomPhaseIdx, pomCount, pomAutoNext, pomDurations]);

  onFinishRef.current = onFinish;

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setFinished(false);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onFinishRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remaining]);

  const pause = () => {
    clear();
    setRunning(false);
  };
  const reset = () => {
    clear();
    setRunning(false);
    setFinished(false);
    setRemaining(totalSec);
  };
  const skip = () => {
    clear();
    setRunning(false);
    setFinished(false);
    const nextIdx = pomPhaseIdx === 0 ? ((pomCount + 1) % 4 === 0 ? 2 : 1) : 0;
    setPomPhaseIdx(nextIdx);
  };

  useEffect(() => () => clear(), [clear]);

  // ── Display values ─────────────────────────────────────────────────────────
  const progress = totalSec > 0 ? remaining / totalSec : 0;
  const dispH = Math.floor(remaining / 3600);
  const dispM = Math.floor((remaining % 3600) / 60);
  const dispS = remaining % 60;
  const ringColor = finished ? "#ba1a1a" : mode === "pomodoro" ? POMODORO_PHASES[pomPhaseIdx].ring : "#26665f";
  const pomTomatoes = Array.from({ length: 4 }).map((_, i) => i < pomCount % 4);
  const currentPhase = POMODORO_PHASES[pomPhaseIdx];

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Mode switcher */}
      <div className="flex bg-[#f1f4f4] rounded-2xl p-1 gap-1 w-full max-w-xs">
        {[
          { key: "manual", label: "Manual", icon: "timer" },
          { key: "pomodoro", label: "Pomodoro", icon: "local_fire_department" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => switchMode(m.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === m.key ? "bg-white shadow text-[#26665f]" : "text-[#5b5f5f] hover:text-[#181c1c]"
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${mode === m.key ? "filled-icon" : ""}`}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Pomodoro controls */}
      {mode === "pomodoro" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          {/* Phase tabs */}
          <div className="flex gap-2 w-full">
            {POMODORO_PHASES.map((p, i) => (
              <button
                key={p.key}
                onClick={() => {
                  if (!running) {
                    setPomPhaseIdx(i);
                    setFinished(false);
                  }
                }}
                disabled={running}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  pomPhaseIdx === i
                    ? "text-white border-transparent"
                    : "bg-white border-[#dee4e3] text-[#5b5f5f] hover:border-[#26665f] disabled:opacity-50"
                }`}
                style={pomPhaseIdx === i ? { backgroundColor: p.ring } : {}}
              >
                <div>{p.label}</div>
                <div className="opacity-75 font-normal mt-0.5">
                  {pomH(i) > 0 ? `${pad(pomH(i))}:` : ""}
                  {pad(pomM(i))}:{pad(pomS(i))}
                </div>
              </button>
            ))}
          </div>

          {/* Tomato counter + auto next */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {pomTomatoes.map((done, i) => (
                <span key={i} className={`text-xl transition-all ${done ? "opacity-100" : "opacity-25"}`}>
                  🍅
                </span>
              ))}
            </div>
            <span className="text-xs text-[#8a9290] font-semibold">{pomCount} sesi selesai</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setPomAutoNext(!pomAutoNext)}
              className={`w-10 h-5 rounded-full transition-colors relative ${pomAutoNext ? "bg-[#26665f]" : "bg-[#dee4e3]"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${pomAutoNext ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-xs font-semibold text-[#5b5f5f]">Auto lanjut ke sesi berikutnya</span>
          </label>
        </div>
      )}

      {/* Ring + Display */}
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={progress} size={300} stroke={8} color={ringColor} />
        <div className="absolute flex flex-col items-center justify-center">
          {!running && !finished ? (
            /* Editable inputs — each column is flex-col with fixed width for perfect vertical alignment */
            <div className="flex items-center justify-center">
              {/* Jam */}
              <div className="flex flex-col items-center w-16">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={pad(mode === "pomodoro" ? pomH(pomPhaseIdx) : inputH)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const v = Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0));
                    mode === "pomodoro" ? setPomDur(pomPhaseIdx, v, pomM(pomPhaseIdx), pomS(pomPhaseIdx)) : setInputH(v);
                  }}
                  className="w-16 text-3xl font-bold text-center bg-transparent border-b-2 border-[#b0efe5] text-[#26665f] outline-none tabular-nums focus:border-[#26665f] transition-colors"
                />
                <span className="text-[10px] font-bold tracking-widest text-[#8a9290] uppercase mt-1">Jam</span>
              </div>

              {/* Separator */}
              <span className="w-5 text-2xl font-bold text-center text-[#bfc9c6] pb-4">:</span>

              {/* Menit */}
              <div className="flex flex-col items-center w-16">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={pad(mode === "pomodoro" ? pomM(pomPhaseIdx) : inputM)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const v = Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0));
                    mode === "pomodoro" ? setPomDur(pomPhaseIdx, pomH(pomPhaseIdx), v, pomS(pomPhaseIdx)) : setInputM(v);
                  }}
                  className="w-16 text-3xl font-bold text-center bg-transparent border-b-2 border-[#b0efe5] text-[#26665f] outline-none tabular-nums focus:border-[#26665f] transition-colors"
                />
                <span className="text-[10px] font-bold tracking-widest text-[#8a9290] uppercase mt-1">Menit</span>
              </div>

              {/* Separator */}
              <span className="w-5 text-2xl font-bold text-center text-[#bfc9c6] pb-4">:</span>

              {/* Detik */}
              <div className="flex flex-col items-center w-16">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={pad(mode === "pomodoro" ? pomS(pomPhaseIdx) : inputS)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const v = Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0));
                    mode === "pomodoro" ? setPomDur(pomPhaseIdx, pomH(pomPhaseIdx), pomM(pomPhaseIdx), v) : setInputS(v);
                  }}
                  className="w-16 text-3xl font-bold text-center bg-transparent border-b-2 border-[#b0efe5] text-[#26665f] outline-none tabular-nums focus:border-[#26665f] transition-colors"
                />
                <span className="text-[10px] font-bold tracking-widest text-[#8a9290] uppercase mt-1">Detik</span>
              </div>
            </div>
          ) : (
            /* Static display */
            <div className="flex items-center justify-center">
              {/* Jam */}
              <div className="flex flex-col items-center w-16">
                <span className={`w-16 text-3xl font-bold text-center tabular-nums ${finished ? "text-[#ba1a1a]" : "text-[#181c1c]"}`}>
                  {pad(dispH)}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#8a9290] uppercase mt-1">Jam</span>
              </div>

              {/* Separator */}
              <span className={`w-5 text-2xl font-bold text-center pb-4 ${finished ? "text-[#ba1a1a]" : "text-[#5b5f5f]"}`}>:</span>

              {/* Menit */}
              <div className="flex flex-col items-center w-16">
                <span className={`w-16 text-3xl font-bold text-center tabular-nums ${finished ? "text-[#ba1a1a]" : "text-[#181c1c]"}`}>
                  {pad(dispM)}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#8a9290] uppercase mt-1">Menit</span>
              </div>

              {/* Separator */}
              <span className={`w-5 text-2xl font-bold text-center pb-4 ${finished ? "text-[#ba1a1a]" : "text-[#5b5f5f]"}`}>:</span>

              {/* Detik */}
              <div className="flex flex-col items-center w-16">
                <span className={`w-16 text-3xl font-bold text-center tabular-nums ${finished ? "text-[#ba1a1a]" : "text-[#181c1c]"}`}>
                  {pad(dispS)}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#8a9290] uppercase mt-1">Detik</span>
              </div>
            </div>
          )}

          <span className={`text-[11px] font-semibold tracking-widest uppercase mt-2 ${finished ? "text-[#ba1a1a]" : "text-[#8a9290]"}`}>
            {finished
              ? "✓ Selesai!"
              : running
              ? mode === "pomodoro"
                ? currentPhase.label
                : "Running"
              : mode === "pomodoro"
              ? currentPhase.label
              : ""}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="w-14 h-14 rounded-full border-2 border-[#dee4e3] text-[#5b5f5f] flex items-center justify-center hover:bg-[#f1f4f4] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">restart_alt</span>
        </button>

        <button
          onClick={running ? pause : start}
          disabled={remaining <= 0 && !finished}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-30 ${
            finished
              ? "bg-[#b0efe5] text-[#26665f] hover:bg-[#94d2c9]"
              : running
              ? "bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab]"
              : "bg-[#26665f] text-white hover:bg-[#296861] shadow-[0_4px_20px_rgba(38,102,95,0.35)]"
          }`}
        >
          <span className="material-symbols-outlined text-[32px]">
            {finished ? "replay" : running ? "pause" : "play_arrow"}
          </span>
        </button>

        {mode === "pomodoro" ? (
          <button
            onClick={skip}
            disabled={running}
            className="w-14 h-14 rounded-full border-2 border-[#dee4e3] text-[#5b5f5f] flex items-center justify-center hover:bg-[#f1f4f4] transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[22px]">skip_next</span>
          </button>
        ) : (
          <div className="flex flex-col gap-1">
            {[5, 10, 25].map((min) => (
              <button
                key={min}
                onClick={() => {
                  setInputH(0);
                  setInputM(min);
                  setInputS(0);
                }}
                disabled={running}
                className="px-3 py-1 rounded-full text-xs font-bold bg-[#f1f4f4] text-[#3f4947] hover:bg-[#b0efe5] hover:text-[#00201d] transition-colors disabled:opacity-30"
              >
                {min}m
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pomodoro tip */}
      {mode === "pomodoro" && !running && !finished && (
        <div className="bg-[#f7faf9] border border-[#dee4e3] rounded-xl px-4 py-3 w-full max-w-xs">
          <p className="text-xs font-semibold text-[#5b5f5f] text-center">
            💡 {pomAutoNext ? "Timer akan otomatis lanjut dan mulai ke sesi berikutnya" : "Timer akan pindah ke sesi berikutnya dan menunggu tombol Mulai"}
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Timer() {
  const [tab, setTab] = useState("countdown");
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <TopAppBar title="Timer" />
      <main className="flex-1 overflow-y-auto pb-28 lg:pb-8">
        <div className="w-full max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
          <div className="flex bg-[#f1f4f4] rounded-2xl p-1 gap-1">
            {[
              { key: "countdown", icon: "hourglass_bottom", label: "Timer" },
              { key: "stopwatch", icon: "timer", label: "Stopwatch" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t.key ? "bg-white shadow text-[#26665f]" : "text-[#5b5f5f] hover:text-[#181c1c]"
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${tab === t.key ? "filled-icon" : ""}`}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center">{tab === "countdown" ? <CountdownTimer /> : <Stopwatch />}</div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}