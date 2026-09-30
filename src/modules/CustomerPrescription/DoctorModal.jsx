import React, { useEffect, useState } from 'react';
import { X, Stethoscope } from 'lucide-react';

const EMPTY = { name: "", slmcNo: "", specialty: "", hospital: "", phone: "", email: "", notes: "", status: "Active" };

const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";

function Field({ label, required, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-slate-700">{label}{required && " *"}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

// Add or edit one doctor in the doctor database (owner only).
export default function DoctorModal({ isOpen, onClose, onSave, doctorToEdit = null }) {
  const [form, setForm] = useState(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(doctorToEdit ? {
      name: doctorToEdit.name || "",
      slmcNo: doctorToEdit.slmcNo || "",
      specialty: doctorToEdit.specialty || "",
      hospital: doctorToEdit.hospital || "",
      phone: doctorToEdit.phone || "",
      email: doctorToEdit.email || "",
      notes: doctorToEdit.notes || "",
      status: doctorToEdit.status || "Active"
    } : EMPTY);
    setIsSaving(false);
  }, [isOpen, doctorToEdit]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const saved = await onSave({
      ...(doctorToEdit ? { id: doctorToEdit.id } : {}),
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v).trim()]))
    });
    if (!saved) setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-modal-title"
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4"
      >
        <div className="flex justify-between items-start gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </span>
            <div>
              <h3 id="doctor-modal-title" className="text-base font-semibold text-[#0B2545]">
                {doctorToEdit ? `Edit ${doctorToEdit.id}` : "Add a doctor"}
              </h3>
              <p className="text-xs text-slate-500">
                Pharmacists check prescriptions against these records.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Doctor name" required>
            <input required value={form.name} onChange={set("name")} placeholder="e.g. Dr. A. Perera" className={inputClass} />
          </Field>
          <Field label="SLMC registration number" required hint="Must be unique.">
            <input required value={form.slmcNo} onChange={set("slmcNo")} placeholder="e.g. SLMC-10234" className={`${inputClass} font-mono uppercase`} />
          </Field>
          <Field label="Specialty">
            <input value={form.specialty} onChange={set("specialty")} placeholder="e.g. General Practitioner" className={inputClass} />
          </Field>
          <Field label="Hospital or clinic">
            <input value={form.hospital} onChange={set("hospital")} placeholder="e.g. City Medical Centre" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="e.g. 0712345678" className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set("email")} placeholder="Optional" className={inputClass} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Other details, such as channelling days" className={inputClass} />
        </Field>

        <Field label="Status" hint="Prescriptions from inactive doctors can't be approved.">
          <select value={form.status} onChange={set("status")} className={inputClass}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2563EB]/20">
            {isSaving ? "Saving..." : doctorToEdit ? "Save changes" : "Add doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}
