import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/admin',                icon: '📊', label: 'Dashboard' },
  { to: '/admin/labs',           icon: '🏗️',  label: 'Manage Labs' },
  { to: '/admin/chemicals',      icon: '⚗️',  label: 'Chemicals' },
  { to: '/admin/transactions',   icon: '📋', label: 'Transactions' },
  { to: '/admin/analytics',      icon: '📈', label: 'Analytics' },
  { to: '/admin/users',          icon: '👥', label: 'Users' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-xl">🔬</div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">ChemLab</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 mx-3 mt-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs text-indigo-700 dark:text-indigo-300">
        🏫 Shri GS Institute of Tech & Science Indore
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }>
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}

        <button onClick={() => navigate('/dashboard')}
          className="sidebar-link sidebar-link-inactive w-full mt-2 border border-dashed border-slate-300 dark:border-slate-600">
          <span>👨‍🎓</span><span>Student View</span>
        </button>
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button onClick={toggleDarkMode}
          className="sidebar-link sidebar-link-inactive w-full">
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-slate-400 hover:text-red-500 transition-colors text-lg">⏻</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-slate-800 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 text-xl">☰</button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔬</span>
            <span className="font-bold text-slate-900 dark:text-white">Admin Panel</span>
          </div>
          <button onClick={toggleDarkMode} className="text-slate-500">{darkMode ? '☀️' : '🌙'}</button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
