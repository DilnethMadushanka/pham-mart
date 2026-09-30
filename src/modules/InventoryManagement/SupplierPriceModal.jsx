import React, { useState } from 'react';
import { X, Tags, Trash2 } from 'lucide-react';
import { saveSupplierPrice } from '../../services/supabaseService';
import { notify, notifyError } from '../../lib/notify';

const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";
const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// A supplier's price list: what they charge per unit for each medicine.
// New purchase orders and reorder suggestions use these prices.
export default function SupplierPriceModal({ supplier, medicines, onClose, onSaved }) {
  const [medicineId, setMedicineId] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [minQty, setMinQty] = useState("1");
  const [busy, setBusy] = useState(false);

  const prices = (supplier.prices || [])
    .map(p => ({ ...p, medicine: medicines.find(m => m.id === p.medicineId) }))
    .filter(p => p.medicine)
    .sort((a, b) => a.medicine.name.localeCompare(b.medicine.name));

  const pick = (id) => {
    setMedicineId(id);
    const existing = (supplier.prices || []).find(p => p.medicineId === id);
    setUnitCost(existing ? String(existing.unitCost) : "");
    setMinQty(existing ? String(existing.minOrderQty) : "1");
  };

  const save = async (id, cost, qty) => {
    setBusy(true);
    const { data, error } = await saveSupplierPrice(supplier.id, id, cost, qty);
    setBusy(false);
    if (error) {
      notifyError(error, "Price not saved");
      return false;
    }
    onSaved(data);
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!medicineId || unitCost === "") return;
    const med = medicines.find(m => m.id === medicineId);
    if (await save(medicineId, Number(unitCost), parseInt(minQty, 10) || 1)) {
      notify("Price saved", `${supplier.name} charges ${money(unitCost)} per unit of ${med.name}.`);
      setMedicineId("");
      setUnitCost("");
      setMinQty("1");
    }
  };

  const selected = medicines.find(m => m.id === medicineId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="prices-title" className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0"><Tags className="w-5 h-5" /></span>
            <div className="min-w-0">
              <h3 id="prices-title" className="text-base font-semibold text-[#0B2545] truncate">Price list: {supplier.name}</h3>
              <p className="text-xs text-slate-500">New orders to this supplier use these unit costs.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-12 gap-2 items-end p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <label className="col-span-12 sm:col-span-6 space-y-1 min-w-0">
            <span className="block text-[11px] text-slate-500">Medicine</span>
            <select value={medicineId} onChange={(e) => pick(e.target.value)} className={inputClass} aria-label="Medicine to price">
              <option value="">Choose a medicine</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="col-span-5 sm:col-span-2 space-y-1">
            <span className="block text-[11px] text-slate-500">Unit cost</span>
            <input type="number" min="0" step="0.01" required value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className={inputClass} aria-label="Unit cost" />
          </label>
          <label className="col-span-4 sm:col-span-2 space-y-1">
            <span className="block text-[11px] text-slate-500">Min. order</span>
            <input type="number" min="1" value={minQty} onChange={(e) => setMinQty(e.target.value)} className={inputClass} aria-label="Minimum order quantity" />
          </label>
          <button type="submit" disabled={busy || !medicineId || unitCost === ""} className="col-span-3 sm:col-span-2 px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-semibold rounded-xl">
            Save
          </button>
          {selected && unitCost !== "" && Number(unitCost) > 0 && (
            <p className="col-span-12 text-[11px] text-slate-500">
              Sells for {money(selected.unitPrice)}, so the margin is {Math.round((1 - Number(unitCost) / Number(selected.unitPrice || 1)) * 100)}%.
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {prices.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No prices yet. Orders use 70% of the selling price as an estimate until you add them.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr><th className="text-left py-2 px-3 font-medium">Medicine</th><th className="text-right py-2 px-3 font-medium">Unit cost</th><th className="text-right py-2 px-3 font-medium hidden sm:table-cell">Min. order</th><th className="py-2 px-3"><span className="sr-only">Remove</span></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prices.map(p => (
                  <tr key={p.medicineId}>
                    <td className="py-2 px-3">
                      <button type="button" onClick={() => pick(p.medicineId)} className="text-left hover:text-[#2563EB]">{p.medicine.name}</button>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{money(p.unitCost)}</td>
                    <td className="py-2 px-3 text-right tabular-nums hidden sm:table-cell">{p.minOrderQty}</td>
                    <td className="py-2 px-3 text-right">
                      <button type="button" disabled={busy} onClick={() => save(p.medicineId, null)} aria-label={`Remove price for ${p.medicine.name}`} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
