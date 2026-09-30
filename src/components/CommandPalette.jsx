import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft, Package, UserCheck, Receipt, ArrowRight } from 'lucide-react';
import { CONSOLE_PAGES } from './Sidebar';
import { canAccessTab } from '../lib/permissions';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Ctrl+K / Cmd+K: jump to a page, or look up a medicine, customer or invoice
// without leaving the screen you are on.
export default function CommandPalette({ open, onClose, role, onNavigate, medicines = [], customers = [], transactions = [] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const has = (...parts) => parts.some(p => String(p || "").toLowerCase().includes(q));
    const pages = CONSOLE_PAGES
      .filter(p => canAccessTab(role, p.id))
      .filter(p => !q || has(p.label, p.sublabel))
      .map(p => ({ kind: "page", id: p.id, icon: p.icon, title: p.label, detail: p.sublabel, go: () => onNavigate(p.id) }));
    if (!q) return pages;

    const meds = medicines
      .filter(m => has(m.name, m.genericName, m.code, m.barcode))
      .slice(0, 6)
      .map(m => ({
        kind: "medicine", id: m.id, icon: Package, title: m.name,
        detail: `${m.stock} in stock · ${money(m.price)}`,
        tone: m.stock <= 0 ? "text-rose-700" : m.stock <= m.reorderLevel ? "text-amber-700" : "text-slate-500",
        go: () => onNavigate(canAccessTab(role, "pos") ? "pos" : "inventory")
      }));
    const people = canAccessTab(role, "customers") ? customers
      .filter(c => has(c.name, c.phone, c.email))
      .slice(0, 4)
      .map(c => ({ kind: "customer", id: c.id, icon: UserCheck, title: c.name, detail: c.phone || c.email || "Customer", go: () => onNavigate("customers") })) : [];
    const invoices = transactions
      .filter(t => has(t.invoiceNo, t.customerName))
      .slice(0, 4)
      .map(t => ({ kind: "invoice", id: t.id, icon: Receipt, title: t.invoiceNo, detail: `${t.customerName} · ${money(t.total)}`, go: () => onNavigate(canAccessTab(role, "analytics") ? "analytics" : "pos") }));
    return [...pages, ...meds, ...people, ...invoices];
  }, [query, role, medicines, customers, transactions, onNavigate]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const choose = (r) => { if (!r) return; r.go(); onClose(); };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(results.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[active]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  const sections = [
    ["page", "Go to"],
    ["medicine", "Medicines"],
    ["customer", "Customers"],
    ["invoice", "Invoices"]
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh] bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search and jump" onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 px-4 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search medicines, customers, invoices or pages"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${active}` : undefined}
            className="flex-1 py-4 text-[15px] text-slate-900 bg-transparent outline-none"
          />
          <kbd className="hidden sm:block text-[11px] font-mono text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5">Esc</kbd>
        </div>

        <div id="palette-results" ref={listRef} role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">Nothing matches "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try a medicine name, barcode, phone number or invoice number.</p>
            </div>
          ) : sections.map(([kind, label]) => {
            const rows = results.map((r, i) => ({ r, i })).filter(({ r }) => r.kind === kind);
            if (rows.length === 0) return null;
            return (
              <div key={kind} className="py-1">
                <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-slate-400">{label}</div>
                {rows.map(({ r, i }) => {
                  const Icon = r.icon;
                  const isActive = i === active;
                  return (
                    <button
                      key={`${r.kind}-${r.id}`}
                      id={`palette-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={isActive}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(r)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${isActive ? "bg-[#EFF6FF]" : ""}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-white text-[#2563EB] ring-1 ring-blue-100" : "bg-slate-100 text-slate-500"}`}>
                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium truncate ${isActive ? "text-[#0B2545]" : "text-slate-800"}`}>{r.title}</span>
                        <span className={`block text-xs truncate ${r.tone || "text-slate-500"}`}>{r.detail}</span>
                      </span>
                      {isActive && (r.kind === "page" ? <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0" /> : <CornerDownLeft className="w-4 h-4 text-[#2563EB] shrink-0" />)}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/60">
          <span><kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to move</span>
          <span><kbd className="font-mono">Enter</kbd> to open</span>
        </div>
      </div>
    </div>
  );
}
