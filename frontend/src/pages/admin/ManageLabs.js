import React, { useState, useEffect } from 'react';
import { labsAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import toast from 'react-hot-toast';

const LAB_TYPES = ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry', 'Microbiology', 'General', 'Research'];

const EMPTY_FORM = { name: '', code: '', type: 'General', building: '', floor: '', capacity: '', description: '', incharge: { name: '', email: '', phone: '' } };

const ManageLabs = () => {
  const [labs, setLabs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selectedLab, setSelectedLab] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await labsAPI.getAll(); setLabs(r.data.labs); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setSelectedLab(null); setModal('add'); };
  const openEdit = (lab) => {
    setSelectedLab(lab);
    setForm({ name: lab.name, code: lab.code, type: lab.type, building: lab.building || '', floor: lab.floor || '', capacity: lab.capacity || '', description: lab.description || '', incharge: lab.incharge || { name: '', email: '', phone: '' } });
    setModal('edit');
  };
  const openDelete = (lab) => { setSelectedLab(lab); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedLab(null); setSaving(false); };

  const handleSave = async () => {
    if (!form.name || !form.code || !form.type) return toast.error('Name, code, and type are required');
    setSaving(true);
    try {
      if (modal === 'add') { await labsAPI.create(form); toast.success('Lab created!'); }
      else { await labsAPI.update(selectedLab._id, form); toast.success('Lab updated!'); }
      closeModal(); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await labsAPI.delete(selectedLab._id); toast.success('Lab removed'); closeModal(); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Delete failed'); }
    finally { setSaving(false); }
  };

  const typeColors = { Organic: 'bg-emerald-100 text-emerald-700', Inorganic: 'bg-blue-100 text-blue-700', Physical: 'bg-amber-100 text-amber-700', Analytical: 'bg-violet-100 text-violet-700' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🏗️ Manage Labs</h1>
          <p className="text-slate-500 text-sm">{labs.length} labs in Shri GS Institute of Tech & Science Indore</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Lab</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map(lab => (
            <div key={lab._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xl">🏗️</div>
                <span className={`badge ${typeColors[lab.type] || 'bg-slate-100 text-slate-700'} dark:bg-slate-700 dark:text-slate-300`}>{lab.type}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{lab.name}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 font-mono font-semibold">{lab.code}</p>
              {lab.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lab.description}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                {lab.building && <span>📍 {lab.building}</span>}
                {lab.floor && <span>🏢 Floor: {lab.floor}</span>}
                {lab.capacity && <span>👥 Cap: {lab.capacity}</span>}
                {lab.incharge?.name && <span>👨‍🏫 {lab.incharge.name}</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(lab)} className="btn-secondary text-xs flex-1">✏️ Edit</button>
                <button onClick={() => openDelete(lab)} className="text-xs px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-all">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={closeModal}
        title={modal === 'add' ? '➕ Add New Lab' : '✏️ Edit Lab'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Lab Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Organic Chemistry Lab" />
          </div>
          <div>
            <label className="label">Lab Code *</label>
            <input className="input uppercase" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. OCL01" />
          </div>
          <div>
            <label className="label">Type *</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {LAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Capacity</label>
            <input className="input" type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} placeholder="Max students" />
          </div>
          <div>
            <label className="label">Building</label>
            <input className="input" value={form.building} onChange={e => setForm(p => ({ ...p, building: e.target.value }))} placeholder="e.g. Science Block A" />
          </div>
          <div>
            <label className="label">Floor</label>
            <input className="input" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} placeholder="e.g. 2nd" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
          </div>
          <div>
            <label className="label">Incharge Name</label>
            <input className="input" value={form.incharge?.name} onChange={e => setForm(p => ({ ...p, incharge: { ...p.incharge, name: e.target.value } }))} placeholder="Dr. Name" />
          </div>
          <div>
            <label className="label">Incharge Email</label>
            <input className="input" type="email" value={form.incharge?.email} onChange={e => setForm(p => ({ ...p, incharge: { ...p.incharge, email: e.target.value } }))} placeholder="incharge@college.edu" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : modal === 'add' ? '+ Create Lab' : '💾 Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === 'delete'} onClose={closeModal} title="🗑️ Delete Lab" size="sm">
        <p className="text-slate-600 dark:text-slate-400">Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedLab?.name}</strong>? This cannot be undone if the lab has no chemicals.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1">
            {saving ? 'Deleting...' : '🗑️ Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageLabs;
