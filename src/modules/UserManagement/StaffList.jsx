import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Search, 
  Filter, 
  Clock, 
  Edit,
  Mail,
  Phone,
  UserCheck,
  Database
} from 'lucide-react';
import AddStaffModal from './AddStaffModal';
import { saveStaff, setStaffPassword, loadDemoData } from '../../services/supabaseService';
import { confirmDialog, promptDialog, notify, notifyError } from '../../lib/notify';
import PageHeader from '../../components/PageHeader';
import MetricCard from '../../components/MetricCard';

export default function StaffList({ staffList, setStaffList, currentUser, addAuditLog, onDataChanged }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleStaffStatus = async (id) => {
    const targetStaff = staffList.find(s => s.id === id);
    if (!targetStaff) return;
    const newStatus = targetStaff.status === "Active" ? "Inactive" : "Active";
    if (newStatus === "Inactive") {
      const confirmed = await confirmDialog({
        title: `Deactivate ${targetStaff.name}?`,
        message: "They are signed out straight away and can't sign in until reactivated.",
        confirmLabel: "Deactivate",
        tone: "danger"
      });
      if (!confirmed) return;
    }
    const { data, error } = await saveStaff({ ...targetStaff, status: newStatus });
    if (error) {
      notifyError(error, "Account not updated");
      return;
    }
    setStaffList(prev => prev.map(s => s.id === id ? data : s));
    addAuditLog(
      `Staff Account ${newStatus === "Active" ? "Activated" : "Deactivated"}`,
      `Account for ${data.name} (${data.username}) was set to ${newStatus}`,
      newStatus === "Active" ? "success" : "warning"
    );
  };

  const handleResetPassword = async (staff) => {
    const password = await promptDialog({
      title: `Set a new password for ${staff.name}`,
      message: "They are signed out everywhere and must use the new password. Share it with them in person.",
      label: "New password",
      inputType: "text",
      minLength: 8,
      confirmLabel: "Set password"
    });
    if (!password) return;
    const { error } = await setStaffPassword(staff.id, password);
    if (error) {
      notifyError(error, "Password not changed");
      return;
    }
    notify("Password changed", `${staff.name} can now sign in with the new password.`);
    addAuditLog("Password Reset", `Owner set a new password for ${staff.username}`, "info");
  };

  // Adds a ready-made data set for the final demo. Existing records are never changed.
  const handleLoadDemoData = async () => {
    const confirmed = await confirmDialog({
      title: "Load demo data?",
      message: "Adds demo medicines (one low on stock, one close to expiry, Rx-only and controlled), two customers, a doctor, an approved and a pending prescription, and two weeks of past sales. Nothing you already have is changed.",
      confirmLabel: "Load demo data"
    });
    if (!confirmed) return;
    setIsLoadingDemo(true);
    const { data, error } = await loadDemoData();
    setIsLoadingDemo(false);
    if (error) {
      notifyError(error, "Demo data not loaded");
      return;
    }
    await onDataChanged?.();
    if (data.medicines === 0 && data.sales === 0) {
      notify("Demo data already loaded", "Everything from the demo set is already in the system.", "info");
    } else {
      notify("Demo data loaded", `Added ${data.medicines} medicines and ${data.sales} past sales. Customer Nimal Perera has an approved prescription ready for the POS.`);
    }
  };

  // Returns true when saved, so the form keeps the user's input on failure.
  const handleSaveStaff = async (staffData) => {
    const { password, ...fields } = staffData;
    const { data, error } = await saveStaff(editingStaff ? { ...fields, id: editingStaff.id } : fields, password);
    if (error) {
      notifyError(error, "Staff account not saved");
      return false;
    }
    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === data.id ? data : s));
      addAuditLog("Staff Account Updated", `Updated role and permissions for ${data.name}`, "info");
    } else {
      setStaffList(prev => [data, ...prev]);
      addAuditLog("New Staff Account Created", `Created new ${data.role} account for ${data.name}`, "success");
    }
    setIsAddModalOpen(false);
    setEditingStaff(null);
    return true;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <PageHeader
        kicker="Settings"
        title="Staff and access"
        description="Roles, account status and permissions for everyone who uses the console."
      >
        <button
          onClick={handleLoadDemoData}
          disabled={isLoadingDemo}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 border border-slate-300 rounded-xl font-medium text-sm shrink-0"
        >
          <Database className="w-4 h-4" />
          <span>{isLoadingDemo ? "Loading demo data" : "Load demo data"}</span>
        </button>
        <button
          onClick={() => { setEditingStaff(null); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-medium text-sm shadow-md shadow-[#2563EB]/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add staff member</span>
        </button>
      </PageHeader>

      {/* Quick Role Stats Cards */}
      <div className="metric-grid grid grid-cols-2 sm:grid-cols-3">
        <MetricCard title="Staff accounts" value={staffList.length} subtitle="Everyone with console access" icon={Users} />
        <MetricCard title="Active accounts" value={staffList.filter(s => s.status === "Active").length} subtitle="Ready for the current shift" icon={UserCheck} />
        <div className="col-span-2 sm:col-span-1">
          <MetricCard title="Average provisioning time" value="1.5 min" subtitle="Target under 2 minutes" icon={ShieldCheck} badge="On target" colorScheme="sky" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-bold">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
          >
            <option value="ALL">All Roles</option>
            <option value="Owner/Admin">Owner / Admin</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Cashier">Cashier</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs block md:table">
            <thead className="hidden md:table-header-group bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px] font-semibold">
              <tr>
                <th className="py-4 px-5">Staff Member</th>
                <th className="py-4 px-5">Assigned Role</th>
                <th className="py-4 px-5">Contact Details</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5">Last Activity</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="grid grid-cols-2 gap-x-3 gap-y-3 p-4 md:table-row md:p-0 hover:bg-blue-50/40 transition-colors">
                  
                  {/* Name & ID */}
                  <td className="col-span-2 md:py-4 md:px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] font-semibold flex items-center justify-center text-xs shadow-md shadow-blue-500/15 shrink-0">
                        {staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm leading-snug">{staff.name}</div>
                        <div className="text-[11.5px] text-slate-400 font-mono">@{staff.username} • {staff.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="md:py-4 md:px-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl font-semibold text-xs border ${
                      staff.role === "Owner/Admin" 
                        ? "bg-slate-100 text-[#0B2545] border-slate-300"
                        : staff.role === "Pharmacist"
                        ? "bg-blue-50 text-blue-900 border-blue-200"
                        : "bg-blue-50 text-blue-900 border-blue-200"
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      {staff.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="col-span-2 row-start-3 md:py-4 md:px-5 space-y-1 min-w-0">
                    <div className="flex items-center text-slate-700 font-medium">
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center text-slate-500 font-medium">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span>{staff.phone}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="justify-self-end md:justify-self-auto md:py-4 md:px-5">
                    <button
                      onClick={() => toggleStaffStatus(staff.id)}
                      disabled={staff.id === currentUser?.id}
                      title={staff.id === currentUser?.id ? "You can't deactivate your own account" : "Change account status"}
                      className={`disabled:cursor-not-allowed disabled:opacity-70 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        staff.status === "Active" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300"
                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${staff.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {staff.status}
                    </button>
                  </td>

                  {/* Last Active */}
                  <td className="self-center md:py-4 md:px-5 text-slate-600 font-medium">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {staff.lastActive}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="md:py-4 md:px-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleResetPassword(staff)}
                        title="Reset Password"
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingStaff(staff); setIsAddModalOpen(true); }}
                        title="Edit Role & Permissions"
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <AddStaffModal 
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingStaff(null); }}
        onSave={handleSaveStaff}
        staffToEdit={editingStaff}
      />

    </div>
  );
}
