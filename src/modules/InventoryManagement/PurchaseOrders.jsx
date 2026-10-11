import React, { useState } from 'react';
import { Truck, Plus, CheckCircle2, Clock, PackageCheck, XCircle, ChevronDown, ChevronUp, ClipboardList, ClipboardCheck } from 'lucide-react';
import GoodsReceiptModal from './GoodsReceiptModal';
import OrderTracker from './OrderTracker';
import DeliveryCheckModal from './DeliveryCheckModal';
import CreatePurchaseOrderModal from './CreatePurchaseOrderModal';
import MetricCard from '../../components/MetricCard';
import { createPurchaseOrder, recordDelivery, reviewDelivery, setPurchaseOrderStatus, loadData } from '../../services/supabaseService';
import { notify, notifyError, confirmDialog } from '../../lib/notify';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Pending (waiting for the owner) -> Approved (sent to the supplier) ->
// Partly received -> Received. Pending or approved orders can be cancelled.
// Each delivery is counted, then checked by someone else before the stock goes in.
const STATUS = {
  Pending: { chip: "status-chip-amber", hint: "Waiting for the owner's approval" },
  Approved: { chip: "status-chip-blue", hint: "Approved and sent to the supplier" },
  "Partly received": { chip: "status-chip-amber", hint: "Some items are still to come" },
  Received: { chip: "status-chip-green", hint: "Delivered and in stock" },
  "Goods Received": { chip: "status-chip-green", hint: "Delivered and in stock" },
  Cancelled: { chip: "status-chip-gray", hint: "Cancelled" }
};
const FILTERS = ["All", "To check", "Pending", "Approved", "Partly received", "Received", "Cancelled"];

