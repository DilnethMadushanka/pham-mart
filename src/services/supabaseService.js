import { supabase } from '../lib/supabaseClient.js';
import { getSessionToken } from '../lib/session.js';

// Every read and write goes through database functions (see supabase_schema.sql).
// Tables are locked with Row Level Security, and each function checks the
// signed-in user's role on the server. Functions return { data, error }; the
// error always has a message that can be shown to the user.

const MISSING_FUNCTION = /Could not find the function|PGRST202|does not exist/i;

function friendlyError(error) {
  if (!error) return null;
  const message = error.message || String(error);
  if (MISSING_FUNCTION.test(message) || error.code === 'PGRST202') {
    return new Error('The database needs the latest update. Run supabase_schema.sql in the Supabase SQL Editor.');
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return new Error("Couldn't reach the database. Check your internet connection and try again.");
  }
  return new Error(message);
}

async function call(fn, args = {}, { withToken = true } = {}) {
  try {
    const payload = withToken ? { p_token: getSessionToken(), ...args } : args;
    const { data, error } = await supabase.rpc(fn, payload);
    if (error) return { data: null, error: friendlyError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: friendlyError(err) };
  }
}

// Sign-in functions report failures as { ok: false, error } so failed
// attempts can be counted on the server.
async function authCall(fn, args) {
  const { data, error } = await call(fn, args, { withToken: false });
  if (error) return { data: null, error };
  if (!data?.ok) return { data: null, error: new Error(data?.error || 'Sign-in failed. Please try again.') };
  return { data: { token: data.token, user: data.user }, error: null };
}

// ------------------------------------------------------------------
// Display helpers: add the formatted dates the components show.
// ------------------------------------------------------------------

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '');

export function normalizeTransaction(t) {
  return { ...t, date: formatDateTime(t.createdAt), created_at: t.createdAt };
}

export function normalizePrescription(rx) {
  return {
    ...rx,
    uploadDate: formatDateTime(rx.createdAt),
    verifiedAt: rx.verifiedAt ? formatDateTime(rx.verifiedAt) : null
  };
}

const NORMALIZERS = {
  transactions: normalizeTransaction,
  prescriptions: normalizePrescription
};

// ------------------------------------------------------------------
// Session
// ------------------------------------------------------------------

export const login = (loginName, password) =>
  authCall('app_login', { p_login: loginName, p_password: password });

export const registerCustomer = (form) =>
  authCall('customer_register', {
    p_name: form.name,
    p_nic: form.nic,
    p_email: form.email,
    p_phone: form.phone,
    p_address: form.address,
    p_allergies: form.allergies,
    p_password: form.password
  });

export const googleLogin = (credential) =>
  authCall('google_login', { p_credential: credential });

export async function fetchSessionUser() {
  if (!getSessionToken()) return { data: null, error: null };
  return call('session_user_info');
}

export const logout = () => call('app_logout');

// ------------------------------------------------------------------
// Reading data. The server only returns what the caller's role may see.
// ------------------------------------------------------------------

export async function loadData(tables = null) {
  const { data, error } = await call('load_data', { p_tables: tables });
  if (error) return { data: null, error };
  const out = {};
  Object.entries(data || {}).forEach(([key, rows]) => {
    const normalize = NORMALIZERS[key];
    out[key] = Array.isArray(rows) && normalize ? rows.map(normalize) : rows;
  });
  return { data: out, error: null };
}

export const fetchPrescriptionFile = (rxId) => call('get_prescription_file', { p_rx_id: rxId });

// ------------------------------------------------------------------
// Writes
// ------------------------------------------------------------------

export const addAuditLog = (action, details, severity = 'info') =>
  call('add_audit_log', { p_action: action, p_details: details, p_severity: severity });

export const saveMedicine = (medicine) => call('save_medicine', { p_medicine: medicine });
export const deleteMedicine = (id) => call('delete_medicine', { p_id: id });

export const saveSupplier = (supplier) => call('save_supplier', { p_supplier: supplier });
export const deleteSupplier = (id) => call('delete_supplier', { p_id: id });

export const createPurchaseOrder = (order) => call('create_purchase_order', { p_order: order });
export const receivePurchaseOrder = (poId, items) =>
  call('receive_purchase_order', { p_po_id: poId, p_items: items });

export const saveCustomer = (customer) => call('save_customer', { p_customer: customer });
export const deleteCustomer = (id) => call('delete_customer', { p_id: id });

export const saveStaff = (staff, password = null) =>
  call('save_staff', { p_staff: staff, p_password: password || null });
export const setStaffPassword = (staffId, password) =>
  call('staff_set_password', { p_staff_id: staffId, p_password: password });

export async function submitPrescription(rx, file = null) {
  const { data, error } = await call('submit_prescription', { p_rx: rx, p_file: file });
  return { data: data ? normalizePrescription(data) : null, error };
}

export async function reviewPrescription(rxId, decision, notes, medicines = null) {
  const { data, error } = await call('review_prescription', {
    p_rx_id: rxId,
    p_decision: decision,
    p_notes: notes || null,
    p_medicines: medicines
  });
  return { data: data ? normalizePrescription(data) : null, error };
}

export async function posCheckout(sale) {
  const { data, error } = await call('pos_checkout', { p_sale: sale });
  if (error) return { data: null, error };
  return {
    data: {
      transaction: normalizeTransaction(data.transaction),
      medicines: data.medicines || [],
      prescription: data.prescription ? normalizePrescription(data.prescription) : null
    },
    error: null
  };
}

// ------------------------------------------------------------------
// Live updates: the database bumps a per-table counter on every change.
// ------------------------------------------------------------------

export function subscribeToDataChanges(onTableChanged) {
  try {
    const channel = supabase
      .channel('public:data_versions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'data_versions' }, (payload) => {
        const table = payload.new?.table_name || payload.old?.table_name;
        if (table) onTableChanged(table);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Live updates unavailable:', err);
    return () => {};
  }
}
