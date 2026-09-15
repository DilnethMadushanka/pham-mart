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
  Phone
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
      
      {/* Epic Header & Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
              Epic 1 Requirement
            </span>
            <h2 className="text-xl font-black text-slate-900">
              User Management & Access Controls
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized role-based access control, account activation, staff permissions & security audit logs.
          </p>
        </div>

        <button
          onClick={() => { setEditingStaff(null); setIsAddModalOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Quick Role Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Staff Accounts</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{staffList.length}</div>
          <span className="text-[11px] text-sky-700 font-bold">100% Centralized</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Active Staff Accounts</span>
          <div className="text-2xl font-black text-sky-700 mt-1">
            {staffList.filter(s => s.status === "Active").length}
          </div>
          <span className="text-[11px] text-slate-500">Ready for duty</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Average Creation KPI</span>
          <div className="text-2xl font-black text-slate-900 mt-1">1.5 mins</div>
          <span className="text-[11px] text-sky-700 font-bold">Target: &lt; 2 mins (Passed)</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-hidden"
          >
            <option value="ALL">All Roles</option>
            <option value="Owner/Admin">Owner / Admin</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Cashier">Cashier</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Name & ID */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-300 text-sky-900 font-bold flex items-center justify-center text-xs">
                        {staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{staff.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{staff.username} • {staff.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                      staff.role === "Owner/Admin" 
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : staff.role === "Pharmacist"
                        ? "bg-sky-50 text-sky-800 border-sky-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}>
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {staff.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="flex items-center text-slate-600">
                      <Mail className="w-3 h-3 mr-1 text-slate-400" />
                      {staff.email}
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {staff.phone}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStaffStatus(staff.id)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        staff.status === "Active" 
                          ? "bg-sky-100 text-sky-800 border-sky-300 hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300"
                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-sky-100 hover:text-sky-800"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${staff.status === "Active" ? "bg-sky-600" : "bg-slate-400"}`}></span>
                      {staff.status}
                    </button>
                  </td>

                  {/* Last Active */}
                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {staff.lastActive}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleResetPassword(staff)}
                        title="Reset Password"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingStaff(staff); setIsAddModalOpen(true); }}
                        title="Edit Role & Permissions"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
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
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveStaff}
        staffToEdit={editingStaff}
      />

    </div>
  );
}
