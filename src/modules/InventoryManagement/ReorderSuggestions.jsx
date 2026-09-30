import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, PackageX, TrendingDown, Truck, CheckCircle2, Building } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { buildReorderSuggestions } from '../../lib/reorder';
import { createPurchaseOrder } from '../../services/supabaseService';
import { notify, notifyError } from '../../lib/notify';

const URGENCY = {
  out: { label: "Out of stock", chip: "status-chip-red" },
  critical: { label: "Runs out before delivery", chip: "status-chip-red" },
  low: { label: "Low stock", chip: "status-chip-amber" }
};

const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Lists every medicine at or below its reorder level with a suggested order
// quantity, grouped by supplier, and turns a group into a purchase order.
export default function ReorderSuggestions({ medicines, transactions, purchaseOrders, setPurchaseOrders, suppliers, addAuditLog, onViewOrders }) {
  const suggestions = useMemo(
    () => buildReorderSuggestions({ medicines, transactions, purchaseOrders, suppliers }),
    [medicines, transactions, purchaseOrders, suppliers]
  );

  // Per-medicine choices: include in the order, and the quantity to order.
  const [picks, setPicks] = useState({});
  const [busySupplier, setBusySupplier] = useState(null);
  // Supplier chosen for medicines that have none set in the catalogue.
  const [fallbackSupplierId, setFallbackSupplierId] = useState("");

  useEffect(() => {
    setPicks(prev => {
      const next = {};
      suggestions.forEach(s => {
        const id = s.medicine.id;
        next[id] = prev[id] || { include: s.openOrders.length === 0, qty: s.suggestedQty };
      });
      return next;
    });
  }, [suggestions]);

  const groups = useMemo(() => {
    const bySupplier = new Map();
    suggestions.forEach(s => {
      const key = s.supplier?.id || "none";
      if (!bySupplier.has(key)) bySupplier.set(key, { supplier: s.supplier, items: [] });
      bySupplier.get(key).items.push(s);
    });
    // Suppliers first, "no supplier" last.
    return [...bySupplier.values()].sort((a, b) => (a.supplier ? 0 : 1) - (b.supplier ? 0 : 1));
  }, [suggestions]);

  const outCount = suggestions.filter(s => s.urgency === "out").length;
  const criticalCount = suggestions.filter(s => s.urgency === "critical").length;
  const onOrderCount = suggestions.filter(s => s.openOrders.length > 0).length;

  const setPick = (id, patch) => setPicks(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleCreateOrder = async (group) => {
    const chosen = group.items.filter(s => picks[s.medicine.id]?.include && picks[s.medicine.id]?.qty > 0);
    if (chosen.length === 0) {
      notify("Nothing selected", "Tick at least one medicine to order.", "error");
      return;
    }
    const supplier = group.supplier || suppliers.find(sp => sp.id === fallbackSupplierId);
    if (!supplier) {
      notify("Choose a supplier", "Pick who to order these medicines from.", "error");
      return;
    }
    setBusySupplier(group.supplier ? supplier.id : "none");
    const { data, error } = await createPurchaseOrder({
      supplierId: supplier.id,
      items: chosen.map(s => ({ medicineId: s.medicine.id, quantity: picks[s.medicine.id].qty, unitCost: s.unitCost }))
    });
    setBusySupplier(null);
    if (error) {
      notifyError(error, "Purchase order not issued");
      return;
    }
    setPurchaseOrders(prev => [data, ...prev]);
    addAuditLog(
      "Reorder Purchase Order Created",
      `Created ${data.poNumber} for ${supplier.name} from reorder suggestions: ` +
        chosen.map(s => `${s.medicine.name} x ${picks[s.medicine.id].qty}`).join(", "),
      "info"
    );
    notify("Purchase order created", `${data.poNumber} for ${supplier.name} is waiting for the owner's approval.`);
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
        <div className="font-semibold text-[#0B2545]">Nothing to reorder</div>
        <p className="text-sm text-slate-500">Every medicine is above its reorder level. Suggestions appear here as soon as one drops to it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="metric-grid grid grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Need reordering" value={suggestions.length} subtitle="At or below reorder level" icon={TrendingDown} colorScheme="amber" />
        <MetricCard title="Out of stock" value={outCount} subtitle="Can't be sold right now" icon={PackageX} colorScheme="rose" />
        <MetricCard title="Run out before delivery" value={criticalCount} subtitle="Based on last 30 days of sales" icon={AlertTriangle} colorScheme="rose" />
        <MetricCard title="Already on order" value={onOrderCount} subtitle="Pending or approved order exists" icon={Truck} />
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Suggested quantities cover the last 30 days' sales rate through the supplier's lead time plus two weeks, and bring stock to at least twice the reorder level, in packs of 10. Change any quantity before ordering.
      </p>

      {groups.map(group => {
        const key = group.supplier?.id || "none";
        const canOrder = Boolean(group.supplier) || suppliers.length > 0;
        const chosen = group.items.filter(s => picks[s.medicine.id]?.include);
        const total = chosen.reduce((sum, s) => sum + (picks[s.medicine.id]?.qty || 0) * s.unitCost, 0);
        return (
          <section key={key} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden" aria-label={group.supplier ? `Reorder from ${group.supplier.name}` : "Medicines without a supplier"}>
            <header className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#0B2545] truncate">{group.supplier ? group.supplier.name : "No supplier set"}</h3>
                  <p className="text-xs text-slate-500">
                    {group.supplier ? `Delivers in about ${group.supplier.leadTimeDays ?? 3} days` : "These medicines have no supplier in the catalogue. Choose one for this order."}
                  </p>
                </div>
              </div>
              {canOrder && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {!group.supplier && (
                  <select
                    value={fallbackSupplierId}
                    onChange={(e) => setFallbackSupplierId(e.target.value)}
                    aria-label="Order from supplier"
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 min-w-0"
                  >
                    <option value="">Choose a supplier</option>
                    {suppliers.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                  </select>
                )}
                <button
                  onClick={() => handleCreateOrder(group)}
                  disabled={busySupplier === key || chosen.length === 0 || (!group.supplier && !fallbackSupplierId)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-xl font-medium text-sm shadow-md shadow-[#2563EB]/20 w-full sm:w-auto justify-center"
                >
                  <Truck className="w-4 h-4" />
                  {busySupplier === key
                    ? "Issuing..."
                    : `Create purchase order${chosen.length ? ` (${chosen.length}, ${money(total)})` : ""}`}
                </button>
                </div>
              )}
            </header>

            <ul className="divide-y divide-slate-100">
              {group.items.map(s => {
                const pick = picks[s.medicine.id] || { include: false, qty: s.suggestedQty };
                const u = URGENCY[s.urgency];
                return (
                  <li key={s.medicine.id} className="px-4 sm:px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
                    <label className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(pick.include)}
                        disabled={!canOrder}
                        onChange={(e) => setPick(s.medicine.id, { include: e.target.checked })}
                        aria-label={`Include ${s.medicine.name}`}
                        className="mt-1 w-4 h-4 accent-[#2563EB] shrink-0"
                      />
                      <span className="min-w-0 space-y-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{s.medicine.name}</span>
                          <span className={`status-chip ${u.chip}`}>{u.label}</span>
                          {s.openOrders.length > 0 && (
                            <span className="status-chip status-chip-blue">
                              On order: {s.openOrders.map(o => `${o.poNumber} (${o.quantity})`).join(", ")}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-slate-600">{s.reason}</span>
                        <span className="block text-[11px] text-slate-500">
                          In stock {s.stock} · reorder level {s.reorderLevel} · sold {s.soldLast30} in 30 days
                        </span>
                      </span>
                    </label>
                    <div className="flex items-center gap-3 md:justify-end pl-7 md:pl-0">
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <span>Order</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={pick.qty}
                          disabled={!canOrder}
                          onChange={(e) => setPick(s.medicine.id, { qty: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                          aria-label={`Quantity of ${s.medicine.name}`}
                          className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm text-center font-semibold tabular-nums"
                        />
                        <span>units</span>
                      </label>
                      <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">≈ {money(pick.qty * s.unitCost)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {onViewOrders && (
        <button onClick={onViewOrders} className="text-sm font-medium text-[#2563EB] hover:underline">
          View purchase orders
        </button>
      )}
    </div>
  );
}
