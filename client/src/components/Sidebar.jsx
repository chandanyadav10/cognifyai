import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FileText, BarChart2, Users,
  Settings, LogOut, BookOpen, Zap
} from "lucide-react";

const teacherNav = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/teacher" },
  { label: "Assessments",   icon: FileText,         path: "/teacher" },
  { label: "Analytics",     icon: BarChart2,        path: "/teacher" },
  { label: "Students",      icon: Users,            path: "/teacher" },
  { label: "Settings",      icon: Settings,         path: "/teacher" },
];

const studentNav = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/student" },
  { label: "My Attempts",   icon: BookOpen,         path: "/student" },
  { label: "Settings",      icon: Settings,         path: "/student" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const navItems  = user?.role === "teacher" ? teacherNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-dark-900 border-r border-dark-600 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dark-600">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <div>
          <span className="text-white font-semibold text-sm">CognifyAI</span>
          <p className="text-gray-500 text-[10px]">
            {user?.role === "teacher" ? "Teacher Suite" : "Student Portal"}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full text-left ${active ? "nav-item-active" : "nav-item"}`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-dark-600 space-y-1">
        <button onClick={() => navigate("/teacher")} className="nav-item w-full">
          <Settings size={16} />
          Settings
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-2">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-[10px] capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
