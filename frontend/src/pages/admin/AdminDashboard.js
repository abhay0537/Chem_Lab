import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, chemicalsAPI } from '../../services/api';
import StatsCard from '../../components/shared/StatsCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [trend, setTrend]         = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [labUsage, setLabUsage]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStock, setLowStock]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, trendRes, borrowedRes, labRes, catRes, lowRes] = await Promise.all([
          reportsAPI.getDashboardStats(),
          reportsAPI.getDailyTrend({ days: 30 }),
          reportsAPI.getMostBorrowed({ days: 30, limit: 8 }),
          reportsAPI.getLabUsage({ days: 30 }),
          reportsAPI.getCategoryBreakdown(),
          chemicalsAPI.getLowStock(),
        ]);
        setStats(statsRes.data.stats);
        setTrend(trendRes.data.trend.slice(-14));
        setMostBorrowed(borrowedRes.data.results);
        setLabUsage(labRes.data.results);
        setCategories(catRes.data.results);
        setLowStock(lowRes.data.chemicals.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📊 Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Shri GS Institute of Tech & Science Indore — ChemLab Overview</p>
        </div>
        <button onClick={() => reportsAPI.exportCSV().then(res => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const a = document.createElement('a'); a.href = url; a.download = 'chemlab-report.csv'; a.click();
        })} className="btn-secondary text-sm hidden sm:flex items-center gap-2">
          📥 Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Chemicals"    value={stats?.totalChemicals}     icon="⚗️" color="primary" />
        <StatsCard title="Active Labs"        value={stats?.totalLabs}          icon="🏗️"  color="emerald" />
        <StatsCard title="Registered Users"   value={stats?.totalUsers}         icon="👥" color="blue" />
        <StatsCard title="Low Stock Alerts"   value={stats?.lowStockCount}      icon="⚠️" color="red" subtitle="Needs restocking" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today's Transactions" value={stats?.todayTransactions}  icon="📋" color="violet" />
        <StatsCard title="This Week"           value={stats?.weekTransactions}   icon="📅" color="amber" />
        <StatsCard title="Active Borrows"      value={stats?.activeBorrows}      icon="📤" color="blue" />
        <StatsCard title="Total Returns"       value={stats?.totalReturns}       icon="📥" color="emerald" />
      </div>

      {/* Low stock alert banner */}
      {lowStock.length > 0 && (
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">Low Stock Alert</h3>
              <p className="text-sm text-red-600 dark:text-red-400">{lowStock.length} chemicals need restocking</p>
            </div>
            <button onClick={() => navigate('/admin/chemicals?filter=lowStock')} className="ml-auto btn-danger text-sm">View All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(c => (
              <span key={c._id} className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                {c.name}: {c.quantity} {c.unit} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Transaction Trend */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">📈 Daily Transactions (14 days)</h2>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="borrows" stroke="#6366f1" strokeWidth={2} dot={false} name="Borrows" />
                <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={2} dot={false} name="Returns" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16">No data yet</p>}
        </div>

        {/* Category Breakdown Pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🍩 Chemical Categories</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, count }) => `${_id}: ${count}`}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16">No data yet</p>}
        </div>
      </div>

      {/* Most borrowed + Lab usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Most Borrowed */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🏆 Most Borrowed (30 days)</h2>
          {mostBorrowed.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mostBorrowed.map(r => ({ name: r.chemical?.name?.slice(0, 12), borrows: r.totalBorrows }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="borrows" fill="#6366f1" radius={[4, 4, 0, 0]} name="Borrows" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16">No data yet</p>}
        </div>

        {/* Lab Usage */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🏗️ Lab Usage (30 days)</h2>
          {labUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={labUsage.map(r => ({ name: r.lab?.code, transactions: r.totalTransactions, users: r.uniqueUserCount }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="transactions" fill="#10b981" radius={[4, 4, 0, 0]} name="Transactions" />
                <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Unique Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16">No data yet</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
