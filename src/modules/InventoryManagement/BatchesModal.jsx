import React, { useMemo, useState } from 'react';
import { X, Layers, Plus, ClipboardCheck, Pencil, Trash2, History } from 'lucide-react';
import { saveBatch, adjustBatch, deleteBatch } from '../../services/supabaseService';
import { notify, notifyError, confirmDialog } from '../../lib/notify';
import { applyBatchResult } from '../../lib/batches';
import { expiryStatus, EXPIRY_LABEL, localToday, checkNewExpiry, minNewExpiry } from '../../lib/expiry';

const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";

const ADJUST_REASONS = ["Stock count", "Damaged", "Expired write-off", "Returned to supplier", "Correction"];

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

// One medicine's stock, batch by batch: receive stock, count or write off a
// batch, correct its number or expiry, and see the stock history.
export default function BatchesModal({ medicine, batches, stockMovements = [], canEdit, onClose, setMedicines, setBatches, setStockMovements }) {
  const [mode, setMode] = useState(null); // null | { kind: "add" } | { kind: "adjust", batch } | { kind: "edit", batch }
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () => batches
      .filter(b => b.medicineId === medicine.id)
      .sort((a, b) => (a.quantity === 0) - (b.quantity === 0) || String(a.expiryDate || "9999").localeCompare(String(b.expiryDate || "9999"))),
    [batches, medicine.id]
  );
  const history = stockMovements.filter(v => v.medicineId === medicine.id).slice(0, 15);
  const today = localToday();

  const open = (next) => {
    setMode(next);
    if (next.kind === "add") setForm({ batchNo: "", expiryDate: "", quantity: "", note: "" });
    if (next.kind === "adjust") setForm({ quantity: String(next.batch.quantity), reason: "Stock count", note: "" });
    if (next.kind === "edit") setForm({ batchNo: next.batch.batchNo, expiryDate: next.batch.expiryDate || "", note: "" });
  };
  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (mode.kind === "add") {
      const expiryError = checkNewExpiry(form.expiryDate);
      if (expiryError) {
        notify("Check the expiry date", expiryError, "error");
        return;
      }
    }
    setBusy(true);
    let res;
    if (mode.kind === "add") {
      res = await saveBatch({ medicineId: medicine.id, batchNo: form.batchNo, expiryDate: form.expiryDate, quantity: parseInt(form.quantity, 10) || 0, note: form.note });
    } else if (mode.kind === "edit") {
      res = await saveBatch({ id: mode.batch.id, batchNo: form.batchNo, expiryDate: form.expiryDate, note: form.note });
    } else {
      res = await adjustBatch(mode.batch.id, parseInt(form.quantity, 10), form.reason, form.note);
    }
    setBusy(false);
    if (res.error) {
      notifyError(res.error, "Stock not changed");
      return;
    }
    applyBatchResult(res.data, { setMedicines, setBatches, setStockMovements });
    const title = mode.kind === "add" ? "Stock received" : mode.kind === "edit" ? "Batch corrected" : "Stock adjusted";
    notify(title, `${medicine.name}: batch ${res.data.batch.batchNo} now has ${res.data.batch.quantity} units. Total stock ${res.data.medicine.stock}.`);
    setMode(null);
  };

  const remove = async (batch) => {
    const ok = await confirmDialog({ title: `Remove empty batch ${batch.batchNo}?`, message: "The batch has no stock left. Its history stays in the stock log.", confirmLabel: "Remove batch" });
    if (!ok) return;
    const { data, error } = await deleteBatch(batch.id);
    if (error) {
      notifyError(error, "Batch not removed");
      return;
    }
    setBatches(prev => prev.filter(b => b.id !== batch.id));
    setMedicines(prev => prev.map(m => (m.id === data.medicine.id ? data.medicine : m)));
  };

  const changeBy = mode?.kind === "adjust" ? (parseInt(form.quantity, 10) || 0) - mode.batch.quantity : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="batches-title" className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 id="batches-title" className="text-base font-semibold text-[#0B2545] truncate">{medicine.name}</h3>
              <p className="text-xs text-slate-500">
                {medicine.stock} units in {medicine.batchCount} batch{medicine.batchCount === 1 ? "" : "es"}
                {medicine.expiredStock > 0 ? ` · ${medicine.expiredStock} expired, can't be sold` : ""}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75dvh] overflow-y-auto">
          {canEdit && !mode && (
            <button onClick={() => open({ kind: "add" })} className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-medium shadow-md shadow-[#2563EB]/20">
              <Plus className="w-4 h-4" /> Receive stock into a batch
            </button>
          )}

          {mode && (
            <form onSubmit={submit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-sm font-semibold text-[#0B2545]">
                {mode.kind === "add" && "Receive stock"}
                {mode.kind === "edit" && `Correct batch ${mode.batch.batchNo}`}
                {mode.kind === "adjust" && `Adjust batch ${mode.batch.batchNo} (${mode.batch.quantity} on record)`}
              </div>
              {mode.kind !== "adjust" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Batch number">
                    <input required value={form.batchNo} onChange={set("batchNo")} className={`${inputClass} font-mono uppercase`} placeholder="e.g. PCM-2026-07" />
                  </Field>
                  <Field label="Expiry date">
                    <input required type="date" min={mode.kind === "add" ? minNewExpiry() : undefined} value={form.expiryDate} onChange={set("expiryDate")} className={inputClass} />
                  </Field>
                  {mode.kind === "add" && (
                    <Field label="Units received">
                      <input required type="number" min="1" value={form.quantity} onChange={set("quantity")} className={inputClass} />
                    </Field>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Units actually on the shelf">
                    <input required type="number" min="0" value={form.quantity} onChange={set("quantity")} className={inputClass} />
                  </Field>
                  <Field label="Reason">
                    <select value={form.reason} onChange={set("reason")} className={inputClass}>
                      {ADJUST_REASONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                </div>
              )}
              <Field label="Note">
                <input value={form.note} onChange={set("note")} className={inputClass} placeholder={mode.kind === "add" ? "Optional, for example the invoice number" : "Optional"} />
              </Field>
              {mode.kind === "adjust" && changeBy !== 0 && (
                <p className={`text-xs font-medium ${changeBy < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                  {changeBy > 0 ? `${changeBy} units will be added.` : `${-changeBy} units will be taken off.`}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setMode(null)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl">Cancel</button>
                <button type="submit" disabled={busy} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
                  {busy ? "Saving..." : mode.kind === "add" ? "Add stock" : "Save"}
                </button>
              </div>
            </form>
          )}

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {rows.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No batches yet. Stock arrives in batches from purchase orders or when received here.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rows.map(b => {
                  const status = b.quantity > 0 ? expiryStatus(b.expiryDate, today) : null;
                  return (
                    <li key={b.id} className={`p-3.5 flex flex-wrap items-center gap-3 ${b.quantity === 0 ? "opacity-60" : ""}`}>
                      <div className="flex-1 min-w-[150px]">
                        <div className="font-mono font-semibold text-sm text-[#0B2545]">{b.batchNo}</div>
                        <div className="text-[11px] text-slate-500">
                          Expires {b.expiryDate || "not set"} · received {b.receivedDate || "earlier"}{b.source ? ` · ${b.source}` : ""}
                        </div>
                      </div>
                      {status && <span className={`status-chip ${EXPIRY_LABEL[status].chip}`}>{EXPIRY_LABEL[status].label}</span>}
                      <div className="text-sm font-semibold tabular-nums w-20 text-right">{b.quantity} units</div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <button onClick={() => open({ kind: "adjust", batch: b })} title="Count or write off" aria-label={`Adjust batch ${b.batchNo}`} className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50">
                            <ClipboardCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => open({ kind: "edit", batch: b })} title="Correct batch number or expiry" aria-label={`Correct batch ${b.batchNo}`} className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {b.quantity === 0 && (
                            <button onClick={() => remove(b)} title="Remove empty batch" aria-label={`Remove batch ${b.batchNo}`} className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Stock history (sales are on the invoices)</h4>
              <ul className="text-xs divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {history.map(v => (
                  <li key={v.id} className="px-3.5 py-2.5 flex flex-wrap gap-x-3 gap-y-0.5 justify-between">
                    <span className="text-slate-700">
                      <span className="font-semibold">{v.reason}</span> · batch <span className="font-mono">{v.batchNo}</span>
                      {v.note ? ` · ${v.note}` : ""}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      <span className={v.change < 0 ? "text-rose-700 font-semibold" : v.change > 0 ? "text-emerald-700 font-semibold" : ""}>
                        {v.change > 0 ? "+" : ""}{v.change}
                      </span>
                      {" "}· {v.user} · {new Date(v.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
