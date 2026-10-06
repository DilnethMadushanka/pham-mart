// Expiry tracking by batch.

import { colomboToday, shiftDate } from "./rxDate";

const DAY_MS = 86400000;

// Today's date as YYYY-MM-DD in the device's time zone.
export const localToday = () => new Date().toLocaleDateString("en-CA");

export function daysUntil(dateStr, today = localToday()) {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr) - new Date(today)) / DAY_MS);
}

// "expired", "soon" (30 days or less), "watch" (90 days or less) or "ok".
export function expiryStatus(dateStr, today = localToday()) {
  const days = daysUntil(dateStr, today);
  if (days === null) return "ok";
  if (days < 0) return "expired";
  if (days <= 30) return "soon";
  if (days <= 90) return "watch";
  return "ok";
}

export const EXPIRY_LABEL = {
  expired: { label: "Expired", chip: "status-chip-red" },
  soon: { label: "Expires within 30 days", chip: "status-chip-red" },
  watch: { label: "Expires within 90 days", chip: "status-chip-amber" },
  ok: { label: "In date", chip: "status-chip-green" }
};

// Batches with stock that are expired or expire within 90 days, soonest first.
export function expiryAlerts(batches = [], medicines = [], today = localToday()) {
  const byId = Object.fromEntries(medicines.map(m => [m.id, m]));
  return batches
    .filter(b => b.quantity > 0 && byId[b.medicineId])
    .map(b => ({ ...b, medicine: byId[b.medicineId], status: expiryStatus(b.expiryDate, today), days: daysUntil(b.expiryDate, today) }))
    .filter(b => b.status !== "ok")
    .sort((a, b) => (a.days ?? 1e9) - (b.days ?? 1e9));
}

// New stock must expire more than 7 days from today. The server enforces the same rule.
export const MIN_EXPIRY_DAYS = 7;

// The earliest expiry date allowed for new stock (today + 8 days, Sri Lanka time).
export const minNewExpiry = (today = colomboToday()) => shiftDate(today, MIN_EXPIRY_DAYS + 1);

// Returns an error message, or null when the date is fine.
export function checkNewExpiry(isoDate, today = colomboToday()) {
  if (!isoDate) return "Enter the expiry date.";
  if (isoDate < today) return `The expiry date ${isoDate} is in the past. Enter a date more than ${MIN_EXPIRY_DAYS} days from today.`;
  if (isoDate < minNewExpiry(today)) return `The expiry date ${isoDate} is too close. It must be more than ${MIN_EXPIRY_DAYS} days from today (${minNewExpiry(today)} or later).`;
  return null;
}
