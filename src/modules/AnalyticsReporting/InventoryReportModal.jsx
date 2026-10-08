import React, { useMemo, useState } from 'react';
import ReportShell, { Stat } from './ReportShell';
import { inDay, inMonth, todayKey, monthKey, monthLabel, money, downloadCsv } from '../../lib/salesStats';
import { expiryAlerts, EXPIRY_LABEL } from '../../lib/expiry';

// Hooks can't run after an early return, so the open check lives in this wrapper.
export default function InventoryReportModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <InventoryReport {...props} />;
}

// Stock received, sold, returned and written off for each medicine.
const RECEIVED = ["Goods received", "Stock received", "Opening stock"];
const CUSTOMER_RETURN = "Customer return";

// Stock movements for a day or a month (stock in, sales, returns, write-offs)
// plus the stock on hand now: quantities, value, low stock and expiring batches.
function InventoryReport({ onClose, medicines = [], batches = [], stockMovements = [], transactions = [] }) {
  const [period, setPeriod] = useState("day");
  const [day, setDay] = useState(todayKey());
  const [month, setMonth] = useState(monthKey(new Date()));
  const key = period === "day" ? day : month;
  const label = period === "day" ? (day === todayKey() ? `Today, ${day}` : day) : monthLabel(month, true);

  const activity = useMemo(() => {
    const pick = period === "day" ? inDay : inMonth;
    const moves = pick(stockMovements, key);
    const sales = pick(transactions, key);
    const rows = {};
    const row = (id, name) => (rows[id] ||= { id, name, received: 0, sold: 0, returned: 0, adjusted: 0 });

    sales.forEach(t => (t.items || []).forEach(i => {
      const id = i.medicineId || i.id;
      if (id) row(id, i.name).sold += Number(i.qty || 0);
    }));
    moves.forEach(v => {
      const r = row(v.medicineId, v.medicineName);
      const change = Number(v.change || 0);
      if (RECEIVED.includes(v.reason)) r.received += change;
      else if (v.reason === CUSTOMER_RETURN) r.returned += change;
      else r.adjusted += change;
    });

    const byId = Object.fromEntries(medicines.map(m => [m.id, m]));
    return Object.values(rows)
      .map(r => ({ ...r, name: byId[r.id]?.name || r.name || r.id, code: byId[r.id]?.code || "" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [period, key, stockMovements, transactions, medicines]);

  const stock = useMemo(() => medicines
    .map(m => {
      const sellable = m.sellableStock ?? m.stock;
      return { ...m, sellable, value: sellable * Number(m.unitPrice || 0), low: m.stock <= m.reorderLevel };
    })
    .sort((a, b) => a.name.localeCompare(b.name)), [medicines]);

  const expiring = useMemo(() => expiryAlerts(batches, medicines), [batches, medicines]);

  const totals = activity.reduce((s, r) => ({
    received: s.received + r.received, sold: s.sold + r.sold, returned: s.returned + r.returned, adjusted: s.adjusted + r.adjusted
  }), { received: 0, sold: 0, returned: 0, adjusted: 0 });
  const units = stock.reduce((s, m) => s + m.sellable, 0);
  const value = stock.reduce((s, m) => s + m.value, 0);
  const lowCount = stock.filter(m => m.low).length;

  const csv = () => downloadCsv(`inventory-${key}.csv`, [
    ["PHARMART inventory report", label],
    [],
    ["Stock movement", "Code", "Medicine", "Received", "Sold", "Customer returns", "Adjusted / written off"],
    ...activity.map(r => ["", r.code, r.name, r.received, r.sold, r.returned, r.adjusted]),
    ["Total", "", "", totals.received, totals.sold, totals.returned, totals.adjusted],
    [],
    ["Stock on hand", "Code", "Medicine", "Category", "Sellable", "Expired", "Reorder level", "Unit price", "Value", "Status"],
    ...stock.map(m => ["", m.code, m.name, m.category, m.sellable, m.expiredStock || 0, m.reorderLevel, m.unitPrice, m.value.toFixed(2), m.low ? "Low stock" : "OK"]),
    [],
    ["Expiring batches", "Medicine", "Batch", "Expiry date", "Quantity", "Status"],
    ...expiring.map(b => ["", b.medicine.name, b.batchNo, b.expiryDate, b.quantity, EXPIRY_LABEL[b.status].label]),
    [],
    ["Units on hand", units], ["Stock value", value.toFixed(2)], ["Low stock medicines", lowCount], ["Expired or expiring batches", expiring.length]
  ]);

  const tab = (id, text) => (
    <button onClick={() => setPeriod(id)} aria-pressed={period === id}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${period === id ? "bg-white text-[#0B2545] shadow-sm" : "text-slate-500 hover:text-[#0B2545]"}`}>
      {text}
    </button>
  );
  const th = "p-2.5 font-medium";
  const num = "p-2.5 text-right tabular-nums";

  return (
    <ReportShell
      title={period === "day" ? "Daily inventory report" : "Monthly inventory report"}
      subtitle={label}
      onClose={onClose}
      onCsv={csv}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">{tab("day", "Daily")}{tab("month", "Monthly")}</div>
          {period === "day" ? (
            <input aria-label="Day" type="date" value={day} max={todayKey()} onChange={(e) => setDay(e.target.value || todayKey())}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm" />
          ) : (
            <input aria-label="Month" type="month" value={month} max={monthKey(new Date())} onChange={(e) => setMonth(e.target.value || monthKey(new Date()))}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm" />
          )}
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Units received" value={totals.received} note={totals.returned ? `${totals.returned} returned by customers` : "No customer returns"} />
        <Stat label="Units sold" value={totals.sold} note={totals.adjusted ? `${totals.adjusted} adjusted or written off` : "No adjustments"} />
        <Stat label="Stock value now" value={money(value)} note={`${units} sellable units`} />
        <Stat label="Needs attention" value={lowCount + expiring.length} note={`${lowCount} low stock · ${expiring.length} expiring batches`} />
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Stock movement ({activity.length} medicines)</h3>
        {activity.length === 0 ? (
          <p className="text-xs text-slate-500 p-6 text-center rounded-2xl border border-dashed border-slate-300">No stock came in or went out in {label}.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600"><tr><th className={th}>Medicine</th><th className={`${th} text-right`}>Received</th><th className={`${th} text-right`}>Sold</th><th className={`${th} text-right`}>Returns</th><th className={`${th} text-right`}>Adjusted</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {activity.map(r => (
                  <tr key={r.id}>
                    <td className="p-2.5">{r.name}{r.code && <span className="block text-[10px] font-mono text-slate-400">{r.code}</span>}</td>
                    <td className={num}>{r.received || "–"}</td>
                    <td className={num}>{r.sold || "–"}</td>
                    <td className={num}>{r.returned || "–"}</td>
                    <td className={num}>{r.adjusted || "–"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold"><tr><td className="p-2.5">Total</td><td className={num}>{totals.received}</td><td className={num}>{totals.sold}</td><td className={num}>{totals.returned}</td><td className={num}>{totals.adjusted}</td></tr></tfoot>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Stock on hand now ({stock.length} medicines)</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600"><tr><th className={th}>Medicine</th><th className={th}>Category</th><th className={`${th} text-right`}>Sellable</th><th className={`${th} text-right`}>Reorder at</th><th className={`${th} text-right`}>Value</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map(m => (
                <tr key={m.id}>
                  <td className="p-2.5">{m.name}<span className="block text-[10px] font-mono text-slate-400">{m.code}</span></td>
                  <td className="p-2.5 text-slate-600">{m.category}</td>
                  <td className={num}>
                    {m.sellable}
                    {m.low && <span className="block text-[10px] text-amber-700">Low stock</span>}
                    {m.expiredStock > 0 && <span className="block text-[10px] text-rose-700">+{m.expiredStock} expired</span>}
                  </td>
                  <td className={num}>{m.reorderLevel}</td>
                  <td className={`${num} font-semibold`}>{money(m.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Expired or expiring within 90 days ({expiring.length})</h3>
        {expiring.length === 0 ? <p className="text-xs text-slate-500">No batch expires in the next 90 days.</p> : (
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {expiring.map(b => (
                <tr key={b.id}>
                  <td className="py-2">{b.medicine.name} <span className="font-mono text-slate-400">{b.batchNo}</span></td>
                  <td className="py-2 text-right tabular-nums">{b.quantity} units</td>
                  <td className="py-2 text-right">{b.expiryDate}</td>
                  <td className={`py-2 text-right ${b.status === "watch" ? "text-amber-700" : "text-rose-700"}`}>{EXPIRY_LABEL[b.status].label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </ReportShell>
  );
}
