import React, { useEffect, useState } from 'react';
import { X, ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, Check } from 'lucide-react';

const CHECKS = [
  { key: "packaging", label: "Packs sealed and undamaged" },
  { key: "invoice", label: "Matches the supplier's invoice" },
  { key: "coldChain", label: "Fridge items arrived cold" }
];
const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;
const stamp = (value) => (value ? new Date(value).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }) : "");

// What to look at on one delivered line, worst first.
function lineIssues(line, now) {
  const issues = [];
  const damaged = Number(line.damaged) || 0;
  const delivered = Number(line.delivered) || 0;
  if (damaged > 0) issues.push({ tone: "rose", text: `${damaged} damaged` });
  if (delivered < Number(line.outstanding)) issues.push({ tone: "amber", text: `${line.outstanding - delivered} short` });
  if (line.expiryDate && new Date(line.expiryDate).getTime() - now < SIX_MONTHS && delivered > damaged) {
    issues.push({ tone: "amber", text: "Expires within 6 months" });
  }
  return issues;
}

// Check a counted delivery against its order, then approve it (good units go
// into stock) or reject it (nothing goes in; the items stay outstanding).
export default function DeliveryCheckModal({ receipt, po, canCheck, blockedReason, onClose, onDecide }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(null);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lines = receipt.items || [];
  const goodTotal = lines.reduce((s, l) => s + Math.max(0, (Number(l.delivered) || 0) - (Number(l.damaged) || 0)), 0);
  const allIssues = lines.flatMap(l => lineIssues(l, now));
  const failedChecks = CHECKS.filter(c => !receipt.checks?.[c.key]);
  const clean = allIssues.length === 0 && failedChecks.filter(c => c.key !== "coldChain").length === 0;
  // Lines on the order that weren't delivered at all.
  const missingLines = (po?.items || []).filter(item =>
    Number(item.quantity) > (Number(item.receivedQty) || 0) && !lines.some(l => l.medicineId === item.medicineId));

  const decide = async (decision) => {
    if (busy) return;
    setBusy(decision);
    await onDecide(receipt.id, decision, note.trim());
    setBusy(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="check-title" onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0"><ClipboardCheck className="w-5 h-5" /></span>
            <div className="min-w-0">
              <h3 id="check-title" className="text-base font-semibold text-[#0B2545]">Check delivery for {receipt.poId}</h3>
              <p className="text-xs text-slate-500">
                {receipt.supplierName} · counted by {receipt.recordedBy} on {stamp(receipt.recordedAt)}
                {receipt.invoiceNo ? ` · invoice ${receipt.invoiceNo}` : ""}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        {clean ? (
          <p className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Everything counted matches the order and passed the checks.
          </p>
        ) : (
          <p className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0" /> Look at the highlighted lines before you approve.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2 pr-2 font-medium">Item</th>
                <th className="py-2 px-2 font-medium text-right">Outstanding</th>
                <th className="py-2 px-2 font-medium text-right">Delivered</th>
                <th className="py-2 px-2 font-medium text-right">Damaged</th>
                <th className="py-2 px-2 font-medium text-right">Into stock</th>
                <th className="py-2 px-2 font-medium">Batch · expiry</th>
                <th className="py-2 pl-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map(l => {
                const issues = lineIssues(l, now);
                return (
                  <tr key={l.medicineId} className={issues.length ? "bg-amber-50/50" : ""}>
                    <td className="py-2.5 pr-2 font-semibold text-slate-900">{l.name}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{l.outstanding}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{l.delivered}</td>
                    <td className={`py-2.5 px-2 text-right tabular-nums ${Number(l.damaged) > 0 ? "text-rose-700 font-semibold" : ""}`}>{l.damaged || 0}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums font-semibold">{Math.max(0, l.delivered - (l.damaged || 0))}</td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      {l.batchNo ? <span className="font-mono">{l.batchNo}</span> : <span className="text-slate-400">-</span>}
                      {l.expiryDate && <span className="text-slate-500"> · {l.expiryDate}</span>}
                    </td>
                    <td className="py-2.5 pl-2">
                      {issues.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700"><Check className="w-3.5 h-3.5" /> Matches</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {issues.map(i => <span key={i.text} className={`status-chip ${i.tone === "rose" ? "status-chip-red" : "status-chip-amber"}`}>{i.text}</span>)}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {missingLines.length > 0 && (
          <p className="text-xs text-amber-800">Not in this delivery: {missingLines.map(i => i.name).join(", ")}.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="text-xs font-semibold text-slate-700">Checks done when it arrived</div>
            {CHECKS.map(c => (
              <div key={c.key} className={`flex items-center gap-2 text-xs ${receipt.checks?.[c.key] ? "text-emerald-700" : "text-slate-500"}`}>
                {receipt.checks?.[c.key] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {c.label}{receipt.checks?.[c.key] ? "" : ": not ticked"}
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-700">If you approve</div>
            <p>{goodTotal} units go into stock under the batches above.</p>
            {receipt.closeShort
              ? <p className="text-amber-800">The order is closed: the supplier won't send what is still missing.</p>
              : <p>Anything short or damaged stays outstanding on the order.</p>}
            {receipt.notes && <p className="pt-1 text-slate-700">Note from {receipt.recordedBy}: {receipt.notes}</p>}
          </div>
        </div>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-slate-700">Note (needed to reject)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000}
            placeholder="For example: wrong strength sent, returned to the supplier"
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
        </label>

        {!canCheck && blockedReason && <p className="text-xs text-rose-700">{blockedReason}</p>}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">Close</button>
          <button type="button" onClick={() => decide("Rejected")} disabled={!canCheck || !!busy || !note.trim()}
            title={!note.trim() ? "Write why it is rejected" : undefined}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 text-sm font-medium rounded-xl">
            <XCircle className="w-4 h-4" /> {busy === "Rejected" ? "Rejecting..." : "Reject delivery"}
          </button>
          <button type="button" onClick={() => decide("Approved")} disabled={!canCheck || !!busy}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2563EB]/20">
            <CheckCircle2 className="w-4 h-4" /> {busy === "Approved" ? "Approving..." : "Approve and add to stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
