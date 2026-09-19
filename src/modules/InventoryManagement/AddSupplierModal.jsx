import React, { useState, useEffect } from 'react';
import { X, Building, User, Mail, Phone, MapPin, Clock, Plus, Save } from 'lucide-react';

export default function AddSupplierModal({ 
  isOpen, 
  onClose, 
  onSave, 
  supplierToEdit = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: 3
  });

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name || '',
        contactPerson: supplierToEdit.contactPerson || '',
        email: supplierToEdit.email || '',
        phone: supplierToEdit.phone || '',
        address: supplierToEdit.address || '',
        leadTimeDays: supplierToEdit.leadTimeDays || 3
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        leadTimeDays: 3
      });
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'leadTimeDays' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...(supplierToEdit ? { id: supplierToEdit.id } : {}),
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      leadTimeDays: formData.leadTimeDays
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {supplierToEdit ? "Edit Wholesale Supplier" : "Add New Wholesale Supplier"}
              </h3>
              <p className="text-xs text-slate-500">
                {supplierToEdit ? "Update details for existing supplier" : "Register a new pharmaceutical supplier"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          
          {/* Supplier Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Supplier / Company Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input 
              type="text"
              name="name"
              required
              placeholder="e.g. State Pharmaceuticals Corporation (SPC)"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
            />
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Contact Person Name
              </label>
              <input 
                type="text"
                name="contactPerson"
                placeholder="e.g. Kamal Perera"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Phone Number
              </label>
              <input 
                type="text"
                name="phone"
                placeholder="e.g. +94 11 243 1845"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Email & Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Email Address
              </label>
              <input 
                type="email"
                name="email"
                placeholder="e.g. orders@supplier.lk"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Delivery Lead Time (Days)
              </label>
              <input 
                type="number"
                name="leadTimeDays"
                min="1"
                max="60"
                value={formData.leadTimeDays}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Office Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Office / Warehouse Address
            </label>
            <textarea
              name="address"
              rows="2"
              placeholder="e.g. 75 Sir Baron Jayatilaka Mawatha, Colombo 01"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {supplierToEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{supplierToEdit ? "Save Changes" : "Register Supplier"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
