import React, { useState, useEffect } from 'react';
import { X, Package, ShieldAlert, DollarSign } from 'lucide-react';

export default function AddMedicineModal({ isOpen, onClose, onSave, medicineToEdit, suppliers }) {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    stock: 100,
    reorderLevel: 30,
    unitPrice: 50.0,
    batchNo: '',
    expiryDate: '2027-12-31',
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: 'SUP-01',
    supplierName: 'GlaxoSmithKline Pharmaceuticals'
  });

  useEffect(() => {
    if (medicineToEdit) {
      setFormData(medicineToEdit);
    } else {
      setFormData({
        name: '',
        genericName: '',
        category: 'Antibiotics',
        stock: 100,
        reorderLevel: 30,
        unitPrice: 50.0,
        batchNo: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: '2027-12-31',
        prescriptionRequired: false,
        controlledDrug: false,
        supplierId: suppliers[0]?.id || 'SUP-01',
        supplierName: suppliers[0]?.name || 'GlaxoSmithKline Pharmaceuticals'
      });
    }
  }, [medicineToEdit, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleSupplierChange = (e) => {
    const selectedSup = suppliers.find(s => s.id === e.target.value);
    setFormData({
      ...formData,
      supplierId: e.target.value,
      supplierName: selectedSup ? selectedSup.name : 'Unknown Supplier'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNo) {
      alert('Please fill in required medicine name and batch number.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-emerald-100 bg-emerald-50/70 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {medicineToEdit ? "Edit Medication Record" : "Add New Medication to Inventory"}
              </h3>
              <p className="text-xs text-slate-500">Epic 2 inventory catalogue management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
            <input 
              type="text"
              required
              placeholder="e.g. Amoxicillin 500mg Capsules"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Generic Scientific Name</label>
            <input 
              type="text"
              placeholder="e.g. Amoxicillin Trihydrate"
              value={formData.genericName}
              onChange={(e) => setFormData({...formData, genericName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Therapeutic Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Controlled Drugs">Controlled Drugs</option>
                <option value="Supplements">Supplements</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Price (LKR) *</label>
              <input 
                type="number"
                step="0.5"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Stock Quantity *</label>
              <input 
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reorder Threshold Alert</label>
              <input 
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-amber-700 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batch Number *</label>
              <input 
                type="text"
                required
                value={formData.batchNo}
                onChange={(e) => setFormData({...formData, batchNo: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input 
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Supplier</label>
            <select
              value={formData.supplierId}
              onChange={handleSupplierChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.leadTimeDays}d lead)</option>
              ))}
            </select>
          </div>

          {/* Regulatory Flags */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.prescriptionRequired}
                onChange={(e) => setFormData({...formData, prescriptionRequired: e.target.checked})}
                className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-bold text-slate-800">Requires Doctor Prescription for Dispensing</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-rose-800 font-bold">
              <input 
                type="checkbox"
                checked={formData.controlledDrug}
                onChange={(e) => setFormData({...formData, controlledDrug: e.target.checked})}
                className="rounded-md border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Controlled Dangerous Drug (Requires Pharmacist Verification & Safe Lock)</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
            >
              {medicineToEdit ? "Update Medicine" : "Add to Inventory"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
