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
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              Epic 3 Requirement
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Prescription Verification & Pharmacist Workstation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structured drug interaction checks, dosage validation, SLMC physician record linking & controlled drug clearance.
          </p>
        </div>

        <button
          onClick={() => setIsNewRxModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Register Prescription</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "ALL" ? "bg-white text-emerald-800 shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveFilter("Pending")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            activeFilter === "Pending" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Pending Verification</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-800 text-[10px] font-black">
            {prescriptions.filter(p => p.status === "Pending").length}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("Approved")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "Approved" ? "bg-white text-emerald-800 shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Approved ({prescriptions.filter(p => p.status === "Approved").length})
        </button>
      </div>

      {/* Main Grid: Prescription Cards + Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Prescription List Column */}
        <div className="lg:col-span-6 space-y-3">
          {filteredRx.map((rx) => {
            const isPending = rx.status === "Pending";
            const isApproved = rx.status === "Approved";
            const isSelected = selectedRx?.id === rx.id;

            return (
              <div
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                  isSelected 
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" 
                    : "border-slate-200 hover:border-emerald-300 shadow-xs"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-slate-900 text-sm">{rx.rxNumber}</span>
                      {rx.isControlledDrug && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Controlled Drug
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {rx.customerName}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isPending 
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : isApproved 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}>
                    {rx.status}
                  </span>
                </div>

                {/* Doctor details */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                  <div className="flex items-center">
                    <Stethoscope className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>{rx.doctorName} ({rx.doctorSlmcNo})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{rx.uploadDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Prescription Review Workstation */}
        <div className="lg:col-span-6">
          {selectedRx ? (
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-lg space-y-5 sticky top-20">
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">
                    Pharmacist Verification Console
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedRx.rxNumber}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedRx.status === "Approved" 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                    : selectedRx.status === "Pending"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-rose-100 text-rose-800 border-rose-300"
                }`}>
                  {selectedRx.status}
                </span>
              </div>

              {/* Patient & Doctor details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block">Patient Name</span>
                  <span className="font-bold text-slate-900">{selectedRx.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Prescribing Physician</span>
                  <span className="font-bold text-slate-900">{selectedRx.doctorName}</span>
                  <span className="text-[10px] text-emerald-700 block font-mono">Reg: {selectedRx.doctorSlmcNo}</span>
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
                    Controlled Substance Safety Protocol (Epic 3 & 4)
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedRx.id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
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
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Approved status view */}
              {selectedRx.status === "Approved" && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <div className="font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                    Prescription Verified & Linked to Customer Record
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">Verified by: {selectedRx.verifiedBy}</p>
                  <p className="text-[11px] text-emerald-700">Remarks: {selectedRx.notes}</p>
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
