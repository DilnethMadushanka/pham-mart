// Counter opening hours, in Sri Lanka time. Used by the storefront to say
// whether the pharmacist is on duty right now.
export const HOURS = {
  weekday: { open: [7, 30], close: [20, 0], label: "Mon - Fri 7:30 AM - 8:00 PM" },
  weekend: { open: [8, 0], close: [18, 0], label: "Sat - Sun 8:00 AM - 6:00 PM" }
};

const fmt = ([h, m]) => {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

// Current weekday and minutes past midnight in Asia/Colombo, whatever the viewer's time zone.
function colomboNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
  }).formatToParts(date);
  const get = (t) => parts.find(p => p.type === t)?.value;
  return { day: get("weekday"), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function openStatus(date = new Date()) {
  const { day, minutes } = colomboNow(date);
  const isWeekend = day === "Sat" || day === "Sun";
  const today = isWeekend ? HOURS.weekend : HOURS.weekday;
  const openAt = today.open[0] * 60 + today.open[1];
  const closeAt = today.close[0] * 60 + today.close[1];
  if (minutes >= openAt && minutes < closeAt) {
    return { open: true, text: `Pharmacist on duty until ${fmt(today.close)}` };
  }
  if (minutes < openAt) {
    return { open: false, text: `Closed now. Opens today at ${fmt(today.open)}` };
  }
  // After closing: next opening is tomorrow.
  const tomorrowWeekend = day === "Fri" || day === "Sat";
  const next = tomorrowWeekend ? HOURS.weekend : HOURS.weekday;
  return { open: false, text: `Closed now. Opens tomorrow at ${fmt(next.open)}` };
}
