import React, { useEffect, useState } from 'react';
import { X, Truck, Check, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STEPS = ["Ordered", "Approved", "Delivering", "Received"];

// Where an order is on its way from "ordered" to "in stock".
function stepOf(po) {
  const st = po.status === "Goods Received" ? "Received" : po.status;
  if (st === "Received") return 3;
  if (st === "Partly received") return 2;
  if (st === "Approved") return 1;
  return 0;
}

function Tracker({ po }) {
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

// Every purchase order placed with one supplier, newest first, with a tracker for each.
export default function SupplierOrdersModal({ supplier, orders, onClose }) {
  const [openId, setOpenId] = useState(orders[0]?.id ?? null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const active = orders.filter(o => !["Received", "Goods Received", "Cancelled"].includes(o.status)).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 animate-fade-in" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="supplier-orders-title" onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0"><Truck className="w-5 h-5" /></span>
            <div className="min-w-0">
              <h3 id="supplier-orders-title" className="text-base font-semibold text-[#0B2545] truncate">Orders from {supplier.name}</h3>
              <p className="text-xs text-slate-500">
                {orders.length} order{orders.length === 1 ? "" : "s"}{active ? `, ${active} on the way` : ""}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">No purchase orders with this supplier yet.</p>
        ) : (
          <ul className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {orders.map(po => {
              const ordered = po.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
              const received = po.items.reduce((s, i) => s + (Number(i.receivedQty) || 0), 0);
              const isOpen = openId === po.id;
              const st = po.status === "Goods Received" ? "Received" : po.status;
              return (
                <li key={po.id} className="rounded-2xl border border-slate-200/80 p-4 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono font-semibold text-[#0B2545]">{po.poNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Ordered {po.orderDate}
                        {st === "Received" ? ` · received ${po.receivedDate || ""}` : (st !== "Cancelled" && po.expectedDelivery ? ` · expected ${po.expectedDelivery}` : "")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0B2545] tabular-nums text-sm">{money(po.totalAmount)}</div>
                      <div className="text-[11px] text-slate-500">{received} of {ordered} units received</div>
                    </div>
                  </div>

                  <Tracker po={po} />

                  <button onClick={() => setOpenId(isOpen ? null : po.id)} aria-expanded={isOpen}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isOpen ? "Hide items" : `Show ${po.items.length} item${po.items.length === 1 ? "" : "s"}`}
                  </button>

                  {isOpen && (
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-500">
                        <tr><th className="py-1 font-medium">Item</th><th className="py-1 font-medium text-right">Ordered</th><th className="py-1 font-medium text-right">Received</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {po.items.map(item => (
                          <tr key={item.medicineId}>
                            <td className="py-1.5 pr-2 text-slate-800">{item.name}</td>
                            <td className="py-1.5 text-right tabular-nums">{item.quantity}</td>
                            <td className="py-1.5 text-right tabular-nums">{Number(item.receivedQty) || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[11px] text-slate-500">Approve orders and record deliveries on the Purchase orders tab.</p>
      </div>
    </div>
  );
}
