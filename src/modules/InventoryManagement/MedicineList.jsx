import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Edit, 
  Trash2, 
  Truck, 
  CheckCircle,
  FileCheck,
  Building
} from 'lucide-react';
import AddMedicineModal from './AddMedicineModal';
import PurchaseOrders from './PurchaseOrders';
import SupplierList from './SupplierList';
import { createMedicine, updateMedicine, deleteMedicine } from '../../services/supabaseService';

export default function MedicineList({ 
  medicines, 
  setMedicines, 
  purchaseOrders, 
  setPurchaseOrders,
  suppliers,
  setSuppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  addAuditLog 
}) {
  const [activeSubTab, setActiveSubTab] = useState("catalogue"); // "catalogue" | "purchase_orders" | "suppliers"
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Filter catalogue
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || m.category === categoryFilter;
    
    let matchesStatus = true;
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 86400000);
    if (statusFilter === "LOW_STOCK") matchesStatus = m.stock <= m.reorderLevel;
    if (statusFilter === "CONTROLLED") matchesStatus = m.controlledDrug;
    if (statusFilter === "EXPIRED") matchesStatus = m.expiryDate && new Date(m.expiryDate) <= ninetyDaysFromNow;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(medicines.map(m => m.category)));

  const handleSaveMedicine = async (medData) => {
    if (editingMedicine) {
      setMedicines(prev => prev.map(m => m.id === medData.id ? medData : m));
      const { data, error } = await updateMedicine(medData.id, medData);
      if (error) {
        console.error("Error updating medicine in DB:", error);
      } else if (data && data.length > 0) {
        const saved = data[0];
        setMedicines(prev => prev.map(m => m.id === medData.id ? { ...m, ...saved } : m));
      }
      addAuditLog("Medicine Updated", `Updated record for ${medData.name} (${medData.code})`, "info");
    } else {
      const newMed = {
        ...medData,
        id: `MED-${Math.floor(200 + Math.random() * 800)}`,
        code: medData.code || `MED-${(medData.name || 'DRG').substring(0,3).toUpperCase()}${Math.floor(100 + Math.random()*800)}`
      };
      setMedicines(prev => [newMed, ...prev]);
      const { data, error } = await createMedicine(newMed);
      if (error) {
        console.error("Error creating medicine in DB:", error);
      } else if (data && data.length > 0) {
        const saved = data[0];
        setMedicines(prev => prev.map(m => m.id === newMed.id ? { ...m, id: saved.id || m.id } : m));
      }
      addAuditLog("New Medicine Added", `Added ${newMed.name} to catalogue`, "success");
    }
    setIsAddMedicineOpen(false);
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = async (id, name, code) => {
    if (window.confirm(`Are you sure you want to discontinue ${name}?`)) {
      setMedicines(prev => prev.filter(m => 
        String(m.id).toLowerCase() !== String(id).toLowerCase() && 
        (!code || String(m.code).toLowerCase() !== String(code).toLowerCase()) &&
        (!name || String(m.name).toLowerCase() !== String(name).toLowerCase())
      ));
      await deleteMedicine(id, code, name);
      addAuditLog("Medicine Discontinued", `Discontinued medication record: ${name}`, "warning");
    }
  };

  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const ninetyDaysThreshold = new Date(Date.now() + 90 * 86400000);
  const expiredCount = medicines.filter(m => m.expiryDate && new Date(m.expiryDate) <= ninetyDaysThreshold).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 depth-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative">
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold shadow-sm shadow-sky-500/30">
              Inventory Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gradient-brand">
            Medicine Catalogue & Inventory Management
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time stock level monitoring, batch tracking, expiry date alerts, and purchase order workflow.
          </p>
        </div>

        {/* Sub-tab buttons */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0 relative">
          <button
            onClick={() => setActiveSubTab("catalogue")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeSubTab === "catalogue"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Medicine Catalogue ({medicines.length})
          </button>

          <button
            onClick={() => setActiveSubTab("purchase_orders")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === "purchase_orders"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("suppliers")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === "suppliers"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Suppliers ({suppliers.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === "suppliers" ? (
        <SupplierList
          suppliers={suppliers}
          setSuppliers={setSuppliers}
          medicines={medicines}
          purchaseOrders={purchaseOrders}
          onAddSupplier={onAddSupplier}
          onUpdateSupplier={onUpdateSupplier}
          onDeleteSupplier={onDeleteSupplier}
          addAuditLog={addAuditLog}
        />
      ) : activeSubTab === "purchase_orders" ? (
        <PurchaseOrders 
          purchaseOrders={purchaseOrders}
          setPurchaseOrders={setPurchaseOrders}
          medicines={medicines}
          setMedicines={setMedicines}
          suppliers={suppliers}
          addAuditLog={addAuditLog}
        />
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 depth-card hover:-translate-y-1 transition-all">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Catalogue Items</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{medicines.length}</div>
              <span className="text-xs text-sky-700 font-extrabold mt-1 block">100% Digital Tracking</span>
            </div>

            <div className="bg-amber-50/40 p-5 rounded-3xl border border-amber-200/90 depth-card hover:-translate-y-1 transition-all">
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-amber-600" />
                Low Stock Threshold
              </span>
              <div className="text-3xl font-black text-amber-700 mt-1">{lowStockCount}</div>
              <span className="text-xs text-amber-800 font-bold mt-1 block">Reorder recommended</span>
            </div>

            <div className="bg-rose-50/40 p-5 rounded-3xl border border-rose-200/90 depth-card hover:-translate-y-1 transition-all">
              <span className="text-xs text-rose-800 font-bold uppercase tracking-wider flex items-center">
                <Clock className="w-4 h-4 mr-1 text-rose-600" />
                Expiring Medicine Risk
              </span>
              <div className="text-3xl font-black text-rose-700 mt-1">{expiredCount}</div>
              <span className="text-xs text-rose-800 font-bold mt-1 block">Flagged for inspection</span>
            </div>

            <div className="bg-sky-50/40 p-5 rounded-3xl border border-sky-200/90 depth-card hover:-translate-y-1 transition-all">
              <span className="text-xs text-sky-800 font-bold uppercase tracking-wider">Controlled Drugs</span>
              <div className="text-3xl font-black text-sky-800 mt-1">
                {medicines.filter(m => m.controlledDrug).length}
              </div>
              <span className="text-xs text-sky-700 font-bold mt-1 block">Strict Verification</span>
            </div>
          </div>

          {/* Controls & Search */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                placeholder="Search medicine name, code or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white/70 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden transition-all"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white/70 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-hidden transition-all"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="LOW_STOCK">Low Stock Only</option>
                <option value="CONTROLLED">Controlled Drugs Only</option>
                <option value="EXPIRED">Near Expiry Only</option>
              </select>

              <button
                onClick={() => { setEditingMedicine(null); setIsAddMedicineOpen(true); }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-500/30 cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>

            </div>

          </div>

          {/* Medicines Grid Table */}
          <div className="bg-white rounded-3xl border border-slate-200 depth-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4">Medicine & Generic Info</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4">Unit Price (LKR)</th>
                    <th className="py-3.5 px-4">Batch & Expiry</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((med, idx) => {
                    const isLowStock = med.stock <= med.reorderLevel;
                    const isNearExpiry = med.expiryDate && new Date(med.expiryDate) <= ninetyDaysThreshold;

                    return (
                      <tr key={med.id} className={`hover:bg-sky-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                        
                        {/* Name & Generic */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center space-x-2">
                            <span>{med.name}</span>
                            {med.controlledDrug && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                Controlled Drug
                              </span>
                            )}
                            {med.prescriptionRequired && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Rx Req
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            {med.genericName} • {med.code}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {med.category}
                          </span>
                        </td>

                        {/* Stock Level */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-black text-sm ${isLowStock ? "text-rose-600" : "text-sky-700"}`}>
                              {med.stock} units
                            </span>
                            {isLowStock && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-0.5" /> Reorder ({med.reorderLevel})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          Rs. {(Number(med.unitPrice || med.unit_price || 0)).toFixed(2)}
                        </td>

                        {/* Batch & Expiry */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-mono font-semibold">{med.batchNo}</div>
                          <div className={`text-[11px] flex items-center ${isNearExpiry ? "text-rose-600 font-bold" : "text-slate-500"}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            Exp: {med.expiryDate}
                          </div>
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">
                          {med.supplierName}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => { setEditingMedicine(med); setIsAddMedicineOpen(true); }}
                              title="Edit Medicine Record"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 hover:scale-110 transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(med.id, med.name, med.code)}
                              title="Discontinue Product"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 hover:scale-110 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineOpen}
        onClose={() => setIsAddMedicineOpen(false)}
        onSave={handleSaveMedicine}
        medicineToEdit={editingMedicine}
        suppliers={suppliers}
      />

    </div>
  );
}
