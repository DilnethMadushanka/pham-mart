import React, { useState } from 'react';
import { X, PackageCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { localToday } from '../../lib/expiry';

const inputClass = "w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";

// Record what arrived against an approved order. Each line is checked against
// what is still outstanding; every delivered line needs its batch number and
// expiry date so the stock goes into the right batch.
export default function GoodsReceiptModal({ po, onClose, onConfirm }) {
  const outstandingOf = (item) => Math.max(0, (Number(item.quantity) || 0) - (Number(item.receivedQty) || 0));
  const [rows, setRows] = useState(() => po.items
    .filter(item => outstandingOf(item) > 0)
    .map(item => ({ ...item, outstanding: outstandingOf(item), delivered: outstandingOf(item), batchNo: "", expiryDate: "" })));
  const [closeShort, setCloseShort] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (idx, patch) => setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const short = rows.reduce((sum, r) => sum + Math.max(0, r.outstanding - r.delivered), 0);
  const over = rows.some(r => r.delivered > r.outstanding);
  const missing = rows.some(r => r.delivered > 0 && (!r.batchNo.trim() || !r.expiryDate));
  const nothing = rows.every(r => r.delivered <= 0) && !closeShort;

  const submit = async (e) => {
    e.preventDefault();
    if (busy || over || missing || nothing) return;
    setBusy(true);
    await onConfirm(po.id, rows.filter(r => r.delivered > 0).map(r => ({
      medicineId: r.medicineId, quantity: r.delivered, batchNo: r.batchNo.trim(), expiryDate: r.expiryDate
    })), closeShort);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in">
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="grn-title" className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0"><PackageCheck className="w-5 h-5" /></span>
            <div>
              <h3 id="grn-title" className="text-base font-semibold text-[#0B2545]">Record delivery for {po.poNumber}</h3>
              <p className="text-xs text-slate-500">{po.supplierName} · ordered {po.orderDate}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div key={r.medicineId} className="p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-900">{r.name}</span>
                <span className="text-xs text-slate-500">
                  Ordered {r.quantity}{Number(r.receivedQty) > 0 ? ` · already received ${r.receivedQty}` : ""} · outstanding <strong className="text-slate-700">{r.outstanding}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className="space-y-1">
                  <span className="block text-[11px] text-slate-500">Units delivered</span>
                  <input type="number" min="0" max={r.outstanding} value={r.delivered} aria-label={`Units of ${r.name} delivered`}
                    onChange={(e) => update(idx, { delivered: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className={`${inputClass} ${r.delivered > r.outstanding ? "border-rose-400" : ""}`} />
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] text-slate-500">Batch number</span>
                  <input value={r.batchNo} onChange={(e) => update(idx, { batchNo: e.target.value })} aria-label={`Batch number of ${r.name}`}
                    className={`${inputClass} font-mono uppercase`} placeholder="From the pack" />
                </label>
                <label className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-slate-500">Expiry date</span>
                  <input type="date" min={localToday()} value={r.expiryDate} onChange={(e) => update(idx, { expiryDate: e.target.value })} aria-label={`Expiry date of ${r.name}`} className={inputClass} />
                </label>
              </div>
              {r.delivered > r.outstanding && <p className="text-xs text-rose-700">More than is outstanding on the order.</p>}
              {r.delivered > 0 && r.delivered < r.outstanding && <p className="text-xs text-amber-700">{r.outstanding - r.delivered} units short.</p>}
            </div>
          ))}
        </div>

        {short === 0 && !over ? (
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-700"><CheckCircle2 className="w-4 h-4" /> The delivery matches the order.</p>
        ) : short > 0 ? (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <p className="flex items-center gap-2 text-xs font-medium text-amber-900"><AlertTriangle className="w-4 h-4" /> {short} units short of the order. The rest stays outstanding for a later delivery.</p>
            <label className="flex items-center gap-2 text-xs text-amber-900">
              <input type="checkbox" checked={closeShort} onChange={(e) => setCloseShort(e.target.checked)} className="w-4 h-4 accent-[#2563EB]" />
              The supplier won't send the rest. Close the order as received.
            </label>
          </div>
        ) : null}
        {missing && <p className="text-xs text-rose-700">Enter the batch number and expiry date for every delivered item.</p>}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">Cancel</button>
          <button type="submit" disabled={busy || over || missing || nothing} className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2563EB]/20">
            {busy ? "Saving..." : "Record delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}
