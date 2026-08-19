import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, AlertCircle, FileText, Plus, Search } from 'lucide-react';

export default function CustomerList({ customers, setCustomers, prescriptions, addAuditLog }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name || !newCust.nic) {
      alert("Please fill in customer name and NIC.");
      return;
    }
    const created = {
      ...newCust,
      id: `CUST-${Math.floor(300 + Math.random() * 700)}`,
      historyCount: 0,
      lastVisit: "Today"
    };
    setCustomers(prev => [created, ...prev]);
    addAuditLog("New Customer Registered", `Created digital customer profile for ${created.name} (${created.nic})`, "success");
    setIsAddModalOpen(false);
    setNewCust({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">Customer Profiles & Medical Histories</h2>
          <p className="text-xs text-slate-500 mt-1">Epic 3 customer registry, allergy tracking & prescription history</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input 
          type="text"
          placeholder="Search customer by name, NIC or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const rxCount = prescriptions.filter(p => p.customerId === cust.id).length;

          return (
            <div key={cust.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-300">
                    {cust.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cust.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">NIC: {cust.nic}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {cust.id}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{cust.phone}</div>
                <div className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{cust.email}</div>
                <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{cust.address}</div>
              </div>

              {cust.allergies && (
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 text-rose-600 mr-1.5 shrink-0" />
                  <span>Allergies: {cust.allergies}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Linked Prescriptions: <strong className="text-emerald-700">{rxCount}</strong></span>
                <span>Last Visit: {cust.lastVisit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register New Customer Profile</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input required type="text" value={newCust.name} onChange={e=>setNewCust({...newCust, name:e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID (NIC) *</label>
                <input required type="text" value={newCust.nic} onChange={e=>setNewCust({...newCust, nic:e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={newCust.phone} onChange={e=>setNewCust({...newCust, phone:e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input type="email" value={newCust.email} onChange={e=>setNewCust({...newCust, email:e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Drug Allergies</label>
                <input type="text" placeholder="e.g. Penicillin, Aspirin" value={newCust.allergies} onChange={e=>setNewCust({...newCust, allergies:e.target.value})} className="w-full px-3 py-2 border rounded-xl text-rose-700" />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={()=>setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-xs">Save Customer Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
