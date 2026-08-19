import { Link, useLocation } from "react-router-dom";

export default function SidebarDesktop() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isCalendar = pathname === "/calendar";
  const isStats = pathname === "/stats";

  const navItem = (to, icon, label, active) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
        active
          ? "bg-[#dde0df] text-[#5f6363] font-semibold"
          : "hover:bg-[#ebeeee] text-[#3f4947] hover:text-[#181c1c]"
      }`}
    >
      <span className={`material-symbols-outlined ${active ? "filled-icon" : ""}`}>{icon}</span>
      <span className="text-base font-semibold">{label}</span>
    </Link>
  );

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-[#f1f4f4] border-r border-[#bfc9c6] h-full p-4 shrink-0 sticky top-0 h-screen">
      <div className="flex items-center gap-3 px-4 h-14 mb-6">
        <span className="material-symbols-outlined text-[#26665f] text-3xl filled-icon">task_alt</span>
        <span className="text-xl font-bold text-[#26665f]">FocusTask</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItem("/", "today", "Today", isToday)}
        {navItem("/calendar", "calendar_month", "Calendar", isCalendar)}
        {navItem("/stats", "bar_chart", "Statistics", isStats)}
      </nav>
    </aside>
  );
}
