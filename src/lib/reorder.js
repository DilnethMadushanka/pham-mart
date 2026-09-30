// Automatic reorder suggestions.
//
// A medicine gets a suggestion when its stock is at or below its reorder level.
// The suggested quantity covers expected sales until the next delivery plus a
// buffer, and never leaves stock below twice the reorder level:
//
//   daily use     = units sold in the last 30 days / 30
//   target stock  = max(2 x reorder level, daily use x (supplier lead days + 14))
//   suggested qty = target stock - current stock, rounded up to a pack of 10
//
// Medicines that already have an open purchase order are listed as "on order"
// instead, so nobody orders them twice.

const SALES_WINDOW_DAYS = 30;
const BUFFER_DAYS = 14;
const PACK_SIZE = 10;

const DAY_MS = 86400000;

// Units of each medicine sold in the last 30 days.
function recentSales(transactions = [], now = Date.now()) {
  const since = now - SALES_WINDOW_DAYS * DAY_MS;
  const sold = {};
  transactions.forEach(t => {
    const at = new Date(t.createdAt || t.created_at || 0).getTime();
    if (!(at >= since)) return;
    (t.items || []).forEach(item => {
      const id = item.medicineId || item.id;
      if (!id) return;
      sold[id] = (sold[id] || 0) + (Number(item.qty ?? item.quantity) || 0);
    });
  });
  return sold;
}

function openOrdersByMedicine(purchaseOrders = []) {
  const open = {};
  purchaseOrders
    .filter(po => po.status !== "Goods Received" && po.status !== "Cancelled")
    .forEach(po => (po.items || []).forEach(item => {
      if (!item.medicineId) return;
      (open[item.medicineId] ||= []).push({ poNumber: po.poNumber || po.id, quantity: Number(item.quantity) || 0, expectedDelivery: po.expectedDelivery });
    }));
  return open;
}

export function isLowStock(med) {
  return Number(med.stock) <= Number(med.reorderLevel);
}

export function buildReorderSuggestions({ medicines = [], transactions = [], purchaseOrders = [], suppliers = [], now = Date.now() }) {
  const sold = recentSales(transactions, now);
  const onOrder = openOrdersByMedicine(purchaseOrders);
  const supplierById = Object.fromEntries(suppliers.map(s => [s.id, s]));

  return medicines
    .filter(isLowStock)
    .map(med => {
      const stock = Math.max(0, Number(med.stock) || 0);
      const reorderLevel = Math.max(0, Number(med.reorderLevel) || 0);
      const supplier = supplierById[med.supplierId] || null;
      const leadDays = Number(supplier?.leadTimeDays ?? 3);
      const dailyUse = (sold[med.id] || 0) / SALES_WINDOW_DAYS;
      const target = Math.max(reorderLevel * 2, Math.ceil(dailyUse * (leadDays + BUFFER_DAYS)), PACK_SIZE);
      const suggestedQty = Math.max(PACK_SIZE, Math.ceil((target - stock) / PACK_SIZE) * PACK_SIZE);
      const daysLeft = dailyUse > 0 ? Math.floor(stock / dailyUse) : null;

      let urgency = "low";
      let reason = `Stock ${stock} is at or below the reorder level of ${reorderLevel}.`;
      if (stock === 0) {
        urgency = "out";
        reason = "Out of stock.";
      } else if (daysLeft !== null && daysLeft < leadDays) {
        urgency = "critical";
        reason = `About ${daysLeft} day${daysLeft === 1 ? "" : "s"} of stock left, but delivery takes ${leadDays} day${leadDays === 1 ? "" : "s"}.`;
      }

      const unitCost = Math.round(Number(med.unitPrice ?? 0) * 0.7 * 100) / 100;
      return {
        medicine: med,
        supplier,
        stock,
        reorderLevel,
        soldLast30: sold[med.id] || 0,
        dailyUse,
        daysLeft,
        leadDays,
        suggestedQty,
        unitCost,
        urgency,
        reason,
        openOrders: onOrder[med.id] || []
      };
    })
    .sort((a, b) => {
      const rank = { out: 0, critical: 1, low: 2 };
      return rank[a.urgency] - rank[b.urgency] || a.stock - b.stock;
    });
}

// Medicines that dropped to or below their reorder level between two stock snapshots.
export function newlyLowStock(before = [], after = []) {
  const prev = Object.fromEntries(before.map(m => [m.id, m]));
  return after.filter(m => isLowStock(m) && prev[m.id] && !isLowStock(prev[m.id]));
}
