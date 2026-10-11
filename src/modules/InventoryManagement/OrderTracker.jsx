import React from 'react';
import { Check, XCircle } from 'lucide-react';

const STEPS = ["Ordered", "Approved", "Delivered", "Checked, in stock"];

// Where an order is on its way from "ordered" to "in stock".
function stepOf(po) {
  const st = po.status === "Goods Received" ? "Received" : po.status;
  if (st === "Received") return 3;
  if (st === "Partly received" || po.receiptToCheck) return 2;
  if (st === "Approved") return 1;
  return 0;
}

// Ordered -> Approved -> Delivered (waiting to be checked) -> Checked and in stock.
export default function OrderTracker({ po }) {
  const cancelled = po.status === "Cancelled";
  const current = stepOf(po);
  if (cancelled) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <XCircle className="w-4 h-4" /> Cancelled. This order won't be delivered.
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-4" aria-label={`Progress: ${STEPS[current]}`}>
      {STEPS.map((label, i) => {
        const done = i <= current;
        return (
          <li key={label} className="relative flex flex-col items-center text-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className={`absolute top-3 right-1/2 w-full h-0.5 -z-0 ${i <= current ? "bg-[#2563EB]" : "bg-slate-200"}`} />
            )}
            <span className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ring-4 ring-white ${done ? "bg-[#2563EB] text-white" : "bg-slate-200 text-slate-500"}`}>
              {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={`text-[11px] ${i === current ? "font-semibold text-[#0B2545]" : done ? "text-slate-600" : "text-slate-400"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