export default function PurchaseOrders({
  purchaseOrders,
  setPurchaseOrders,
  medicines,
  setMedicines,
  setBatches,
  setStockMovements,
  goodsReceipts = [],
  setGoodsReceipts,
  currentUserId,
  suppliers,
  transactions = [],
  canApprove = false
}) {
  const [receiving, setReceiving] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const statusOf = (po) => (po.status === "Goods Received" ? "Received" : po.status);
  // Status counts follow the supplier filter, so each chip shows what clicking it will list.
  const forSupplier = supplierFilter === "ALL" ? purchaseOrders : purchaseOrders.filter(po => po.supplierId === supplierFilter);
  const matches = (po, f) => (f === "To check" ? Boolean(po.receiptToCheck) : statusOf(po) === f);
  const count = (f) => forSupplier.filter(po => matches(po, f)).length;
  const shown = filter === "All" ? forSupplier : forSupplier.filter(po => matches(po, filter));
  const toCheck = goodsReceipts.filter(g => g.status === "Awaiting check");
  const checking = goodsReceipts.find(g => g.id === checkingId);
  // The owner checks any delivery; a pharmacist checks deliveries someone else counted.
  const canCheck = (g) => canApprove || g.recordedById !== currentUserId;
  const orderSuppliers = Array.from(new Map(purchaseOrders.map(po => [po.supplierId, po.supplierName])))
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const openValue = purchaseOrders
    .filter(po => ["Pending", "Approved", "Partly received"].includes(statusOf(po)))
    .reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);

  const replacePO = (po) => setPurchaseOrders(prev => prev.map(p => (p.id === po.id ? po : p)));

  const handleCreate = async (order) => {
    const { data, error } = await createPurchaseOrder(order);
    if (error) {
      notifyError(error, "Purchase order not created");
      return false;
    }
    setPurchaseOrders(prev => [data, ...prev]);
    notify("Purchase order created", `${data.poNumber} for ${data.supplierName} is waiting for the owner's approval.`);
    return true;
  };

  const changeStatus = async (po, status) => {
    if (status === "Cancelled") {
      const ok = await confirmDialog({ title: `Cancel ${po.poNumber}?`, message: "The order won't be delivered or received.", confirmLabel: "Cancel order", tone: "danger" });
      if (!ok) return;
    }
    setBusyId(po.id);
    const { data, error } = await setPurchaseOrderStatus(po.id, status);
    setBusyId(null);
    if (error) {
      notifyError(error, "Order not updated");
      return;
    }
    replacePO(data);
    notify(status === "Approved" ? "Order approved" : "Order cancelled",
      status === "Approved" ? `${data.poNumber} can now be sent to ${data.supplierName}. Expected by ${data.expectedDelivery}.` : `${data.poNumber} was cancelled.`);
  };

  const replaceReceipt = (g) => setGoodsReceipts?.(prev => [g, ...prev.filter(x => x.id !== g.id)]);

  const handleReceive = async (poId, receipt) => {
    const { data, error } = await recordDelivery(poId, receipt);
    if (error) {
      notifyError(error, "Delivery not recorded");
      return;
    }
    replacePO({ ...data.purchaseOrder, receiptToCheck: data.receipt.id });
    replaceReceipt(data.receipt);
    notify("Delivery sent for checking", `${data.purchaseOrder.poNumber} is counted. Someone else checks it before the stock goes in.`);
    setReceiving(null);
  };

  const handleDecision = async (receiptId, decision, note) => {
    const { data, error } = await reviewDelivery(receiptId, decision, note || null);
    if (error) {
      notifyError(error, decision === "Approved" ? "Delivery not approved" : "Delivery not rejected");
      return;
    }
    replacePO(data.purchaseOrder);
    replaceReceipt(data.receipt);
    if (data.medicines.length) {
      setMedicines(prev => prev.map(m => data.medicines.find(u => u.id === m.id) || m));
      if (setBatches) {
        const ids = new Set(data.medicines.map(m => m.id));
        setBatches(prev => [...prev.filter(b => !ids.has(b.medicineId)), ...data.batches]);
      }
    }
    const po = data.purchaseOrder;
    notify(decision === "Rejected" ? "Delivery rejected" : po.status === "Received" ? "Order received" : "Delivery approved",
      decision === "Rejected"
        ? `Nothing from this delivery went into stock. ${po.poNumber} is still waiting for the items.`
        : po.status === "Received"
          ? `${po.poNumber} is complete and the stock is in.`
          : `The good units are in stock. The rest of ${po.poNumber} stays outstanding.`,
      decision === "Rejected" ? "info" : "success");
    setCheckingId(null);
    if (decision === "Approved" && setStockMovements) {
      const fresh = await loadData(['stock_movements']);
      if (fresh.data?.stock_movements) setStockMovements(fresh.data.stock_movements);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="metric-grid grid grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Waiting for approval" value={count("Pending")} subtitle={canApprove ? "Approve to send" : "The owner approves orders"} icon={Clock} colorScheme="amber" />
        <MetricCard title="With the supplier" value={count("Approved") + count("Partly received")} subtitle="Approved, not fully received" icon={Truck} />
        <MetricCard title="Deliveries to check" value={toCheck.length} subtitle="Counted, not yet in stock" icon={ClipboardCheck} colorScheme={toCheck.length ? "amber" : "sky"} />
        <MetricCard title="Open order value" value={money(openValue)} subtitle="Pending and approved" icon={ClipboardList} />
      </div>

      {toCheck.length > 0 && (
        <section aria-label="Deliveries to check" className="rounded-3xl border border-amber-200 bg-amber-50/70 overflow-hidden">
          <header className="px-4 sm:px-5 py-3 border-b border-amber-200/70">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Deliveries to check <span className="font-mono text-sm">{toCheck.length}</span></h3>
            <p className="text-xs text-amber-800">Counted when they arrived. Check each one against the order before the stock goes in.</p>
          </header>
          <ul className="divide-y divide-amber-200/60">
            {toCheck.map(g => {
              const units = (g.items || []).reduce((sum, l) => sum + (Number(l.delivered) || 0), 0);
              const damaged = (g.items || []).reduce((sum, l) => sum + (Number(l.damaged) || 0), 0);
              return (
                <li key={g.id} className="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-semibold text-slate-900"><span className="font-mono">{g.poId}</span> · {g.supplierName}</div>
                    <div className="text-[11px] text-slate-600">
                      {units} units counted by {g.recordedBy}{damaged > 0 ? ` · ${damaged} damaged` : ""}{g.invoiceNo ? ` · invoice ${g.invoiceNo}` : ""}
                    </div>
                  </div>
                  <button onClick={() => setCheckingId(g.id)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-medium">
                    <ClipboardCheck className="w-4 h-4" /> {canCheck(g) ? "Check delivery" : "View"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter orders by status">
          {FILTERS.map(f => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border ${filter === f ? "bg-[#0B2545] text-white border-[#0B2545]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {f}{f !== "All" ? ` ${count(f)}` : ""}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
        {orderSuppliers.length > 1 && (
          <select
            aria-label="Filter orders by supplier"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
          >
            <option value="ALL">All suppliers</option>
            {orderSuppliers.map(s => <option key={s.id || s.name} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <button onClick={() => setCreating(true)} disabled={suppliers.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-xl font-medium text-sm shadow-md shadow-[#2563EB]/20 shrink-0">
          <Plus className="w-4 h-4" /> New purchase order
        </button>
        </div>
      </div>

      {shown.length === 0 && (
        <div className="bg-white p-10 rounded-3xl border border-slate-200/80 text-center text-sm text-slate-500">
          {purchaseOrders.length === 0 ? "No purchase orders yet." : filter === "All" ? "No orders from this supplier." : `No ${filter.toLowerCase()} orders.`}
        </div>
      )}

      <div className="space-y-3">
        {shown.map(po => {
          const st = statusOf(po);
          const meta = STATUS[st] || STATUS.Pending;
          const ordered = po.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
          const received = po.items.reduce((s, i) => s + (Number(i.receivedQty) || 0), 0);
          const isOpen = expanded === po.id;
          return (
            <article key={po.id} aria-label={`Purchase order ${po.poNumber}`} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-[#0B2545]">{po.poNumber}</span>
                    <span className={`status-chip ${meta.chip}`}>{st}</span>
                    {po.receiptToCheck && <span className="status-chip status-chip-amber">Delivery to check</span>}
                    <span className="text-xs text-slate-500">{po.receiptToCheck ? "A delivery is counted and waiting to be checked" : meta.hint}</span>
                  </div>
                  <div className="text-sm text-slate-700"><strong className="font-semibold">{po.supplierName}</strong></div>
                  <div className="text-xs text-slate-500">
                    Ordered {po.orderDate}{po.createdBy ? ` by ${po.createdBy}` : ""}
                    {po.approvedBy ? ` · approved by ${po.approvedBy}` : ""}
                    {st === "Received" ? ` · received ${po.receivedDate || ""}` : (st !== "Cancelled" && po.expectedDelivery ? ` · expected ${po.expectedDelivery}` : "")}
                  </div>
                  <div className="text-xs text-slate-600">
                    {po.items.length} item{po.items.length === 1 ? "" : "s"} · {received > 0 ? `${received} of ${ordered} units received` : `${ordered} units`}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <div className="text-right mr-2">
                    <div className="text-[11px] text-slate-500">Total</div>
                    <div className="font-semibold text-[#0B2545] tabular-nums">{money(po.totalAmount)}</div>
                  </div>
                  {st === "Pending" && canApprove && (
                    <button onClick={() => changeStatus(po, "Approved")} disabled={busyId === po.id} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white rounded-xl text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  )}
                  {po.receiptToCheck && (
                    <button onClick={() => setCheckingId(po.receiptToCheck)} className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium">
                      <ClipboardCheck className="w-4 h-4" /> Check delivery
                    </button>
                  )}
                  {(st === "Approved" || st === "Partly received") && !po.receiptToCheck && (
                    <button onClick={() => setReceiving(po)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-medium">
                      <PackageCheck className="w-4 h-4" /> Record delivery
                    </button>
                  )}
                  {(st === "Pending" || (st === "Approved" && canApprove)) && (
                    <button onClick={() => changeStatus(po, "Cancelled")} disabled={busyId === po.id} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-sm">
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                  <button onClick={() => setExpanded(isOpen ? null : po.id)} aria-expanded={isOpen} aria-label={isOpen ? "Hide details" : "Show details"} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="max-w-xl">
                  <OrderTracker po={po} />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-4 text-xs">
                  <table className="w-full text-left">
                    <thead className="text-slate-500">
                      <tr><th className="py-1.5 font-medium">Item</th><th className="py-1.5 font-medium text-right">Ordered</th><th className="py-1.5 font-medium text-right">Received</th><th className="py-1.5 font-medium text-right hidden sm:table-cell">Unit cost</th><th className="py-1.5 font-medium text-right">Match</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70">
                      {po.items.map(item => {
                        const got = Number(item.receivedQty) || 0;
                        const match = got === Number(item.quantity) ? "Complete" : got === 0 ? (st === "Received" ? "Not delivered" : "Waiting") : got < item.quantity ? `${item.quantity - got} short` : "Over";
                        return (
                          <tr key={item.medicineId}>
                            <td className="py-2 pr-2 text-slate-800">{item.name}</td>
                            <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                            <td className="py-2 text-right tabular-nums">{got}</td>
                            <td className="py-2 text-right tabular-nums hidden sm:table-cell">{money(item.unitCost)}</td>
                            <td className={`py-2 text-right ${match === "Complete" ? "text-emerald-700" : match === "Waiting" ? "text-slate-500" : "text-amber-700"}`}>{match}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {(po.deliveries || []).length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-600">Deliveries</div>
                      {po.deliveries.map((d, i) => (
                        <div key={i} className="text-slate-600">
                          {d.date} · {d.receivedBy}: {d.items.map(x => `${x.name} x ${x.quantity} (batch ${x.batchNo}, exp ${x.expiryDate})`).join(", ")}
                        </div>
                      ))}
                    </div>
                  )}
                  {goodsReceipts.some(g => g.poId === po.id) && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-600">Delivery checks</div>
                      {goodsReceipts.filter(g => g.poId === po.id).map(g => (
                        <div key={g.id} className="flex flex-wrap items-center gap-2 text-slate-600">
                          <span className={`status-chip ${g.status === "Approved" ? "status-chip-green" : g.status === "Rejected" ? "status-chip-red" : "status-chip-amber"}`}>{g.status}</span>
                          <span>
                            Counted by {g.recordedBy}
                            {g.checkedBy ? `, ${g.status.toLowerCase()} by ${g.checkedBy}` : ""}
                            {g.checkNote ? `: ${g.checkNote}` : ""}
                            {(g.items || []).some(l => Number(l.damaged) > 0) ? ` · damaged: ${(g.items || []).filter(l => Number(l.damaged) > 0).map(l => `${l.name} x ${l.damaged}`).join(", ")}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {po.notes && <p className="text-slate-600 whitespace-pre-line">Notes: {po.notes}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {creating && (
        <CreatePurchaseOrderModal
          suppliers={suppliers}
          medicines={medicines}
          purchaseOrders={purchaseOrders}
          transactions={transactions}
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
        />
      )}

      {checking && (
        <DeliveryCheckModal
          receipt={checking}
          po={purchaseOrders.find(p => p.id === checking.poId)}
          canCheck={checking.status === "Awaiting check" && canCheck(checking)}
          blockedReason={checking.status !== "Awaiting check" ? `This delivery was already ${checking.status.toLowerCase()}.` : "You counted this delivery, so the owner or another pharmacist needs to check it."}
          onClose={() => setCheckingId(null)}
          onDecide={handleDecision}
        />
      )}

      {receiving && (
        <GoodsReceiptModal po={receiving} onClose={() => setReceiving(null)} onConfirm={handleReceive} />
      )}
    </div>
  );
}
