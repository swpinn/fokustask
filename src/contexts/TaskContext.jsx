import { createContext, useContext, useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore";
import { db, DEMO_MODE } from "../firebase";
import { useAuth } from "./AuthContext";
import { format, isToday, parseISO, differenceInCalendarDays } from "date-fns";

const TaskContext = createContext(null);
const STORAGE_KEY  = "focustask_tasks";
const loadLocal    = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } };
const saveLocal    = (tasks) => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

const TODAY = format(new Date(), "yyyy-MM-dd");

/**
 * Hitung apakah streak dilanjutkan atau putus.
 * lastCompletedDate: "yyyy-MM-dd" string
 * streak: angka streak saat ini
 */
function computeNewStreak(lastCompletedDate, currentStreak) {
  if (!lastCompletedDate) return currentStreak;
  const diff = differenceInCalendarDays(new Date(), parseISO(lastCompletedDate));
  // diff=0 berarti hari ini sudah selesai (tidak normalnya dipanggil sini)
  // diff=1 berarti kemarin selesai → streak lanjut
  // diff>1 berarti ada hari yang terlewat → streak putus
  if (diff <= 1) return currentStreak;
  return 0; // putus
}

export function TaskProvider({ children }) {
  const { currentUser } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [loading, setLoading] = useState(true);

  // ── Subscribe + reset harian ──────────────────────────────────────────────
  useEffect(() => {
    if (DEMO_MODE) {
      const local = loadLocal();
      setTasks(applyDailyReset(local));
      setLoading(false);
      return;
    }
    if (!currentUser) { setTasks([]); setLoading(false); return; }

    const q = query(collection(db, "tasks"), where("uid", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const { tasks: reset, toUpdate } = applyDailyReset(raw, true);
      // Persist reset ke Firestore
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(({ id, data }) => updateDoc(doc(db, "tasks", id), data)));
      }
      setTasks(reset.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoading(false);
    }, (err) => { console.error("Firestore:", err); setLoading(false); });

    return unsubscribe;
  }, [currentUser]);

  /**
   * applyDailyReset:
   * - Untuk setiap tugas harian, cek apakah sudah di-reset hari ini.
   * - Jika lastResetDate !== TODAY → reset completed=false, hitung streak.
   * - Jika kemarin completed=true → streak +1, lastCompletedDate=kemarin.
   * - Jika kemarin completed=false → streak putus = 0.
   */
  function applyDailyReset(rawTasks, returnUpdates = false) {
    const toUpdate = [];
    const tasks = rawTasks.map((task) => {
      if (!task.isDaily) return task;

      const lastReset = task.lastResetDate || null;
      if (lastReset === TODAY) return task; // sudah di-reset hari ini

      // Perlu reset
      const wasCompleted   = task.completed === true;
      const lastCompleted  = task.lastCompletedDate || null;

      // Hitung streak baru
      let newStreak = task.streak ?? 0;
      if (wasCompleted) {
        // Selesai kemarin → lanjut streak
        newStreak = (task.streak ?? 0) + 1;
      } else {
        // Tidak selesai → cek apakah baru putus atau memang belum pernah
        if (lastReset) {
          // Ada riwayat reset tapi tidak selesai → putus
          newStreak = 0;
        }
        // Jika belum pernah reset sama sekali, biarkan streak tetap 0
      }

      const updated = {
        ...task,
        completed:         false,
        lastResetDate:     TODAY,
        lastCompletedDate: wasCompleted ? lastReset : (lastCompleted || null),
        streak:            newStreak,
        failedYesterday:   !wasCompleted && !!lastReset,
      };

      if (returnUpdates) {
        toUpdate.push({
          id: task.id,
          data: {
            completed:         false,
            lastResetDate:     TODAY,
            lastCompletedDate: updated.lastCompletedDate,
            streak:            newStreak,
            failedYesterday:   updated.failedYesterday,
          },
        });
      }
      return updated;
    });

    return returnUpdates ? { tasks, toUpdate } : tasks;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addTask = async (taskData) => {
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order ?? 0)) + 1 : 0;
    const extra = taskData.isDaily
      ? { streak: 0, lastResetDate: TODAY, lastCompletedDate: null, failedYesterday: false }
      : {};

    if (DEMO_MODE) {
      const t = { ...taskData, ...extra, id: crypto.randomUUID(), uid: "demo-user-123", completed: false, order: maxOrder, createdAt: new Date().toISOString() };
      const u = [...tasks, t]; setTasks(u); saveLocal(u); return;
    }
    await addDoc(collection(db, "tasks"), { ...taskData, ...extra, uid: currentUser.uid, completed: false, order: maxOrder, createdAt: serverTimestamp() });
  };

  const updateTask = async (id, data) => {
    if (DEMO_MODE) {
      const u = tasks.map((t) => t.id === id ? { ...t, ...data } : t); setTasks(u); saveLocal(u); return;
    }
    await updateDoc(doc(db, "tasks", id), data);
  };

  const deleteTask = async (id) => {
    if (DEMO_MODE) {
      const u = tasks.filter((t) => t.id !== id); setTasks(u); saveLocal(u); return;
    }
    await deleteDoc(doc(db, "tasks", id));
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nowCompleted = !task.completed;
    const extra = task.isDaily && nowCompleted
      ? { lastCompletedDate: TODAY }
      : {};
    await updateTask(id, { completed: nowCompleted, ...extra });
  };

  const reorderTasks = async (reordered) => {
    setTasks(reordered);
    if (DEMO_MODE) { saveLocal(reordered); return; }
    await Promise.all(reordered.map((t, i) => updateDoc(doc(db, "tasks", t.id), { order: i })));
  };

  const filteredTasks = tasks.filter((t) =>
    filter === "active" ? !t.completed : filter === "completed" ? t.completed : true
  );

  return (
    <TaskContext.Provider value={{ tasks, filteredTasks, filter, setFilter, loading, addTask, updateTask, deleteTask, toggleTask, reorderTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() { return useContext(TaskContext); }