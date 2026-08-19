import { useState, useEffect } from "react";
import { useTask } from "../../contexts/TaskContext";

const CATEGORIES = ["Personal", "Work", "Shopping", "Health", "Finance"];
const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_LABELS = { low: "Rendah", medium: "Sedang", high: "Tinggi" };

export default function AddTaskModal({ onClose, editTask = null }) {
  const { addTask, updateTask } = useTask();
  const [title, setTitle]               = useState("");
  const [category, setCategory]         = useState("Personal");
  const [dueDate, setDueDate]           = useState("");
  const [dueTime, setDueTime]           = useState("");
  const [priority, setPriority]         = useState("medium");
  const [notes, setNotes]               = useState("");
  const [isDaily, setIsDaily]           = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [customCat, setCustomCat]       = useState("");
  const [addingCat, setAddingCat]       = useState(false);
  const [categories, setCategories]     = useState(CATEGORIES);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || "");
      setCategory(editTask.category || "Personal");
      setDueDate(editTask.dueDate || "");
      setDueTime(editTask.dueTime || "");
      setPriority(editTask.priority || "medium");
      setNotes(editTask.notes || "");
      setIsDaily(editTask.isDaily || false);
    }
  }, [editTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const data = {
      title: title.trim(),
      category,
      dueDate: isDaily ? "" : dueDate,
      dueTime,
      priority,
      notes,
      isDaily,
    };
    if (editTask) await updateTask(editTask.id, data);
    else await addTask(data);
    setSubmitting(false);
    onClose();
  };

  const addCustomCategory = () => {
    const trimmed = customCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setCategory(trimmed);
    }
    setCustomCat("");
    setAddingCat(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#2d3131]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dee4e3]">
          <h2 className="text-xl font-bold text-[#26665f]">
            {editTask ? "Edit Task" : "Tambah Tugas Baru"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f1f4f4] text-[#5b5f5f]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto pb-8">

          {/* Daily Toggle — prominent at top */}
          <div
            onClick={() => { setIsDaily(!isDaily); if (!isDaily) setDueDate(""); }}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
              isDaily
                ? "border-[#26665f] bg-[#b0efe5]/30"
                : "border-[#dee4e3] bg-[#f7faf9] hover:border-[#94d2c9]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDaily ? "bg-[#26665f]" : "bg-[#e0e3e2]"}`}>
                <span className={`material-symbols-outlined filled-icon text-[20px] ${isDaily ? "text-white" : "text-[#5b5f5f]"}`}>
                  repeat
                </span>
              </div>
              <div>
                <p className={`text-sm font-bold ${isDaily ? "text-[#26665f]" : "text-[#181c1c]"}`}>Tugas Harian</p>
                <p className="text-xs text-[#5b5f5f]">Muncul setiap hari secara otomatis</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all relative ${isDaily ? "bg-[#26665f]" : "bg-[#c4c7c6]"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isDaily ? "right-1" : "left-1"}`} />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Judul Tugas *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#e0e3e3] focus:border-[#26665f] focus:outline-none py-2 text-base text-[#181c1c] placeholder-[#c4c7c6] transition-colors"
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    category === cat
                      ? "border-[#26665f] text-[#00201d] bg-[#b0efe5]"
                      : "border-[#dee4e3] text-[#3f4947] hover:bg-[#f1f4f4]"
                  }`}
                >{cat}</button>
              ))}
              {addingCat ? (
                <div className="flex gap-1">
                  <input
                    autoFocus value={customCat}
                    onChange={(e) => setCustomCat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCategory())}
                    className="border border-[#26665f] rounded-full px-3 py-1 text-sm focus:outline-none w-32"
                    placeholder="Nama kategori"
                  />
                  <button type="button" onClick={addCustomCategory} className="text-[#26665f] text-sm font-semibold">OK</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAddingCat(true)}
                  className="px-4 py-1.5 rounded-full border border-dashed border-[#bfc9c6] text-[#5b5f5f] text-sm hover:bg-[#f1f4f4] flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add</span>Tambah
                </button>
              )}
            </div>
          </div>

          {/* Date & Time — hidden for daily tasks */}
          {!isDaily && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Tanggal</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#c4c7c6] text-[20px]">calendar_today</span>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#e0e3e3] focus:border-[#26665f] focus:outline-none pl-7 py-2 text-base text-[#181c1c] transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Waktu</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#c4c7c6] text-[20px]">schedule</span>
                  <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#e0e3e3] focus:border-[#26665f] focus:outline-none pl-7 py-2 text-base text-[#181c1c] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Time only for daily tasks */}
          {isDaily && (
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Waktu Pengingat (opsional)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#c4c7c6] text-[20px]">schedule</span>
                <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-[#e0e3e3] focus:border-[#26665f] focus:outline-none pl-7 py-2 text-base text-[#181c1c] transition-colors" />
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Prioritas</label>
            <div className="flex bg-[#f1f4f4] rounded-xl p-1 gap-1">
              {PRIORITIES.map((p) => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    priority === p
                      ? p === "high" ? "bg-white shadow text-[#ba1a1a]"
                        : p === "low" ? "bg-white shadow text-[#5b5f5f]"
                        : "bg-white shadow text-[#26665f]"
                      : "text-[#5b5f5f]"
                  }`}
                >{PRIORITY_LABELS[p]}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-widest text-[#3f4947] uppercase">Catatan</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full bg-[#f1f4f4] border border-[#e0e3e3] rounded-xl p-3 text-sm text-[#181c1c] placeholder-[#c4c7c6] resize-none focus:outline-none focus:border-[#26665f] transition-colors"
              placeholder="Any extra details?" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-full border border-[#dee4e3] text-[#26665f] font-semibold text-sm hover:bg-[#f1f4f4] transition-colors">
              Batal
            </button>
            <button type="submit" disabled={submitting || !title.trim()}
              className="flex-1 h-11 rounded-full bg-[#26665f] text-white font-semibold text-sm hover:bg-[#296861] disabled:opacity-50 transition-colors shadow-md">
              {submitting ? "Menyimpan..." : editTask ? "Update" : "Simpan Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
