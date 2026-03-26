import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const Analytics = () => {
  const [trend, setTrend]         = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [labUsage, setLabUsage]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [days, setDays]           = useState(30);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trendRes, borrowedRes, labRes, stuRes, catRes] = await Promise.all([
          reportsAPI.getDailyTrend({ days }),
          reportsAPI.getMostBorrowed({ days, limit: 10 }),
          reportsAPI.getLabUsage({ days }),
          reportsAPI.getStudentStats({ days, limit: 10 }),
          reportsAPI.getCategoryBreakdown(),
        ]);
        setTrend(trendRes.data.trend);
        setMostBorrowed(borrowedRes.data.results);
        setLabUsage(labRes.data.results);
        setStudents(stuRes.data.results);
        setCategories(catRes.data.results);
      } finally { setLoading(false); }
    };
    load();
  }, [days]);

  const handleExport = async () => {
    const res = await reportsAPI.exportCSV({ startDate: new Date(Date.now() - days * 86400000).toISOString().split('T')[0] });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'analytics-export.csv'; a.click();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📈 Analytics & Reports</h1>
          <p className="text-slate-500 text-sm">Chemical usage trends and statistics</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {[7, 30, 60, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-4 py-2 text-sm font-medium transition-all ${days === d ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                {d}d
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn-secondary text-sm">📥 Export</button>
        </div>
      </div>

      {/* Transaction Trend Area Chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">📊 Transaction Trend ({days} days)</h2>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="borrowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="borrows" stroke="#6366f1" fill="url(#borrowGrad)" strokeWidth={2} name="Borrows" />
              <Area type="monotone" dataKey="returns" stroke="#10b981" fill="url(#returnGrad)" strokeWidth={2} name="Returns" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 py-12">No transaction data for this period</p>}
      </div>

      {/* Row: Most borrowed + categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🏆 Top 10 Most Borrowed</h2>
          {mostBorrowed.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mostBorrowed.map(r => ({ name: r.chemical?.name?.slice(0, 14), borrows: r.totalBorrows, qty: Math.round(r.totalQuantity) }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="borrows" fill="#6366f1" radius={[0, 4, 4, 0]} name="Times Borrowed" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-12">No data yet</p>}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🍩 Chemical Category Distribution</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categories} dataKey="count" nameKey="_id" cx="50%" cy="50%"
                  outerRadius={100} innerRadius={50}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-12">No data yet</p>}
        </div>
      </div>

      {/* Lab usage */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">🏗️ Lab-wise Usage Statistics</h2>
        {labUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={labUsage.map(r => ({ lab: r.lab?.code, transactions: r.totalTransactions, users: r.uniqueUserCount }))}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="lab" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Transactions" />
              <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Unique Users" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 py-12">No data yet</p>}
      </div>

      {/* Top Students Table */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">👨‍🎓 Top Students by Usage</h2>
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['#', 'Student', 'Student ID', 'Department', 'Total Borrows', 'Total Qty'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {students.map((s, i) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="table-cell font-medium text-slate-900 dark:text-white">{s.user?.name}</td>
                    <td className="table-cell text-slate-500">{s.user?.studentId || '—'}</td>
                    <td className="table-cell text-slate-500">{s.user?.department || '—'}</td>
                    <td className="table-cell">
                      <span className="font-bold text-primary-600 dark:text-primary-400">{s.totalBorrows}</span>
                    </td>
                    <td className="table-cell text-slate-600 dark:text-slate-400">{Math.round(s.totalQuantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-center text-slate-400 py-8">No student data</p>}
      </div>
    </div>
  );
};

export default Analytics;
