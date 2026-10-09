import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { notify } from '../../lib/notify';
import { checkRxDate, colomboToday, shiftDate, RX_VALID_DAYS } from '../../lib/rxDate';

export default function NewPrescriptionModal({ isOpen, onClose, onSave, customers, medicines, doctors = [] }) {
  const [customerId, setCustomerId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorSlmcNo, setDoctorSlmcNo] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dosage, setDosage] = useState('1 tablet twice daily');
  const [durationDays, setDurationDays] = useState(30);
  const [qty, setQty] = useState(60);
  const [rxDate, setRxDate] = useState(colomboToday());

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    const med = medicines.find(m => m.id === selectedMedId);
    if (!cust || !med) {
      notify("Details needed", "Choose the customer and the prescribed medicine.", "error");
      return;
    }

    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor && (!doctorName.trim() || !doctorSlmcNo.trim())) {
      notify("Doctor needed", "Pick the doctor from the doctor database, or type the name and SLMC number from the slip.", "error");
      return;
    }

    const dateCheck = checkRxDate(rxDate);
    if (!dateCheck.ok) {
      notify("Invalid prescription", dateCheck.message, "error");
      return;
    }

    onSave({
      customerId: cust.id,
      prescriptionDate: rxDate,
      doctorId: doctor?.id || null,
      doctorName: doctor ? doctor.name : doctorName.trim(),
      doctorSlmcNo: doctor ? doctor.slmcNo : doctorSlmcNo.trim(),
      medicines: [
        { medicineId: med.id, name: med.name, dosage, durationDays, quantity: qty }
      ],
      notes: med.controlledDrug ? "Controlled drug verification required." : ""
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-blue-100 overflow-hidden">
        
        <div className="p-4 border-b border-blue-100 bg-blue-50/70 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Customer Prescription</h3>
              <p className="text-xs text-slate-500">Register doctor prescription for Pharmacist verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
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
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.nic ? ` (${c.nic})` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Prescribing Doctor *</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
            >
              <option value="">Not in the doctor database (type below)</option>
              {doctors.filter(d => d.status === "Active").map(d => (
                <option key={d.id} value={d.id}>{d.name} · {d.slmcNo} · {d.id}</option>
              ))}
            </select>
            {!doctorId && (
              <p className="mt-1 text-[11px] text-amber-700">
                Unlisted doctors can be registered, but a pharmacist can't approve prescription medicines until the doctor is added to the database.
              </p>
            )}
          </div>

          {!doctorId && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
              <input 
                type="text"
                value={doctorName}
                placeholder="As written on the slip"
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SLMC Reg No *</label>
              <input 
                type="text"
                value={doctorSlmcNo}
                placeholder="e.g. SLMC-10234"
                onChange={(e) => setDoctorSlmcNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>
          )}

          <div>
            <label htmlFor="staff-rx-date" className="block font-bold text-slate-700 mb-1">Prescription date *</label>
            <input
              id="staff-rx-date"
              type="date"
              value={rxDate}
              max={colomboToday()}
              min={shiftDate(colomboToday(), -RX_VALID_DAYS)}
              onChange={(e) => setRxDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl ${checkRxDate(rxDate).ok ? "border-slate-300" : "border-rose-300"}`}
            />
            <p className={`mt-1 text-[11px] ${checkRxDate(rxDate).ok ? "text-slate-500" : "text-rose-700 font-medium"}`}>{checkRxDate(rxDate).message}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Prescribed Medication *</label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
            >
              <option value="">Choose a medicine...</option>
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-blue-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Register Prescription
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
