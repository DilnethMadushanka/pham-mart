import { PaymentError, genie, genieSignature, missingConfig, readBody, rpc, send, siteUrl } from "../_payments.js";

// POST { token, rxId } -> { url }: starts a Genie hosted checkout for an
// approved prescription order. The amount is worked out by the database.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." });
  const missing = missingConfig();
  if (missing.length) {
    console.error("Payments not configured, missing:", missing.join(", "));
    return send(res, 503, { error: "Online payment isn't switched on yet. Please pay at the counter or on delivery." });
  }
  try {
    const { token, rxId } = await readBody(req);
    if (!token || !rxId) throw new PaymentError("Sign in and choose an order to pay for.");
    const start = await rpc("payment_start", { p_token: token, p_rx_id: rxId });
    const site = siteUrl(req);
    const amount = Math.round(Number(start.amount) * 100);
    const txn = await genie("transactions", {
      method: "POST",
      body: {
        amount,
        currency: start.currency,
        localId: start.paymentId,
        redirectUrl: `${site}/?payment=${encodeURIComponent(start.paymentId)}`,
        webhook: `${site}/api/payments/webhook`,
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        // Genie requires the request to be signed, as its official PHP client does.
        apiVersion: "2.0",
        appVersion: "pharmart-web",
        signMethod: "sha1",
        signature: genieSignature(amount, start.currency)
      }
    });
    const t = txn?.data && typeof txn.data === "object" ? txn.data : txn;
    if (!t?.url || !t?.id) throw new PaymentError("The card payment page couldn't be opened. Please try again.", 502);
    await rpc("payment_attach", { p_payment_id: start.paymentId, p_genie_id: String(t.id), p_checkout_url: t.url }, { asServer: true });
    return send(res, 200, { url: t.url, paymentId: start.paymentId, amount: start.amount });
  } catch (err) {
    if (!(err instanceof PaymentError)) console.error(err);
    return send(res, err.status || 500, { error: err instanceof PaymentError ? err.message : "Something went wrong starting the payment." });
  }
}
