import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { notify } from '../../lib/notify';
import { checkNewExpiry, minNewExpiry, MIN_EXPIRY_DAYS } from '../../lib/expiry';

const DEFAULT_CATEGORIES = ["Antibiotics", "Analgesics", "Cardiovascular", "Diabetes", "Respiratory", "Controlled Drugs", "Supplements"];

export default function AddMedicineModal({ isOpen, onClose, onSave, medicineToEdit, suppliers, categories = [] }) {
  const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories])).sort();
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    stock: 100,
    reorderLevel: 30,
    unitPrice: 50.0,
    batchNo: '',
    barcode: '',
    expiryDate: '2027-12-31',
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: '',
    supplierName: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (medicineToEdit) {
      setFormData({ ...medicineToEdit, barcode: medicineToEdit.barcode || '' });
    } else {
      setFormData({
        name: '',
        genericName: '',
        category: 'Antibiotics',
        stock: 100,
        reorderLevel: 30,
        unitPrice: 50.0,
        batchNo: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: '',
        expiryDate: '2027-12-31',
        prescriptionRequired: false,
        controlledDrug: false,
        supplierId: suppliers[0]?.id || '',
        supplierName: suppliers[0]?.name || ''
      });
    }
  }, [medicineToEdit, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleSupplierChange = (e) => {
    const selectedSup = suppliers.find(s => s.id === e.target.value);
    setFormData({
      ...formData,
      supplierId: e.target.value,
      supplierName: selectedSup ? selectedSup.name : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!formData.name || (!medicineToEdit && formData.stock > 0 && !formData.batchNo)) {
      notify("Details needed", "Please fill in the medicine name and batch number.", "error");
      return;
    }
    if (!String(formData.category || "").trim()) {
      notify("Details needed", "Choose or type a category.", "error");
      return;
    }
    if (!medicineToEdit) {
      const expiryError = checkNewExpiry(formData.expiryDate);
      if (expiryError) {
        notify("Check the expiry date", expiryError, "error");
        return;
      }
    }
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-blue-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-blue-100 bg-blue-50/70 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {medicineToEdit ? "Edit Medication Record" : "Add New Medication to Inventory"}
              </h3>
              <p className="text-xs text-slate-500">Pharmaceutical inventory catalogue management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Generic Scientific Name</label>
            <input 
              type="text"
              placeholder="e.g. Amoxicillin Trihydrate"
              value={formData.genericName}
              onChange={(e) => setFormData({...formData, genericName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Therapeutic Category</label>
              <input
                list="medicine-categories"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Pick or type a category"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
              <datalist id="medicine-categories">
                {categoryOptions.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Price (LKR) *</label>
              <input 
                type="number"
                step="0.5"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-blue-800 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Barcode</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Scan or type the pack barcode (optional)"
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            />
          </div>

          {medicineToEdit ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800">
                Stock: {medicineToEdit.stock} units in {medicineToEdit.batchCount || 0} batch{medicineToEdit.batchCount === 1 ? "" : "es"}
              </div>
              <p className="text-slate-500">Stock is kept by batch. Use the Batches button in the list to receive stock, count it, correct a batch or write off expired stock.</p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reorder Threshold Alert</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-amber-700 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
                />
              </div>
            </div>
          ) : (<>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Stock Quantity *</label>
              <input 
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reorder Threshold Alert</label>
              <input 
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-amber-700 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batch Number *</label>
              <input 
                type="text"
                required={formData.stock > 0}
                value={formData.batchNo}
                onChange={(e) => setFormData({...formData, batchNo: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input 
                type="date"
                required
                min={minNewExpiry()}
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
              />
              <p className="mt-1 text-xs text-slate-500">Must be more than {MIN_EXPIRY_DAYS} days from today.</p>
            </div>
          </div>
          </>)}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Supplier</label>
            <select
              value={formData.supplierId || ""}
              onChange={handleSupplierChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden"
            >
              <option value="">No supplier</option>
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
                className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {isSaving ? "Saving..." : medicineToEdit ? "Update Medicine" : "Add to Inventory"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
