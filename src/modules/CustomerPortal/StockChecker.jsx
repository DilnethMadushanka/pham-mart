import React, { useMemo, useState } from 'react';
import { Search, FileText, Phone, X } from 'lucide-react';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// What a customer needs to know before the trip: is it on the shelf, and does it need a prescription.
// Exact counts stay behind the counter; customers see a plain availability label.
function availability(med) {
  const units = med.sellableStock ?? med.stock ?? 0;
  if (units <= 0) return { label: "Out of stock", tone: "status-chip-gray" };
  if (units <= (med.reorderLevel || 0)) return { label: "Low, call ahead", tone: "status-chip-amber" };
  return { label: "In stock", tone: "status-chip-green" };
}

export default function StockChecker({ medicines = [], onUploadRx }) {
  const [query, setQuery] = useState("");

  // Controlled drugs are dispensed only against a prescription at the counter, so they aren't advertised here.
  const listed = useMemo(() => medicines.filter(m => !m.controlledDrug), [medicines]);

  const categories = useMemo(() => {
    const counts = {};
    listed.forEach(m => { if (m.category) counts[m.category] = (counts[m.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);
  }, [listed]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? listed.filter(m => [m.name, m.genericName, m.category].some(v => String(v || "").toLowerCase().includes(q)))
      : listed.filter(m => (m.sellableStock ?? m.stock) > 0);
    return list.slice(0, 6);
  }, [listed, query]);

  if (listed.length === 0) return null;

  return (
    <section aria-labelledby="stock-title" className="rounded-[28px] bg-gradient-to-b from-[#EFF6FF] to-[#F8FAFC] ring-1 ring-[#2563EB]/10 px-5 py-8 sm:p-10 lg:p-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-3">
        <h2 id="stock-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545] leading-[1.08]">
          Check the shelf before you visit
        </h2>
        <p className="text-slate-600 leading-relaxed max-w-[42ch]">
          Search by brand or generic name. Stock updates as the counter sells.
        </p>
        </div>
        <a href="tel:055-222-8292" className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-[#0B2545] hover:text-[#2563EB]">
          <Phone className="w-4 h-4 text-[#2563EB]" />
          Not listed? Call 055-222-8292
        </a>
      </div>

      <div className="space-y-4 min-w-0">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paracetamol, metformin, cough syrup..."
            aria-label="Search medicines in stock"
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white ring-1 ring-slate-200 shadow-md shadow-[#0B2545]/5 text-base text-slate-900 outline-none focus:ring-2 focus:ring-[#2563EB]/60"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Browse by category">
            {categories.map(c => (
              <button key={c} onClick={() => setQuery(query === c ? "" : c)} aria-pressed={query === c}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm ring-1 ${query === c ? "bg-[#0B2545] text-white ring-[#0B2545]" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300 hover:text-[#0B2545]"}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">We don't list "{query}" yet</p>
            <p className="text-sm text-slate-500 mt-1">Call the pharmacist. Many items can be ordered in within a day or two.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map(m => {
              const a = availability(m);
              return (
                <li key={m.id} className="bg-white rounded-2xl ring-1 ring-slate-200/80 p-4 hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300 flex flex-col gap-3 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-[#0B2545] leading-snug">{m.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{[...new Set([m.genericName, m.dosage].filter(Boolean))].join(", ")}</div>
                    </div>
                    <span className={`status-chip ${a.tone} shrink-0`}>{a.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{money(m.unitPrice)}</span>
                    {m.prescriptionRequired ? (
                      <button onClick={onUploadRx} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                        <FileText className="w-3.5 h-3.5" /> Prescription needed
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Over the counter</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
