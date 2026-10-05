import React, { useState } from 'react';
import { X, Stethoscope, Phone, Calendar, Clock, CheckCircle2, User, MessageSquare } from 'lucide-react';
import { notify } from '../../lib/notify';
import PhoneHint from '../../components/PhoneHint';
import { checkPhone } from '../../lib/phone';

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
      notify("Details needed", "Please enter the patient's name and a contact number.", "error");
      return;
    }
    if (!checkPhone(phone, notify, { required: true })) return;

    notify(
      "Consultation requested",
      `${consultType === "pharmacist" ? "The duty pharmacist" : "Dr. L. C. Fernando"} will call ${patientName} on ${phone}.`
    );
    
    addAuditLog("Consultation Requested", `Patient ${patientName} requested ${consultType} callback for ${topic}`, "info");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-blue-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0B2545]">Talk to a pharmacist or doctor</h3>
              <p className="text-xs text-slate-500">Licensed tele-pharmacy consultation</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#0B2545] hover:bg-slate-100">
            <X className="w-5 h-5" />
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
                    ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Duty Pharmacist</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Dosage & Interaction Advice</div>
              </button>

              <button
                type="button"
                onClick={() => setConsultType("doctor")}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  consultType === "doctor"
                    ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-blue-600" />
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
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number for Callback *</label>
            <input 
              type="tel" inputMode="tel"
              required
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="peer w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
            <PhoneHint value={phone} />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Inquiry Subject</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Average Callback Time: <strong>12 Minutes</strong> (Free Patient Support)</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            Request Instant Callback
          </button>

        </form>

      </div>
    </div>
  );
}
