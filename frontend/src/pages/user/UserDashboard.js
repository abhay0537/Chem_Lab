import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chemicalsAPI, transactionsAPI, labsAPI } from '../../services/api';
import StatsCard from '../../components/shared/StatsCard';
import { StatusBadge } from '../../components/shared/Badges';
import { format } from 'date-fns';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [labs, setLabs]               = useState([]);
  const [chemicals, setChemicals]     = useState([]);
  const [history, setHistory]         = useState([]);
  const [stats, setStats]             = useState({ activeBorrows: 0, totalBorrows: 0 });
  const [selectedLab, setSelectedLab] = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [labsRes, histRes] = await Promise.all([
          labsAPI.getAll(),
          transactionsAPI.getMyHistory({ limit: 5 }),
        ]);
        setLabs(labsRes.data.labs);
        setHistory(histRes.data.transactions);
        setStats({ activeBorrows: histRes.data.activeBorrows, totalBorrows: histRes.data.pagination?.total || 0 });
        if (labsRes.data.labs.length > 0) setSelectedLab(labsRes.data.labs[0]._id);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedLab) return;
    chemicalsAPI.getAll({ lab: selectedLab, limit: 8 })
      .then(r => setChemicals(r.data.chemicals))
      .catch(() => {});
  }, [selectedLab]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-primary-100 mt-1">
              {user?.department && <span>{user.department} · </span>}
              {user?.studentId && <span>ID: {user.studentId} · </span>}
              Shri GS Institute of Tech & Science Indore
            </p>
          </div>
          <div className="text-4xl hidden sm:block">⚗️</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => navigate('/dashboard/chemicals')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
            🔍 Browse Chemicals
          </button>
          <button onClick={() => navigate('/dashboard/borrow')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
            📤 Borrow Chemical
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Borrows"  value={stats.activeBorrows} icon="📤" color="blue"    subtitle="Currently borrowed" />
        <StatsCard title="Total Borrows"   value={stats.totalBorrows}  icon="📊" color="primary" subtitle="All time" />
        <StatsCard title="Labs Available"  value={labs.length}         icon="🏗️"  color="emerald" subtitle="In your college" />
        <StatsCard title="My College"      value="1"                   icon="🏫" color="amber"   subtitle="Shri GS Institute of Tech & Science Indore" />
      </div>

      {/* Lab selector + chemicals */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">🧪 Available Chemicals</h2>
          <select value={selectedLab} onChange={e => setSelectedLab(e.target.value)}
            className="input w-auto text-sm">
            {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>

        {chemicals.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No chemicals found in this lab</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {chemicals.map(chem => (
              <div key={chem._id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate('/dashboard/borrow', { state: { chemical: chem } })}>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-lg">⚗️</div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    chem.quantity <= chem.lowStockThreshold
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {chem.quantity <= chem.lowStockThreshold ? '⚠️ Low' : '✅ In Stock'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">{chem.name}</h3>
                {chem.formula && <p className="text-xs text-slate-400 font-mono mt-0.5">{chem.formula}</p>}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Available</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{chem.quantity} {chem.unit}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Max Borrow</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{chem.maxBorrowLimit} {chem.unit}</span>
                  </div>
                </div>
                {/* Stock bar */}
                {chem.totalCapacity > 0 && (
                  <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      chem.quantity / chem.totalCapacity < 0.2 ? 'bg-red-500'
                      : chem.quantity / chem.totalCapacity < 0.5 ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    }`} style={{ width: `${Math.min(100, (chem.quantity / chem.totalCapacity) * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate('/dashboard/chemicals')}
          className="mt-4 w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all font-medium">
          View All Chemicals →
        </button>
      </div>

      {/* Recent history */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">📋 Recent Activity</h2>
          <button onClick={() => navigate('/dashboard/history')}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No activity yet. Start by borrowing a chemical!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(tx => (
              <div key={tx._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-base flex-shrink-0">
                  {tx.type === 'borrow' ? '📤' : '📥'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{tx.chemical?.name}</p>
                  <p className="text-xs text-slate-500">{tx.quantity} {tx.unit} · {tx.lab?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={tx.status} />
                  <p className="text-xs text-slate-400 mt-1">{format(new Date(tx.createdAt), 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
