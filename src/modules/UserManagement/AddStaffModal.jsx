import React, { useState, useEffect } from 'react';
import { X, User, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';

export default function AddStaffModal({ isOpen, onClose, onSave, staffToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'Pharmacist',
    email: '',
    phone: '',
    status: 'Active',
    permissions: ['inventory_view', 'pos_checkout']
  });

  useEffect(() => {
    if (staffToEdit) {
      setFormData(staffToEdit);
    } else {
      setFormData({
        name: '',
        username: '',
        role: 'Pharmacist',
        email: '',
        phone: '',
        status: 'Active',
        permissions: ['inventory_view', 'pos_checkout']
      });
    }
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave(formData);
  };

  const allPermissions = [
    { key: 'user_management', label: 'User Management & Roles' },
    { key: 'inventory_full', label: 'Inventory Catalogue & Stock Adjustment' },
    { key: 'prescription_approve', label: 'Prescription Verification & Approval' },
    { key: 'pos_checkout', label: 'POS Counter & Checkout' },
    { key: 'reports_access', label: 'Financial & Business Analytics Reports' },
    { key: 'void_refund', label: 'Authorize Sales Void & Refunds' }
  ];

  const togglePermission = (permKey) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permKey);
      return {
        ...prev,
        permissions: exists 
          ? prev.permissions.filter(p => p !== permKey)
          : [...prev.permissions, permKey]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-sky-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-sky-100 bg-sky-50/70 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-sky-600 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {staffToEdit ? "Edit Staff Account" : "Register New Staff Account"}
              </h3>
              <p className="text-xs text-slate-500">Assign role permissions and credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input 
              type="text"
              required
              placeholder="e.g. Dr. K. A. Perera"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username *</label>
              <input 
                type="text"
                required
                placeholder="e.g. perera_k"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-hidden"
              >
                <option value="Owner/Admin">Owner / Admin</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input 
                type="email"
                required
                placeholder="staff@pharmart.lk"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input 
                type="text"
                placeholder="+94 77 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Permissions Matrix */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">Granular Role Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {allPermissions.map((p) => {
                const checked = formData.permissions.includes(p.key);
                return (
                  <label key={p.key} className="flex items-center space-x-2 cursor-pointer text-[11px] font-medium text-slate-700">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(p.key)}
                      className="rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {staffToEdit ? "Update Account" : "Create Staff Account"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
