import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/shared/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ManageUsers = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters]   = useState({ role: '', search: '' });
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const r = await usersAPI.getAll({ page, limit: 15, ...filters });
      setUsers(r.data.users);
      setPagination(r.data.pagination);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  const handleToggleStatus = async (user) => {
    try {
      await usersAPI.toggleStatus(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      load(pagination.page);
    } catch { toast.error('Failed to update status'); }
  };

  const handleUpdateRole = async (newRole) => {
    setSaving(true);
    try {
      await usersAPI.updateRole(selected._id, { role: newRole });
      toast.success('Role updated');
      setModal(null);
      load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const roleBadge = (role) => ({
    superadmin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    admin:      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    user:       'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  }[role] || 'bg-slate-100 text-slate-700');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">👥 Manage Users</h1>
          <p className="text-slate-500 text-sm">{pagination.total} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input type="text" placeholder="🔍 Search by name, email, or ID..." value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className="input flex-1 min-w-48" />
        <select value={filters.role} onChange={e => setFilters(p => ({ ...p, role: e.target.value }))} className="input w-auto">
          <option value="">All Roles</option>
          <option value="user">Student</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <button onClick={() => setFilters({ role: '', search: '' })} className="btn-secondary text-sm">Clear</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>{['User', 'Role', 'Student ID', 'Department', 'Joined', 'Status', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${roleBadge(u.role)} capitalize`}>{u.role}</span>
                    </td>
                    <td className="table-cell text-slate-500 text-sm">{u.studentId || '—'}</td>
                    <td className="table-cell text-slate-500 text-sm">{u.department || '—'}</td>
                    <td className="table-cell text-slate-500 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="table-cell">
                      <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {u.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        {isSuperAdmin && (
                          <button onClick={() => { setSelected(u); setModal('role'); }}
                            className="p-1.5 text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Change role">
                            🔑
                          </button>
                        )}
                        <button onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 text-xs rounded-lg transition-all ${u.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-3xl mb-2">👤</p>
                <p>No users found</p>
              </div>
            )}
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === pagination.page ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Role change modal */}
      <Modal isOpen={modal === 'role'} onClose={() => setModal(null)} title="🔑 Change User Role" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="font-semibold text-slate-900 dark:text-white">{selected.name}</p>
              <p className="text-sm text-slate-500">{selected.email}</p>
              <p className="text-xs mt-1">Current role: <span className={`badge ${roleBadge(selected.role)} capitalize`}>{selected.role}</span></p>
            </div>
            <div className="space-y-2">
              {['user', 'admin', 'superadmin'].map(role => (
                <button key={role} onClick={() => handleUpdateRole(role)} disabled={saving || selected.role === role}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${selected.role === role ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
                  <p className="font-medium capitalize text-slate-900 dark:text-white">{role}</p>
                  <p className="text-xs text-slate-500">
                    {role === 'user' ? 'Can browse and borrow chemicals' : role === 'admin' ? 'Can manage labs, chemicals, and view reports' : 'Full system access including user management'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
