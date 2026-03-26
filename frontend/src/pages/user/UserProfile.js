import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '', studentId: user?.studentId || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">👤 My Profile</h1>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 capitalize">
              {user?.role}
            </span>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
            {editing ? 'Cancel' : '✏️ Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {editing ? (
            <>
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Student ID', key: 'studentId', type: 'text' },
                { label: 'Department', key: 'department', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'tel' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="input" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Student ID', value: user?.studentId || '—' },
                { label: 'Department', value: user?.department || '—' },
                { label: 'Phone', value: user?.phone || '—' },
                { label: 'College', value: user?.college || 'Shri GS Institute of Tech & Science Indore' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{value}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🔐 Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="password" value={passForm[key]}
                onChange={e => setPassForm(p => ({ ...p, [key]: e.target.value }))}
                className="input" required />
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : '🔑 Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
