import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
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
import { saveMedicine, deleteMedicine } from '../../services/supabaseService';
import { confirmDialog, notifyError } from '../../lib/notify';
import PageHeader from '../../components/PageHeader';
import MetricCard from '../../components/MetricCard';

export default function MedicineList({ 
  medicines, 
  setMedicines, 
  purchaseOrders, 
  setPurchaseOrders,
  suppliers,
  onSaveSupplier,
  onDeleteSupplier,
  canEdit = false,
  addAuditLog 
}) {
  const [selectedSubTab, setActiveSubTab] = useState("catalogue");
  // Read-only roles only see the catalogue; procurement screens need edit rights.
  const activeSubTab = canEdit ? selectedSubTab : "catalogue"; // "catalogue" | "purchase_orders" | "suppliers"
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

  // Returns true when saved, so the form stays open (with the user's input) on failure.
  const handleSaveMedicine = async (medData) => {
    if (!canEdit) return false;
    const payload = editingMedicine ? { ...medData, stockBefore: editingMedicine.stock } : medData;
    const { data, error } = await saveMedicine(payload);
    if (error) {
      notifyError(error, "Medicine not saved");
      return false;
    }
    if (editingMedicine) {
      setMedicines(prev => prev.map(m => m.id === data.id ? data : m));
      addAuditLog("Medicine Updated", `Updated record for ${data.name} (${data.code})`, "info");
    } else {
      setMedicines(prev => [data, ...prev]);
      addAuditLog("New Medicine Added", `Added ${data.name} (${data.code}) to catalogue`, "success");
    }
    setIsAddMedicineOpen(false);
    setEditingMedicine(null);
    return true;
  };

  const handleDeleteMedicine = async (med) => {
    if (!canEdit) return;
    const confirmed = await confirmDialog({
      title: `Discontinue ${med.name}?`,
      message: `This removes ${med.name} (${med.code}) from the catalogue. Past sales keep their records.`,
      confirmLabel: "Discontinue",
      tone: "danger"
    });
    if (!confirmed) return;
    const { error } = await deleteMedicine(med.id);
    if (error) {
      notifyError(error, "Medicine not removed");
      return;
    }
    setMedicines(prev => prev.filter(m => m.id !== med.id));
    addAuditLog("Medicine Discontinued", `Discontinued medication record: ${med.name} (${med.code})`, "warning");
  };

  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const ninetyDaysThreshold = new Date(Date.now() + 90 * 86400000);
  const expiredCount = medicines.filter(m => m.expiryDate && new Date(m.expiryDate) <= ninetyDaysThreshold).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      <PageHeader
        kicker="Inventory"
        title="Medicines and stock"
        description="Stock levels, batches, expiry alerts and purchase orders in one place."
      />

      {canEdit && (
      <nav aria-label="Inventory sections" className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("catalogue")}
            aria-current={activeSubTab === "catalogue" ? "page" : undefined}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeSubTab === "catalogue"
                ? "border-[#2563EB] text-[#0B2545]"
                : "border-transparent text-slate-500 hover:text-[#0B2545]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue</span>
            <span className="text-xs font-mono text-slate-400">{medicines.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("purchase_orders")}
            aria-current={activeSubTab === "purchase_orders" ? "page" : undefined}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeSubTab === "purchase_orders"
                ? "border-[#2563EB] text-[#0B2545]"
                : "border-transparent text-slate-500 hover:text-[#0B2545]"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Purchase orders</span>
            <span className="text-xs font-mono text-slate-400">{purchaseOrders.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("suppliers")}
            aria-current={activeSubTab === "suppliers" ? "page" : undefined}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeSubTab === "suppliers"
                ? "border-[#2563EB] text-[#0B2545]"
                : "border-transparent text-slate-500 hover:text-[#0B2545]"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Suppliers</span>
            <span className="text-xs font-mono text-slate-400">{suppliers.length}</span>
          </button>
      </nav>
      )}

      {activeSubTab === "suppliers" ? (
        <SupplierList
          suppliers={suppliers}
          medicines={medicines}
          purchaseOrders={purchaseOrders}
          onSaveSupplier={onSaveSupplier}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Catalogue items" value={medicines.length} subtitle="Tracked by batch and expiry" icon={Package} />
            <MetricCard title="Low stock" value={lowStockCount} subtitle="At or below reorder level" icon={AlertTriangle} badge="Reorder" colorScheme="amber" />
            <MetricCard title="Expiring within 90 days" value={expiredCount} subtitle="Flagged for inspection" icon={Clock} badge="Inspect" colorScheme="rose" />
            <MetricCard title="Controlled drugs" value={medicines.filter(m => m.controlledDrug).length} subtitle="Pharmacist sign-off required" icon={ShieldCheck} />
          </div>

          {/* Controls & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                placeholder="Search medicine name, code or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="LOW_STOCK">Low Stock Only</option>
                <option value="CONTROLLED">Controlled Drugs Only</option>
                <option value="EXPIRED">Near Expiry Only</option>
              </select>

              {canEdit && (
              <button
                onClick={() => { setEditingMedicine(null); setIsAddMedicineOpen(true); }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-2xl shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
              )}

            </div>

          </div>

          {/* Medicines Grid Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Medicine & Generic Info</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4">Unit Price (LKR)</th>
                    <th className="py-3.5 px-4">Batch & Expiry</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    {canEdit && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((med) => {
                    const isLowStock = med.stock <= med.reorderLevel;
                    const isNearExpiry = med.expiryDate && new Date(med.expiryDate) <= ninetyDaysThreshold;

                    return (
                      <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                        
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
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {med.genericName} <span className="font-mono text-slate-400">{med.code}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                            {med.category}
                          </span>
                        </td>

                        {/* Stock Level */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium text-sm whitespace-nowrap tabular-nums ${isLowStock ? "text-rose-600" : "text-slate-900"}`}>
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
                        <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap tabular-nums">
                          Rs. {(Number(med.unitPrice || med.unit_price || 0)).toFixed(2)}
                        </td>

                        {/* Batch & Expiry */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-mono whitespace-nowrap">{med.batchNo}</div>
                          <div className={`text-[11px] flex items-center whitespace-nowrap ${isNearExpiry ? "text-rose-600 font-bold" : "text-slate-500"}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            Exp: {med.expiryDate}
                          </div>
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">
                          {med.supplierName}
                        </td>

                        {/* Actions */}
                        {canEdit && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => { setEditingMedicine(med); setIsAddMedicineOpen(true); }}
                              title="Edit Medicine Record"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(med)}
                              title="Discontinue Product"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        )}

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
        onClose={() => { setIsAddMedicineOpen(false); setEditingMedicine(null); }}
        onSave={handleSaveMedicine}
        medicineToEdit={editingMedicine}
        suppliers={suppliers}
      />

    </div>
  );
}
