import { useAuth } from "../../contexts/AuthContext";

export default function TopAppBar({ title = "FocusTask" }) {
  const { currentUser, signOut } = useAuth();
  const initials = currentUser?.displayName
    ? currentUser.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : currentUser?.email?.slice(0, 2).toUpperCase() || "US";

  return (
    <header className="bg-[#f7faf9] shrink-0 z-40 flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 w-full border-b border-[#bfc9c6] lg:border-none sticky top-0">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl text-[#26665f] lg:hidden">{title}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={signOut}
          title="Sign out"
          className="text-[#3f4947] hover:bg-[#ebeeee] transition-colors rounded-full p-2 w-11 h-11 flex items-center justify-center"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-[#b0efe5] text-[#00201d] flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity ml-1 cursor-default" title={currentUser?.email}>
          {initials}
        </div>
      </div>
    </header>
  );
}
