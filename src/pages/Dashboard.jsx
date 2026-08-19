import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { isToday, isTomorrow, parseISO, format, isValid, startOfDay, differenceInCalendarDays } from "date-fns";
import { id } from "date-fns/locale";
import TopAppBar from "../components/layout/TopAppBar";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import ProgressBar from "../components/ui/ProgressBar";
import AddTaskModal from "../components/tasks/AddTaskModal";
import { useTask } from "../contexts/TaskContext";

const PRIORITY_COLORS = {
  high:   "text-[#ba1a1a] bg-[#ffdad6]",
  medium: "text-[#26665f] bg-[#b0efe5]",
  low:    "text-[#5b5f5f] bg-[#e0e3e2]",
};

// ── Streak badge ─────────────────────────────────────────────────────────────
function StreakBadge({ streak, failedYesterday }) {
  if (streak > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#fff3e0] text-[#e65100] shrink-0">
        🔥{streak}
      </span>
    );
  }
  if (failedYesterday) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] shrink-0">
        💔 Streak Putus
      </span>
    );
  }
  return null;
}

// ── Task Item ─────────────────────────────────────────────────────────────────
function TaskItem({ task, index, onEdit }) {
  const { toggleTask, deleteTask } = useTask();
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => { setDeleting(true); await deleteTask(task.id); };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group flex items-center justify-between p-4 bg-white border-b border-[#dee4e3] gap-3 transition-all
            ${task.completed ? "opacity-60" : ""}
            ${snapshot.isDragging ? "shadow-lg ring-2 ring-[#26665f]/20 rounded-xl" : ""}
            ${deleting ? "opacity-30 pointer-events-none" : ""}
          `}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div {...provided.dragHandleProps}
              className="text-[#bfc9c6] hover:text-[#26665f] cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-lg">drag_indicator</span>
            </div>
            <input type="checkbox" className="checkbox-custom shrink-0"
              checked={task.completed} onChange={() => toggleTask(task.id)} />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.isDaily && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#26665f] bg-[#b0efe5] px-1.5 py-0.5 rounded-full shrink-0">
                    <span className="material-symbols-outlined text-[10px]">repeat</span>Harian
                  </span>
                )}
                {task.isDaily && <StreakBadge streak={task.streak ?? 0} failedYesterday={task.failedYesterday} />}
                <span className={`text-base font-medium text-[#181c1c] truncate ${task.completed ? "line-through opacity-50" : ""}`}>
                  {task.title}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {task.category && (
                  <span className="text-xs font-semibold text-[#3f4947] bg-[#e6e9e8] px-2 py-0.5 rounded-full">{task.category}</span>
                )}
                {task.dueTime && (
                  <span className="text-xs text-[#5b5f5f] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>{task.dueTime}
                  </span>
                )}
                {task.priority && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(task)} className="text-[#575d5d] hover:text-[#26665f] p-1.5 rounded-full hover:bg-[#f1f4f4] transition-colors">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button onClick={handleDelete} className="text-[#575d5d] hover:text-[#ba1a1a] p-1.5 rounded-full hover:bg-[#ffdad6] transition-colors">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function SectionHeader({ icon, label, count, color = "text-[#26665f]", bgColor = "bg-[#b0efe5]" }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor}`}>
        <span className={`material-symbols-outlined filled-icon text-[16px] ${color}`}>{icon}</span>
      </div>
      <h3 className="text-sm font-bold text-[#181c1c] uppercase tracking-wide">{label}</h3>
      <span className="ml-auto text-xs font-semibold text-[#5b5f5f] bg-[#e6e9e8] px-2 py-0.5 rounded-full">{count} task</span>
    </div>
  );
}

function TaskGroup({ droppableId, tasks, onEdit }) {
  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}
          className="flex flex-col rounded-xl overflow-hidden border border-[#dee4e3] shadow-sm">
          {tasks.map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} onEdit={onEdit} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function EmptyState({ message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#dee4e3] rounded-xl">
      <span className="material-symbols-outlined text-5xl text-[#c4c7c6] mb-3">task_alt</span>
      <p className="text-sm font-semibold text-[#5b5f5f]">{message}</p>
      {sub && <p className="text-xs text-[#6f7977] mt-1">{sub}</p>}
    </div>
  );
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try { const d = parseISO(dateStr); return isValid(d) ? d : null; } catch { return null; }
}

function getDayLabel(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "Tanpa Tanggal";
  if (isToday(d)) return "Hari Ini";
  if (isTomorrow(d)) return "Besok";
  const diff = differenceInCalendarDays(d, startOfDay(new Date()));
  if (diff > 0 && diff <= 6) return format(d, "EEEE, d MMM", { locale: id });
  if (diff < 0) return `Terlambat — ${format(d, "d MMM", { locale: id })}`;
  return format(d, "d MMM yyyy", { locale: id });
}

function getDayOrder(dateStr) {
  const d = parseDate(dateStr);
  return d ? differenceInCalendarDays(d, startOfDay(new Date())) : 9999;
}

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "completed", label: "Selesai" },
];

function FilterChips({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {FILTERS.map((f) => (
        <button key={f.key} onClick={() => onChange(f.key)}
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
            value === f.key ? "bg-[#26665f] text-white" : "bg-[#ebeeee] text-[#3f4947] hover:bg-[#dde0df]"
          }`}
        >{f.label}</button>
      ))}
    </div>
  );
}

