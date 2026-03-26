/**
 * API Service
 * Configures axios with base URL and JWT auth interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor: attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chemlab_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle global errors ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || 'Something went wrong';

    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem('chemlab_token');
      localStorage.removeItem('chemlab_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied: Insufficient permissions');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Labs API ────────────────────────────────────────────────────────────────
export const labsAPI = {
  getAll:   ()         => api.get('/labs'),
  getOne:   (id)       => api.get(`/labs/${id}`),
  create:   (data)     => api.post('/labs', data),
  update:   (id, data) => api.put(`/labs/${id}`, data),
  delete:   (id)       => api.delete(`/labs/${id}`),
};

// ─── Chemicals API ───────────────────────────────────────────────────────────
export const chemicalsAPI = {
  getAll:      (params) => api.get('/chemicals', { params }),
  getOne:      (id)     => api.get(`/chemicals/${id}`),
  create:      (data)   => api.post('/chemicals', data),
  update:      (id, data) => api.put(`/chemicals/${id}`, data),
  restock:     (id, data) => api.patch(`/chemicals/${id}/restock`, data),
  delete:      (id)     => api.delete(`/chemicals/${id}`),
  getLowStock: ()       => api.get('/chemicals/low-stock'),
};

// ─── Transactions API ────────────────────────────────────────────────────────
export const transactionsAPI = {
  borrow:    (data)   => api.post('/transactions/borrow', data),
  return:    (data)   => api.post('/transactions/return', data),
  getAll:    (params) => api.get('/transactions', { params }),
  getMyHistory: (params) => api.get('/transactions/my-history', { params }),
  getOne:    (id)     => api.get(`/transactions/${id}`),
};

// ─── Reports API ─────────────────────────────────────────────────────────────
export const reportsAPI = {
  getDashboardStats:  () => api.get('/reports/dashboard-stats'),
  getMostBorrowed:    (params) => api.get('/reports/most-borrowed', { params }),
  getDailyTrend:      (params) => api.get('/reports/daily-trend', { params }),
  getLabUsage:        (params) => api.get('/reports/lab-usage', { params }),
  getStudentStats:    (params) => api.get('/reports/student-stats', { params }),
  getCategoryBreakdown: ()     => api.get('/reports/category-breakdown'),
  exportCSV:          (params) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
};

// ─── Users API ───────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:          (params) => api.get('/users', { params }),
  getOne:          (id)     => api.get(`/users/${id}`),
  updateRole:      (id, data) => api.patch(`/users/${id}/role`, data),
  toggleStatus:    (id)     => api.patch(`/users/${id}/toggle-status`),
};

export default api;
