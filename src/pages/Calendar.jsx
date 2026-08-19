import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, getDay,
} from "date-fns";
import { id } from "date-fns/locale";
import TopAppBar from "../components/layout/TopAppBar";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import { useTask } from "../contexts/TaskContext";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function Calendar() {
  const { tasks } = useTask();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (day) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate + "T00:00"), day));

  const selectedTasks = getTasksForDay(selectedDay);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setSidebarOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <TopAppBar title="Calendar" />
      <main className="flex-grow flex flex-col lg:flex-row w-full relative overflow-y-auto pb-20 lg:pb-0">
        {/* Calendar Grid */}
        <div className="flex-grow flex flex-col p-4 sm:p-6 lg:mr-[320px] w-full">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#181c1c]">
                {format(currentMonth, "MMMM yyyy", { locale: id })}
              </h1>
              <p className="text-sm text-[#5b5f5f] mt-0.5">Review your monthly progress.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="w-10 h-10 rounded-full hover:bg-[#ebeeee] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 h-10 rounded-full hover:bg-[#ebeeee] text-sm font-semibold text-[#26665f] transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="w-10 h-10 rounded-full hover:bg-[#ebeeee] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-[#bfc9c6] w-full">
            <div className="grid grid-cols-7 bg-[#f1f4f4] border-b border-[#bfc9c6]">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-3 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#5b5f5f]">{d}</div>
              ))}
            </div>
            <div className="month-grid">
              {days.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDay);
                const isTodayDay = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`day-cell ${isTodayDay ? "current" : ""} ${isSelected ? "active" : ""} ${!isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    <span className="day-number">{format(day, "d")}</span>
                    {dayTasks.length > 0 && (
                      <div className="dots-container">
                        {dayTasks.slice(0, 3).map((t) => (
                          <div key={t.id} className="dot" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Sidebar */}
        <aside className={`sidebar-trans lg:absolute lg:right-0 lg:top-0 lg:h-full w-full lg:w-[320px] bg-white border-l border-[#bfc9c6] p-5 flex flex-col shadow-lg lg:shadow-sm lg:flex ${sidebarOpen ? "open" : "hidden lg:flex"}`}>
          <div className="w-12 h-1.5 bg-[#bfc9c6] rounded-full mx-auto mb-4 lg:hidden" />
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-[#181c1c]">
              {format(selectedDay, "d MMMM", { locale: id })}
            </h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-[#f1f4f4] text-[#5b5f5f]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {selectedTasks.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-[#bfc9c6]">event_available</span>
                <p className="text-sm text-[#5b5f5f] mt-3">Tidak ada task di hari ini</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedTasks.map((t) => (
                  <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border border-[#dee4e3] ${t.completed ? "opacity-50" : ""}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${t.completed ? "bg-[#26665f]" : "border-2 border-[#bfc9c6]"}`}>
                      {t.completed && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <div>
                      <p className={`text-sm font-medium text-[#181c1c] ${t.completed ? "line-through" : ""}`}>{t.title}</p>
                      {t.dueTime && <p className="text-xs text-[#5b5f5f] mt-0.5">{t.dueTime}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-[#2d3131]/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
