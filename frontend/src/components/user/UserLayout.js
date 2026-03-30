import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/dashboard/chemicals", icon: "⚗️", label: "Browse Chemicals" },
  { to: "/dashboard/borrow", icon: "📤", label: "Borrow Chemical" },
  { to: "/dashboard/history", icon: "📋", label: "My History" },
  { to: "/dashboard/profile", icon: "👤", label: "My Profile" },
  { to: "/about", icon: "👥", label: "About Us" },
];

const UserLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-xl">
            ⚗️
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">
              ChemLab
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Student Portal
            </p>
          </div>
        </div>
      </div>

      {/* College info */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-xs text-primary-700 dark:text-primary-300">
        🏫 Shri GS Institute of Tech & Science Indore
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="sidebar-link sidebar-link-inactive w-full mt-2 border border-dashed border-slate-300 dark:border-slate-600"
          >
            <span>🔧</span>
            <span>Switch to Admin</span>
          </button>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="sidebar-link sidebar-link-inactive w-full"
        >
          <span>{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.studentId || user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-slate-400 hover:text-red-500 transition-colors text-lg"
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-white dark:bg-slate-800 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xl"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚗️</span>
            <span className="font-bold text-slate-900 dark:text-white">
              ChemLab
            </span>
          </div>
          <button onClick={toggleDarkMode} className="text-slate-500">
            {darkMode ? "☀️" : "🌙"}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;