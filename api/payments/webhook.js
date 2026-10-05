import { confirmWithGenie, missingConfig, readBody, send } from "../_payments.js";

// Genie calls this when a transaction changes. Only the payment id is taken
// from the message; the actual result is fetched from Genie with our key.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." });
  if (missingConfig().length) return send(res, 503, { error: "Not configured." });
  const body = await readBody(req);
  const t = body?.data && typeof body.data === "object" ? body.data : body?.transaction || body;
  const localId = String(t?.localId || body?.localId || "");
  const paymentId = /^PAY-[A-Z0-9]+$/.test(localId) ? localId : String(t?.id || body?.transactionId || "");
  if (!paymentId || paymentId.length > 100) return send(res, 200, { ignored: true });
  try {
    const result = await confirmWithGenie(paymentId);
    return send(res, 200, { status: result.status });
  } catch (err) {
    console.error("Genie webhook", paymentId, err.message);
    // A non-2xx answer makes Genie retry later, which is what we want for a temporary error.
    return send(res, err.status && err.status < 500 ? 200 : 500, { error: err.message });
  }
}
