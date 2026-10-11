import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  User, 
  Stethoscope,
  Plus,
  BadgeCheck
} from 'lucide-react';
import NewPrescriptionModal from './NewPrescriptionModal';
import DoctorDatabase from './DoctorDatabase';
import { findDoctorForPrescription, doctorLabel } from '../../lib/doctors';
import { submitPrescription, reviewPrescription, fetchPrescriptionFile } from '../../services/supabaseService';
import { checkRxDate } from '../../lib/rxDate';
import { promptDialog, notify, notifyError } from '../../lib/notify';
import PageHeader from '../../components/PageHeader';

export default function PrescriptionVerification({ 
  prescriptions, 
  setPrescriptions, 
  customers, 
  medicines, 
  doctors = [],
  setDoctors,
  canManageDoctors = false,
  canApprove = false,
  addAuditLog 
}) {
  const [section, setSection] = useState("queue"); // "queue" | "doctors"
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedRxId, setSelectedRxId] = useState(null);
  const [pharmacistNotes, setPharmacistNotes] = useState("");
  const [approvalItems, setApprovalItems] = useState([]);
  const [addItemId, setAddItemId] = useState("");
  const [addItemQty, setAddItemQty] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Pending"); // "Pending" | "Approved" | "Rejected" | "ALL"
  const [isNewRxModalOpen, setIsNewRxModalOpen] = useState(false);
  const [attachments, setAttachments] = useState({}); // rx id -> data URL (loaded on demand)

  const filteredRx = prescriptions.filter(p => {
    if (activeFilter === "ALL") return true;
    return p.status === activeFilter;
  });

  const selectedRx = prescriptions.find(p => p.id === selectedRxId) || null;
  const attachment = selectedRx ? attachments[selectedRx.id] : null;

  const reviewRef = useRef(null);

  const selectRx = (rx) => {
    setSelectedRxId(rx.id);
    // On phones the review panel sits below the list, so bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    setPharmacistNotes("");
    setSelectedDoctorId(findDoctorForPrescription(rx, doctors).doctor?.id || "");
    setApprovalItems(rx.medicines || []);
    setAddItemId("");
    setAddItemQty(1);
  };

  // Prescription photos are private and large, so they load only when opened.
  useEffect(() => {
    if (!selectedRx?.hasAttachment || attachments[selectedRx.id] !== undefined) return;
    let cancelled = false;
    fetchPrescriptionFile(selectedRx.id).then(({ data, error }) => {
      if (cancelled) return;
      if (error) notifyError(error, "Couldn't open the attachment");
      setAttachments(prev => ({ ...prev, [selectedRx.id]: data || null }));
    });
    return () => { cancelled = true; };
  }, [selectedRx, attachments]);

  const openAttachment = async () => {
    if (!attachment) return;
    const blob = await (await fetch(attachment)).blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // Pharmacists can list the exact catalogue items to dispense (for example from a
  // photo slip). Only listed items can be sold against this prescription at the POS.
  const handleAddApprovalItem = () => {
    const med = medicines.find(m => m.id === addItemId);
    if (!med || !(addItemQty > 0)) return;
    setApprovalItems(prev => [...prev, {
      medicineId: med.id,
      name: med.name,
      dosage: med.dosage || med.genericName || "",
      quantity: addItemQty
    }]);
    setAddItemId("");
    setAddItemQty(1);
  };

  const applyReviewed = (updated) => {
    setPrescriptions(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleApprove = async (rx) => {
    if (!canApprove || isSaving) return;
    setIsSaving(true);
    const { data, error } = await reviewPrescription(rx.id, "Approved", pharmacistNotes, approvalItems, selectedDoctorId);
    setIsSaving(false);
    if (error) {
      notifyError(error, "Prescription not approved");
      return;
    }
    applyReviewed(data);
    setPharmacistNotes("");
    notify("Prescription approved", `${data.rxNumber} can now be dispensed at the counter.`);
  };

  const handleReject = async (rx) => {
    if (!canApprove || isSaving) return;
    const reason = await promptDialog({
      title: `Reject ${rx.rxNumber}?`,
      message: "The patient sees this reason in My Orders.",
      label: "Reason for rejecting",
      placeholder: "e.g. The slip is unreadable. Please upload a clearer photo.",
      confirmLabel: "Reject prescription",
      multiline: true,
      tone: "danger"
    });
    if (!reason) return;
    setIsSaving(true);
    const { data, error } = await reviewPrescription(rx.id, "Rejected", reason, null, selectedDoctorId);
    setIsSaving(false);
    if (error) {
      notifyError(error, "Prescription not rejected");
      return;
    }
    applyReviewed(data);
  };

  const handleAddPrescription = async (newRxData) => {
    const { data, error } = await submitPrescription(newRxData);
    if (error) {
      notifyError(error, "Prescription not registered");
      return false;
    }
    setPrescriptions(prev => [data, ...prev]);
    addAuditLog("New Prescription Uploaded", `Registered prescription ${data.rxNumber} for customer ${data.customerName}`, "info");
    setIsNewRxModalOpen(false);
    return true;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <PageHeader
        kicker={canApprove ? "Pharmacist console" : "Prescriptions"}
        title={canApprove ? "Prescription verification" : "Customer prescriptions"}
        description={canApprove
          ? "Check interactions and dosage, link the prescribing doctor's SLMC record, and clear controlled drugs."
          : "Register a customer's prescription and view its status. A pharmacist approves it before it can be dispensed."}
      >
        <button
          onClick={() => setIsNewRxModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-medium text-sm shadow-md shadow-[#2563EB]/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register prescription</span>
        </button>
      </PageHeader>

      <nav aria-label="Prescription sections" className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "queue", label: "Verification queue", count: prescriptions.filter(p => p.status === "Pending").length },
          { id: "doctors", label: "Doctor database", count: doctors.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            aria-current={section === t.id ? "page" : undefined}
            className={`flex items-center gap-2 pb-3 -mb-px border-b-2 text-sm font-medium whitespace-nowrap ${
              section === t.id ? "border-[#2563EB] text-[#0B2545]" : "border-transparent text-slate-500 hover:text-[#0B2545]"
            }`}
          >
            {t.id === "doctors" ? <Stethoscope className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {t.label}
            <span className="text-xs font-mono text-slate-400">{t.count}</span>
          </button>
        ))}
      </nav>

      {section === "doctors" ? (
        <DoctorDatabase doctors={doctors} setDoctors={setDoctors} canManage={canManageDoctors} />
      ) : (
      <>
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl w-fit border border-slate-200/80">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "ALL" ? "bg-white text-blue-800 shadow-xs border border-slate-200/60" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveFilter("Pending")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
            activeFilter === "Pending" ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Pending Verification</span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-900 text-[10px] font-semibold">
            {prescriptions.filter(p => p.status === "Pending").length}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("Approved")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "Approved" ? "bg-white text-blue-800 shadow-xs border border-slate-200/60" : "text-slate-600 hover:text-slate-900"
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
                onClick={() => selectRx(rx)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer bg-white ${
                  isSelected 
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg" 
                    : "border-blue-100 hover:border-blue-300 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900 text-base">{rx.rxNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                        rx.hasAttachment ? "bg-blue-50 text-blue-800 border-blue-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}>
                        {rx.hasAttachment ? "Photo slip" : "Typed order"}
                      </span>
                      {rx.paidAt && (
                        <span className="status-chip status-chip-green" title={`Paid online, reference ${rx.paymentRef}`}>
                          Paid online Rs. {Number(rx.paidAmount || 0).toFixed(2)}
                        </span>
                      )}
                      {rx.isControlledDrug && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 flex items-center">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Controlled Drug
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-blue-600" />
                      {rx.customerName}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${
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
                <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center font-semibold min-w-0">
                    <Stethoscope className="w-4 h-4 mr-1.5 text-blue-600 shrink-0" />
                    <span className="truncate">{rx.doctorName}{rx.doctorSlmcNo ? ` (${rx.doctorSlmcNo})` : ""}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{rx.uploadDate}</span>
                  {rx.status === "Pending" && rx.prescriptionDate && !checkRxDate(rx.prescriptionDate).ok && (
                    <span className="status-chip status-chip-red">Invalid, older than 7 days</span>
                  )}
                  {(() => {
                    const { doctor, how } = findDoctorForPrescription(rx, doctors);
                    if (doctor && how === "linked") return <span className="status-chip status-chip-green"><BadgeCheck className="w-3.5 h-3.5" /> Doctor verified</span>;
                    if (doctor) return <span className="status-chip status-chip-blue">Possible match: {doctor.id}</span>;
                    return <span className="status-chip status-chip-amber">Doctor not in database</span>;
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Prescription Review Workstation */}
        <div ref={reviewRef} className="lg:col-span-6 scroll-mt-20">
          {selectedRx ? (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-blue-200 shadow-xl space-y-5 lg:sticky lg:top-20">
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-blue-600">
                    Pharmacist Verification Workstation
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900 mt-1">{selectedRx.rxNumber}</h3>
                </div>
                <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${
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
                  <span className="text-slate-400 font-medium text-[11px] block">Patient Name</span>
                  <span className="font-semibold text-slate-900 text-sm">{selectedRx.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium text-[11px] block">Order / Physician Type</span>
                  <span className="font-semibold text-slate-900 text-sm">{selectedRx.doctorName}</span>
                  <span className="text-[11px] text-blue-700 block font-mono font-bold">{selectedRx.orderType || "SLMC Reg: " + selectedRx.doctorSlmcNo}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium text-[11px] block">Prescription date</span>
                  {selectedRx.prescriptionDate ? (() => {
                    const check = checkRxDate(selectedRx.prescriptionDate);
                    return (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{selectedRx.prescriptionDate}</span>
                        {selectedRx.status === "Pending" && (check.ok
                          ? <span className="status-chip status-chip-green">Within 7 days</span>
                          : <span className="status-chip status-chip-red">Invalid, older than 7 days</span>)}
                      </span>
                    );
                  })() : <span className="text-slate-500">Not given</span>}
                </div>
              </div>

              {/* Doctor database check */}
              {(() => {
                const match = findDoctorForPrescription(selectedRx, doctors);
                const editing = selectedRx.status === "Pending" && canApprove;
                const chosen = doctors.find(d => d.id === (editing ? selectedDoctorId : selectedRx.doctorId)) || null;
                const needsDoctor = (editing ? approvalItems : (selectedRx.medicines || [])).some(item => {
                  const med = medicines.find(m => m.id === item.medicineId);
                  return med && (med.prescriptionRequired || med.controlledDrug);
                });
                const tone = chosen && chosen.status === "Active" ? "emerald" : "amber";
                return (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${tone === "emerald" ? "bg-emerald-50/70 border-emerald-200" : "bg-amber-50/70 border-amber-200"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[11px] text-slate-700">Doctor database check</span>
                      {chosen ? (
                        chosen.status === "Active"
                          ? <span className="status-chip status-chip-green"><BadgeCheck className="w-3.5 h-3.5" /> Record found</span>
                          : <span className="status-chip status-chip-red">Doctor inactive</span>
                      ) : (
                        <span className="status-chip status-chip-amber">No record linked</span>
                      )}
                    </div>
                    <p className="text-slate-600">
                      On the prescription: <span className="font-semibold text-slate-900">{selectedRx.doctorName}</span>
                      {selectedRx.doctorSlmcNo && <span className="font-mono"> · {selectedRx.doctorSlmcNo}</span>}
                    </p>
                    {chosen && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <div className="font-semibold text-slate-900 text-sm">{chosen.name} <span className="font-mono text-[11px] text-slate-500">{chosen.id}</span></div>
                        <div className="text-slate-600"><span className="font-mono">{chosen.slmcNo}</span>{chosen.specialty ? ` · ${chosen.specialty}` : ""}{chosen.hospital ? ` · ${chosen.hospital}` : ""}</div>
                        {chosen.phone && <a href={`tel:${chosen.phone}`} className="text-[#2563EB] font-medium">Call to confirm: {chosen.phone}</a>}
                      </div>
                    )}
                    {editing && (
                      <label className="block space-y-1">
                        <span className="block font-semibold text-slate-700">
                          Prescribing doctor{needsDoctor ? " (required to approve prescription medicines)" : ""}
                        </span>
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          className="w-full min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        >
                          <option value="">Not in the doctor database</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id} disabled={d.status !== "Active"}>
                              {doctorLabel(d)}{d.status !== "Active" ? " (inactive)" : ""}
                            </option>
                          ))}
                        </select>
                        {match.doctor && match.how !== "linked" && selectedDoctorId === match.doctor.id && (
                          <span className="block text-[11px] text-slate-500">
                            Suggested from the {match.how === "registration" ? "registration number" : "doctor's name"} on the prescription. Check it against the slip.
                          </span>
                        )}
                        {!selectedDoctorId && (
                          <span className="block text-[11px] text-amber-800">
                            {canManageDoctors
                              ? "Add the doctor in the Doctor database tab first, or reject the prescription."
                              : "Ask the owner to add this doctor, or reject the prescription."}
                          </span>
                        )}
                      </label>
                    )}
                  </div>
                );
              })()}

              {/* Patient Notes, Contact & Delivery Address */}
              {(selectedRx.notes || selectedRx.contactPhone || selectedRx.deliveryAddress) && (
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-xs space-y-1.5">
                  <span className="text-blue-900 font-semibold text-[11px] block">
                    Patient contact and notes
                  </span>
                  {selectedRx.contactPhone && <p className="text-slate-800"><span className="text-slate-500">Phone:</span> {selectedRx.contactPhone}</p>}
                  {selectedRx.deliveryAddress && <p className="text-slate-800"><span className="text-slate-500">Deliver to:</span> {selectedRx.deliveryAddress}</p>}
                  {selectedRx.notes && <p className="text-slate-800 leading-relaxed whitespace-pre-line"><span className="text-slate-500">Notes:</span> {selectedRx.notes}</p>}
                </div>
              )}

              {/* Prescription Slip Photo Preview OR Typed Order Banner */}
              {selectedRx.hasAttachment ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500 block">Attached prescription</span>
                  {attachment === undefined ? (
                    <div className="h-48 rounded-2xl border border-blue-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading attachment...</div>
                  ) : attachment === null ? (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">The attachment could not be loaded.</div>
                  ) : attachment.startsWith("data:image/") ? (
                    <div className="relative rounded-2xl overflow-hidden border border-blue-200 max-h-56 shadow-xs">
                      <img src={attachment} alt="Doctor's prescription slip" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={openAttachment}
                        className="absolute bottom-2 right-2 px-3 py-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full text-[10.5px] font-semibold backdrop-blur-xs shadow-md"
                      >
                        View full size
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openAttachment}
                      className="w-full p-4 rounded-2xl border border-blue-200 bg-blue-50/60 text-xs font-semibold text-blue-800 hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Open PDF prescription
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
                  <span className="text-emerald-900 font-semibold text-xs block flex items-center">
                    Typed medicine order (direct request)
                  </span>
                  <p className="text-emerald-800 font-medium">
                    No doctor's slip was uploaded. The medicines were typed or picked directly.
                  </p>
                </div>
              )}

              {/* Prescribed Medications & Typed Custom Items */}
              {(() => {
                const editing = selectedRx.status === "Pending" && canApprove;
                const items = editing ? approvalItems : (selectedRx.medicines || []);
                return (
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 mb-2">
                      {editing ? "Items to dispense" : "Prescribed / requested items"}
                    </h4>
                    {editing && (
                      <p className="text-[11px] text-slate-500 mb-2">
                        Only catalogue items listed here can be sold against this prescription at the counter. Add items from the photo slip before approving.
                      </p>
                    )}
                    <div className="space-y-2">
                      {items.length === 0 && (
                        <div className="p-3 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">No items listed yet.</div>
                      )}
                      {items.map((m, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                          <div className="font-semibold text-slate-900 text-sm flex justify-between gap-3">
                            <span>{m.name}{!m.medicineId && <span className="ml-2 text-[10px] font-semibold text-amber-700">Not in catalogue</span>}</span>
                            <span className="flex items-center gap-2 shrink-0">
                              <span className="text-blue-700 font-semibold">{m.quantity} units</span>
                              {editing && (
                                <button
                                  type="button"
                                  onClick={() => setApprovalItems(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold"
                                >
                                  Remove
                                </button>
                              )}
                            </span>
                          </div>
                          {m.dosage && <div className="text-slate-600 mt-1 font-semibold">Dosage / instructions: {m.dosage}</div>}
                          {m.durationDays && <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.durationDays} days supply</div>}
                        </div>
                      ))}
                      {editing && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <select
                            value={addItemId}
                            onChange={(e) => setAddItemId(e.target.value)}
                            aria-label="Catalogue medicine to add"
                            className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                          >
                            <option value="">Add a catalogue medicine...</option>
                            {medicines.map(m => (
                              <option key={m.id} value={m.id}>{m.name}{m.controlledDrug ? " (controlled)" : m.prescriptionRequired ? " (Rx)" : ""}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={addItemQty}
                            onChange={(e) => setAddItemQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            aria-label="Quantity"
                            className="w-20 px-3 py-2 border border-slate-300 rounded-xl text-xs text-center"
                          />
                          <button
                            type="button"
                            onClick={handleAddApprovalItem}
                            disabled={!addItemId}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold"
                          >
                            Add item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Interaction & Controlled Drug Warning */}
              {selectedRx.isControlledDrug && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1 text-rose-600" />
                    Controlled Substance Safety Protocol
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    This prescription contains controlled drugs. The POS will only sell the listed items, once, to this patient, after approval.
                  </p>
                </div>
              )}

              {/* Action Form if Pending */}
              {selectedRx.status === "Pending" && !canApprove && (
                <p className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Only a pharmacist or the owner can approve or reject prescriptions.
                </p>
              )}

              {selectedRx.status === "Pending" && canApprove && (
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
                    />
                  </div>

                  {(approvalItems.length === 0 || approvalItems.some(m => !m.medicineId)) && (
                    <p className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                      The customer can only pay online when every item is a catalogue medicine. Remove items marked "Not in catalogue" and add the matching medicine instead.
                    </p>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedRx)}
                      disabled={isSaving}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSaving ? "Saving..." : "Approve Prescription"}</span>
                    </button>

                    <button
                      onClick={() => handleReject(selectedRx)}
                      disabled={isSaving}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Approved status view */}
              {selectedRx.status === "Approved" && (
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-0.5">
                  <div className="font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-blue-600" />
                    {selectedRx.dispensedAt ? `Dispensed on invoice ${selectedRx.dispensedInvoice}` : "Approved and ready to dispense"}
                  </div>
                  <p className="text-[11px] text-blue-800">Verified by: {selectedRx.verifiedBy}{selectedRx.verifiedAt ? `, ${selectedRx.verifiedAt}` : ""}</p>
                  {selectedRx.pharmacistNotes && <p className="text-[11px] text-blue-700">Remarks: {selectedRx.pharmacistNotes}</p>}
                  {selectedRx.expiryDate && <p className="text-[11px] text-blue-700">Valid until {selectedRx.expiryDate}</p>}
                </div>
              )}

              {selectedRx.status === "Rejected" && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-0.5">
                  <div className="font-bold">Rejected{selectedRx.verifiedBy ? ` by ${selectedRx.verifiedBy}` : ""}</div>
                  {selectedRx.rejectionReason && <p className="text-[11px]">Reason: {selectedRx.rejectionReason}</p>}
                </div>
              )}

            </div>
          ) : (
            <div className="hidden lg:block bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-300" />
              <div className="font-bold text-slate-700">Select a Prescription to Review</div>
              <p className="text-xs text-slate-500">
                Click any prescription card on the left to inspect doctor credentials, dosage limits, and grant dispensing clearance.
              </p>
            </div>
          )}
        </div>

      </div>
      </>
      )}

      {/* New Prescription Modal */}
      <NewPrescriptionModal
        isOpen={isNewRxModalOpen}
        onClose={() => setIsNewRxModalOpen(false)}
        onSave={handleAddPrescription}
        customers={customers}
        medicines={medicines}
        doctors={doctors}
      />

    </div>
  );
}
