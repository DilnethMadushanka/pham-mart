import { PaymentError, confirmWithGenie, missingConfig, readBody, send } from "../_payments.js";

// POST { paymentId } -> { status }: called when the customer lands back on the
// site from Genie, so the order shows as paid even before the webhook arrives.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." });
  if (missingConfig().length) return send(res, 503, { error: "Online payment isn't switched on yet." });
  try {
    const { paymentId } = await readBody(req);
    if (!paymentId || !/^PAY-[A-Z0-9]+$/.test(String(paymentId))) throw new PaymentError("Unknown payment.", 404);
    const result = await confirmWithGenie(String(paymentId));
    return send(res, 200, { status: result.status });
  } catch (err) {
    if (!(err instanceof PaymentError)) console.error(err);
    return send(res, err.status || 500, { error: err instanceof PaymentError ? err.message : "Couldn't check the payment." });
  }
}
