// Shared helpers for the Genie Business payment functions. These run on
// Vercel's servers, never in the browser, so the Genie API key and the
// Supabase service key stay secret. Set them in Vercel > Settings >
// Environment Variables:
//   GENIE_API_KEY             the "API Key (secret)" from the Genie dashboard
//   GENIE_API_BASE_URL        optional; defaults to Genie production
//   SUPABASE_SERVICE_ROLE_KEY Supabase > Project Settings > API > service_role
//   SITE_URL                  optional; defaults to the address the request came to

import { createHash } from "node:crypto";

const GENIE_BASE = (process.env.GENIE_API_BASE_URL || "https://api.geniebiz.lk/public/").replace(/\/?$/, "/");
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export class PaymentError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function missingConfig() {
  const missing = [];
  if (!process.env.GENIE_API_KEY) missing.push("GENIE_API_KEY");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  return missing;
}

// Call a database function. `asServer` uses the service key, needed for the
// payment functions the public cannot reach.
export async function rpc(name, args, { asServer = false } = {}) {
  const key = asServer ? process.env.SUPABASE_SERVICE_ROLE_KEY : ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify(args)
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new PaymentError(data?.message || `Database error (${res.status})`, res.status >= 500 ? 502 : 400);
  return data;
}

// Genie's request signature: sha1 of "amount=<cents>&currency=<code>&apiKey=<key>".
export function genieSignature(amountCents, currency) {
  return createHash("sha1")
    .update(`amount=${amountCents}&currency=${currency}&apiKey=${process.env.GENIE_API_KEY}`)
    .digest("hex");
}

export async function genie(path, { method = "GET", body } = {}) {
  const res = await fetch(GENIE_BASE + path, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: process.env.GENIE_API_KEY },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    console.error("Genie error", res.status, text.slice(0, 500));
    // Genie's own reason helps the owner fix setup problems (wrong key, wrong domain).
    const reason = String(data?.message || data?.error || data?.raw || "").replace(/\s+/g, " ").slice(0, 160);
    throw new PaymentError(`The card payment service didn't accept the request (Genie ${res.status}${reason ? `: ${reason}` : ""}). Please try again shortly.`, 502);
  }
  return data;
}

export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

// Ask Genie for the transaction and record the result against our payment.
// The webhook body is never trusted on its own: the state always comes from Genie.
export async function confirmWithGenie(paymentOrGenieId) {
  const payment = await rpc("payment_lookup", { p_payment_id: paymentOrGenieId }, { asServer: true });
  if (!payment) throw new PaymentError("Unknown payment.", 404);
  const paymentId = payment.paymentId;
  if (payment.status === "Paid") return { status: "Paid", rxId: payment.rxId };
  if (!payment.genieId) return { status: payment.status, rxId: payment.rxId };
  const txn = await genie(`transactions/${encodeURIComponent(payment.genieId)}`);
  const t = txn?.data && typeof txn.data === "object" && !Array.isArray(txn.data) ? txn.data : txn;
  if (t?.localId && String(t.localId) !== paymentId) {
    throw new PaymentError("Genie transaction does not match this payment.", 409);
  }
  const amount = typeof t?.amount === "object" ? t.amount?.value : t?.amount;
  const currency = typeof t?.amount === "object" ? t.amount?.currency : t?.currency;
  return rpc("payment_settle", {
    p_payment_id: paymentId,
    p_genie_id: payment.genieId,
    p_state: t?.state || t?.status || "",
    p_amount_cents: amount == null ? null : Math.round(Number(amount)),
    p_currency: currency || ""
  }, { asServer: true });
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
