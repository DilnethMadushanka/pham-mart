import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  FileText, 
  Plus, 
  Search, 
  History, 
  Receipt, 
  Clock, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Pill,
  UserCheck,
  Edit,
  Trash2
} from 'lucide-react';
import { saveCustomer, deleteCustomer } from '../../services/supabaseService';
import { confirmDialog, notify, notifyError } from '../../lib/notify';
import PhoneHint from '../../components/PhoneHint';
import { checkPhone } from '../../lib/phone';
import PageHeader from '../../components/PageHeader';

export default function CustomerList({ 
  customers, 
  setCustomers, 
  prescriptions = [], 
  transactions = [], 
  canDelete = false,
  addAuditLog 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null);
  const [historyTab, setHistoryTab] = useState("purchases"); // "purchases" | "prescriptions"

  // History is matched by customer id. Old records saved before ids were stored
  // fall back to an exact (not partial) name match.
  const filterCustomerRecords = (records = [], cust) => {
    if (!cust?.id) return [];
    const name = String(cust.name || "").trim().toLowerCase();
    return records.filter(r => r.customerId
      ? r.customerId === cust.id
      : Boolean(name) && String(r.customerName || "").trim().toLowerCase() === name);
  };

  useEffect(() => {
    if (selectedHistoryCustomer) {
      const custTxns = filterCustomerRecords(transactions, selectedHistoryCustomer);
      const custRxs = filterCustomerRecords(prescriptions, selectedHistoryCustomer);
      if (custTxns.length === 0 && custRxs.length > 0) {
        setHistoryTab("prescriptions");
      } else {
        setHistoryTab("purchases");
      }
    }
  }, [selectedHistoryCustomer, transactions, prescriptions]);

  const [newCust, setNewCust] = useState({ 
    name: '', 
    nic: '', 
    phone: '', 
    email: '', 
    address: '', 
    allergies: '' 
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nic && c.nic.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setNewCust({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (cust) => {
    setEditingCustomer(cust);
    setNewCust({
      name: cust.name || '',
      nic: cust.nic || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      allergies: cust.allergies || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (cust) => {
    if (!canDelete) return;
    const confirmed = await confirmDialog({
      title: `Delete ${cust.name}?`,
      message: "This removes the customer profile and their online sign-in. Past invoices keep the name.",
      confirmLabel: "Delete customer",
      tone: "danger"
    });
    if (!confirmed) return;

    const { error } = await deleteCustomer(cust.id);
    if (error) {
      notifyError(error, "Customer not deleted");
      return;
    }
    setCustomers(prev => prev.filter(c => c.id !== cust.id));
    addAuditLog("Customer Deleted", `Deleted customer profile for ${cust.name} (${cust.id})`, "warning");
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.nic.trim()) {
      notify("Details needed", "Please fill in the customer's name and NIC.", "error");
      return;
    }
    if (!checkPhone(newCust.phone, notify, { required: true })) return;

    const { data, error } = await saveCustomer(editingCustomer ? { ...newCust, id: editingCustomer.id } : newCust);
    if (error) {
      notifyError(error, "Customer not saved");
      return;
    }

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
      addAuditLog("Customer Updated", `Updated customer profile for ${data.name} (ID: ${data.id})`, "info");
    } else {
      setCustomers(prev => [data, ...prev]);
      addAuditLog("New Customer Registered", `Created customer profile for ${data.name} (NIC: ${data.nic})`, "success");
    }

    setIsAddModalOpen(false);
    setEditingCustomer(null);
    setNewCust({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      <PageHeader
        kicker="Patient directory"
        title="Customers"
        description="Profiles, allergy flags, past invoices and prescription records."
      >
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-medium text-sm shadow-md shadow-[#2563EB]/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New customer</span>
        </button>
      </PageHeader>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search customer by name, NIC or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Registered Customers: <span className="text-slate-900 font-semibold">{customers.length}</span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => {
          const custRxList = filterCustomerRecords(prescriptions, cust);
          const custTxnList = filterCustomerRecords(transactions, cust);

          return (
            <div 
              key={cust.id} 
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] font-semibold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                        {cust.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        NIC {cust.nic || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-500 whitespace-nowrap">
                      {cust.id}
                    </span>
                    <button 
                      onClick={() => handleEditClick(cust)}
                      title="Edit Customer Profile"
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {canDelete && (
                    <button 
                      onClick={() => handleDeleteClick(cust)}
                      title="Delete Customer Profile"
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    )}
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {cust.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="tabular-nums font-medium text-slate-700">{cust.phone}</span>
                    </div>
                  )}
                  {cust.email && (
                    <div className="flex items-center space-x-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600">{cust.email}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 leading-snug">{cust.address}</span>
                    </div>
                  )}
                </div>

                {/* Allergies Warning Badge */}
                {cust.allergies && cust.allergies !== "None" && cust.allergies !== "None reported" ? (
                  <div className="mt-3 p-3 bg-rose-50 rounded-2xl border border-rose-200/80 text-xs text-rose-900 font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span><strong>Known Allergies:</strong> {cust.allergies}</span>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-[11px] text-emerald-800 font-medium flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>No known drug allergies reported</span>
                  </div>
                )}
              </div>

              {/* Action & Stats Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                  <span>Purchases: <strong className="text-slate-900">{custTxnList.length}</strong></span>
                  <span>Prescriptions: <strong className="text-blue-700">{custRxList.length}</strong></span>
                </div>

                <button
                  onClick={() => { setSelectedHistoryCustomer(cust); setHistoryTab("purchases"); }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-200/60"
                >
                  <History className="w-4 h-4 text-blue-600" />
                  <span>View Purchase & Rx Records</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {editingCustomer ? "Edit Customer Profile" : "Register Customer Profile"}
                </h3>
              </div>
              <button onClick={() => { setIsAddModalOpen(false); setEditingCustomer(null); }} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. K. A. Sunil Shantha" value={newCust.name} onChange={e=>setNewCust({...newCust, name:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID (NIC) <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. 781290348V" value={newCust.nic} onChange={e=>setNewCust({...newCust, nic:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number <span className="text-rose-500">*</span></label>
                  <input type="tel" inputMode="tel" placeholder="+94 77 123 4567" value={newCust.phone} onChange={e=>setNewCust({...newCust, phone:e.target.value})} className="peer w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
                  <PhoneHint value={newCust.phone} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input type="email" placeholder="customer@gmail.com" value={newCust.email} onChange={e=>setNewCust({...newCust, email:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Home / Delivery Address</label>
                <input type="text" placeholder="No 45, Baseline Road, Colombo" value={newCust.address} onChange={e=>setNewCust({...newCust, address:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Drug Allergies</label>
                <input type="text" placeholder="e.g. Penicillin, Sulfa drugs, Aspirin" value={newCust.allergies} onChange={e=>setNewCust({...newCust, allergies:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-rose-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingCustomer(null); }} className="px-4 py-2.5 bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  {editingCustomer ? "Update Customer Profile" : "Save Customer Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase & Prescription History Modal */}
      {selectedHistoryCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Top Banner */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-semibold text-base flex items-center justify-center border border-blue-200">
                  {selectedHistoryCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedHistoryCustomer.name}</h3>
                  <div className="text-xs text-slate-500 font-semibold flex items-center space-x-2 mt-0.5">
                    <span>NIC: {selectedHistoryCustomer.nic || "N/A"}</span>
                    <span>•</span>
                    <span>Phone: {selectedHistoryCustomer.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedHistoryCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Allergy Banner */}
            {selectedHistoryCustomer.allergies && selectedHistoryCustomer.allergies !== "None" && selectedHistoryCustomer.allergies !== "None reported" && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-semibold flex items-center space-x-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>CRITICAL ALLERGY ALERT:</strong> {selectedHistoryCustomer.allergies}</span>
              </div>
            )}

            {/* Tabs Selector */}
            {(() => {
              const custTxns = filterCustomerRecords(transactions, selectedHistoryCustomer);
              const custRxs = filterCustomerRecords(prescriptions, selectedHistoryCustomer);

              return (
                <>
                  <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                    <button
                      onClick={() => setHistoryTab("purchases")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        historyTab === "purchases" ? "bg-white text-blue-800 shadow-xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Checkout Purchases ({custTxns.length})</span>
                    </button>

                    <button
                      onClick={() => setHistoryTab("prescriptions")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        historyTab === "prescriptions" ? "bg-white text-blue-800 shadow-xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Prescription Records ({custRxs.length})</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {historyTab === "purchases" ? (
                      custTxns.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 font-semibold space-y-3 bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80">
                          <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                          <div className="text-sm font-bold text-slate-800">No checkout purchase invoices recorded for {selectedHistoryCustomer.name} yet.</div>
                          {custRxs.length > 0 && (
                            <button
                              onClick={() => setHistoryTab("prescriptions")}
                              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-2xl font-semibold text-xs transition-all cursor-pointer border border-blue-300 shadow-xs"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>Click to View {custRxs.length} Prescription Record(s) Uploaded by Patient</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        custTxns.map((txn) => (
                          <div key={txn.id} className="bg-slate-50/80 p-4 rounded-3xl border border-slate-200/80 space-y-2.5">
                            <div className="flex justify-between items-center">
                              <div className="font-mono font-semibold text-slate-900 text-xs">{txn.invoiceNo || txn.id}</div>
                              <div className="text-xs text-slate-500 font-bold">{txn.date}</div>
                            </div>

                            <div className="space-y-1 py-2 border-y border-slate-200/80">
                              {txn.items && txn.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-slate-800 font-semibold">
                                  <span>{item.name} × {item.qty}</span>
                                  <span className="font-semibold">Rs. {Number(item.total || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-1 font-bold">
                              <span className="text-slate-600">Total Paid ({txn.paymentMethod || "Cash"}):</span>
                              <span className="text-blue-700 text-sm font-semibold">Rs. {Number(txn.total || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      custRxs.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 font-semibold space-y-3 bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80">
                          <FileText className="w-10 h-10 mx-auto text-slate-300" />
                          <div className="text-sm font-bold text-slate-800">No uploaded prescription records found for {selectedHistoryCustomer.name}.</div>
                        </div>
                      ) : (
                        custRxs.map((rx) => (
                          <div key={rx.id} className="bg-slate-50/80 p-4 rounded-3xl border border-slate-200/80 space-y-2.5">
                            <div className="flex justify-between items-center">
                              <div className="font-mono font-semibold text-slate-900">{rx.rxNumber || rx.id}</div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                rx.status === "Approved" ? "bg-emerald-100 text-emerald-900 border-emerald-300" :
                                rx.status === "Rejected" ? "bg-rose-100 text-rose-900 border-rose-300" :
                                "bg-amber-100 text-amber-900 border-amber-300"
                              }`}>
                                {rx.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 font-semibold">
                              Doctor/Order: <strong className="text-slate-900">{rx.doctorName}</strong> • {rx.uploadDate}
                            </div>

                            {rx.medicines && rx.medicines.length > 0 && (
                              <div className="space-y-1 py-2 border-t border-slate-200/80">
                                <span className="text-[11px] font-medium text-slate-400 block">Items & Dosage:</span>
                                {rx.medicines.map((m, idx) => (
                                  <div key={idx} className="flex justify-between text-slate-800 font-bold bg-white p-2 rounded-xl border border-slate-200">
                                    <span>{m.name} ({m.dosage})</span>
                                    <span className="text-blue-700 font-semibold">{m.quantity} units</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {rx.notes && (
                              <div className="text-[11.5px] text-slate-500 font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                                {rx.notes}
                              </div>
                            )}
                          </div>
                        ))
                      )
                    )}
                  </div>
                </>
              );
            })()}

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedHistoryCustomer(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl cursor-pointer"
              >
                Close Medical History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
