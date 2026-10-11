import React, { useMemo, useState } from 'react';
import { History, TrendingUp, TrendingDown, Tag, Search, X, ArrowRight } from 'lucide-react';
import MetricCard from '../../components/MetricCard';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const stamp = (value) => (value ? new Date(value).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }) : "");
const DAY = 24 * 60 * 60 * 1000;

const PERIODS = [
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "365", label: "Last 12 months", days: 365 },
  { key: "ALL", label: "All time", days: null }
];

// Increase, decrease, or the first price recorded for the medicine.
function kindOf(row) {
  if (row.oldPrice === null || row.oldPrice === undefined) return "first";
  return Number(row.newPrice) > Number(row.oldPrice) ? "up" : "down";
}

const KIND_CHIP = {
  first: { label: "First price", chip: "status-chip-gray" },
  up: { label: "Increase", chip: "status-chip-amber" },
  down: { label: "Decrease", chip: "status-chip-blue" }
};

function ChangeCell({ row }) {
  const kind = kindOf(row);
  if (kind === "first") return <span className="text-slate-400">-</span>;
  const diff = Number(row.newPrice) - Number(row.oldPrice);
  const pct = Number(row.oldPrice) > 0 ? (diff / Number(row.oldPrice)) * 100 : null;
  return (
    <span className={`font-semibold tabular-nums whitespace-nowrap ${kind === "up" ? "text-amber-700" : "text-blue-700"}`}>
      {diff > 0 ? "+" : "-"}{money(Math.abs(diff))}
      {pct !== null && <span className="text-[11px] font-medium"> ({diff > 0 ? "+" : "-"}{Math.abs(pct).toFixed(1)}%)</span>}
    </span>
  );
}

