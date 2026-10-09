import React, { useMemo, useState } from 'react';
import { CalendarX, CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { adjustBatch } from '../../services/supabaseService';
import { notify, notifyError, confirmDialog } from '../../lib/notify';
import { expiryAlerts, EXPIRY_LABEL } from '../../lib/expiry';
import { applyBatchResult } from '../../lib/batches';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const GROUPS = [
  { key: "expired", title: "Expired", hint: "Can't be sold. Write these off once they are removed from the shelf." },
  { key: "soon", title: "Expiring within 30 days", hint: "Sell these first or return them to the supplier." },
  { key: "watch", title: "Expiring within 90 days", hint: "Keep an eye on these." }
];

// Every batch that has expired or expires within 90 days.
export default function ExpiryTracking({ medicines, batches, canEdit, onOpenBatches, setMedicines, setBatches, setStockMovements }) {
  const alerts = useMemo(() => expiryAlerts(batches, medicines), [batches, medicines]);
  const [busyId, setBusyId] = useState(null);

  const byStatus = (key) => alerts.filter(a => a.status === key);
  const valueOf = (list) => list.reduce((sum, a) => sum + a.quantity * Number(a.medicine.unitPrice || 0), 0);

  const writeOff = async (a) => {
    const ok = await confirmDialog({
      title: `Write off ${a.quantity} units of ${a.medicine.name}?`,
      message: `Batch ${a.batchNo} expired on ${a.expiryDate}. The stock is set to 0 and the write-off is recorded.`,
      confirmLabel: "Write off",
      tone: "danger"
    });
    if (!ok) return;
    setBusyId(a.id);
    const { data, error } = await adjustBatch(a.id, 0, "Expired write-off", "Removed from the shelf");
    setBusyId(null);
    if (error) {
      notifyError(error, "Not written off");
      return;
    }
    applyBatchResult(data, { setMedicines, setBatches, setStockMovements });
    notify("Written off", `${a.quantity} units of ${a.medicine.name} (batch ${a.batchNo}) were written off.`);
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
        <div className="font-semibold text-[#0B2545]">No expiry warnings</div>
        <p className="text-sm text-slate-500">No batch in stock expires in the next 90 days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="metric-grid grid grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Expired batches" value={byStatus("expired").length} subtitle={`${money(valueOf(byStatus("expired")))} at selling price`} icon={CalendarX} colorScheme="rose" />
        <MetricCard title="Within 30 days" value={byStatus("soon").length} subtitle={`${money(valueOf(byStatus("soon")))} at selling price`} icon={CalendarClock} colorScheme="rose" />
        <MetricCard title="Within 90 days" value={byStatus("watch").length} subtitle={`${money(valueOf(byStatus("watch")))} at selling price`} icon={Clock} colorScheme="amber" />
        <MetricCard title="Units affected" value={alerts.reduce((s, a) => s + a.quantity, 0)} subtitle="Across all warned batches" icon={CalendarClock} />
      </div>

      {GROUPS.map(g => {
        const list = byStatus(g.key);
        if (list.length === 0) return null;
        return (
          <section key={g.key} aria-label={g.title} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <header className="px-4 sm:px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-[#0B2545]">{g.title} <span className="text-slate-400 font-mono text-sm">{list.length}</span></h3>
              <p className="text-xs text-slate-500">{g.hint}</p>
            </header>
            <ul className="divide-y divide-slate-100">
              {list.map(a => (
                <li key={a.id} className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <div className="font-semibold text-sm text-slate-900">{a.medicine.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Batch <span className="font-mono">{a.batchNo}</span> · expires {a.expiryDate}
                      {a.status !== "expired" ? ` (in ${a.days} day${a.days === 1 ? "" : "s"})` : ` (${-a.days} day${a.days === -1 ? "" : "s"} ago)`}
                    </div>
                  </div>
                  <span className={`status-chip ${EXPIRY_LABEL[a.status].chip}`}>{EXPIRY_LABEL[a.status].label}</span>
                  <span className="text-sm font-semibold tabular-nums w-20 text-right">{a.quantity} units</span>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenBatches(a.medicine)} className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      Batches
                    </button>
                    {canEdit && a.status === "expired" && (
                      <button onClick={() => writeOff(a)} disabled={busyId === a.id} className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold">
                        {busyId === a.id ? "Writing off..." : "Write off"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
