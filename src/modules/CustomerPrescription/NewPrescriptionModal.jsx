import React, { useState } from 'react';
import { X, FileText, Plus, User, Stethoscope } from 'lucide-react';

export default function NewPrescriptionModal({ isOpen, onClose, onSave, customers, medicines }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [doctorName, setDoctorName] = useState('Dr. L. C. Fernando');
  const [doctorSlmcNo, setDoctorSlmcNo] = useState('SLMC-44912');
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [dosage, setDosage] = useState('1 tablet twice daily');
  const [durationDays, setDurationDays] = useState(30);
  const [qty, setQty] = useState(60);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    const med = medicines.find(m => m.id === selectedMedId);
    if (!cust || !med) return;

    const newRx = {
      id: `RX-${Math.floor(900 + Math.random() * 100)}`,
      rxNumber: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: cust.id,
      customerName: cust.name,
      doctorName: doctorName,
      doctorSlmcNo: doctorSlmcNo,
      uploadDate: new Date().toLocaleString(),
      expiryDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      medicines: [
        { medicineId: med.id, name: med.name, dosage: dosage, durationDays: durationDays, quantity: qty }
      ],
      isControlledDrug: med.controlledDrug,
      status: "Pending",
      verifiedBy: null,
      verifiedAt: null,
      notes: med.controlledDrug ? "Controlled drug verification required." : "Regular prescription review pending."
    };

    onSave(newRx);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden">
        
        <div className="p-4 border-b border-emerald-100 bg-emerald-50/70 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Customer Prescription</h3>
              <p className="text-xs text-slate-500">Register doctor prescription for Pharmacist verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Customer *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.nic})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
              <input 
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SLMC Reg No *</label>
              <input 
                type="text"
                required
                value={doctorSlmcNo}
                onChange={(e) => setDoctorSlmcNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Prescribed Medication *</label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.controlledDrug ? "(CONTROLLED DRUG)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dosage Instructions *</label>
            <input 
              type="text"
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Days)</label>
              <input 
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Quantity</label>
              <input 
                type="number"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-xs"
            >
              Register Prescription
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
