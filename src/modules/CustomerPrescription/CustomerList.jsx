import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import { createCustomer } from '../../services/supabaseService';

export default function CustomerList({ 
  customers, 
  setCustomers, 
  prescriptions = [], 
  transactions = [], 
  addAuditLog 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null);
  const [historyTab, setHistoryTab] = useState("purchases"); // "purchases" | "prescriptions"

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

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.nic.trim()) {
      alert("Please fill in customer name and NIC.");
      return;
    }
    const created = {
      ...newCust,
      id: `CUST-${Math.floor(300 + Math.random() * 700)}`,
      historyCount: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [created, ...prev]);
    await createCustomer(created);
    if (addAuditLog) {
      addAuditLog("New Customer Registered", `Created digital customer profile for ${created.name} (NIC: ${created.nic})`, "success");
    }
    setIsAddModalOpen(false);
    setNewCust({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
              Patient Directory
            </span>
            <span className="text-xs text-slate-500 font-semibold">Cashier & Pharmacist Workstation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Patient Profiles & Medical Histories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Register new customers, view allergy flags, past checkout invoices, and prescription records.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-sky-500/20 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search customer by name, NIC or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden transition-all"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Registered Customers: <span className="text-slate-900 font-extrabold">{customers.length}</span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => {
          const custRxList = prescriptions.filter(p => p.customerId === cust.id || p.customerName === cust.name);
          const custTxnList = transactions.filter(t => t.customerName === cust.name || t.customerId === cust.id);

          return (
            <div 
              key={cust.id} 
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-sky-700 transition-colors">
                        {cust.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono font-semibold">
                        NIC: {cust.nic || "N/A"}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-slate-100 text-slate-700 border border-slate-200">
                    {cust.id}
                  </span>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {cust.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-semibold text-slate-700">{cust.phone}</span>
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
                  <span>Prescriptions: <strong className="text-sky-700">{custRxList.length}</strong></span>
                </div>

                <button
                  onClick={() => { setSelectedHistoryCustomer(cust); setHistoryTab("purchases"); }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-200/60"
                >
                  <History className="w-4 h-4 text-sky-600" />
                  <span>View Purchase & Rx Records</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Register Customer Profile</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. K. A. Sunil Shantha" value={newCust.name} onChange={e=>setNewCust({...newCust, name:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID (NIC) <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. 781290348V" value={newCust.nic} onChange={e=>setNewCust({...newCust, nic:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input type="text" placeholder="+94 77 123 4567" value={newCust.phone} onChange={e=>setNewCust({...newCust, phone:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input type="email" placeholder="customer@gmail.com" value={newCust.email} onChange={e=>setNewCust({...newCust, email:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Home / Delivery Address</label>
                <input type="text" placeholder="No 45, Baseline Road, Colombo" value={newCust.address} onChange={e=>setNewCust({...newCust, address:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Drug Allergies</label>
                <input type="text" placeholder="e.g. Penicillin, Sulfa drugs, Aspirin" value={newCust.allergies} onChange={e=>setNewCust({...newCust, allergies:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-rose-700 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={()=>setIsAddModalOpen(false)} className="px-4 py-2.5 bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md cursor-pointer">Save Customer Profile</button>
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
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 font-black text-base flex items-center justify-center border border-sky-200">
                  {selectedHistoryCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedHistoryCustomer.name}</h3>
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
            {selectedHistoryCustomer.allergies && selectedHistoryCustomer.allergies !== "None" && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-semibold flex items-center space-x-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>CRITICAL ALLERGY ALERT:</strong> {selectedHistoryCustomer.allergies}</span>
              </div>
            )}

            {/* Tabs Selector */}
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => setHistoryTab("purchases")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  historyTab === "purchases" ? "bg-white text-sky-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Checkout Purchases & Invoices ({transactions.filter(t => t.customerName === selectedHistoryCustomer.name || t.customerId === selectedHistoryCustomer.id).length})</span>
              </button>

              <button
                onClick={() => setHistoryTab("prescriptions")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  historyTab === "prescriptions" ? "bg-white text-sky-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Prescription Records ({prescriptions.filter(p => p.customerId === selectedHistoryCustomer.id || p.customerName === selectedHistoryCustomer.name).length})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              
              {historyTab === "purchases" ? (
                (() => {
                  const custTxns = transactions.filter(t => t.customerName === selectedHistoryCustomer.name || t.customerId === selectedHistoryCustomer.id);

                  if (custTxns.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400 font-semibold space-y-2">
                        <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                        <div>No checkout purchase invoices recorded for this customer yet.</div>
                      </div>
                    );
                  }

                  return custTxns.map((txn) => (
                    <div key={txn.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-mono font-bold text-slate-900 text-xs">{txn.invoiceNo}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{txn.date}</div>
                      </div>

                      <div className="space-y-1 py-1.5 border-y border-slate-200/60">
                        {txn.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{item.name} × {item.qty}</span>
                            <span className="font-semibold">Rs. {Number(item.total).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-1 font-bold">
                        <span className="text-slate-600">Total Paid ({txn.paymentMethod || "Cash"}):</span>
                        <span className="text-sky-700 text-sm font-black">Rs. {Number(txn.total).toFixed(2)}</span>
                      </div>
                    </div>
                  ));
                })()
              ) : (
                (() => {
                  const custRxs = prescriptions.filter(p => p.customerId === selectedHistoryCustomer.id || p.customerName === selectedHistoryCustomer.name);

                  if (custRxs.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400 font-semibold space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-slate-300" />
                        <div>No uploaded prescription records found for this patient.</div>
                      </div>
                    );
                  }

                  return custRxs.map((rx) => (
                    <div key={rx.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-mono font-bold text-slate-900">{rx.rxNumber || rx.id}</div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rx.status === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          rx.status === "Rejected" ? "bg-rose-100 text-rose-800 border-rose-300" :
                          "bg-amber-100 text-amber-800 border-amber-300"
                        }`}>
                          {rx.status}
                        </span>
                      </div>

                      <div className="text-slate-600 font-medium">
                        Doctor: <span className="text-slate-900 font-bold">{rx.doctorName}</span> ({rx.doctorSlmcNo})
                      </div>

                      {rx.medicines && rx.medicines.length > 0 && (
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                          <div className="font-bold text-slate-700 text-[11px]">Prescribed Medications:</div>
                          {rx.medicines.map((m, idx) => (
                            <div key={idx} className="text-slate-600 flex justify-between">
                              <span>• {m.name}</span>
                              <span className="font-semibold text-slate-800">{m.dosage || `${m.quantity} units`}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {rx.notes && (
                        <div className="text-[11px] text-slate-500 italic">Notes: {rx.notes}</div>
                      )}
                    </div>
                  ));
                })()
              )}

            </div>

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
