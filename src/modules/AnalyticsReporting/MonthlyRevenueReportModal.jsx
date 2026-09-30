import React, { useMemo, useState } from 'react';
import ReportShell, { Stat } from './ReportShell';
import { monthlySeries, growth, money, downloadCsv } from '../../lib/salesStats';

export default function MonthlyRevenueReportModal({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <MonthlyRevenueReport {...props} />;
}

// Revenue month by month for a year, with growth on the month before and on
// the same month last year.
function MonthlyRevenueReport({ onClose, transactions = [], salesReturns = [] }) {
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => {
    const ys = new Set([thisYear]);
    transactions.forEach(t => ys.add(new Date(t.createdAt).getFullYear()));
    return [...ys].sort((a, b) => b - a);
  }, [transactions, thisYear]);
  const [year, setYear] = useState(thisYear);

  // 24 months ending in December of the chosen year: the year plus the one before, for comparisons.
  const months = useMemo(() => monthlySeries(transactions, salesReturns, 24, new Date(year, 11, 1)), [transactions, salesReturns, year]);
  const current = months.slice(12);
  const previous = months.slice(0, 12);
  const upToNow = year === thisYear ? current.slice(0, new Date().getMonth() + 1) : current;

  const total = (list, key) => list.reduce((s, m) => s + m[key], 0);
  const yearNet = total(upToNow, "net");
  const prevSamePeriod = total(previous.slice(0, upToNow.length), "net");
  const yoy = growth(yearNet, prevSamePeriod);
  const best = upToNow.reduce((b, m) => (m.net > (b?.net ?? -Infinity) ? m : b), null);
  const pct = (v) => (v === null || !Number.isFinite(v) ? "–" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`);

  const csv = () => downloadCsv(`monthly-revenue-${year}.csv`, [
    ["PHARMART monthly revenue report", year],
    [],
    ["Month", "Invoices", "Gross sales", "Discounts", "Tax", "Refunds", "Net revenue", "vs previous month", "vs same month last year"],
    ...upToNow.map((m, i) => [m.fullLabel, m.count, m.gross.toFixed(2), m.discount.toFixed(2), m.tax.toFixed(2), m.refunds.toFixed(2), m.net.toFixed(2), pct(m.growth), pct(growth(m.net, previous[i].net))]),
    [],
    ["Total", total(upToNow, "count"), total(upToNow, "gross").toFixed(2), total(upToNow, "discount").toFixed(2), total(upToNow, "tax").toFixed(2), total(upToNow, "refunds").toFixed(2), yearNet.toFixed(2), "", pct(yoy)]
  ]);

  return (
    <ReportShell
      title="Monthly revenue report"
      subtitle={year === thisYear ? `${year} to date` : String(year)}
      onClose={onClose}
      onCsv={csv}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-600" htmlFor="report-year">Year</label>
          <select id="report-year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Net revenue" value={money(yearNet)} note={`${pct(yoy)} on the same months of ${year - 1}`} />
        <Stat label="Invoices" value={total(upToNow, "count")} note={`${total(upToNow, "items")} units sold`} />
        <Stat label="Refunds" value={money(total(upToNow, "refunds"))} />
        <Stat label="Best month" value={best && best.net > 0 ? best.fullLabel : "–"} note={best && best.net > 0 ? money(best.net) : "No sales yet"} />
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-2.5 text-left font-medium">Month</th>
              <th className="p-2.5 text-right font-medium">Invoices</th>
              <th className="p-2.5 text-right font-medium">Gross sales</th>
              <th className="p-2.5 text-right font-medium hidden sm:table-cell">Discounts</th>
              <th className="p-2.5 text-right font-medium hidden sm:table-cell">Tax</th>
              <th className="p-2.5 text-right font-medium">Refunds</th>
              <th className="p-2.5 text-right font-medium">Net revenue</th>
              <th className="p-2.5 text-right font-medium">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {upToNow.map((m, i) => (
              <tr key={m.key}>
                <td className="p-2.5">{m.fullLabel}</td>
                <td className="p-2.5 text-right tabular-nums">{m.count}</td>
                <td className="p-2.5 text-right tabular-nums">{money(m.gross)}</td>
                <td className="p-2.5 text-right tabular-nums hidden sm:table-cell">{money(m.discount)}</td>
                <td className="p-2.5 text-right tabular-nums hidden sm:table-cell">{money(m.tax)}</td>
                <td className="p-2.5 text-right tabular-nums">{money(m.refunds)}</td>
                <td className="p-2.5 text-right tabular-nums font-semibold">{money(m.net)}</td>
                <td className={`p-2.5 text-right tabular-nums ${m.growth === null ? "text-slate-400" : m.growth >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  title={`vs same month last year: ${pct(growth(m.net, previous[i].net))}`}>
                  {pct(m.growth)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-semibold">
            <tr>
              <td className="p-2.5">Total</td>
              <td className="p-2.5 text-right tabular-nums">{total(upToNow, "count")}</td>
              <td className="p-2.5 text-right tabular-nums">{money(total(upToNow, "gross"))}</td>
              <td className="p-2.5 text-right tabular-nums hidden sm:table-cell">{money(total(upToNow, "discount"))}</td>
              <td className="p-2.5 text-right tabular-nums hidden sm:table-cell">{money(total(upToNow, "tax"))}</td>
              <td className="p-2.5 text-right tabular-nums">{money(total(upToNow, "refunds"))}</td>
              <td className="p-2.5 text-right tabular-nums">{money(yearNet)}</td>
              <td className="p-2.5 text-right tabular-nums">{pct(yoy)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] text-slate-500">Growth compares each month with the month before. Hover a growth figure to compare with the same month last year. Refunds count in the month they were paid.</p>
    </ReportShell>
  );
}
