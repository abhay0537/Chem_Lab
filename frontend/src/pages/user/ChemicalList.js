import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chemicalsAPI, labsAPI } from '../../services/api';
import { HazardBadge } from '../../components/shared/Badges';

const CATEGORIES = ['All', 'Acid', 'Base', 'Solvent', 'Salt', 'Indicator', 'Reagent', 'Buffer', 'Standard', 'Gas', 'Other'];
const HAZARD_LEVELS = ['All', 'Low', 'Medium', 'High', 'Extreme'];

const ChemicalList = () => {
  const navigate = useNavigate();
  const [chemicals, setChemicals] = useState([]);
  const [labs, setLabs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ lab: '', category: 'All', hazardLevel: 'All', search: '', lowStock: false });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const loadChemicals = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page, limit: 20,
        ...(filters.lab && { lab: filters.lab }),
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.hazardLevel !== 'All' && { hazardLevel: filters.hazardLevel }),
        ...(filters.search && { search: filters.search }),
        ...(filters.lowStock && { lowStock: true }),
      };
      const res = await chemicalsAPI.getAll(params);
      setChemicals(res.data.chemicals);
      setPagination(res.data.pagination);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { labsAPI.getAll().then(r => setLabs(r.data.labs)); }, []);
  useEffect(() => { loadChemicals(1); }, [loadChemicals]);

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">⚗️ Browse Chemicals</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} chemicals available</p>
        </div>
        <button onClick={() => navigate('/dashboard/borrow')} className="btn-primary text-sm">
          📤 Borrow Chemical
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="🔍 Search chemicals..." value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="input flex-1" />
          <select value={filters.lab} onChange={e => setFilter('lab', e.target.value)} className="input sm:w-48">
            <option value="">All Labs</option>
            {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category filter pills */}
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter('category', cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {HAZARD_LEVELS.map(level => (
            <button key={level} onClick={() => setFilter('hazardLevel', level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.hazardLevel === level
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}>
              Hazard: {level}
            </button>
          ))}
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer ml-2">
            <input type="checkbox" checked={filters.lowStock}
              onChange={e => setFilter('lowStock', e.target.checked)}
              className="rounded accent-red-500" />
            Low Stock Only
          </label>
        </div>
      </div>

      {/* Chemical Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chemicals.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <p className="text-4xl mb-3">🧫</p>
          <p className="font-medium">No chemicals match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chemicals.map(chem => (
            <div key={chem._id}
              className="card p-4 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer group"
              onClick={() => navigate('/dashboard/borrow', { state: { chemical: chem } })}>

              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/30 dark:to-indigo-900/30 flex items-center justify-center text-xl">⚗️</div>
                <HazardBadge level={chem.hazardLevel} />
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {chem.name}
              </h3>
              {chem.formula && (
                <p className="text-xs text-slate-400 font-mono mt-0.5 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 rounded w-fit">{chem.formula}</p>
              )}

              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{chem.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Available</span>
                  <span className={`font-bold ${chem.quantity <= chem.lowStockThreshold ? 'text-red-600' : 'text-emerald-600'}`}>
                    {chem.quantity} {chem.unit}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Max Borrow</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{chem.maxBorrowLimit} {chem.unit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Lab</span>
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{chem.lab?.name}</span>
                </div>
              </div>

              {chem.totalCapacity > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      (chem.quantity / chem.totalCapacity) < 0.2 ? 'bg-red-500'
                      : (chem.quantity / chem.totalCapacity) < 0.5 ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    }`} style={{ width: `${Math.min(100, (chem.quantity / chem.totalCapacity) * 100)}%` }} />
                  </div>
                  <p className="text-right text-xs text-slate-400 mt-0.5">
                    {Math.round((chem.quantity / chem.totalCapacity) * 100)}% stock
                  </p>
                </div>
              )}

              <button className="mt-3 w-full py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 rounded-lg group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                Borrow →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => loadChemicals(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                p === pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChemicalList;
