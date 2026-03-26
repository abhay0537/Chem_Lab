import React, { useState, useEffect, useCallback } from 'react';
import { chemicalsAPI, labsAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import { HazardBadge } from '../../components/shared/Badges';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const CATEGORIES  = ['Acid', 'Base', 'Solvent', 'Salt', 'Indicator', 'Reagent', 'Buffer', 'Standard', 'Gas', 'Other'];
const HAZARD_LVLS = ['Low', 'Medium', 'High', 'Extreme'];
const UNITS       = ['ml', 'L', 'g', 'kg', 'mg', 'mol', 'mmol', 'drops', 'units'];
const HAZARD_SYMS = ['Flammable', 'Corrosive', 'Toxic', 'Explosive', 'Oxidizer', 'Health Hazard', 'Environmental Hazard', 'Irritant', 'Compressed Gas'];

const EMPTY_FORM = {
  name: '', formula: '', casNumber: '', lab: '', category: 'Reagent',
  quantity: '', unit: 'ml', maxBorrowLimit: '', lowStockThreshold: '10',
  totalCapacity: '', hazardLevel: 'Low', hazardSymbols: [],
  safetyNotes: '', storageConditions: '',
  supplier: { name: '', contact: '', catalogNo: '' },
  expiryDate: '', nextRestockDate: '',
};

const ManageChemicals = () => {
  const [chemicals, setChemicals] = useState([]);
  const [labs, setLabs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [restockQty, setRestockQty] = useState('');
  const [saving, setSaving]       = useState(false);
  const [filters, setFilters]     = useState({ lab: '', search: '', lowStock: false });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { labsAPI.getAll().then(r => setLabs(r.data.labs)); }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters, ...(filters.lowStock ? { lowStock: true } : {}) };
      if (!params.lowStock) delete params.lowStock;
      const r = await chemicalsAPI.getAll(params);
      setChemicals(r.data.chemicals);
      setPagination(r.data.pagination);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  const openAdd = () => { setForm({ ...EMPTY_FORM, lab: labs[0]?._id || '' }); setSelected(null); setModal('add'); };
  const openEdit = (c) => {
    setSelected(c);
    setForm({ name: c.name, formula: c.formula || '', casNumber: c.casNumber || '', lab: c.lab?._id || c.lab, category: c.category, quantity: c.quantity, unit: c.unit, maxBorrowLimit: c.maxBorrowLimit, lowStockThreshold: c.lowStockThreshold, totalCapacity: c.totalCapacity || '', hazardLevel: c.hazardLevel, hazardSymbols: c.hazardSymbols || [], safetyNotes: c.safetyNotes || '', storageConditions: c.storageConditions || '', supplier: c.supplier || { name: '', contact: '', catalogNo: '' }, expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : '', nextRestockDate: c.nextRestockDate ? c.nextRestockDate.split('T')[0] : '' });
    setModal('edit');
  };
  const openRestock = (c) => { setSelected(c); setRestockQty(''); setModal('restock'); };
  const openQR = (c) => { setSelected(c); setModal('qr'); };
  const closeModal = () => { setModal(null); setSelected(null); setSaving(false); };

  const setF = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setSupplier = (key, val) => setForm(p => ({ ...p, supplier: { ...p.supplier, [key]: val } }));
  const toggleSymbol = (sym) => setForm(p => ({ ...p, hazardSymbols: p.hazardSymbols.includes(sym) ? p.hazardSymbols.filter(s => s !== sym) : [...p.hazardSymbols, sym] }));

  const handleSave = async () => {
    if (!form.name || !form.lab || !form.quantity || !form.unit || !form.maxBorrowLimit) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      if (modal === 'add') { await chemicalsAPI.create(form); toast.success('Chemical added!'); }
      else { await chemicalsAPI.update(selected._id, form); toast.success('Chemical updated!'); }
      closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await chemicalsAPI.delete(selected._id); toast.success('Chemical removed'); closeModal(); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleRestock = async () => {
    if (!restockQty || parseFloat(restockQty) <= 0) return toast.error('Enter valid quantity');
    setSaving(true);
    try { await chemicalsAPI.restock(selected._id, { quantity: parseFloat(restockQty) }); toast.success(`Restocked ${restockQty} ${selected.unit}`); closeModal(); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Restock failed'); }
    finally { setSaving(false); }
  };

  const FormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[['Chemical Name *', 'name', 'text', 'e.g. Sulphuric Acid'], ['Formula', 'formula', 'text', 'e.g. H₂SO₄'], ['CAS Number', 'casNumber', 'text', '7664-93-9']].map(([lbl, key, type, ph]) => (
        <div key={key}>
          <label className="label">{lbl}</label>
          <input className="input" type={type} value={form[key]} onChange={e => setF(key, e.target.value)} placeholder={ph} />
        </div>
      ))}
      <div>
        <label className="label">Lab *</label>
        <select className="input" value={form.lab} onChange={e => setF('lab', e.target.value)}>
          <option value="">Select lab</option>
          {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Category</label>
        <select className="input" value={form.category} onChange={e => setF('category', e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Hazard Level</label>
        <select className="input" value={form.hazardLevel} onChange={e => setF('hazardLevel', e.target.value)}>
          {HAZARD_LVLS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Quantity *</label>
        <input className="input" type="number" step="0.001" value={form.quantity} onChange={e => setF('quantity', e.target.value)} placeholder="Available amount" />
      </div>
      <div>
        <label className="label">Unit *</label>
        <select className="input" value={form.unit} onChange={e => setF('unit', e.target.value)}>
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Max Borrow Limit *</label>
        <input className="input" type="number" value={form.maxBorrowLimit} onChange={e => setF('maxBorrowLimit', e.target.value)} placeholder="Max per borrow" />
      </div>
      <div>
        <label className="label">Low Stock Threshold</label>
        <input className="input" type="number" value={form.lowStockThreshold} onChange={e => setF('lowStockThreshold', e.target.value)} placeholder="Alert when below" />
      </div>
      <div>
        <label className="label">Total Capacity</label>
        <input className="input" type="number" value={form.totalCapacity} onChange={e => setF('totalCapacity', e.target.value)} placeholder="Max capacity" />
      </div>
      <div>
        <label className="label">Expiry Date</label>
        <input className="input" type="date" value={form.expiryDate} onChange={e => setF('expiryDate', e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Hazard Symbols</label>
        <div className="flex flex-wrap gap-2">
          {HAZARD_SYMS.map(sym => (
            <button key={sym} type="button" onClick={() => toggleSymbol(sym)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.hazardSymbols.includes(sym) ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-amber-400'}`}>
              {sym}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Safety Notes</label>
        <textarea className="input" rows={2} value={form.safetyNotes} onChange={e => setF('safetyNotes', e.target.value)} placeholder="Safety precautions..." />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Storage Conditions</label>
        <input className="input" value={form.storageConditions} onChange={e => setF('storageConditions', e.target.value)} placeholder="e.g. Cool dry place away from ignition" />
      </div>
      <div>
        <label className="label">Supplier Name</label>
        <input className="input" value={form.supplier.name} onChange={e => setSupplier('name', e.target.value)} placeholder="SRL Chemicals" />
      </div>
      <div>
        <label className="label">Supplier Contact</label>
        <input className="input" value={form.supplier.contact} onChange={e => setSupplier('contact', e.target.value)} placeholder="email or phone" />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">⚗️ Manage Chemicals</h1>
          <p className="text-slate-500 text-sm">{pagination.total} chemicals in inventory</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Chemical</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input type="text" placeholder="🔍 Search..." value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className="input flex-1 min-w-48" />
        <select value={filters.lab} onChange={e => setFilters(p => ({ ...p, lab: e.target.value }))} className="input w-auto">
          <option value="">All Labs</option>
          {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={filters.lowStock} onChange={e => setFilters(p => ({ ...p, lowStock: e.target.checked }))} className="rounded accent-red-500" />
          Low Stock Only
        </label>
        <button onClick={() => setFilters({ lab: '', search: '', lowStock: false })} className="btn-secondary text-sm">Clear</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>{['Chemical', 'Lab', 'Quantity', 'Limit', 'Hazard', 'Stock', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {chemicals.map(c => {
                  const pct = c.totalCapacity ? Math.round((c.quantity / c.totalCapacity) * 100) : null;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{c.formula}</p>
                          <p className="text-xs text-slate-400">{c.category}</p>
                        </div>
                      </td>
                      <td className="table-cell text-slate-500">{c.lab?.name}</td>
                      <td className="table-cell">
                        <span className={`font-bold text-sm ${c.quantity <= c.lowStockThreshold ? 'text-red-600' : 'text-emerald-600'}`}>
                          {c.quantity} {c.unit}
                        </span>
                        {c.quantity <= c.lowStockThreshold && <p className="text-xs text-red-500">⚠️ Low Stock</p>}
                      </td>
                      <td className="table-cell">{c.maxBorrowLimit} {c.unit}</td>
                      <td className="table-cell"><HazardBadge level={c.hazardLevel} /></td>
                      <td className="table-cell w-28">
                        {pct !== null ? (
                          <div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-20">
                              <div className={`h-full rounded-full ${pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{pct}%</p>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openQR(c)} title="QR Code" className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all text-sm">📱</button>
                          <button onClick={() => openRestock(c)} title="Restock" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all text-sm">📦</button>
                          <button onClick={() => openEdit(c)} title="Edit" className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all text-sm">✏️</button>
                          <button onClick={() => { setSelected(c); setModal('delete'); }} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {chemicals.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-2">🧪</p>
                <p>No chemicals found</p>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={closeModal} title={modal === 'add' ? '➕ Add Chemical' : '✏️ Edit Chemical'} size="xl">
        <FormFields />
        <div className="flex gap-3 mt-5">
          <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : modal === 'add' ? '+ Add Chemical' : '💾 Update'}
          </button>
        </div>
      </Modal>

      {/* Restock Modal */}
      <Modal isOpen={modal === 'restock'} onClose={closeModal} title="📦 Restock Chemical" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="font-semibold text-slate-900 dark:text-white">{selected.name}</p>
              <p className="text-sm text-slate-500 mt-1">Current stock: <strong className="text-emerald-600">{selected.quantity} {selected.unit}</strong></p>
            </div>
            <div>
              <label className="label">Quantity to Add ({selected.unit})</label>
              <input type="number" step="0.001" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="input" placeholder="Enter amount to add" />
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleRestock} disabled={saving} className="btn-success flex-1">
                {saving ? 'Adding...' : '📦 Add Stock'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={modal === 'qr'} onClose={closeModal} title="📱 QR Code" size="sm">
        {selected && (
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-inner">
              <QRCodeSVG value={JSON.stringify({ id: selected._id, name: selected.name, lab: selected.lab?.name })} size={200} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{selected.name}</p>
              <p className="text-sm text-slate-500">{selected.lab?.name} · {selected.formula}</p>
            </div>
            <p className="text-xs text-slate-400">Scan this QR code to quickly identify this chemical</p>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === 'delete'} onClose={closeModal} title="🗑️ Remove Chemical" size="sm">
        <p className="text-slate-600 dark:text-slate-400">Remove <strong className="text-slate-900 dark:text-white">{selected?.name}</strong> from inventory? This is a soft delete.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1">{saving ? 'Removing...' : 'Remove'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageChemicals;
