import React, { useMemo, useState } from 'react';
import ReportShell, { Stat } from './ReportShell';
import { summarize, inDay, todayKey, money, downloadCsv } from '../../lib/salesStats';

// Hooks can't run after an early return, so the open check lives in this wrapper.
export default function DailySalesReportModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <DailySalesReport {...props} />;
}

// Everything sold and refunded on one day: totals, payments, every invoice
// and the best sellers.
function DailySalesReport({ onClose, transactions = [], salesReturns = [], medicines = [] }) {
  const [day, setDay] = useState(todayKey());
  const sales = useMemo(() => inDay(transactions, day), [transactions, day]);
  const refunds = useMemo(() => inDay(salesReturns, day), [salesReturns, day]);
  const s = useMemo(() => summarize(sales, refunds, medicines), [sales, refunds, medicines]);

  const csv = () => downloadCsv(`daily-sales-${day}.csv`, [
    ["PHARMART daily sales report", day],
    [],
    ["Invoice", "Time", "Customer", "Cashier", "Items", "Payment", "Discount", "Tax", "Total", "Refunded"],
    ...sales.map(t => [t.invoiceNo, new Date(t.createdAt).toLocaleTimeString(), t.customerName, t.cashierName,
      t.items.map(i => `${i.name} x ${i.qty}`).join("; "), t.paymentMethod, t.discountAmt, t.taxAmt, t.total, t.refundedAmount || 0]),
    [],
    ["Refund", "Invoice", "Items", "Method", "Reason", "Amount"],
    ...refunds.map(r => [r.returnNo, r.invoiceNo, r.items.map(i => `${i.name} x ${i.qty}`).join("; "), r.refundMethod, r.reason, r.refundAmount]),
    [],
    ["Gross sales", s.gross], ["Refunds", s.refunds], ["Net sales", s.net], ["Invoices", s.count], ["Discounts given", s.discount], ["Tax collected", s.tax]
  ]);

  return (
    <ReportShell
      title="Daily sales report"
      subtitle={day === todayKey() ? `Today, ${day}` : day}
      onClose={onClose}
      onCsv={csv}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-600" htmlFor="report-day">Day</label>
          <input id="report-day" type="date" value={day} max={todayKey()} onChange={(e) => setDay(e.target.value || todayKey())}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm" />
          {day !== todayKey() && (
            <button onClick={() => setDay(todayKey())} className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs hover:bg-slate-50">Today</button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Net sales" value={money(s.net)} note={s.refunds ? `${money(s.gross)} sold, ${money(s.refunds)} refunded` : "No refunds"} />
        <Stat label="Invoices" value={s.count} note={`${s.items} units sold`} />
        <Stat label="Average bill" value={money(s.avgTicket)} />
        <Stat label="Discounts and tax" value={money(s.discount)} note={`Tax collected ${money(s.tax)}`} />
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Payments</h3>
        {s.methods.length === 0 ? <p className="text-xs text-slate-500">No payments on this day.</p> : (
          <table className="w-full text-xs">
            <thead className="text-slate-500"><tr><th className="text-left py-1.5 font-medium">Method</th><th className="text-right py-1.5 font-medium">Sales</th><th className="text-right py-1.5 font-medium">Collected</th><th className="text-right py-1.5 font-medium">Refunded</th><th className="text-right py-1.5 font-medium">Net</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {s.methods.map(m => (
                <tr key={m.method}><td className="py-2">{m.method}</td><td className="py-2 text-right tabular-nums">{m.count}</td><td className="py-2 text-right tabular-nums">{money(m.sales)}</td><td className="py-2 text-right tabular-nums">{money(m.refunds)}</td><td className="py-2 text-right tabular-nums font-semibold">{money(m.sales - m.refunds)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Invoices ({sales.length})</h3>
        {sales.length === 0 ? (
          <p className="text-xs text-slate-500 p-6 text-center rounded-2xl border border-dashed border-slate-300">No sales on {day}.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="p-2.5 font-medium">Invoice</th><th className="p-2.5 font-medium">Time</th><th className="p-2.5 font-medium">Customer</th><th className="p-2.5 font-medium">Items</th><th className="p-2.5 font-medium">Payment</th><th className="p-2.5 font-medium text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map(t => (
                  <tr key={t.id}>
                    <td className="p-2.5 font-mono text-[#0B2545]">{t.invoiceNo}{t.status !== "Completed" && <span className="block text-[10px] text-amber-700">{t.status}</span>}</td>
                    <td className="p-2.5 text-slate-600 whitespace-nowrap">{new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}<span className="block text-[10px]">{t.cashierName}</span></td>
                    <td className="p-2.5">{t.customerName}</td>
                    <td className="p-2.5 text-slate-600">{t.items.map(i => `${i.name} x ${i.qty}`).join(", ")}</td>
                    <td className="p-2.5">{t.paymentMethod}</td>
                    <td className="p-2.5 text-right tabular-nums font-semibold">{money(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {refunds.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Refunds ({refunds.length})</h3>
          <ul className="text-xs divide-y divide-slate-100 border border-slate-200 rounded-2xl">
            {refunds.map(r => (
              <li key={r.id} className="p-2.5 flex flex-wrap justify-between gap-2">
                <span><span className="font-mono">{r.returnNo}</span> on {r.invoiceNo}: {r.items.map(i => `${i.name} x ${i.qty}`).join(", ")} · {r.reason}</span>
                <span className="tabular-nums font-semibold">{money(r.refundAmount)} · {r.refundMethod}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {s.topItems.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Best sellers</h3>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {s.topItems.slice(0, 5).map(i => (
                <tr key={i.name}><td className="py-2">{i.name}</td><td className="py-2 text-right tabular-nums">{i.qty} units</td><td className="py-2 text-right tabular-nums font-semibold">{money(i.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </ReportShell>
  );
}
