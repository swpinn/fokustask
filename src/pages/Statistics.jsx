import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { startOfWeek, eachDayOfInterval, endOfWeek, isSameDay, format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { id } from "date-fns/locale";
import TopAppBar from "../components/layout/TopAppBar";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import { useTask } from "../contexts/TaskContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Statistics() {
  const { tasks } = useTask();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(now, { weekStartsOn: 1 }) });

  const weeklyData = weekDays.map((day) => ({
    label: format(day, "EEE", { locale: id }),
    count: tasks.filter((t) => t.completed && t.dueDate && isSameDay(new Date(t.dueDate + "T00:00"), day)).length,
  }));

  const monthTasks = tasks.filter((t) => t.dueDate && isSameMonth(new Date(t.dueDate + "T00:00"), now));
  const monthCompleted = monthTasks.filter((t) => t.completed).length;
  const monthPending = monthTasks.length - monthCompleted;

  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const barData = {
    labels: weeklyData.map((d) => d.label),
    datasets: [{
      label: "Tugas Selesai",
      data: weeklyData.map((d) => d.count),
      backgroundColor: "#26665f",
      borderRadius: 6,
      barThickness: 18,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "#5b5f5f", font: { family: "Manrope" } }, grid: { display: false } },
      x: { ticks: { color: "#5b5f5f", font: { family: "Manrope" } }, grid: { display: false } },
    },
  };

  const doughnutData = {
    labels: ["Selesai", "Tertunda"],
    datasets: [{
      data: [monthCompleted || 0, monthPending || 1],
      backgroundColor: ["#26665f", "#e0e3e2"],
      borderWidth: 0,
      cutout: "75%",
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, font: { family: "Manrope" }, color: "#5b5f5f" } },
    },
  };

  const stats = [
    { label: "Total Task", value: totalTasks, icon: "list_alt", color: "bg-[#b0efe5] text-[#00201d]" },
    { label: "Selesai", value: totalCompleted, icon: "task_alt", color: "bg-[#26665f] text-white" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: "insights", color: "bg-[#dde0df] text-[#181c1c]" },
    { label: "Pending", value: totalTasks - totalCompleted, icon: "pending", color: "bg-[#ffdad6] text-[#93000a]" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      <TopAppBar title="Statistics" />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-28 pt-8 flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#181c1c] mb-2">Statistik & Insight</h1>
          <p className="text-base text-[#5b5f5f]">Pantau produktivitas dan temukan ritme fokusmu.</p>
        </div>

        {/* Achievement Banner */}
        {completionRate >= 50 && (
          <div className="bg-white border border-[#dee4e3] p-5 rounded-xl mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-[#b0efe5] text-[#00201d] p-3 rounded-full shrink-0">
              <span className="material-symbols-outlined filled-icon text-3xl">emoji_events</span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-[#181c1c] mb-1">Pencapaian Luar Biasa!</h2>
              <p className="text-base text-[#5b5f5f]">
                Kamu sudah menyelesaikan{" "}
                <strong className="text-[#26665f]">{completionRate}% task</strong> hingga saat ini. Keep it up!
              </p>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-[#dee4e3] rounded-xl p-4 flex flex-col items-center gap-2 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined filled-icon">{s.icon}</span>
              </div>
              <span className="text-2xl font-bold text-[#181c1c]">{s.value}</span>
              <span className="text-xs font-semibold text-[#5b5f5f]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#dee4e3] p-5 rounded-xl">
            <h3 className="text-base font-semibold text-[#181c1c] mb-4">Minggu Ini</h3>
            <div className="h-48 relative">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
          <div className="bg-white border border-[#dee4e3] p-5 rounded-xl">
            <h3 className="text-base font-semibold text-[#181c1c] mb-4">Bulan Ini</h3>
            <div className="h-48 relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
