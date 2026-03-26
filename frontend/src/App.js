/**
 * App.js
 * Root component — sets up routing, context providers, and protected routes
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Auth Pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserLayout       from './components/user/UserLayout';
import UserDashboard    from './pages/user/UserDashboard';
import ChemicalList     from './pages/user/ChemicalList';
import BorrowChemical   from './pages/user/BorrowChemical';
import MyHistory        from './pages/user/MyHistory';
import UserProfile      from './pages/user/UserProfile';

// Admin Pages
import AdminLayout      from './components/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import ManageLabs       from './pages/admin/ManageLabs';
import ManageChemicals  from './pages/admin/ManageChemicals';
import ManageUsers      from './pages/admin/ManageUsers';
import Transactions     from './pages/admin/Transactions';
import Analytics        from './pages/admin/Analytics';

// Shared
import LoadingScreen from './components/shared/LoadingScreen';
import NotFound      from './components/shared/NotFound';

// ─── Protected Route Wrapper ─────────────────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

// ─── Public Route (redirect if already logged in) ────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/"        element={<Navigate to="/login" replace />} />
      <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route index             element={<UserDashboard />} />
        <Route path="chemicals"  element={<ChemicalList />} />
        <Route path="borrow"     element={<BorrowChemical />} />
        <Route path="history"    element={<MyHistory />} />
        <Route path="profile"    element={<UserProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index              element={<AdminDashboard />} />
        <Route path="labs"        element={<ManageLabs />} />
        <Route path="chemicals"   element={<ManageChemicals />} />
        <Route path="users"       element={<ManageUsers />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="analytics"   element={<Analytics />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #1e293b)',
                color: '#f1f5f9',
                borderRadius: '10px',
                border: '1px solid rgba(148,163,184,0.1)',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
