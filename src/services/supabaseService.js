import { supabase } from '../lib/supabaseClient';
import { 
  INITIAL_STAFF, 
  INITIAL_MEDICINES, 
  INITIAL_CUSTOMERS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';

// ==========================================
// 1. STAFF ACCOUNTS
// ==========================================
export async function fetchStaffList() {
  try {
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_STAFF;
    return data;
  } catch (err) {
    console.warn("Supabase fetchStaffList fallback:", err);
    return INITIAL_STAFF;
  }
}

export async function createStaff(staffMember) {
  try {
    const { data, error } = await supabase.from('staff').insert([staffMember]).select();
    if (error) console.error("Error creating staff:", error.message);
    return data;
  } catch (err) {
    console.error("createStaff exception:", err);
  }
}

// ==========================================
// 2. CUSTOMERS
// ==========================================
export async function fetchCustomers() {
  try {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_CUSTOMERS;
    return data;
  } catch (err) {
    console.warn("Supabase fetchCustomers fallback:", err);
    return INITIAL_CUSTOMERS;
  }
}

export async function createCustomer(customerData) {
  try {
    const { data, error } = await supabase.from('customers').insert([customerData]).select();
    if (error) console.error("Error creating customer:", error.message);
    return data;
  } catch (err) {
    console.error("createCustomer exception:", err);
  }
}

// ==========================================
// 3. MEDICINES INVENTORY
// ==========================================
export async function fetchMedicines() {
  try {
    const { data, error } = await supabase.from('medicines').select('*').order('name', { ascending: true });
    if (error || !data || data.length === 0) return INITIAL_MEDICINES;
    return data;
  } catch (err) {
    console.warn("Supabase fetchMedicines fallback:", err);
    return INITIAL_MEDICINES;
  }
}

export async function createMedicine(medicineData) {
  try {
    const { data, error } = await supabase.from('medicines').insert([medicineData]).select();
    if (error) console.error("Error creating medicine:", error.message);
    return data;
  } catch (err) {
    console.error("createMedicine exception:", err);
  }
}

export async function updateMedicineStock(id, newStock) {
  try {
    const { data, error } = await supabase.from('medicines').update({ stock: newStock }).eq('id', id);
    if (error) console.error("Error updating medicine stock:", error.message);
    return data;
  } catch (err) {
    console.error("updateMedicineStock exception:", err);
  }
}

// ==========================================
// 4. PRESCRIPTIONS
// ==========================================
export async function fetchPrescriptions() {
  try {
    const { data, error } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_PRESCRIPTIONS;
    return data;
  } catch (err) {
    console.warn("Supabase fetchPrescriptions fallback:", err);
    return INITIAL_PRESCRIPTIONS;
  }
}

export async function createPrescription(prescriptionData) {
  try {
    const { data, error } = await supabase.from('prescriptions').insert([prescriptionData]).select();
    if (error) console.error("Error creating prescription:", error.message);
    return data;
  } catch (err) {
    console.error("createPrescription exception:", err);
  }
}

export async function updatePrescriptionStatus(id, status, rejectionReason = null) {
  try {
    const updateObj = { status };
    if (rejectionReason) updateObj.rejection_reason = rejectionReason;
    
    const { data, error } = await supabase.from('prescriptions').update(updateObj).eq('id', id);
    if (error) console.error("Error updating prescription status:", error.message);
    return data;
  } catch (err) {
    console.error("updatePrescriptionStatus exception:", err);
  }
}

// ==========================================
// 5. POS TRANSACTIONS
// ==========================================
export async function fetchTransactions() {
  try {
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_TRANSACTIONS;
    return data;
  } catch (err) {
    console.warn("Supabase fetchTransactions fallback:", err);
    return INITIAL_TRANSACTIONS;
  }
}

export async function createTransaction(txData) {
  try {
    const { data, error } = await supabase.from('transactions').insert([txData]).select();
    if (error) console.error("Error creating transaction:", error.message);
    return data;
  } catch (err) {
    console.error("createTransaction exception:", err);
  }
}

// ==========================================
// 6. AUDIT LOGS
// ==========================================
export async function fetchAuditLogs() {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_AUDIT_LOGS;
    return data;
  } catch (err) {
    console.warn("Supabase fetchAuditLogs fallback:", err);
    return INITIAL_AUDIT_LOGS;
  }
}

export async function saveAuditLog(logEntry) {
  try {
    const { data, error } = await supabase.from('audit_logs').insert([logEntry]);
    if (error) console.warn("Supabase audit log insert note:", error.message);
    return data;
  } catch (err) {
    console.warn("saveAuditLog exception:", err);
  }
}

// ==========================================
// 7. REAL-TIME DATABASE LISTENER SUBSCRIPTIONS
// ==========================================
export function subscribeToRealtimeChanges(tableName, onInsertOrUpdate) {
  try {
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          if (onInsertOrUpdate) onInsertOrUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn(`Realtime subscription setup note for ${tableName}:`, err);
    return () => {};
  }
}
