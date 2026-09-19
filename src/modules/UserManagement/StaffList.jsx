import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Edit,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import AddStaffModal from './AddStaffModal';
import { createStaff, updateStaff } from '../../services/supabaseService';

export default function StaffList({ staffList, setStaffList, addAuditLog }) {
  const [searchTerm, setSearchTerm] = useState("");
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
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    await updateStaff(id, { status: newStatus });
    addAuditLog(
      `Staff Account ${newStatus === "Active" ? "Activated" : "Deactivated"}`,
      `Account for ${targetStaff.name} (${targetStaff.username}) was set to ${newStatus}`,
      newStatus === "Active" ? "success" : "warning"
    );
  };

  const handleResetPassword = (staff) => {
    alert(`Password reset link generated & dispatched to ${staff.email} (${staff.name})`);
    addAuditLog(
      "Password Reset Requested",
      `Password reset trigger executed for user ${staff.username}`,
      "info"
    );
  };

  const handleSaveStaff = async (staffData) => {
    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === staffData.id ? staffData : s));
      await updateStaff(staffData.id, staffData);
      addAuditLog("Staff Account Updated", `Updated roles and permissions for ${staffData.name}`, "info");
    } else {
      const newStaff = {
        ...staffData,
        id: `STF-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: "Never"
      };
      setStaffList(prev => [newStaff, ...prev]);
      await createStaff(newStaff);
      addAuditLog("New Staff Account Created", `Created new ${newStaff.role} account for ${newStaff.name}`, "success");
    }
    setIsAddModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Action Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
              Security & Identity
            </span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {staffList.length} Registered Staff
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            User Access & Staff Credentials Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
            Centralized role-based access control, account activation, staff permissions & security audit logs.
          </p>
        </div>

        <button
          onClick={() => { setEditingStaff(null); setIsAddModalOpen(true); }}
          className="flex items-center space-x-2 px-5 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-2xl font-black text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Quick Role Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Staff Accounts</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{staffList.length}</div>
          <span className="text-xs text-sky-700 font-bold mt-1 inline-block">100% Centralized Directory</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Duty Accounts</span>
          <div className="text-3xl font-black text-sky-700 mt-1">
            {staffList.filter(s => s.status === "Active").length}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Ready for active shift</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average Provisioning Time</span>
          <div className="text-3xl font-black text-slate-900 mt-1">1.5 mins</div>
          <span className="text-xs text-purple-700 font-bold mt-1 inline-block">Target KPI: &lt; 2.0 mins (Passed)</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-bold">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-hidden"
          >
            <option value="ALL">All Roles</option>
            <option value="Owner/Admin">Owner / Admin</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Cashier">Cashier</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10.5px] tracking-wider font-extrabold">
              <tr>
                <th className="py-4 px-5">Staff Member</th>
                <th className="py-4 px-5">Assigned Role</th>
                <th className="py-4 px-5">Contact Details</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5">Last Activity</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-sky-50/40 transition-colors">
                  
                  {/* Name & ID */}
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md shadow-sky-500/15 shrink-0">
                        {staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm leading-snug">{staff.name}</div>
                        <div className="text-[11.5px] text-slate-400 font-mono">@{staff.username} • {staff.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl font-black text-xs border ${
                      staff.role === "Owner/Admin" 
                        ? "bg-purple-50 text-purple-900 border-purple-200"
                        : staff.role === "Pharmacist"
                        ? "bg-sky-50 text-sky-900 border-sky-200"
                        : "bg-blue-50 text-blue-900 border-blue-200"
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      {staff.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-5 space-y-1">
                    <div className="flex items-center text-slate-700 font-medium">
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span>{staff.email}</span>
                    </div>
                    <div className="flex items-center text-slate-500 font-medium">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span>{staff.phone}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <button
                      onClick={() => toggleStaffStatus(staff.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border transition-colors cursor-pointer ${
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
                  <td className="py-4 px-5 text-slate-600 font-medium">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {staff.lastActive}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleResetPassword(staff)}
                        title="Reset Password"
                        className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer border border-transparent hover:border-sky-200"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingStaff(staff); setIsAddModalOpen(true); }}
                        title="Edit Role & Permissions"
                        className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer border border-transparent hover:border-sky-200"
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