// Every change to a medicine's selling price: old and new price, who changed it and when.
export default function PriceHistory({ priceHistory = [], medicines = [], medicineId = "ALL", onMedicineChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [kindFilter, setKindFilter] = useState("ALL");
  // Time the tab was opened; the period filters count back from it.
  const [now] = useState(() => Date.now());

  const medicineOptions = useMemo(() => {
    const names = new Map();
    priceHistory.forEach(h => { if (h.medicineId && !names.has(h.medicineId)) names.set(h.medicineId, h.medicineName); });
    medicines.forEach(m => names.set(m.id, m.name));
    return Array.from(names, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [priceHistory, medicines]);

  const since = PERIODS.find(p => p.key === period)?.days;
  const term = searchTerm.trim().toLowerCase();
  const rows = priceHistory.filter(h => {
    if (medicineId !== "ALL" && h.medicineId !== medicineId) return false;
    if (since && new Date(h.createdAt).getTime() < now - since * DAY) return false;
    if (kindFilter !== "ALL" && kindOf(h) !== kindFilter) return false;
    if (term && !`${h.medicineName} ${h.medicineCode} ${h.user} ${h.note}`.toLowerCase().includes(term)) return false;
    return true;
  });

  // Figures for the last 30 days (or for the chosen medicine, over all time).
  const recent = priceHistory.filter(h => medicineId === "ALL"
    ? new Date(h.createdAt).getTime() >= now - 30 * DAY
    : h.medicineId === medicineId);
  const changes = recent.filter(h => kindOf(h) !== "first");
  const ups = changes.filter(h => kindOf(h) === "up").length;
  const downs = changes.length - ups;
  const medsChanged = new Set(changes.map(h => h.medicineId)).size;

  // For one medicine: first recorded price against today's price.
  const selected = medicineId !== "ALL" ? medicines.find(m => m.id === medicineId) : null;
  const ownRows = medicineId !== "ALL" ? priceHistory.filter(h => h.medicineId === medicineId) : [];
  const firstRow = ownRows[ownRows.length - 1];
  const currentPrice = selected ? Number(selected.unitPrice || 0) : Number(ownRows[0]?.newPrice || 0);
  const overall = firstRow && Number(firstRow.newPrice) > 0
    ? ((currentPrice - Number(firstRow.newPrice)) / Number(firstRow.newPrice)) * 100
    : null;

  const scope = medicineId === "ALL" ? "Last 30 days" : "All time";

  return (
    <div className="space-y-5">
      <div className="metric-grid grid grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Price changes" value={changes.length} subtitle={scope} icon={History} />
        <MetricCard title="Increases" value={ups} subtitle={scope} icon={TrendingUp} colorScheme="amber" />
        <MetricCard title="Decreases" value={downs} subtitle={scope} icon={TrendingDown} />
        {medicineId === "ALL" ? (
          <MetricCard title="Medicines repriced" value={medsChanged} subtitle={scope} icon={Tag} />
        ) : (
          <MetricCard
            title="Since first price"
            value={overall === null ? "-" : `${overall > 0 ? "+" : ""}${overall.toFixed(1)}%`}
            subtitle={firstRow ? `${money(firstRow.newPrice)} to ${money(currentPrice)}` : "No price recorded"}
            icon={Tag}
            colorScheme={overall > 0 ? "amber" : "sky"}
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="search"
            aria-label="Search price history"
            placeholder="Search medicine, staff or reason"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by medicine"
            value={medicineId}
            onChange={(e) => onMedicineChange?.(e.target.value)}
            className="max-w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
          >
            <option value="ALL">All medicines</option>
            {medicineOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select
            aria-label="Filter by period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
          >
            {PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select
            aria-label="Filter by change"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
          >
            <option value="ALL">All changes</option>
            <option value="up">Increases</option>
            <option value="down">Decreases</option>
            <option value="first">First prices</option>
          </select>
          {medicineId !== "ALL" && (
            <button
              onClick={() => onMedicineChange?.("ALL")}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <X className="w-3.5 h-3.5" /> Show all medicines
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-2">
          <History className="w-10 h-10 mx-auto text-slate-300" />
          <div className="font-semibold text-[#0B2545]">No price changes found</div>
          <p className="text-sm text-slate-500">
            {priceHistory.length === 0
              ? "Every time a medicine's selling price is changed, it is recorded here."
              : "Try another medicine, period or change type."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs block md:table">
              <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-medium">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Medicine</th>
                  <th className="py-3.5 px-4">Price (LKR)</th>
                  <th className="py-3.5 px-4">Change</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Changed by</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-slate-100">
                {rows.map(h => {
                  const kind = kindOf(h);
                  return (
                    <tr key={h.id} className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 md:table-row md:p-0 hover:bg-slate-50/80 transition-colors">
                      <td className="col-span-2 md:col-span-1 md:py-3.5 md:px-4 text-slate-500 whitespace-nowrap">{stamp(h.createdAt)}</td>
                      <td className="col-span-2 md:col-span-1 md:py-3.5 md:px-4">
                        {medicineId === "ALL" && h.medicineId ? (
                          <button onClick={() => onMedicineChange?.(h.medicineId)} className="font-bold text-slate-900 hover:text-blue-700 text-left" title="Show only this medicine">
                            {h.medicineName}
                          </button>
                        ) : (
                          <span className="font-bold text-slate-900">{h.medicineName}</span>
                        )}
                        <div className="text-[11px] font-mono text-slate-400">{h.medicineCode}</div>
                      </td>
                      <td className="md:py-3.5 md:px-4 whitespace-nowrap tabular-nums">
                        {kind === "first" ? (
                          <span className="font-medium text-slate-900">{money(h.newPrice)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-slate-400 line-through">{money(h.oldPrice)}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-medium text-slate-900">{money(h.newPrice)}</span>
                          </span>
                        )}
                      </td>
                      <td className="justify-self-end md:justify-self-auto md:py-3.5 md:px-4"><ChangeCell row={h} /></td>
                      <td className="col-span-2 md:col-span-1 md:py-3.5 md:px-4">
                        <span className={`status-chip ${KIND_CHIP[kind].chip}`}>{h.reason || KIND_CHIP[kind].label}</span>
                        {h.note && <div className="text-[11px] text-slate-500 mt-1">{h.note}</div>}
                      </td>
                      <td className="col-span-2 md:col-span-1 md:py-3.5 md:px-4 text-slate-600">{h.user || "System"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {priceHistory.length >= 1000 && (
            <p className="px-4 py-3 text-[11px] text-slate-400 border-t border-slate-100">Showing the latest 1,000 price changes.</p>
          )}
        </div>
      )}
    </div>
  );
}
