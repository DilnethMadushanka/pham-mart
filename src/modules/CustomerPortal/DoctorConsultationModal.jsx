import React, { useState } from 'react';
import { X, Stethoscope, Phone, Calendar, Clock, CheckCircle2, User, MessageSquare } from 'lucide-react';

export default function DoctorConsultationModal({ isOpen, onClose, addAuditLog }) {
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [consultType, setConsultType] = useState("pharmacist"); // "pharmacist" | "doctor"
  const [topic, setTopic] = useState("Prescription Dosage Inquiry");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert("Please enter patient name and contact number.");
      return;
    }

    alert(`Consultation Request Submitted!\n\nPatient: ${patientName}\nConsultant: ${consultType === "pharmacist" ? "Duty Pharmacist Mendis M.M.N" : "Dr. L. C. Fernando (SLMC-44912)"}\nOur team will call you within 15 minutes at ${phone}.`);
    
    addAuditLog("Consultation Requested", `Patient ${patientName} requested ${consultType} callback for ${topic}`, "info");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">Talk to a Pharmacist / Doctor</h3>
              <p className="text-xs text-sky-100">Licensed Tele-pharmacy Consultation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Consultation Provider *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConsultType("pharmacist")}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  consultType === "pharmacist"
                    ? "bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  <span>Duty Pharmacist</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Dosage & Interaction Advice</div>
              </button>

              <button
                type="button"
                onClick={() => setConsultType("doctor")}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  consultType === "doctor"
                    ? "bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>SLMC Doctor</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Tele-Prescription Issuance</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
            <input 
              type="text"
              required
              placeholder="e.g. K. A. Sunil Shantha"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number for Callback *</label>
            <input 
              type="text"
              required
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Inquiry Subject</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-500 outline-hidden"
            >
              <option value="Prescription Dosage Inquiry">Prescription Dosage Inquiry</option>
              <option value="Controlled Drug Verification">Controlled Drug Verification</option>
              <option value="Chronic Disease Medicine Refill">Chronic Disease Medicine Refill</option>
              <option value="Side Effects & Drug Interaction Check">Side Effects & Drug Interaction Check</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Brief Description / Specific Medical Notes</label>
            <textarea
              rows={2}
              placeholder="Detail your health query or existing medications..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-[11px] text-sky-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Average Callback Time: <strong>12 Minutes</strong> (Free Patient Support)</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
          >
            Request Instant Callback
          </button>

        </form>

      </div>
    </div>
  );
}
