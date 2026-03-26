/**
 * AuthContext
 * Global authentication state using React Context API
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // Initial auth check
  const [token, setToken]     = useState(localStorage.getItem('chemlab_token'));

  // ─── Bootstrap: verify token on app load ──────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('chemlab_token');
      if (!savedToken) { setLoading(false); return; }

      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
        setToken(savedToken);
      } catch {
        // Token invalid — clear it
        localStorage.removeItem('chemlab_token');
        localStorage.removeItem('chemlab_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('chemlab_token', data.token);
    localStorage.setItem('chemlab_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data.user;
  }, []);

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('chemlab_token', data.token);
    localStorage.setItem('chemlab_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success('Account created successfully! 🎉');
    return data.user;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('chemlab_token');
    localStorage.removeItem('chemlab_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  // ─── Update user state (after profile update) ─────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('chemlab_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin      = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateUser,
      isAdmin, isSuperAdmin,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
