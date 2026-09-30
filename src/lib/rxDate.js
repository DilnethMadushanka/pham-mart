// A doctor's prescription is valid for 7 days from the date written on it.
// The server enforces the same rule; this gives the customer the answer before they send.
export const RX_VALID_DAYS = 7;

// Today's date in Sri Lanka as YYYY-MM-DD, whatever the viewer's time zone.
export function colomboToday(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(date);
}

export function shiftDate(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns { ok, message } for a YYYY-MM-DD prescription date.
export function checkRxDate(isoDate, today = colomboToday()) {
  if (!isoDate) return { ok: false, message: "Enter the date written on the prescription." };
  if (isoDate > today) return { ok: false, message: "The prescription date can't be in the future." };
  const lastValid = shiftDate(isoDate, RX_VALID_DAYS);
  if (lastValid < today) {
    return {
      ok: false,
      message: "Invalid prescription. It was written more than 7 days ago, and prescriptions are only valid for 7 days. Please get a new prescription from your doctor."
    };
  }
  const daysLeft = Math.round((new Date(`${lastValid}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 86400000);
  return {
    ok: true,
    lastValid,
    message: daysLeft === 0 ? "Valid until the end of today." : `Valid for ${daysLeft} more day${daysLeft === 1 ? "" : "s"}, until ${lastValid}.`
  };
}
