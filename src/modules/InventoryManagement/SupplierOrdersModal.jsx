import React, { useEffect, useState } from 'react';
import { X, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import OrderTracker from './OrderTracker';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

                  <OrderTracker po={po} />

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
