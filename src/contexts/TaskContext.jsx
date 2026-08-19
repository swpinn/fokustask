import { createContext, useContext, useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

const TaskContext = createContext(null);

const TODAY = format(new Date(), "yyyy-MM-dd");

export function TaskProvider({ children }) {
  const { currentUser } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [loading, setLoading] = useState(true);

  // ── Subscribe + reset harian ──────────────────────────────────────────────
  useEffect(() => {
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
      const wasCompleted  = task.completed === true;
      const lastCompleted = task.lastCompletedDate || null;

      // Hitung streak baru
      let newStreak = task.streak ?? 0;
      if (wasCompleted) {
        newStreak = (task.streak ?? 0) + 1;
      } else {
        if (lastReset) newStreak = 0;
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
    await addDoc(collection(db, "tasks"), {
      ...taskData, ...extra,
      uid: currentUser.uid,
      completed: false,
      order: maxOrder,
      createdAt: serverTimestamp(),
    });
  };

  const updateTask = async (id, data) => {
    await updateDoc(doc(db, "tasks", id), data);
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nowCompleted = !task.completed;
    const extra = task.isDaily && nowCompleted ? { lastCompletedDate: TODAY } : {};
    await updateTask(id, { completed: nowCompleted, ...extra });
  };

  const reorderTasks = async (reordered) => {
    setTasks(reordered);
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