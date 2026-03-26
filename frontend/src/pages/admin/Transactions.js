import React, { useState, useEffect, useCallback } from 'react';
import { transactionsAPI, labsAPI, reportsAPI } from '../../services/api';
import { StatusBadge, TypeBadge } from '../../components/shared/Badges';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [labs, setLabs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [pagination, setPagination]     = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ type: '', status: '', labId: '', startDate: '', endDate: '' });
  const [exporting, setExporting]       = useState(false);

  useEffect(() => { labsAPI.getAll().then(r => setLabs(r.data.labs)); }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.type)      params.type      = filters.type;
      if (filters.status)    params.status    = filters.status;
      if (filters.labId)     params.labId     = filters.labId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate)   params.endDate   = filters.endDate;
      const r = await transactionsAPI.getAll(params);
      setTransactions(r.data.transactions);
      setPagination(r.data.pagination);
    } catch { } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.labId) params.lab = filters.labId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await reportsAPI.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📋 All Transactions</h1>
          <p className="text-slate-500 text-sm">{pagination.total} total records</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary text-sm flex items-center gap-2">
          {exporting ? '...' : '📥 Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))} className="input text-sm">
            <option value="">All Types</option>
            <option value="borrow">Borrow</option>
            <option value="return">Return</option>
          </select>
          <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="input text-sm">
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="returned">Returned</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filters.labId} onChange={e => setFilters(p => ({ ...p, labId: e.target.value }))} className="input text-sm">
            <option value="">All Labs</option>
            {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className="input text-sm" placeholder="Start date" />
          <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className="input text-sm" placeholder="End date" />
        </div>
        <button onClick={() => setFilters({ type: '', status: '', labId: '', startDate: '', endDate: '' })}
          className="btn-secondary text-sm mt-3">Clear Filters</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-2">📭</p>
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Student', 'Chemical', 'Type', 'Qty', 'Lab', 'Date', 'Status', 'Purpose'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-xs">{tx.user?.name}</p>
                        <p className="text-xs text-slate-400">{tx.user?.studentId}</p>
                        <p className="text-xs text-slate-400">{tx.user?.department}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-900 dark:text-white text-xs">{tx.chemical?.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{tx.chemical?.formula}</p>
                    </td>
                    <td className="table-cell"><TypeBadge type={tx.type} /></td>
                    <td className="table-cell font-semibold text-sm">{tx.quantity} {tx.unit}</td>
                    <td className="table-cell text-xs text-slate-500">{tx.lab?.name}</td>
                    <td className="table-cell text-xs text-slate-500 whitespace-nowrap">{format(new Date(tx.createdAt), 'MMM d, yy HH:mm')}</td>
                    <td className="table-cell"><StatusBadge status={tx.status} /></td>
                    <td className="table-cell text-xs text-slate-500 max-w-xs truncate">{tx.purpose || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-2">
            {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === pagination.page ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
