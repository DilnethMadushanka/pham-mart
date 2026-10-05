import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const WALK_IN = "Walk-in Customer (General)";
const digits = (v) => String(v || "").replace(/\D/g, "");

// Does this customer match what the cashier typed? Name and NIC match on any
// part; a phone number matches however it was written (077..., +94 77..., 94...).
function matches(c, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (String(c.name || "").toLowerCase().includes(q)) return true;
  if (String(c.nic || "").toLowerCase().includes(q)) return true;
  const qd = digits(q).replace(/^(0094|94|0)/, "");
  return digits(q).length >= 3 && qd.length > 0 && digits(c.phone).replace(/^(0094|94|0)/, "").includes(qd);
}

// Search-as-you-type customer picker for the POS: name, phone number or NIC.
export default function CustomerPicker({ customers, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const current = customers.find(c => c.id === value);
  const results = useMemo(() => {
    const found = customers.filter(c => matches(c, query)).slice(0, 50);
    return query.trim() ? found : [{ id: "", name: WALK_IN }, ...found];
  }, [customers, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const openPicker = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pick = (id) => {
    onChange(id);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (results[active]) pick(results[active].id); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0 sm:flex-none sm:min-w-[260px]">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Customer"
        className="w-full flex items-center justify-between gap-2 font-medium text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 transition-all"
      >
        <span className="truncate">{current ? current.name : WALK_IN}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-40 right-0 sm:right-auto sm:left-0 mt-1.5 w-[min(22rem,calc(100vw-3rem))] bg-white rounded-xl border border-slate-200 shadow-xl shadow-[#0B2545]/10 overflow-hidden">
          <div className="relative border-b border-slate-100">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKeyDown}
              placeholder="Search name, phone or NIC"
              aria-label="Search customers by name, phone or NIC"
              role="combobox"
              aria-expanded="true"
              aria-controls="pos-customer-list"
              aria-activedescendant={results[active] ? `pos-cust-${results[active].id || "walkin"}` : undefined}
              className="w-full pl-9 pr-3 py-2.5 text-sm outline-hidden"
            />
          </div>
          <ul id="pos-customer-list" ref={listRef} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-500">No customer matches "{query.trim()}".</li>
            )}
            {results.map((c, i) => {
              const selected = (c.id || "") === (value || "");
              return (
                <li
                  key={c.id || "walkin"}
                  id={`pos-cust-${c.id || "walkin"}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(c.id)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer ${i === active ? "bg-[#EFF6FF]" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900 truncate">{c.name}</span>
                    {c.id && (
                      <span className="block text-xs text-slate-500 tabular-nums truncate">
                        {[c.phone, c.nic].filter(Boolean).join(" · ") || "No phone on file"}
                      </span>
                    )}
                  </span>
                  {selected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
