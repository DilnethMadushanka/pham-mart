import { supabase } from '../lib/supabaseClient.js';
import { 
  INITIAL_STAFF, 
  INITIAL_MEDICINES, 
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
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
    if (error) {
      console.warn("Supabase fetchCustomers note:", error.message);
      return INITIAL_CUSTOMERS;
    }

    const dbCusts = (data || []).map(c => ({
      id: c.id,
      name: c.name,
      nic: c.nic || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      allergies: c.allergies || 'None',
      historyCount: c.history_count || 0,
      lastVisit: c.last_visit || (c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '2026-09-01')
    }));

    const deletedList = JSON.parse(localStorage.getItem('pharmart_deleted_customers') || '[]');
    const combined = [...dbCusts];
    INITIAL_CUSTOMERS.forEach(initC => {
      if (!deletedList.includes(initC.id) && !combined.some(x => String(x.id).toLowerCase() === String(initC.id).toLowerCase() || (initC.nic && x.nic === initC.nic))) {
        combined.push(initC);
      }
    });

    return combined;
  } catch (err) {
    console.warn("Supabase fetchCustomers fallback:", err);
    return INITIAL_CUSTOMERS;
  }
}

export async function createCustomer(customerData) {
  try {
    const dbPayload = {
      id: customerData.id || `CUST-${Math.floor(300 + Math.random() * 700)}`,
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

export async function updateCustomer(id, updateData) {
  try {
    const dbPayload = {
      id: id,
      name: updateData.name,
      nic: updateData.nic || null,
      email: updateData.email || null,
      phone: updateData.phone || null,
      address: updateData.address || null,
      allergies: updateData.allergies || 'None'
    };

    // 1. Try updating by exact ID
    let { data, error } = await supabase.from('customers').update(dbPayload).eq('id', id).select();

    // 2. If no matching ID row found and NIC exists, try updating by NIC
    if (!error && (!data || data.length === 0) && updateData.nic) {
      const byNic = await supabase.from('customers').update(dbPayload).eq('nic', updateData.nic).select();
      if (!byNic.error && byNic.data && byNic.data.length > 0) {
        return { data: byNic.data, error: null };
      }
    }

    // 3. If still no rows updated (record was never in Supabase DB), UPSERT into Supabase DB!
    if (!error && (!data || data.length === 0)) {
      const upsertRes = await supabase.from('customers').upsert([dbPayload]).select();
      return upsertRes;
    }

    if (error) {
      console.error("Error updating customer in Supabase:", error.message);
    }
    return { data, error };
  } catch (err) {
    console.error("updateCustomer exception:", err);
    return { data: null, error: err };
  }
}

export async function deleteCustomer(id, nic = null) {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (nic) {
      await supabase.from('customers').delete().eq('nic', nic);
    }

    try {
      const deletedList = JSON.parse(localStorage.getItem('pharmart_deleted_customers') || '[]');
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        localStorage.setItem('pharmart_deleted_customers', JSON.stringify(deletedList));
      }
    } catch (e) {}

    if (error) console.error("Error deleting customer in Supabase:", error.message);
    return { error };
  } catch (err) {
    console.error("deleteCustomer exception:", err);
    return { error: err };
  }
}

// ==========================================
// 3. MEDICINES INVENTORY
// ==========================================
export async function fetchMedicines() {
  try {
    const { data, error } = await supabase.from('medicines').select('*').order('name', { ascending: true });
    if (error) {
      console.warn("Supabase fetchMedicines note:", error.message);
      return INITIAL_MEDICINES;
    }

    const deletedList = JSON.parse(localStorage.getItem('pharmart_deleted_medicines') || '[]').map(d => String(d).toLowerCase().trim());

    const dbMeds = (data || []).filter(dbMed => {
      const medId = String(dbMed.id || '').toLowerCase().trim();
      const medCode = String(dbMed.code || '').toLowerCase().trim();
      const medName = String(dbMed.name || '').toLowerCase().trim();
      return !deletedList.includes(medId) && !deletedList.includes(medCode) && !deletedList.includes(medName);
    }).map(dbMed => {
      const initialMatch = INITIAL_MEDICINES.find(m => m.id === dbMed.id || m.code === dbMed.code);
      const isCtrl = dbMed.controlledDrug ?? dbMed.is_controlled ?? initialMatch?.controlledDrug ?? false;
      const isRx = dbMed.prescriptionRequired ?? dbMed.is_prescription ?? initialMatch?.prescriptionRequired ?? false;

      return {
        ...initialMatch,
        ...dbMed,
        id: dbMed.id,
        code: dbMed.code || initialMatch?.code || `MED-${String(dbMed.id).toUpperCase()}`,
        name: dbMed.name || initialMatch?.name || 'Medicine Item',
        genericName: dbMed.genericName || dbMed.generic_name || dbMed.dosage || initialMatch?.genericName || '',
        supplierId: dbMed.supplierId || dbMed.supplier_id || initialMatch?.supplierId || 'SUP-01',
        supplierName: dbMed.supplierName || dbMed.supplier_name || initialMatch?.supplierName || 'GlaxoSmithKline Pharmaceuticals',
        unitPrice: Number(dbMed.unitPrice || dbMed.price || initialMatch?.unitPrice || 50),
        stock: Number(dbMed.stock ?? initialMatch?.stock ?? 0),
        reorderLevel: Number(dbMed.reorderLevel || dbMed.reorder_level || initialMatch?.reorderLevel || 10),
        expiryDate: dbMed.expiryDate || dbMed.expiry_date || initialMatch?.expiryDate || '2027-12-31',
        batchNo: dbMed.batchNo || dbMed.batch_no || initialMatch?.batchNo || 'BATCH-2026',
        controlledDrug: isCtrl,
        is_controlled: isCtrl,
        prescriptionRequired: isRx,
        is_prescription: isRx
      };
    });

    const combined = [...dbMeds];
    INITIAL_MEDICINES.forEach(initM => {
      const initId = String(initM.id || '').toLowerCase().trim();
      const initCode = String(initM.code || '').toLowerCase().trim();
      const initName = String(initM.name || '').toLowerCase().trim();

      if (!deletedList.includes(initId) && 
          !deletedList.includes(initCode) && 
          !deletedList.includes(initName) && 
          !combined.some(x => String(x.id).toLowerCase() === initId || (x.code && String(x.code).toLowerCase() === initCode))) {
        combined.push(initM);
      }
    });

    return combined;
  } catch (err) {
    console.warn("Supabase fetchMedicines fallback:", err);
    return INITIAL_MEDICINES;
  }
}

export async function createMedicine(medicineData) {
  try {
    const dbPayload = {
      id: medicineData.id || `MED-${Math.floor(200 + Math.random() * 800)}`,
      code: medicineData.code || `MED-${(medicineData.name || 'DRG').substring(0,3).toUpperCase()}${Math.floor(100 + Math.random()*800)}`,
      name: medicineData.name || 'New Medicine',
      category: medicineData.category || 'Analgesic',
      dosage: medicineData.genericName || medicineData.dosage || 'Standard',
      price: Number(medicineData.unitPrice || medicineData.price || 50),
      stock: Number(medicineData.stock || 0),
      reorder_level: Number(medicineData.reorderLevel || medicineData.reorder_level || 10),
      is_prescription: Boolean(medicineData.prescriptionRequired || medicineData.is_prescription),
      is_controlled: Boolean(medicineData.controlledDrug || medicineData.is_controlled),
      expiry_date: medicineData.expiryDate || medicineData.expiry_date || null
    };

    let { data, error } = await supabase.from('medicines').insert([dbPayload]).select();
    if (error && error.message && error.message.includes('Could not find column')) {
      delete dbPayload.dosage;
      delete dbPayload.reorder_level;
      delete dbPayload.is_prescription;
      delete dbPayload.is_controlled;
      const retry = await supabase.from('medicines').insert([dbPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Error creating medicine in Supabase:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("createMedicine exception:", err);
    return { data: null, error: err };
  }
}

export async function updateMedicine(id, updateData) {
  try {
    const dbPayload = {
      id: id,
      code: updateData.code || `MED-${(updateData.name || 'DRG').substring(0,3).toUpperCase()}`,
      name: updateData.name,
      category: updateData.category || 'Analgesic',
      dosage: updateData.genericName || updateData.dosage || 'Standard',
      price: Number(updateData.unitPrice || updateData.price || 50),
      stock: Number(updateData.stock || 0),
      reorder_level: Number(updateData.reorderLevel || updateData.reorder_level || 10),
      is_prescription: Boolean(updateData.prescriptionRequired || updateData.is_prescription),
      is_controlled: Boolean(updateData.controlledDrug || updateData.is_controlled),
      expiry_date: updateData.expiryDate || updateData.expiry_date || null
    };

    // 1. Try update by exact ID
    let { data, error } = await supabase.from('medicines').update(dbPayload).eq('id', id).select();

    // If column mismatch error occurred, retry with stripped optional fields
    if (error && error.message && error.message.includes('Could not find column')) {
      delete dbPayload.dosage;
      delete dbPayload.reorder_level;
      delete dbPayload.is_prescription;
      delete dbPayload.is_controlled;
      const retry = await supabase.from('medicines').update(dbPayload).eq('id', id).select();
      data = retry.data;
      error = retry.error;
    }

    // 2. If no matching ID row found and code exists, try update by code
    if (!error && (!data || data.length === 0) && updateData.code) {
      const byCode = await supabase.from('medicines').update(dbPayload).eq('code', updateData.code).select();
      if (!byCode.error && byCode.data && byCode.data.length > 0) {
        return { data: byCode.data, error: null };
      }
    }

    // 3. If no matching row by code and name exists, try update by name
    if (!error && (!data || data.length === 0) && updateData.name) {
      const byName = await supabase.from('medicines').update(dbPayload).eq('name', updateData.name).select();
      if (!byName.error && byName.data && byName.data.length > 0) {
        return { data: byName.data, error: null };
      }
    }

    // 4. Fallback: UPSERT into Supabase DB!
    if (!error && (!data || data.length === 0)) {
      const upsertRes = await supabase.from('medicines').upsert([dbPayload]).select();
      return upsertRes;
    }

    if (error) console.error("Error updating medicine in Supabase:", error.message);
    return { data, error };
  } catch (err) {
    console.error("updateMedicine exception:", err);
    return { data: null, error: err };
  }
}

export async function deleteMedicine(id, code = null, name = null) {
  try {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (code) {
      await supabase.from('medicines').delete().eq('code', code);
    }
    if (name) {
      await supabase.from('medicines').delete().eq('name', name);
    }

    try {
      const deletedList = JSON.parse(localStorage.getItem('pharmart_deleted_medicines') || '[]');
      const itemsToAdd = [id, code, name].filter(Boolean);
      let updated = false;
      itemsToAdd.forEach(item => {
        const itemStr = String(item).toLowerCase().trim();
        if (!deletedList.some(d => String(d).toLowerCase().trim() === itemStr)) {
          deletedList.push(itemStr);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('pharmart_deleted_medicines', JSON.stringify(deletedList));
      }
    } catch (e) {}

    if (error) console.error("Error deleting medicine in Supabase:", error.message);
    return { error };
  } catch (err) {
    console.error("deleteMedicine exception:", err);
    return { error: err };
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
// 3.6. PURCHASE ORDERS
// ==========================================
export async function fetchPurchaseOrders() {
  try {
    const { data, error } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn("Supabase fetchPurchaseOrders note:", error.message);
      return INITIAL_PURCHASE_ORDERS;
    }
    
    const dbOrders = (data || []).map(po => {
      let itemsArr = po.items;
      if (typeof itemsArr === 'string') {
        try { itemsArr = JSON.parse(itemsArr); } catch (e) { itemsArr = []; }
      }
      return {
        id: po.id,
        poNumber: po.id,
        supplierId: po.supplier_id || 'SUP-01',
        supplierName: po.supplier_name || 'Supplier',
        orderDate: po.created_at ? new Date(po.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: po.status || 'Issued',
        expectedDelivery: new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
        items: Array.isArray(itemsArr) ? itemsArr : [],
        totalAmount: Number(po.total_amount) || 0
      };
    });

    const combined = [...dbOrders];
    INITIAL_PURCHASE_ORDERS.forEach(initPo => {
      if (!combined.some(p => p.id === initPo.id)) {
        combined.push(initPo);
      }
    });

    return combined;
  } catch (err) {
    console.warn("Supabase fetchPurchaseOrders fallback:", err);
    return INITIAL_PURCHASE_ORDERS;
  }
}

export async function createPurchaseOrder(poData) {
  try {
    const dbPayload = {
      id: poData.id || poData.poNumber,
      supplier_id: poData.supplierId || null,
      supplier_name: poData.supplierName || 'Supplier',
      items: poData.items || [],
      total_amount: poData.totalAmount || 0,
      status: poData.status || 'Issued'
    };
    const { data, error } = await supabase.from('purchase_orders').insert([dbPayload]).select();
    if (error) console.error("Error creating purchase order:", error.message);
    return { data, error };
  } catch (err) {
    console.error("createPurchaseOrder exception:", err);
    return { data: null, error: err };
  }
}

export async function updatePurchaseOrderStatus(poId, status) {
  try {
    const { data, error } = await supabase.from('purchase_orders').update({ status }).eq('id', poId).select();
    if (error) console.error("Error updating purchase order status:", error.message);
    return { data, error };
  } catch (err) {
    console.error("updatePurchaseOrderStatus exception:", err);
    return { data: null, error: err };
  }
}

// ==========================================
// 4. PRESCRIPTIONS
// ==========================================
export async function fetchPrescriptions() {
  try {
    const { data, error } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_PRESCRIPTIONS;
    return data.map(rx => {
      let meds = rx.medications || rx.medicines || [];
      if (typeof meds === 'string') {
        try { meds = JSON.parse(meds); } catch (e) { meds = []; }
      }
      if (!Array.isArray(meds)) meds = [meds];

      const rawUrl = rx.prescription_url || rx.prescriptionUrl || null;
      const validUrl = (rawUrl && !rawUrl.includes('pharmart.lk/rx_upload')) ? rawUrl : null;
      const notesText = rx.notes || rx.rejection_reason || '';
      const orderTypeLabel = validUrl 
        ? (meds.length > 0 && meds[0].name !== "Prescribed Medication (See Attached Photo Slip)" ? "Photo Slip + Typed Medicines" : "Doctor Slip Photo Upload")
        : "Typed Medicine Custom Order";

      const rxNum = rx.rxNumber || rx.id;

      return {
        id: rx.id,
        rxNumber: String(rxNum).startsWith('RX-') ? rxNum : `RX-2026-${String(rxNum).replace(/\D/g, '').slice(-4) || '0901'}`,
        customerId: rx.patient_id || rx.customerId || 'CUST-301',
        customerName: rx.patient_name || rx.customerName || 'Patient',
        doctorName: rx.doctor_name || rx.doctorName || 'Patient Direct Order',
        doctorSlmcNo: rx.doctor_reg || rx.doctorSlmcNo || 'DIRECT-ORDER',
        uploadDate: rx.uploadDate || (rx.created_at ? new Date(rx.created_at).toLocaleString() : new Date().toLocaleString()),
        expiryDate: rx.expiryDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
        medicines: meds,
        isControlledDrug: rx.isControlledDrug || false,
        status: rx.status || 'Pending',
        orderType: orderTypeLabel,
        verifiedBy: rx.verifiedBy || null,
        verifiedAt: rx.verifiedAt || null,
        prescriptionUrl: validUrl,
        rejectionReason: rx.rejection_reason || rx.rejectionReason || null,
        notes: notesText
      };
    });
  } catch (err) {
    console.warn("Supabase fetchPrescriptions fallback:", err);
    return INITIAL_PRESCRIPTIONS;
  }
}

export async function createPrescription(prescriptionData) {
  try {
    const notesContent = prescriptionData.notes || prescriptionData.rejectionReason || null;
    const urlContent = prescriptionData.prescriptionUrl || prescriptionData.prescription_url || null;

    const dbPayload = {
      id: prescriptionData.id || `RX-${Math.floor(950 + Math.random() * 50)}`,
      patient_id: prescriptionData.customerId || prescriptionData.patient_id || null,
      patient_name: prescriptionData.customerName || prescriptionData.patient_name || 'Patient Name',
      doctor_name: prescriptionData.doctorName || prescriptionData.doctor_name || 'Doctor Prescription',
      doctor_reg: prescriptionData.doctorSlmcNo || prescriptionData.doctor_reg || 'SLMC-VERIFY',
      status: prescriptionData.status || 'Pending',
      medications: prescriptionData.medicines || prescriptionData.medications || [],
      prescription_url: (urlContent && !urlContent.includes('pharmart.lk/rx_upload')) ? urlContent : null,
      rejection_reason: notesContent
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
    if (error) {
      console.warn("Supabase fetchTransactions note:", error.message);
      return INITIAL_TRANSACTIONS;
    }

    const dbTxns = (data || []).map(t => {
      let itemsArr = t.items;
      if (typeof itemsArr === 'string') {
        try { itemsArr = JSON.parse(itemsArr); } catch (e) { itemsArr = []; }
      }
      return {
        id: t.id,
        invoiceNo: t.invoice_no || t.id,
        invoice_no: t.invoice_no || t.id,
        date: t.created_at ? new Date(t.created_at).toLocaleString() : new Date().toLocaleString(),
        created_at: t.created_at,
        customerName: t.customer_name || 'Walk-in Customer',
        customer_name: t.customer_name || 'Walk-in Customer',
        cashierName: t.cashier_name || 'Staff',
        cashier_name: t.cashier_name || 'Staff',
        items: Array.isArray(itemsArr) ? itemsArr : [],
        subtotal: Number(t.subtotal) || 0,
        discount: Number(t.discount) || 0,
        discountAmt: Number(t.discount) || 0,
        tax: Number(t.tax) || 0,
        taxAmt: Number(t.tax) || 0,
        total: Number(t.total) || 0,
        paymentMethod: t.payment_method || 'Cash',
        payment_method: t.payment_method || 'Cash',
        paidAmount: Number(t.paid_amount || t.total) || 0,
        changeAmount: Number(t.change_amount) || 0,
        status: 'Completed'
      };
    });

    const combined = [...dbTxns];
    INITIAL_TRANSACTIONS.forEach(initT => {
      if (!combined.some(x => x.id === initT.id || x.invoiceNo === initT.invoiceNo)) {
        combined.push(initT);
      }
    });

    return combined;
  } catch (err) {
    console.warn("Supabase fetchTransactions fallback:", err);
    return INITIAL_TRANSACTIONS;
  }
}

export async function createTransaction(txData) {
  try {
    const dbPayload = {
      id: txData.id || `TXN-${Math.floor(8800 + Math.random() * 1000)}`,
      invoice_no: txData.invoice_no || txData.invoiceNo || `INV-2026-${Math.floor(8800 + Math.random() * 1000)}`,
      customer_name: txData.customer_name || txData.customerName || 'Walk-in Customer',
      cashier_name: txData.cashier_name || txData.cashierName || 'Staff',
      items: txData.items || [],
      subtotal: Number(txData.subtotal) || 0,
      discount: Number(txData.discountAmt || txData.discount) || 0,
      tax: Number(txData.taxAmt || txData.tax) || 0,
      total: Number(txData.total) || 0,
      payment_method: txData.payment_method || txData.paymentMethod || 'Cash',
      paid_amount: Number(txData.paidAmount || txData.paid_amount || txData.total) || 0,
      change_amount: Number(txData.changeAmount || txData.change_amount) || 0
    };
    const { data, error } = await supabase.from('transactions').insert([dbPayload]).select();
    if (error) {
      if (error.message && (error.message.includes('paid_amount') || error.message.includes('change_amount'))) {
        delete dbPayload.paid_amount;
        delete dbPayload.change_amount;
        const retry = await supabase.from('transactions').insert([dbPayload]).select();
        return retry;
      }
      console.error("Error creating transaction in Supabase:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("createTransaction exception:", err);
    return { data: null, error: err };
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