// ── Daily streak summary bar ──────────────────────────────────────────────────
function DailyStreakBar({ dailyTasks }) {
  if (dailyTasks.length === 0) return null;
  const best   = Math.max(...dailyTasks.map((t) => t.streak ?? 0));
  const done   = dailyTasks.filter((t) => t.completed).length;
  const failed = dailyTasks.filter((t) => t.failedYesterday && !t.completed).length;
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-[#b0efe5]/40 to-[#f7faf9] rounded-2xl border border-[#c4e8e3]">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔥</span>
        <div>
          <p className="text-xs text-[#5b5f5f] font-medium">Streak Terbaik</p>
          <p className="text-lg font-bold text-[#26665f]">{best} hari</p>
        </div>
      </div>
      <div className="w-px bg-[#dee4e3]" />
      <div className="flex items-center gap-2">
        <span className="text-xl">✅</span>
        <div>
          <p className="text-xs text-[#5b5f5f] font-medium">Selesai Hari Ini</p>
          <p className="text-lg font-bold text-[#26665f]">{done}/{dailyTasks.length}</p>
        </div>
      </div>
      {failed > 0 && (
        <>
          <div className="w-px bg-[#dee4e3]" />
          <div className="flex items-center gap-2">
            <span className="text-xl">💔</span>
            <div>
              <p className="text-xs text-[#5b5f5f] font-medium">Streak Putus</p>
              <p className="text-lg font-bold text-[#ba1a1a]">{failed} task</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { tasks, reorderTasks } = useTask();
  const [showModal, setShowModal] = useState(false);
  const [editTask,  setEditTask]  = useState(null);
  const [dailyFilter,  setDailyFilter]  = useState("all");
  const [oneoffFilter, setOneoffFilter] = useState("all");

  const openAdd  = ()     => { setEditTask(null); setShowModal(true); };
  const openEdit = (task) => { setEditTask(task); setShowModal(true); };

  const dailyTasks  = useMemo(() => tasks.filter((t) =>  t.isDaily), [tasks]);
  const oneoffTasks = useMemo(() => tasks.filter((t) => !t.isDaily), [tasks]);

  const filteredDaily = useMemo(() =>
    dailyTasks.filter((t) =>
      dailyFilter === "active" ? !t.completed : dailyFilter === "completed" ? t.completed : true
    ), [dailyTasks, dailyFilter]);

  const filteredOneoff = useMemo(() =>
    oneoffTasks.filter((t) =>
      oneoffFilter === "active" ? !t.completed : oneoffFilter === "completed" ? t.completed : true
    ), [oneoffTasks, oneoffFilter]);

  const oneoffGroups = useMemo(() => {
    const groups = {};
    filteredOneoff.forEach((t) => {
      const label = getDayLabel(t.dueDate);
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });
    return Object.entries(groups).sort(([, a], [, b]) =>
      getDayOrder(a[0]?.dueDate) - getDayOrder(b[0]?.dueDate)
    );
  }, [filteredOneoff]);

  const completedToday = useMemo(() => {
    const all = [...dailyTasks, ...oneoffTasks.filter((t) => t.dueDate && isToday(parseDate(t.dueDate) || new Date(0)))];
    return { completed: all.filter((t) => t.completed).length, total: all.length };
  }, [dailyTasks, oneoffTasks]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "daily") {
        const items = Array.from(filteredDaily);
        const [moved] = items.splice(source.index, 1);
        items.splice(destination.index, 0, moved);
        reorderTasks([...items, ...tasks.filter((t) => !t.isDaily)]);
      } else {
        const groupLabel = source.droppableId.replace("oneoff-", "");
        const group = oneoffGroups.find(([l]) => l === groupLabel);
        if (!group) return;
        const items = Array.from(group[1]);
        const [moved] = items.splice(source.index, 1);
        items.splice(destination.index, 0, moved);
        const others = tasks.filter((t) => !items.find((i) => i.id === t.id));
        reorderTasks([...others, ...items]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <TopAppBar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 overflow-y-auto pb-32">
        <ProgressBar completed={completedToday.completed} total={completedToday.total} />

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* TUGAS HARIAN */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <SectionHeader icon="repeat" label="Tugas Harian" count={dailyTasks.length} />
              <FilterChips value={dailyFilter} onChange={setDailyFilter} />
            </div>
            <DailyStreakBar dailyTasks={dailyTasks} />
            {filteredDaily.length === 0 ? (
              <EmptyState message="Belum ada tugas harian" sub="Klik + dan aktifkan toggle Tugas Harian" />
            ) : (
              <TaskGroup droppableId="daily" tasks={filteredDaily} onEdit={openEdit} />
            )}
          </section>

          {/* DIVIDER */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#dee4e3]" />
            <span className="text-xs font-bold tracking-widest text-[#6f7977] uppercase">Tugas Terjadwal</span>
            <div className="flex-1 h-px bg-[#dee4e3]" />
          </div>

          {/* TUGAS ONE-OFF */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <SectionHeader icon="event" label="Tugas Terjadwal & Lainnya" count={oneoffTasks.length}
                color="text-[#575d5d]" bgColor="bg-[#dde0df]" />
              <FilterChips value={oneoffFilter} onChange={setOneoffFilter} />
            </div>
            {oneoffGroups.length === 0 ? (
              <EmptyState message="Belum ada tugas terjadwal" sub="Klik + untuk menambah tugas dengan tanggal" />
            ) : (
              oneoffGroups.map(([groupLabel, groupTasks]) => {
                const isOverdue = groupLabel.startsWith("Terlambat");
                const isHariIni = groupLabel === "Hari Ini";
                const isBesok   = groupLabel === "Besok";
                return (
                  <div key={groupLabel} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isOverdue ? "text-[#ba1a1a] bg-[#ffdad6]"
                        : isHariIni ? "text-[#00201d] bg-[#94d2c9]"
                        : isBesok   ? "text-[#26665f] bg-[#b0efe5]"
                        : "text-[#3f4947] bg-[#e6e9e8]"
                      }`}>{isOverdue && "⚠ "}{groupLabel}</span>
                      <span className="text-xs text-[#6f7977]">{groupTasks.length} task</span>
                    </div>
                    <TaskGroup droppableId={`oneoff-${groupLabel}`} tasks={groupTasks} onEdit={openEdit} />
                  </div>
                );
              })
            )}
          </section>
        </DragDropContext>
      </main>

      <div className="absolute bottom-24 right-4 sm:right-6 lg:right-8 z-40 lg:bottom-8">
        <button onClick={openAdd}
          className="fab-button bg-[#26665f] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(38,102,95,0.35)] hover:bg-[#296861] focus:outline-none">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      <MobileBottomNav />
      {showModal && <AddTaskModal onClose={() => setShowModal(false)} editTask={editTask} />}
    </div>
  );
}