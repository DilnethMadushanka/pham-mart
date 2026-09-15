import { supabase } from '../lib/supabaseClient.js';
import { 
  INITIAL_STAFF, 
  INITIAL_MEDICINES, 
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData.js';

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
    const dbPayload = {
      id: staffMember.id,
      name: staffMember.name,
      username: staffMember.username,
      role: staffMember.role,
      email: staffMember.email,
      phone: staffMember.phone || null,
      status: staffMember.status || 'Active',
      permissions: staffMember.permissions || [],
      last_active: staffMember.lastActive || staffMember.last_active || 'Just now'
    };
    const { data, error } = await supabase.from('staff').insert([dbPayload]).select();
    if (error) {
      console.error("Error creating staff:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("createStaff exception:", err);
    return { data: null, error: err };
  }
}

export async function updateStaff(id, updateData) {
  try {
    const dbPayload = {};
    if (updateData.name !== undefined) dbPayload.name = updateData.name;
    if (updateData.username !== undefined) dbPayload.username = updateData.username;
    if (updateData.role !== undefined) dbPayload.role = updateData.role;
    if (updateData.email !== undefined) dbPayload.email = updateData.email;
    if (updateData.phone !== undefined) dbPayload.phone = updateData.phone;
    if (updateData.status !== undefined) dbPayload.status = updateData.status;
    if (updateData.permissions !== undefined) dbPayload.permissions = updateData.permissions;
    if (updateData.lastActive !== undefined || updateData.last_active !== undefined) {
      dbPayload.last_active = updateData.lastActive || updateData.last_active;
    }

    const { data, error } = await supabase.from('staff').update(dbPayload).eq('id', id).select();
    if (error) console.error("Error updating staff:", error.message);
    return { data, error };
  } catch (err) {
    console.error("updateStaff exception:", err);
    return { data: null, error: err };
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
    const dbPayload = {
      id: customerData.id,
      name: customerData.name,
      nic: customerData.nic || null,
      email: customerData.email || null,
      phone: customerData.phone || null,
      address: customerData.address || null,
      allergies: customerData.allergies || 'None',
      password: customerData.password || null
    };
    const { data, error } = await supabase.from('customers').insert([dbPayload]).select();
    if (error) {
      console.error("Error creating customer:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("createCustomer exception:", err);
    return { data: null, error: err };
  }
}

// ==========================================
// 3. MEDICINES INVENTORY
// ==========================================
export async function fetchMedicines() {
  try {
    const { data, error } = await supabase.from('medicines').select('*').order('name', { ascending: true });
    if (error || !data || data.length === 0) return INITIAL_MEDICINES;

    return data.map(dbMed => {
      const initialMatch = INITIAL_MEDICINES.find(m => m.id === dbMed.id || m.code === dbMed.code);
      return {
        ...initialMatch,
        ...dbMed,
        supplierId: dbMed.supplierId || dbMed.supplier_id || initialMatch?.supplierId || 'SUP-01',
        supplierName: dbMed.supplierName || dbMed.supplier_name || initialMatch?.supplierName || 'GlaxoSmithKline Pharmaceuticals',
        unitPrice: dbMed.unitPrice || dbMed.price || initialMatch?.unitPrice || 50
      };
    });
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
// 3.5. SUPPLIERS
// ==========================================
export async function fetchSuppliers() {
  try {
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error || !data || data.length === 0) return INITIAL_SUPPLIERS;
    return data.map(s => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contact_person || s.contactPerson || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      leadTimeDays: s.lead_days || s.leadTimeDays || 3
    }));
  } catch (err) {
    console.warn("Supabase fetchSuppliers fallback:", err);
    return INITIAL_SUPPLIERS;
  }
}

export async function createSupplier(supplierData) {
  try {
    const dbPayload = {
      id: supplierData.id || `SUP-${Math.floor(10 + Math.random() * 90)}`,
      name: supplierData.name,
      contact_person: supplierData.contactPerson || null,
      phone: supplierData.phone || null,
      email: supplierData.email || null,
      lead_days: supplierData.leadTimeDays || 3
    };
    const { data, error } = await supabase.from('suppliers').insert([dbPayload]).select();
    if (error) {
      console.error("Error creating supplier:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("createSupplier exception:", err);
    return { data: null, error: err };
  }
}

export async function updateSupplier(id, updateData) {
  try {
    const dbPayload = {
      name: updateData.name,
      contact_person: updateData.contactPerson,
      phone: updateData.phone,
      email: updateData.email,
      lead_days: updateData.leadTimeDays
    };
    const { data, error } = await supabase.from('suppliers').update(dbPayload).eq('id', id).select();
    if (error) console.error("Error updating supplier:", error.message);
    return { data, error };
  } catch (err) {
    console.error("updateSupplier exception:", err);
    return { data: null, error: err };
  }
}

export async function deleteSupplier(id) {
  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) console.error("Error deleting supplier:", error.message);
    return { error };
  } catch (err) {
    console.error("deleteSupplier exception:", err);
    return { error: err };
  }
}

// ==========================================
// 4. PRESCRIPTIONS
// ==========================================
export async function fetchPrescriptions() {
  try {
    const { data, error } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_PRESCRIPTIONS;
    return data.map(rx => ({
      id: rx.id,
      rxNumber: rx.rxNumber || rx.id,
      customerId: rx.patient_id || rx.customerId || 'CUST-301',
      customerName: rx.patient_name || rx.customerName || 'Patient',
      doctorName: rx.doctor_name || rx.doctorName || 'Dr. Assigned',
      doctorSlmcNo: rx.doctor_reg || rx.doctorSlmcNo || 'SLMC-REG',
      uploadDate: rx.uploadDate || rx.created_at || new Date().toLocaleString(),
      expiryDate: rx.expiryDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      medicines: rx.medications || rx.medicines || [],
      isControlledDrug: rx.isControlledDrug || false,
      status: rx.status || 'Pending',
      verifiedBy: rx.verifiedBy || null,
      verifiedAt: rx.verifiedAt || null,
      prescriptionUrl: rx.prescription_url || rx.prescriptionUrl || null,
      rejectionReason: rx.rejection_reason || rx.rejectionReason || null,
      notes: rx.notes || ''
    }));
  } catch (err) {
    console.warn("Supabase fetchPrescriptions fallback:", err);
    return INITIAL_PRESCRIPTIONS;
  }
}

export async function createPrescription(prescriptionData) {
  try {
    const dbPayload = {
      id: prescriptionData.id || `RX-${Math.floor(950 + Math.random() * 50)}`,
      patient_id: prescriptionData.customerId || prescriptionData.patient_id || null,
      patient_name: prescriptionData.customerName || prescriptionData.patient_name || 'Patient Name',
      doctor_name: prescriptionData.doctorName || prescriptionData.doctor_name || 'Doctor Prescription',
      doctor_reg: prescriptionData.doctorSlmcNo || prescriptionData.doctor_reg || 'SLMC-VERIFY',
      status: prescriptionData.status || 'Pending',
      medications: prescriptionData.medicines || prescriptionData.medications || [],
      prescription_url: prescriptionData.prescriptionUrl || prescriptionData.prescription_url || 'https://pharmart.lk/rx_upload.png',
      rejection_reason: prescriptionData.rejectionReason || prescriptionData.rejection_reason || null
    };
    const { data, error } = await supabase.from('prescriptions').insert([dbPayload]).select();
    if (error) {
      console.error("Error creating prescription:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("createPrescription exception:", err);
    return { data: null, error: err };
  }
}

export async function updatePrescriptionStatus(id, status, rejectionReason = null) {
  try {
    const updateObj = { status };
    if (rejectionReason) updateObj.rejection_reason = rejectionReason;
    
    const { data, error } = await supabase.from('prescriptions').update(updateObj).eq('id', id).select();
    if (error) console.error("Error updating prescription status:", error.message);
    return { data, error };
  } catch (err) {
    console.error("updatePrescriptionStatus exception:", err);
    return { data: null, error: err };
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
    return data.map(log => ({
      ...log,
      user: log.user || log.user_name
    }));
  } catch (err) {
    console.warn("Supabase fetchAuditLogs fallback:", err);
    return INITIAL_AUDIT_LOGS;
  }
}

export async function saveAuditLog(logEntry) {
  try {
    const dbPayload = {
      id: logEntry.id,
      timestamp: logEntry.timestamp,
      user_name: logEntry.user || logEntry.user_name,
      role: logEntry.role,
      action: logEntry.action,
      details: logEntry.details,
      severity: logEntry.severity
    };
    const { data, error } = await supabase.from('audit_logs').insert([dbPayload]);
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
