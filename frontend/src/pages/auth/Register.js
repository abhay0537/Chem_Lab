import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', studentId: '', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
            <span className="text-3xl">⚗️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1">Join ChemLab Management System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { label: 'Full Name *', name: 'name', type: 'text', placeholder: 'Your full name' },
              { label: 'Email Address *', name: 'email', type: 'email', placeholder: 'you@college.edu' },
              { label: 'Student ID', name: 'studentId', type: 'text', placeholder: 'e.g. CSC2024001' },
              { label: 'Department', name: 'department', type: 'text', placeholder: 'e.g. B.Sc Chemistry' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: 'Your phone number' },
              { label: 'Password *', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
              { label: 'Confirm Password *', name: 'confirmPassword', type: 'password', placeholder: 'Re-enter password' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
                <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-all duration-150 mt-2 shadow-lg shadow-primary-600/30">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
