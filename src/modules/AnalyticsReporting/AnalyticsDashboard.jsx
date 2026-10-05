import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  FileText,
  AlertTriangle,
  CalendarX,
  Truck,
  Printer,
  BarChart3,
  Wallet,
  Undo2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import DailySalesReportModal from './DailySalesReportModal';
import MonthlyRevenueReportModal from './MonthlyRevenueReportModal';
import { dailySeries, monthlySeries, summarize, inDay, inMonth, todayKey, monthKey, dayKey, growth, money } from '../../lib/salesStats';
import { expiryAlerts } from '../../lib/expiry';
import { CLOSED_PO_STATUSES } from '../../lib/reorder';

const BLUE = "#2563EB";
const GRID = "#EEF2F7";
const AXIS = "#94a3b8";
const tooltipStyle = { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', boxShadow: '0 12px 28px -8px rgba(11, 37, 69, 0.18)' };
const kFormat = (v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : `${Math.round(v)}`);

function Trend({ value, label }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-slate-500">No {label} to compare</span>;
  const up = value >= 0;
  return (
    <span className={up ? "text-emerald-700" : "text-rose-700"}>
      {up ? "+" : ""}{value.toFixed(1)}% vs {label}
    </span>
  );
}

// A ranked list drawn as thin single-colour bars (magnitude only, one hue).
function BarList({ rows, valueOf, labelOf, format, empty }) {
  const max = Math.max(...rows.map(valueOf), 0);
  if (rows.length === 0) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={i} className="space-y-1">
          <div className="flex justify-between gap-3 text-xs">
            <span className="text-slate-700 font-medium truncate">{labelOf(r)}</span>
            <span className="text-slate-900 font-semibold tabular-nums whitespace-nowrap">{format(r)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] shadow-[0_2px_6px_-1px_rgb(37_99_235/0.5)] origin-left transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${max ? Math.max(2, (valueOf(r) / max) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Shown in place of a chart when the period has no sales, so an empty axis doesn't read as a flat zero line.
function EmptyChart({ title, detail }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6">
      <BarChart3 className="w-6 h-6 text-slate-300" strokeWidth={1.75} />
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500 max-w-[40ch]">{detail}</p>
    </div>
  );
}

export default function AnalyticsDashboard({ medicines = [], transactions = [], prescriptions = [], salesReturns = [], batches = [], purchaseOrders = [], onNavigate }) {
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isMonthlyOpen, setIsMonthlyOpen] = useState(false);
  const [range, setRange] = useState(30);

  const today = todayKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);
  const thisMonth = monthKey(new Date());
  const lastMonthDate = new Date();
  lastMonthDate.setDate(1);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = monthKey(lastMonthDate);

  const todayStats = useMemo(() => summarize(inDay(transactions, today), inDay(salesReturns, today), medicines), [transactions, salesReturns, medicines, today]);
  const yesterdayStats = useMemo(() => summarize(inDay(transactions, yesterday), inDay(salesReturns, yesterday)), [transactions, salesReturns, yesterday]);
  const monthStats = useMemo(() => summarize(inMonth(transactions, thisMonth), inMonth(salesReturns, thisMonth), medicines), [transactions, salesReturns, medicines, thisMonth]);
  const lastMonthStats = useMemo(() => summarize(inMonth(transactions, lastMonth), inMonth(salesReturns, lastMonth)), [transactions, salesReturns, lastMonth]);
  const daily = useMemo(() => dailySeries(transactions, salesReturns, range), [transactions, salesReturns, range]);
  const monthly = useMemo(() => monthlySeries(transactions, salesReturns, 12), [transactions, salesReturns]);

  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const expiryCount = expiryAlerts(batches, medicines).length;
  const pendingRxCount = prescriptions.filter(p => p.status === "Pending").length;
  const openPOs = purchaseOrders.filter(po => !CLOSED_PO_STATUSES.includes(po.status));
  const pendingApproval = openPOs.filter(po => po.status === "Pending").length;
  const stockValue = medicines.reduce((s, m) => s + (m.sellableStock ?? m.stock) * Number(m.unitPrice || 0), 0);
  const refundRate = monthStats.gross ? (monthStats.refunds / monthStats.gross) * 100 : 0;

  const dayGrowth = growth(todayStats.net, yesterdayStats.net);
  const monthGrowth = growth(monthStats.net, lastMonthStats.net);
  const rangeTotal = daily.reduce((s, d) => s + d.net, 0);
  const dailyEmpty = daily.every(d => d.count === 0 && d.refunds === 0);
  const monthlyEmpty = monthly.every(m => m.count === 0 && m.refunds === 0);
  const go = (target) => onNavigate ? () => onNavigate(target) : undefined;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <PageHeader
        kicker="Overview"
        title="Pharmacy performance"
        description="Sales, revenue growth, stock and open work, from the live sales and stock records."
      >
        <button
          onClick={() => setIsDailyOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-sm rounded-xl shadow-md shadow-[#2563EB]/20"
        >
          <Printer className="w-4 h-4" />
          <span>Daily sales report</span>
        </button>
        <button
          onClick={() => setIsMonthlyOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium text-sm rounded-xl"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monthly revenue report</span>
        </button>
      </PageHeader>

      {/* Money */}
      <div className="metric-grid grid grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Net sales today"
          value={money(todayStats.net)}
          subtitle={<Trend value={dayGrowth} label="yesterday" />}
          icon={TrendingUp}
        />
        <MetricCard
          title="Revenue this month"
          value={money(monthStats.net)}
          subtitle={<Trend value={monthGrowth} label="last month" />}
          icon={Wallet}
        />
        <MetricCard
          title="Sales today"
          value={todayStats.count}
          subtitle={`Average bill ${money(todayStats.avgTicket)} · ${todayStats.items} units`}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Refunds this month"
          value={money(monthStats.refunds)}
          subtitle={`${refundRate.toFixed(1)}% of gross sales`}
          icon={Undo2}
          colorScheme={refundRate > 5 ? "amber" : "sky"}
        />
      </div>

      {/* Work waiting */}
      <div className="metric-grid grid grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Need reordering" value={lowStockCount} subtitle="At or below reorder level" icon={AlertTriangle} colorScheme="amber" badge={lowStockCount ? "Reorder" : undefined} onClick={go("inventory:reorder")} />
        <MetricCard title="Expiry warnings" value={expiryCount} subtitle="Batches expired or expiring in 90 days" icon={CalendarX} colorScheme="rose" onClick={go("inventory:expiry")} />
        <MetricCard title="Prescriptions to check" value={pendingRxCount} subtitle="Pharmacist verification queue" icon={FileText} colorScheme="rose" onClick={go("prescriptions")} />
        <MetricCard title="Open purchase orders" value={openPOs.length} subtitle={`${pendingApproval} waiting for approval. Stock on hand worth ${money(stockValue)}`} icon={Truck} onClick={go("inventory:purchase_orders")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily net sales */}
        <section className="lg:col-span-8 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5" aria-label="Daily net sales">
          <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Daily net sales</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sales less refunds, last {range} days: {money(rangeTotal)}</p>
            </div>
            <div className="flex gap-1.5" role="group" aria-label="Time range">
              {[7, 30, 90].map(d => (
                <button key={d} onClick={() => setRange(d)} aria-pressed={range === d}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${range === d ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {d} days
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {dailyEmpty ? <EmptyChart title={`No sales in the last ${range} days`} detail="Completed sales at the counter appear here within seconds." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} dy={8} minTickGap={24} />
                <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={kFormat} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
                  formatter={(val, _name, item) => [`${money(val)} (${item.payload.count} sale${item.payload.count === 1 ? "" : "s"}${item.payload.refunds ? `, ${money(item.payload.refunds)} refunded` : ""})`, 'Net sales']}
                />
                <Area type="monotone" dataKey="net" stroke={BLUE} strokeWidth={2.25} fillOpacity={1} fill="url(#netGrad)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Sales by category */}
        <section className="lg:col-span-4 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5" aria-label="Sales by category this month">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Sales by category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Share of this month's sales</p>
          </div>
          <BarList
            rows={monthStats.categories.slice(0, 6)}
            valueOf={r => r.value}
            labelOf={r => r.name}
            format={r => `${r.share.toFixed(0)}% · ${money(r.value)}`}
            empty="No sales this month yet."
          />
        </section>
      </div>

      {/* Monthly revenue */}
      <section className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5" aria-label="Monthly revenue">
        <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Monthly revenue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Net revenue for the last 12 months, with growth on the month before</p>
          </div>
          <button onClick={() => setIsMonthlyOpen(true)} className="text-sm font-medium text-[#2563EB] hover:underline">Full report</button>
        </div>
        <div className="h-64">
          {monthlyEmpty ? <EmptyChart title="No revenue in the last 12 months" detail="Each month's net revenue and growth appear once sales are recorded." /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={kFormat} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: '#F1F5F9' }}
                labelFormatter={(_l, p) => p?.[0]?.payload?.fullLabel || ""}
                formatter={(val, _n, item) => [
                  `${money(val)}${item.payload.growth === null ? "" : ` (${item.payload.growth >= 0 ? "+" : ""}${item.payload.growth.toFixed(1)}%)`}`,
                  'Net revenue'
                ]}
              />
              <Bar dataKey="net" fill="url(#barGrad)" radius={[6, 6, 2, 2]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5" aria-label="Best sellers this month">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Best sellers this month</h3>
            <p className="text-xs text-slate-500 mt-0.5">By sales value</p>
          </div>
          <BarList
            rows={monthStats.topItems.slice(0, 6)}
            valueOf={r => r.total}
            labelOf={r => r.name}
            format={r => `${r.qty} units · ${money(r.total)}`}
            empty="No sales this month yet."
          />
        </section>
        <section className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5" aria-label="Payments this month">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Payments this month</h3>
            <p className="text-xs text-slate-500 mt-0.5">Collected by payment method, with refunds paid out</p>
          </div>
          <BarList
            rows={monthStats.methods}
            valueOf={r => r.sales}
            labelOf={r => r.method}
            format={r => `${r.count} sale${r.count === 1 ? "" : "s"} · ${money(r.sales)}${r.refunds ? ` · ${money(r.refunds)} refunded` : ""}`}
            empty="No payments this month yet."
          />
        </section>
      </div>

      <DailySalesReportModal
        isOpen={isDailyOpen}
        onClose={() => setIsDailyOpen(false)}
        transactions={transactions}
        salesReturns={salesReturns}
        medicines={medicines}
      />
      <MonthlyRevenueReportModal
        isOpen={isMonthlyOpen}
        onClose={() => setIsMonthlyOpen(false)}
        transactions={transactions}
        salesReturns={salesReturns}
      />
    </div>
  );
}
