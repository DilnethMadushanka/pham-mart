import React, { useMemo, useState } from 'react';
import { X, Truck, Plus, Trash2, TrendingDown } from 'lucide-react';
import { buildReorderSuggestions, supplierCost } from '../../lib/reorder';

const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";
const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Build a purchase order with one or more lines. Unit costs come from the
// supplier's price list; "Add low-stock items" fills in the reorder suggestions
// for this supplier.
export default function CreatePurchaseOrderModal({ suppliers, medicines, purchaseOrders, transactions = [], onClose, onCreate }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [lines, setLines] = useState([]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const supplier = suppliers.find(s => s.id === supplierId);
  const lowStock = useMemo(
    () => buildReorderSuggestions({ medicines, transactions, purchaseOrders, suppliers })
      .filter(s => s.openOrders.length === 0 && (!s.supplier || s.supplier.id === supplierId)),
    [medicines, transactions, purchaseOrders, suppliers, supplierId]
  );

  const changeSupplier = (id) => {
    setSupplierId(id);
    const next = suppliers.find(s => s.id === id);
    // Re-price lines from the new supplier's price list.
    setLines(prev => prev.map(l => {
      const med = medicines.find(m => m.id === l.medicineId);
      return med ? { ...l, unitCost: supplierCost(next, med) } : l;
    }));
  };

  const addLine = (medicineId = "", quantity = 10) => {
    const med = medicines.find(m => m.id === medicineId);
    setLines(prev => [...prev, { key: `${Date.now()}-${prev.length}`, medicineId, quantity, unitCost: med ? supplierCost(supplier, med) : 0 }]);
  };
  const updateLine = (key, patch) => setLines(prev => prev.map(l => {
    if (l.key !== key) return l;
    const next = { ...l, ...patch };
    if (patch.medicineId !== undefined) {
      const med = medicines.find(m => m.id === patch.medicineId);
      next.unitCost = med ? supplierCost(supplier, med) : 0;
    }
    return next;
  }));
  const addLowStock = () => {
    const have = new Set(lines.map(l => l.medicineId));
    const extra = lowStock.filter(s => !have.has(s.medicine.id)).map((s, i) => ({
      key: `${Date.now()}-low-${i}`,
      medicineId: s.medicine.id,
      quantity: s.suggestedQty,
      unitCost: supplierCost(supplier, s.medicine)
    }));
    setLines(prev => [...prev.filter(l => l.medicineId), ...extra]);
  };

  const valid = lines.filter(l => l.medicineId && l.quantity > 0);
  const total = valid.reduce((sum, l) => sum + l.quantity * (Number(l.unitCost) || 0), 0);
  const duplicate = valid.length !== new Set(valid.map(l => l.medicineId)).size;

  const submit = async (e) => {
    e.preventDefault();
    if (busy || !supplier || valid.length === 0 || duplicate) return;
    setBusy(true);
    const ok = await onCreate({
      supplierId,
      notes,
      items: valid.map(l => ({ medicineId: l.medicineId, quantity: l.quantity, unitCost: Number(l.unitCost) || 0 }))
    });
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in">
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="po-create-title" className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0"><Truck className="w-5 h-5" /></span>
            <div>
              <h3 id="po-create-title" className="text-base font-semibold text-[#0B2545]">New purchase order</h3>
              <p className="text-xs text-slate-500">It is saved as pending until the owner approves it.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <label className="block space-y-1">
          <span className="block text-xs font-semibold text-slate-700">Supplier</span>
          <select value={supplierId} onChange={(e) => changeSupplier(e.target.value)} className={inputClass} aria-label="Supplier">
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.leadTimeDays ?? 3} day delivery)</option>)}
          </select>
        </label>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">Items</span>
            <div className="flex gap-2">
              {lowStock.length > 0 && (
                <button type="button" onClick={addLowStock} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium hover:bg-amber-100">
                  <TrendingDown className="w-3.5 h-3.5" /> Add low-stock items ({lowStock.length})
                </button>
              )}
              <button type="button" onClick={() => addLine()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50">
                <Plus className="w-3.5 h-3.5" /> Add item
              </button>
            </div>
          </div>
          {lines.length === 0 && (
            <p className="text-xs text-slate-500 p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">Add the medicines to order.</p>
          )}
          {lines.map(l => {
            const med = medicines.find(m => m.id === l.medicineId);
            const listed = med && (supplier?.prices || []).some(p => p.medicineId === med.id);
            return (
              <div key={l.key} className="grid grid-cols-12 gap-2 items-end p-3 rounded-2xl border border-slate-200">
                <label className="col-span-12 sm:col-span-6 space-y-1 min-w-0">
                  <span className="block text-[11px] text-slate-500">Medicine</span>
                  <select value={l.medicineId} onChange={(e) => updateLine(l.key, { medicineId: e.target.value })} className={inputClass} aria-label="Medicine">
                    <option value="">Choose a medicine</option>
                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (stock {m.stock})</option>)}
                  </select>
                </label>
                <label className="col-span-4 sm:col-span-2 space-y-1">
                  <span className="block text-[11px] text-slate-500">Units</span>
                  <input type="number" min="1" value={l.quantity} onChange={(e) => updateLine(l.key, { quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })} className={inputClass} aria-label="Units" />
                </label>
                <label className="col-span-6 sm:col-span-3 space-y-1">
                  <span className="block text-[11px] text-slate-500">Unit cost{med ? (listed ? " (price list)" : " (estimate)") : ""}</span>
                  <input type="number" min="0" step="0.01" value={l.unitCost} onChange={(e) => updateLine(l.key, { unitCost: e.target.value })} className={inputClass} aria-label="Unit cost" />
                </label>
                <button type="button" onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))} aria-label="Remove item" className="col-span-2 sm:col-span-1 p-2.5 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 justify-self-end">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {duplicate && <p className="text-xs text-rose-700">A medicine is listed twice. Combine it into one line.</p>}
        </div>

        <label className="block space-y-1">
          <span className="block text-xs font-semibold text-slate-700">Notes for the supplier</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="Optional" />
        </label>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-sm text-slate-600">Total <span className="font-semibold text-[#0B2545] tabular-nums">{money(total)}</span></div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">Cancel</button>
            <button type="submit" disabled={busy || valid.length === 0 || duplicate} className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2563EB]/20">
              {busy ? "Saving..." : "Create order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
