import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, Stethoscope, CheckCircle2, AlertTriangle, Power } from 'lucide-react';
import DoctorModal from './DoctorModal';
import MetricCard from '../../components/MetricCard';
import { saveDoctor, deleteDoctor } from '../../services/supabaseService';
import { notify, notifyError, confirmDialog } from '../../lib/notify';
import { searchDoctors } from '../../lib/doctors';

// The doctor database. The owner adds, edits and deactivates doctors; pharmacists
// and cashiers can search it to check a doctor named on a prescription.
export default function DoctorDatabase({ doctors, setDoctors, canManage = false }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const results = useMemo(() => {
    const matched = searchDoctors(doctors, query);
    return statusFilter === "ALL" ? matched : matched.filter(d => d.status === statusFilter);
  }, [doctors, query, statusFilter]);

  const activeCount = doctors.filter(d => d.status === "Active").length;
  const linkedCount = doctors.reduce((sum, d) => sum + (d.prescriptionCount || 0), 0);

  const upsert = (saved) => setDoctors(prev => {
    const exists = prev.some(d => d.id === saved.id);
    const next = exists ? prev.map(d => (d.id === saved.id ? saved : d)) : [...prev, saved];
    return next.sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleSave = async (doctor) => {
    const { data, error } = await saveDoctor(doctor);
    if (error) {
      notifyError(error, "Doctor not saved");
      return false;
    }
    upsert(data);
    setIsModalOpen(false);
    setEditingDoctor(null);
    notify(doctor.id ? "Doctor updated" : "Doctor added", `${data.name} is saved as ${data.id}.`);
    return true;
  };

  const handleToggleStatus = async (doctor) => {
    const next = doctor.status === "Active" ? "Inactive" : "Active";
    if (next === "Inactive") {
      const ok = await confirmDialog({
        title: `Mark ${doctor.name} inactive?`,
        message: "Pharmacists won't be able to approve new prescriptions from this doctor. Past prescriptions stay linked.",
        confirmLabel: "Mark inactive",
        tone: "danger"
      });
      if (!ok) return;
    }
    const { data, error } = await saveDoctor({ ...doctor, status: next });
    if (error) {
      notifyError(error, "Status not changed");
      return;
    }
    upsert(data);
    notify(`${data.name} is now ${next.toLowerCase()}`);
  };

  const handleDelete = async (doctor) => {
    const ok = await confirmDialog({
      title: `Remove ${doctor.name}?`,
      message: "This deletes the record. Doctors linked to prescriptions can only be marked inactive.",
      confirmLabel: "Remove doctor",
      tone: "danger"
    });
    if (!ok) return;
    const { error } = await deleteDoctor(doctor.id);
    if (error) {
      notifyError(error, "Doctor not removed");
      return;
    }
    setDoctors(prev => prev.filter(d => d.id !== doctor.id));
    notify("Doctor removed", `${doctor.name} was removed from the doctor database.`);
  };

  return (
    <div className="space-y-5">
      <div className="metric-grid grid grid-cols-2 sm:grid-cols-3">
        <MetricCard title="Registered doctors" value={doctors.length} subtitle="In the doctor database" icon={Stethoscope} />
        <MetricCard title="Active" value={activeCount} subtitle="Prescriptions can be approved" icon={CheckCircle2} />
        <div className="col-span-2 sm:col-span-1">
          <MetricCard title="Linked prescriptions" value={linkedCount} subtitle="Checked against a doctor record" icon={Stethoscope} />
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Search doctors</span>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Check a doctor by name, SLMC number, ID or phone"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
          </label>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-hidden"
            >
              <option value="ALL">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {canManage && (
              <button
                onClick={() => { setEditingDoctor(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-medium text-sm shadow-md shadow-[#2563EB]/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add doctor</span>
              </button>
            )}
          </div>
        </div>

        {query.trim() && (
          results.length > 0 ? (
            <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              {results.length === 1 ? "1 doctor matches" : `${results.length} doctors match`} "{query.trim()}".
            </p>
          ) : (
            <p className="flex items-center gap-2 text-xs font-medium text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              No doctor matching "{query.trim()}" is in the doctor database.{canManage ? " Add them before approving their prescriptions." : " Ask the owner to add them before approving their prescriptions."}
            </p>
          )
        )}
        {!canManage && (
          <p className="text-[11px] text-slate-500">Only the owner can add or change doctor records.</p>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {results.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {doctors.length === 0 ? "No doctors yet." + (canManage ? " Add the doctors whose prescriptions you accept." : "") : "No doctors match this search."}
          </div>
        ) : (
          <table className="w-full text-left text-xs block md:table">
            <thead className="hidden md:table-header-group bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-5">Doctor</th>
                <th className="py-3.5 px-5">SLMC reg. no</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Prescriptions</th>
                {canManage && <th className="py-3.5 px-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100">
              {results.map(doctor => (
                <tr key={doctor.id} className="grid grid-cols-2 gap-x-3 gap-y-2.5 p-4 md:table-row md:p-0 hover:bg-slate-50/60">
                  <td className="col-span-2 md:py-4 md:px-5">
                    <div className="font-semibold text-slate-900 text-sm">{doctor.name}</div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-mono">{doctor.id}</span>
                      {(doctor.specialty || doctor.hospital) && <> · {[doctor.specialty, doctor.hospital].filter(Boolean).join(", ")}</>}
                    </div>
                  </td>
                  <td className="md:py-4 md:px-5">
                    <span className="font-mono font-semibold text-[#0B2545]">{doctor.slmcNo}</span>
                  </td>
                  <td className="justify-self-end md:justify-self-auto md:py-4 md:px-5">
                    <span className={`status-chip ${doctor.status === "Active" ? "status-chip-green" : "status-chip-gray"}`}>
                      {doctor.status}
                    </span>
                  </td>
                  <td className="col-span-2 row-start-3 md:py-4 md:px-5 space-y-1 min-w-0">
                    {doctor.phone && (
                      <a href={`tel:${doctor.phone}`} className="flex items-center text-slate-700 font-medium hover:text-[#2563EB]">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />{doctor.phone}
                      </a>
                    )}
                    {doctor.email && (
                      <div className="flex items-center text-slate-500 min-w-0">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" /><span className="truncate">{doctor.email}</span>
                      </div>
                    )}
                    {!doctor.phone && !doctor.email && <span className="text-slate-400">No contact details</span>}
                  </td>
                  <td className="self-center md:py-4 md:px-5 text-slate-600 tabular-nums">
                    {doctor.prescriptionCount || 0} linked
                  </td>
                  {canManage && (
                    <td className="md:py-4 md:px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingDoctor(doctor); setIsModalOpen(true); }}
                          title="Edit doctor"
                          aria-label={`Edit ${doctor.name}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(doctor)}
                          title={doctor.status === "Active" ? "Mark inactive" : "Mark active"}
                          aria-label={doctor.status === "Active" ? `Mark ${doctor.name} inactive` : `Mark ${doctor.name} active`}
                          className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        {!doctor.prescriptionCount && (
                          <button
                            onClick={() => handleDelete(doctor)}
                            title="Remove doctor"
                            aria-label={`Remove ${doctor.name}`}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDoctor(null); }}
        onSave={handleSave}
        doctorToEdit={editingDoctor}
      />
    </div>
  );
}
