import React, { useMemo, useState } from 'react';
import { X, Undo2, Search, Receipt } from 'lucide-react';
import { processReturn } from '../../services/supabaseService';
import { notify, notifyError } from '../../lib/notify';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";
const REASONS = ["Wrong item given", "Damaged or faulty pack", "Adverse reaction", "Prescription changed", "Customer changed mind", "Other"];

// Returns against a past invoice. The refund is worked out from what the
// customer paid for each unit (after the invoice discount and tax). Unopened
// items can go back into the batch they were sold from.
export default function ReturnsModal({ transactions, salesReturns, canProcess, onClose, onDone, onViewInvoice }) {
  const [query, setQuery] = useState("");
  const [txnId, setTxnId] = useState(null);
  const [picks, setPicks] = useState({});
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("Cash");
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => transactions
    .filter(t => !q || (t.invoiceNo || "").toLowerCase().includes(q) || (t.customerName || "").toLowerCase().includes(q))
    .slice(0, 8), [transactions, q]);
  const txn = transactions.find(t => t.id === txnId);

  const returnedQty = (medicineId) => salesReturns
    .filter(r => r.transactionId === txnId)
    .flatMap(r => r.items)
    .filter(i => i.medicineId === medicineId)
    .reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const factor = txn && txn.subtotal > 0 ? txn.total / txn.subtotal : 1;
  const unitRefund = (item) => Math.round(Number(item.price || 0) * factor * 100) / 100;

  const choose = (t) => {
    setTxnId(t.id);
    setMethod(t.paymentMethod || "Cash");
    setPicks(Object.fromEntries(t.items.map(i => [i.medicineId, { qty: 0, restock: true }])));
  };
  const setPick = (id, patch) => setPicks(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const chosen = txn ? txn.items.filter(i => (picks[i.medicineId]?.qty || 0) > 0) : [];
  const refund = Math.min(
    chosen.reduce((s, i) => s + Math.round(Number(i.price || 0) * picks[i.medicineId].qty * factor * 100) / 100, 0),
    txn ? txn.total - (txn.refundedAmount || 0) : 0
  );
  const pastReturns = salesReturns.filter(r => r.transactionId === txnId);

  const submit = async (e) => {
    e.preventDefault();
    if (busy || !txn || chosen.length === 0) return;
    setBusy(true);
    const { data, error } = await processReturn({
      transactionId: txn.id,
      refundMethod: method,
      reason: note.trim() ? `${reason}: ${note.trim()}` : reason,
      items: chosen.map(i => ({ medicineId: i.medicineId, qty: picks[i.medicineId].qty, restock: picks[i.medicineId].restock }))
    });
    setBusy(false);
    if (error) {
      notifyError(error, "Return not processed");
      return;
    }
    onDone(data);
    notify("Return processed", `${data.return.returnNo}: refund ${money(data.return.refundAmount)} by ${data.return.refundMethod}.`);
    setTxnId(null);
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="returns-title" className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0"><Undo2 className="w-5 h-5" /></span>
            <div>
              <h3 id="returns-title" className="text-base font-semibold text-[#0B2545]">Returns and refunds</h3>
              <p className="text-xs text-slate-500">{canProcess ? "Find the invoice, pick what came back and refund it." : "Only a pharmacist or the owner can process returns."}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        {!txn ? (
          <div className="space-y-3">
            <label className="relative block">
              <span className="sr-only">Find invoice</span>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Invoice number or customer name" className={`${inputClass} pl-10`} />
            </label>
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {matches.length === 0 && <li className="p-4 text-sm text-slate-500 text-center">No sale matches.</li>}
              {matches.map(t => (
                <li key={t.id}>
                  <button type="button" onClick={() => choose(t)} className="w-full text-left p-3.5 hover:bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-mono text-sm font-semibold text-[#0B2545]">{t.invoiceNo}</span>
                      <span className="block text-xs text-slate-500">{t.customerName} · {t.date} · {t.items.length} item{t.items.length === 1 ? "" : "s"}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-semibold tabular-nums">{money(t.total)}</span>
                      {t.status !== "Completed" && <span className={`status-chip ${t.status === "Refunded" ? "status-chip-gray" : "status-chip-amber"}`}>{t.status}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {salesReturns.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-500">Recent returns</h4>
                <ul className="text-xs divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {salesReturns.slice(0, 5).map(r => (
                    <li key={r.id} className="px-3.5 py-2.5 flex flex-wrap justify-between gap-2">
                      <span><span className="font-mono">{r.returnNo}</span> · {r.invoiceNo} · {r.reason}</span>
                      <span className="tabular-nums text-slate-600">{money(r.refundAmount)} · {r.refundMethod} · {r.processedBy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span>
                <span className="font-mono font-semibold text-sm text-[#0B2545]">{txn.invoiceNo}</span>
                <span className="block text-slate-500">{txn.customerName} · {txn.date} · paid {money(txn.total)} by {txn.paymentMethod}
                  {txn.refundedAmount > 0 ? ` · ${money(txn.refundedAmount)} refunded so far` : ""}</span>
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => onViewInvoice(txn)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100"><Receipt className="w-3.5 h-3.5" /> Invoice</button>
                <button type="button" onClick={() => setTxnId(null)} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100">Change</button>
              </span>
            </div>

            <ul className="space-y-2">
              {txn.items.map(item => {
                const left = (Number(item.qty) || 0) - returnedQty(item.medicineId);
                const pick = picks[item.medicineId] || { qty: 0, restock: true };
                return (
                  <li key={item.medicineId} className="p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Sold {item.qty}{left < item.qty ? `, ${item.qty - left} already returned` : ""} · refund {money(unitRefund(item))} each
                        {(item.batches || []).length > 0 ? ` · batch ${item.batches.map(b => b.batchNo).join(", ")}` : ""}
                      </div>
                    </div>
                    {left > 0 ? (
                      <>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          Return
                          <input type="number" min="0" max={left} value={pick.qty} disabled={!canProcess}
                            onChange={(e) => setPick(item.medicineId, { qty: Math.min(left, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                            aria-label={`Units of ${item.name} returned`}
                            className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center" />
                          of {left}
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600">
                          <input type="checkbox" checked={pick.restock} disabled={!canProcess} onChange={(e) => setPick(item.medicineId, { restock: e.target.checked })} className="w-4 h-4 accent-[#2563EB]" />
                          Back to stock
                        </label>
                      </>
                    ) : (
                      <span className="status-chip status-chip-gray">All returned</span>
                    )}
                  </li>
                );
              })}
            </ul>

            {canProcess ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="space-y-1 sm:col-span-1">
                    <span className="block text-xs font-semibold text-slate-700">Reason</span>
                    <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
                      {REASONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 sm:col-span-1">
                    <span className="block text-xs font-semibold text-slate-700">Refund by</span>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                      <option>Cash</option><option>Card</option><option>Digital Wallet</option>
                    </select>
                  </label>
                  <label className="space-y-1 sm:col-span-1">
                    <span className="block text-xs font-semibold text-slate-700">Note</span>
                    <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="Optional" />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Untick "Back to stock" for opened, damaged or cold-chain items. They are refunded but not resold.</p>
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-sm text-slate-600">Refund <span className="font-semibold text-[#0B2545] tabular-nums">{money(refund)}</span></div>
                  <button type="submit" disabled={busy || chosen.length === 0} className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2563EB]/20">
                    {busy ? "Processing..." : `Refund ${money(refund)}`}
                  </button>
                </div>
              </>
            ) : (
              <p className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">Ask a pharmacist or the owner to process this return.</p>
            )}

            {pastReturns.length > 0 && (
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-500">Earlier returns on this invoice</div>
                {pastReturns.map(r => (
                  <div key={r.id}>{r.returnNo}: {r.items.map(i => `${i.name} x ${i.qty}`).join(", ")} · {money(r.refundAmount)} · {r.reason}</div>
                ))}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
