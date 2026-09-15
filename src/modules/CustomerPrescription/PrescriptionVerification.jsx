import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  User, 
  Clock, 
  FileCheck,
  Bell,
  Stethoscope,
  Plus
} from 'lucide-react';
import NewPrescriptionModal from './NewPrescriptionModal';
import { createPrescription, updatePrescriptionStatus } from '../../services/supabaseService';

export default function PrescriptionVerification({ 
  prescriptions, 
  setPrescriptions, 
  customers, 
  medicines, 
  currentRole,
  addAuditLog 
}) {
  const [selectedRx, setSelectedRx] = useState(null);
  const [pharmacistNotes, setPharmacistNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeFilter, setActiveFilter] = useState("Pending"); // "Pending" | "Approved" | "Rejected" | "ALL"
  const [isNewRxModalOpen, setIsNewRxModalOpen] = useState(false);

  const filteredRx = prescriptions.filter(p => {
    if (activeFilter === "ALL") return true;
    return p.status === activeFilter;
  });

  const handleApprove = async (rxId) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === rxId) {
        const updated = {
          ...p,
          status: "Approved",
          verifiedBy: currentRole === "Pharmacist" ? "Mendis M.M.N (Pharmacist)" : "Ms. Chathurangika (Admin)",
          verifiedAt: new Date().toLocaleString(),
          notes: pharmacistNotes || "Verified against patient dosage & SLMC physician registration."
        };
        addAuditLog("Prescription Approved", `Approved RX ${p.rxNumber} for customer ${p.customerName}`, "success");
        return updated;
      }
      return p;
    }));
    await updatePrescriptionStatus(rxId, "Approved");
    setSelectedRx(null);
    setPharmacistNotes("");
  };

  const handleReject = async (rxId) => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejecting the prescription.");
      return;
    }
    setPrescriptions(prev => prev.map(p => {
      if (p.id === rxId) {
        const updated = {
          ...p,
          status: "Rejected",
          verifiedBy: currentRole === "Pharmacist" ? "Mendis M.M.N (Pharmacist)" : "Ms. Chathurangika (Admin)",
          verifiedAt: new Date().toLocaleString(),
          notes: `REJECTED: ${rejectionReason}`
        };
        addAuditLog("Prescription Rejected", `Rejected RX ${p.rxNumber}. Rationale: ${rejectionReason}`, "warning");
        return updated;
      }
      return p;
    }));
    await updatePrescriptionStatus(rxId, "Rejected", rejectionReason);
    setSelectedRx(null);
    setRejectionReason("");
  };

  const handleAddPrescription = async (newRxData) => {
    setPrescriptions(prev => [newRxData, ...prev]);
    await createPrescription(newRxData);
    addAuditLog("New Prescription Uploaded", `Registered prescription ${newRxData.rxNumber} for customer ${newRxData.customerName}`, "info");
    setIsNewRxModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
              Clinical Workstation
            </span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {prescriptions.filter(p => p.status === "Pending").length} Pending RX
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Prescription Verification & Pharmacist Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
            Structured drug interaction checks, dosage validation, SLMC physician record linking & controlled drug clearance.
          </p>
        </div>

        <button
          onClick={() => setIsNewRxModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-2xl font-black text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Register Prescription</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl w-fit border border-slate-200/80">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeFilter === "ALL" ? "bg-white text-sky-800 shadow-xs border border-slate-200/60" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveFilter("Pending")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
            activeFilter === "Pending" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Pending Verification</span>
          <span className="px-2 py-0.5 rounded-full bg-white text-sky-900 text-[10px] font-black">
            {prescriptions.filter(p => p.status === "Pending").length}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("Approved")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeFilter === "Approved" ? "bg-white text-sky-800 shadow-xs border border-slate-200/60" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Approved ({prescriptions.filter(p => p.status === "Approved").length})
        </button>
      </div>

      {/* Main Grid: Prescription Cards + Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Prescription List Column */}
        <div className="lg:col-span-6 space-y-4">
          {filteredRx.map((rx) => {
            const isPending = rx.status === "Pending";
            const isApproved = rx.status === "Approved";
            const isSelected = selectedRx?.id === rx.id;

            return (
              <div
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer bg-white ${
                  isSelected 
                    ? "border-sky-500 ring-2 ring-sky-500/20 shadow-lg" 
                    : "border-sky-100 hover:border-sky-300 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-base">{rx.rxNumber}</span>
                      {rx.isControlledDrug && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Controlled Drug
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-1 flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-sky-600" />
                      {rx.customerName}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shrink-0 ${
                    isPending 
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : isApproved 
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-rose-100 text-rose-900 border-rose-300"
                  }`}>
                    {rx.status}
                  </span>
                </div>

                {/* Doctor details */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                  <div className="flex items-center font-semibold">
                    <Stethoscope className="w-4 h-4 mr-1.5 text-sky-600" />
                    <span>{rx.doctorName} ({rx.doctorSlmcNo})</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{rx.uploadDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Prescription Review Workstation */}
        <div className="lg:col-span-6">
          {selectedRx ? (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-200 shadow-xl space-y-5 sticky top-20">
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
                    Pharmacist Verification Workstation
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedRx.rxNumber}</h3>
                </div>
                <span className={`px-3.5 py-1 rounded-full text-xs font-black border ${
                  selectedRx.status === "Approved" 
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                    : selectedRx.status === "Pending"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-rose-100 text-rose-900 border-rose-300"
                }`}>
                  {selectedRx.status}
                </span>
              </div>

              {/* Patient & Doctor details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Patient Name</span>
                  <span className="font-black text-slate-900 text-sm">{selectedRx.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Prescribing Physician</span>
                  <span className="font-black text-slate-900 text-sm">{selectedRx.doctorName}</span>
                  <span className="text-[11px] text-sky-700 block font-mono font-bold">SLMC Reg: {selectedRx.doctorSlmcNo}</span>
                </div>
              </div>

              {/* Prescribed Medications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Prescribed Items & Dosage Instructions
                </h4>
                <div className="space-y-2">
                  {selectedRx.medicines.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-slate-600 mt-1 font-semibold">Dosage: {m.dosage}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Quantity: {m.quantity} units ({m.durationDays} days supply)</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaction & Controlled Drug Warning */}
              {selectedRx.isControlledDrug && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1 text-rose-600" />
                    Controlled Substance Safety Protocol
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    This prescription contains controlled dangerous drugs. Dispensing is locked at the POS billing counter until Pharmacist approval is recorded.
                  </p>
                </div>
              )}

              {/* Action Form if Pending */}
              {selectedRx.status === "Pending" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pharmacist Clinical Notes / Clearance Remarks
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter verification remarks or SLMC checks..."
                      value={pharmacistNotes}
                      onChange={(e) => setPharmacistNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-hidden"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedRx.id)}
                      className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Prescription</span>
                    </button>

                    <button
                      onClick={() => {
                        const reason = prompt("Enter rationale for rejecting prescription:");
                        if (reason) {
                          setRejectionReason(reason);
                          handleReject(selectedRx.id);
                        }
                      }}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Approved status view */}
              {selectedRx.status === "Approved" && (
                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900">
                  <div className="font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-sky-600" />
                    Prescription Verified & Linked to Customer Record
                  </div>
                  <p className="text-[11px] text-sky-800 mt-1">Verified by: {selectedRx.verifiedBy}</p>
                  <p className="text-[11px] text-sky-700">Remarks: {selectedRx.notes}</p>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-300" />
              <div className="font-bold text-slate-700">Select a Prescription to Review</div>
              <p className="text-xs text-slate-500">
                Click any prescription card on the left to inspect doctor credentials, dosage limits, and grant dispensing clearance.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* New Prescription Modal */}
      <NewPrescriptionModal
        isOpen={isNewRxModalOpen}
        onClose={() => setIsNewRxModalOpen(false)}
        onSave={handleAddPrescription}
        customers={customers}
        medicines={medicines}
      />

    </div>
  );
}
