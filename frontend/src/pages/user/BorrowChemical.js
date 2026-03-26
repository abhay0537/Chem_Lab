import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chemicalsAPI, labsAPI, transactionsAPI } from '../../services/api';
import { HazardBadge } from '../../components/shared/Badges';
import toast from 'react-hot-toast';

const BorrowChemical = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const prefilled = location.state?.chemical;

  const [labs, setLabs]             = useState([]);
  const [chemicals, setChemicals]   = useState([]);
  const [selectedLab, setSelectedLab]   = useState(prefilled?.lab?._id || '');
  const [selectedChem, setSelectedChem] = useState(prefilled || null);
  const [quantity, setQuantity]     = useState('');
  const [purpose, setPurpose]       = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    labsAPI.getAll().then(r => { setLabs(r.data.labs); if (!selectedLab && r.data.labs.length) setSelectedLab(r.data.labs[0]._id); });
  }, []);

  useEffect(() => {
    if (!selectedLab) return;
    setLoading(true);
    chemicalsAPI.getAll({ lab: selectedLab, limit: 100 })
      .then(r => { setChemicals(r.data.chemicals); if (!prefilled) setSelectedChem(null); })
      .finally(() => setLoading(false));
  }, [selectedLab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChem) return toast.error('Please select a chemical');
    if (!quantity || parseFloat(quantity) <= 0) return toast.error('Enter a valid quantity');
    if (parseFloat(quantity) > selectedChem.maxBorrowLimit) return toast.error(`Max borrow limit: ${selectedChem.maxBorrowLimit} ${selectedChem.unit}`);
    if (parseFloat(quantity) > selectedChem.quantity) return toast.error('Insufficient stock available');

    setSubmitting(true);
    try {
      await transactionsAPI.borrow({
        chemicalId: selectedChem._id,
        quantity: parseFloat(quantity),
        purpose,
        expectedReturnDate: returnDate || undefined,
      });
      toast.success(`✅ Successfully borrowed ${quantity} ${selectedChem.unit} of ${selectedChem.name}`);
      navigate('/dashboard/history');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Borrow failed');
    } finally {
      setSubmitting(false);
    }
  };

  const stockPercent = selectedChem?.totalCapacity
    ? Math.round((selectedChem.quantity / selectedChem.totalCapacity) * 100) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📤 Borrow Chemical</h1>
        <p className="text-slate-500 text-sm mt-0.5">Select a chemical and enter the quantity you need</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Select Lab */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Select Lab
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {labs.map(lab => (
              <button key={lab._id} type="button"
                onClick={() => setSelectedLab(lab._id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedLab === lab._id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{lab.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{lab.type} · {lab.code}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Chemical */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Select Chemical
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <select value={selectedChem?._id || ''} onChange={e => setSelectedChem(chemicals.find(c => c._id === e.target.value) || null)}
              className="input" required>
              <option value="">-- Select a chemical --</option>
              {chemicals.map(c => (
                <option key={c._id} value={c._id} disabled={c.quantity === 0}>
                  {c.name} ({c.formula || c.category}) — {c.quantity} {c.unit} available
                  {c.quantity === 0 ? ' [OUT OF STOCK]' : ''}
                </option>
              ))}
            </select>
          )}

          {/* Chemical Details Card */}
          {selectedChem && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{selectedChem.name}</h3>
                  {selectedChem.formula && <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedChem.formula}</p>}
                </div>
                <HazardBadge level={selectedChem.hazardLevel} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { label: 'Available', value: `${selectedChem.quantity} ${selectedChem.unit}`, highlight: true },
                  { label: 'Max Borrow', value: `${selectedChem.maxBorrowLimit} ${selectedChem.unit}`, primary: true },
                  { label: 'Category', value: selectedChem.category },
                  { label: 'Hazard', value: selectedChem.hazardLevel },
                ].map(({ label, value, highlight, primary }) => (
                  <div key={label} className="bg-white dark:bg-slate-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${highlight ? 'text-emerald-600' : primary ? 'text-primary-600' : 'text-slate-700 dark:text-slate-300'}`}>{value}</p>
                  </div>
                ))}
              </div>
              {stockPercent !== null && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Stock Level</span><span>{stockPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stockPercent < 20 ? 'bg-red-500' : stockPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${stockPercent}%` }} />
                  </div>
                </div>
              )}
              {selectedChem.safetyNotes && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">⚠️ Safety Notes</p>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">{selectedChem.safetyNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Enter Details */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Borrow Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">
                Quantity Required *
                {selectedChem && <span className="text-slate-400 font-normal"> (max {selectedChem.maxBorrowLimit} {selectedChem.unit})</span>}
              </label>
              <div className="flex gap-2">
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                  min="0.001" max={selectedChem?.maxBorrowLimit} step="0.001"
                  placeholder="Enter amount" className="input flex-1" required />
                {selectedChem && <span className="input w-20 text-center bg-slate-50 dark:bg-slate-700">{selectedChem.unit}</span>}
              </div>
              {quantity && selectedChem && parseFloat(quantity) > selectedChem.maxBorrowLimit && (
                <p className="text-red-500 text-xs mt-1">⚠️ Exceeds maximum borrow limit of {selectedChem.maxBorrowLimit} {selectedChem.unit}</p>
              )}
            </div>

            <div>
              <label className="label">Purpose / Experiment</label>
              <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)}
                placeholder="e.g. Acid-base titration, Organic synthesis..." className="input" />
            </div>

            <div>
              <label className="label">Expected Return Date</label>
              <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} className="input" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard/chemicals')} className="btn-secondary flex-1">
            ← Cancel
          </button>
          <button type="submit" disabled={submitting || !selectedChem || !quantity} className="btn-primary flex-1">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : '📤 Confirm Borrow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BorrowChemical;
