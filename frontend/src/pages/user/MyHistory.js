import React, { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../../services/api';
import { StatusBadge, TypeBadge } from '../../components/shared/Badges';
import Modal from '../../components/shared/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MyHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [pagination, setPagination]     = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters]           = useState({ type: '', status: '' });
  const [returnModal, setReturnModal]   = useState(null);
  const [returning, setReturning]       = useState(false);
  const [activeBorrows, setActiveBorrows] = useState(0);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getMyHistory({ page, limit: 15, ...filters });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
      setActiveBorrows(res.data.activeBorrows);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  const handleReturn = async () => {
    if (!returnModal) return;
    setReturning(true);
    try {
      await transactionsAPI.return({ transactionId: returnModal._id, quantity: returnModal.quantity });
      toast.success(`✅ ${returnModal.chemical?.name} returned successfully`);
      setReturnModal(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Return failed');
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📋 My Borrow History</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total transactions · {activeBorrows} active borrows</p>
        </div>
      </div>

      {/* Active borrows alert */}
      {activeBorrows > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">You have {activeBorrows} active borrow{activeBorrows > 1 ? 's' : ''}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">Please return chemicals after use. Click "Return" on any active borrow below.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
          className="input w-auto text-sm">
          <option value="">All Types</option>
          <option value="borrow">Borrow</option>
          <option value="return">Return</option>
        </select>
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          className="input w-auto text-sm">
          <option value="">All Status</option>
          <option value="approved">Approved (Active)</option>
          <option value="returned">Returned</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={() => setFilters({ type: '', status: '' })}
          className="btn-secondary text-sm">Clear</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No transactions found</p>
            <p className="text-sm">Your borrow history will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {['Chemical', 'Type', 'Quantity', 'Lab', 'Date', 'Status', 'Action'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{tx.chemical?.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{tx.chemical?.formula}</p>
                        </div>
                      </td>
                      <td className="table-cell"><TypeBadge type={tx.type} /></td>
                      <td className="table-cell font-semibold">{tx.quantity} {tx.unit}</td>
                      <td className="table-cell text-slate-500">{tx.lab?.name}</td>
                      <td className="table-cell text-slate-500 whitespace-nowrap">{format(new Date(tx.createdAt), 'MMM d, yyyy')}</td>
                      <td className="table-cell"><StatusBadge status={tx.status} /></td>
                      <td className="table-cell">
                        {tx.type === 'borrow' && tx.status === 'approved' && (
                          <button onClick={() => setReturnModal(tx)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors">
                            📥 Return
                          </button>
                        )}
                        {tx.purpose && (
                          <p className="text-xs text-slate-400 mt-1">{tx.purpose}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => load(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      p === pagination.page ? 'bg-primary-600 text-white' : 'btn-secondary'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Return Confirmation Modal */}
      <Modal isOpen={!!returnModal} onClose={() => setReturnModal(null)} title="📥 Confirm Return" size="sm">
        {returnModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Chemical</span>
                <span className="font-semibold text-slate-900 dark:text-white">{returnModal.chemical?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Quantity</span>
                <span className="font-semibold text-slate-900 dark:text-white">{returnModal.quantity} {returnModal.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Lab</span>
                <span className="font-semibold text-slate-900 dark:text-white">{returnModal.lab?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Borrowed on</span>
                <span className="font-semibold text-slate-900 dark:text-white">{format(new Date(returnModal.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">Are you sure you want to return this chemical? The quantity will be added back to inventory.</p>
            <div className="flex gap-3">
              <button onClick={() => setReturnModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReturn} disabled={returning} className="btn-success flex-1">
                {returning ? 'Returning...' : '✅ Confirm Return'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyHistory;
