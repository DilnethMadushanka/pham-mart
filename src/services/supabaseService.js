import { supabase } from '../lib/supabaseClient';
import { 
  INITIAL_STAFF, 
  INITIAL_MEDICINES, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';

// Fetch Staff Accounts
export async function fetchStaffList() {
  try {
    const { data, error } = await supabase.from('staff').select('*');
    if (error || !data || data.length === 0) {
      return INITIAL_STAFF;
    }
    return data;
  } catch (err) {
    console.warn("Supabase fetchStaffList fallback to local data:", err);
    return INITIAL_STAFF;
  }
}

// Fetch Medicines Inventory
export async function fetchMedicines() {
  try {
    const { data, error } = await supabase.from('medicines').select('*');
    if (error || !data || data.length === 0) {
      return INITIAL_MEDICINES;
    }
    return data;
  } catch (err) {
    console.warn("Supabase fetchMedicines fallback to local data:", err);
    return INITIAL_MEDICINES;
  }
}

// Fetch Prescriptions
export async function fetchPrescriptions() {
  try {
    const { data, error } = await supabase.from('prescriptions').select('*');
    if (error || !data || data.length === 0) {
      return INITIAL_PRESCRIPTIONS;
    }
    return data;
  } catch (err) {
    console.warn("Supabase fetchPrescriptions fallback to local data:", err);
    return INITIAL_PRESCRIPTIONS;
  }
}

// Fetch Transactions
export async function fetchTransactions() {
  try {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error || !data || data.length === 0) {
      return INITIAL_TRANSACTIONS;
    }
    return data;
  } catch (err) {
    console.warn("Supabase fetchTransactions fallback to local data:", err);
    return INITIAL_TRANSACTIONS;
  }
}

// Add Audit Log Entry to Supabase
export async function saveAuditLog(logEntry) {
  try {
    const { data, error } = await supabase.from('audit_logs').insert([logEntry]);
    if (error) {
      console.warn("Supabase audit log insert note:", error.message);
    }
    return data;
  } catch (err) {
    console.warn("Supabase saveAuditLog error:", err);
  }
}

// Save New Customer to Supabase
export async function saveCustomer(customerData) {
  try {
    const { data, error } = await supabase.from('customers').insert([customerData]);
    if (error) {
      console.warn("Supabase saveCustomer error:", error.message);
    }
    return data;
  } catch (err) {
    console.warn("Supabase saveCustomer exception:", err);
  }
}

// Save New Prescription to Supabase
export async function savePrescription(prescriptionData) {
  try {
    const { data, error } = await supabase.from('prescriptions').insert([prescriptionData]);
    if (error) {
      console.warn("Supabase savePrescription error:", error.message);
    }
    return data;
  } catch (err) {
    console.warn("Supabase savePrescription exception:", err);
  }
}
