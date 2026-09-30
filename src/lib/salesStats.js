// Sales figures for the dashboard and reports. Net sales are invoice totals
// less refunds, each counted on the day it happened.

export const pad = (n) => String(n).padStart(2, "0");
export const dayKey = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const monthKey = (value) => dayKey(value).slice(0, 7);
export const todayKey = () => dayKey(new Date());

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthLabel = (key, withYear = false) => {
  const [y, m] = key.split("-");
  return withYear ? `${MONTHS[Number(m) - 1]} ${y}` : MONTHS[Number(m) - 1];
};

const when = (row) => row.createdAt || row.created_at || row.date;
export const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Percentage change, or null when there is nothing to compare with.
export function growth(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function emptyBucket(key) {
  return { key, gross: 0, refunds: 0, net: 0, count: 0, items: 0, discount: 0, tax: 0 };
}

function addSale(b, t) {
  b.gross += Number(t.total) || 0;
  b.count += 1;
  b.discount += Number(t.discountAmt) || 0;
  b.tax += Number(t.taxAmt) || 0;
  b.items += (t.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);
}

function finish(b) {
  b.net = b.gross - b.refunds;
  return b;
}

// One bucket per day for the last `days` days, oldest first.
export function dailySeries(transactions = [], returns = [], days = 30, end = new Date()) {
  const keys = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    keys.push(dayKey(d));
  }
  const map = Object.fromEntries(keys.map(k => [k, emptyBucket(k)]));
  transactions.forEach(t => { const b = map[dayKey(when(t))]; if (b) addSale(b, t); });
  returns.forEach(r => { const b = map[dayKey(when(r))]; if (b) b.refunds += Number(r.refundAmount) || 0; });
  return keys.map(k => {
    const b = finish(map[k]);
    const d = new Date(k);
    return { ...b, label: `${d.getDate()} ${MONTHS[d.getMonth()]}` };
  });
}

// One bucket per month for the last `months` months, oldest first, with growth.
export function monthlySeries(transactions = [], returns = [], months = 12, end = new Date()) {
  const keys = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }
  const map = Object.fromEntries(keys.map(k => [k, emptyBucket(k)]));
  transactions.forEach(t => { const b = map[monthKey(when(t))]; if (b) addSale(b, t); });
  returns.forEach(r => { const b = map[monthKey(when(r))]; if (b) b.refunds += Number(r.refundAmount) || 0; });
  return keys.map((k, i) => {
    const b = finish(map[k]);
    const prev = i > 0 ? map[keys[i - 1]].net : null;
    return { ...b, label: monthLabel(k), fullLabel: monthLabel(k, true), growth: prev === null ? null : growth(b.net, prev) };
  });
}

// Totals and breakdowns for the sales in a period.
export function summarize(transactions = [], returns = [], medicines = []) {
  const b = emptyBucket("all");
  transactions.forEach(t => addSale(b, t));
  b.refunds = returns.reduce((s, r) => s + (Number(r.refundAmount) || 0), 0);
  finish(b);

  const byMethod = {};
  transactions.forEach(t => {
    const m = t.paymentMethod || "Cash";
    byMethod[m] = byMethod[m] || { method: m, sales: 0, refunds: 0, count: 0 };
    byMethod[m].sales += Number(t.total) || 0;
    byMethod[m].count += 1;
  });
  returns.forEach(r => {
    const m = r.refundMethod || "Cash";
    byMethod[m] = byMethod[m] || { method: m, sales: 0, refunds: 0, count: 0 };
    byMethod[m].refunds += Number(r.refundAmount) || 0;
  });

  const category = Object.fromEntries(medicines.map(m => [m.id, m.category || "Other"]));
  const byItem = {};
  const byCategory = {};
  transactions.forEach(t => {
    // Line totals are before the invoice discount and tax; scale them to what was paid.
    const factor = Number(t.subtotal) > 0 ? Number(t.total) / Number(t.subtotal) : 1;
    (t.items || []).forEach(i => {
      const value = (Number(i.total) || (Number(i.price) || 0) * (Number(i.qty) || 0)) * factor;
      const key = i.medicineId || i.name;
      byItem[key] = byItem[key] || { name: i.name, qty: 0, total: 0 };
      byItem[key].qty += Number(i.qty) || 0;
      byItem[key].total += value;
      const cat = category[i.medicineId] || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + value;
    });
  });
  const catTotal = Object.values(byCategory).reduce((s, v) => s + v, 0);

  return {
    ...b,
    avgTicket: b.count ? b.gross / b.count : 0,
    methods: Object.values(byMethod).sort((x, y) => y.sales - x.sales),
    topItems: Object.values(byItem).sort((x, y) => y.total - x.total),
    categories: Object.entries(byCategory)
      .map(([name, value]) => ({ name, value, share: catTotal ? (value / catTotal) * 100 : 0 }))
      .sort((x, y) => y.value - x.value)
  };
}

export const inDay = (rows, key) => rows.filter(r => dayKey(when(r)) === key);
export const inMonth = (rows, key) => rows.filter(r => monthKey(when(r)) === key);

export function downloadCsv(filename, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const text = rows.map(r => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
