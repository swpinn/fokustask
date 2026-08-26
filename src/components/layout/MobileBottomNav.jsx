import { Link, useLocation } from "react-router-dom";

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const isToday = pathname === "/";
  const isCalendar = pathname === "/calendar";
  const isStats = pathname === "/stats";
  const isTimer = pathname === "/timer";

  const navItem = (to, icon, label, active) => (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 rounded-2xl ${
        active ? "bg-[#b0efe5] text-[#00201d]" : "text-[#5b5f5f]"
      }`}
    >
      <span className={`material-symbols-outlined mb-0.5 ${active ? "filled-icon" : ""}`}>{icon}</span>
      <span className="text-[11px] font-semibold tracking-wide uppercase font-[Inter]">{label}</span>
    </Link>
  );

  return (
    <nav className="lg:hidden bg-white border-t border-[#bfc9c6] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 shadow-sm">
      {navItem("/", "check_circle", "Tasks", isToday)}
      {navItem("/calendar", "calendar_month", "Calendar", isCalendar)}
      {navItem("/timer", "timer", "Timer", isTimer)}
      {navItem("/stats", "bar_chart", "Stats", isStats)}
    </nav>
  );
}
