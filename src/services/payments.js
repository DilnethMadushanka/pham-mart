// Online card payments through Genie Business. The browser only talks to the
// site's own server functions (api/payments/*); they hold the Genie key.
import { getSessionToken } from '../lib/session';

async function post(path, body) {
  let res;
  try {
    res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    return { data: null, error: new Error("Couldn't reach the payment service. Check your connection and try again.") };
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: new Error(data?.error || "The payment service is unavailable right now.") };
  return { data, error: null };
}

// Opens Genie's secure card page for an approved order.
export function startOnlinePayment(rxId) {
  return post("/api/payments/create", { token: getSessionToken(), rxId });
}

// Checks the result after Genie sends the customer back to the site.
export function verifyOnlinePayment(paymentId) {
  return post("/api/payments/verify", { paymentId });
}
