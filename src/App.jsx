import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import SidebarDesktop from "./components/layout/SidebarDesktop";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";
import Login from "./pages/Login";
import Timer from "./pages/Timer";

function ProtectedLayout() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <TaskProvider>
      <div className="flex h-screen w-full bg-[#f7faf9] overflow-hidden">
        <SidebarDesktop />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/timer" element={<Timer />} />
          </Routes>
        </div>
      </div>
    </TaskProvider>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
