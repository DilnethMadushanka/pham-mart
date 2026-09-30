import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Edit,
  Trash2,
  Truck,
  Building,
  TrendingDown,
  ArrowRight,
  Layers,
  CalendarX,
  ScanBarcode
} from 'lucide-react';
import AddMedicineModal from './AddMedicineModal';
import PurchaseOrders from './PurchaseOrders';
import SupplierList from './SupplierList';
import ReorderSuggestions from './ReorderSuggestions';
import ExpiryTracking from './ExpiryTracking';
import BatchesModal from './BatchesModal';
import { expiryAlerts, expiryStatus, EXPIRY_LABEL } from '../../lib/expiry';
import { buildReorderSuggestions } from '../../lib/reorder';
import { saveMedicine, deleteMedicine, loadData } from '../../services/supabaseService';
import { confirmDialog, notifyError } from '../../lib/notify';
import PageHeader from '../../components/PageHeader';
import MetricCard from '../../components/MetricCard';

export default function MedicineList({ 
  medicines, 
  setMedicines, 
  purchaseOrders, 
  setPurchaseOrders,
  suppliers,
  setSuppliers,
  onSaveSupplier,
  onDeleteSupplier,
  batches = [],
  setBatches,
  stockMovements = [],
  setStockMovements,
  canApproveOrders = false,
  transactions = [],
  focusSection = null,
  onFocusHandled,
  canEdit = false,
  addAuditLog 
}) {
  const [selectedSubTab, setActiveSubTab] = useState("catalogue");

  // Another screen (for example the notifications) can open a section directly.
  useEffect(() => {
    if (!focusSection) return;
    setActiveSubTab(focusSection);
    onFocusHandled?.();
  }, [focusSection, onFocusHandled]);

  const reorderSuggestions = useMemo(
    () => buildReorderSuggestions({ medicines, transactions, purchaseOrders, suppliers }),
    [medicines, transactions, purchaseOrders, suppliers]
  );
  const toReorder = reorderSuggestions.filter(s => s.openOrders.length === 0).length;
  // Read-only roles only see the catalogue; procurement screens need edit rights.
  const activeSubTab = canEdit ? selectedSubTab : "catalogue"; // "catalogue" | "reorder" | "expiry" | "purchase_orders" | "suppliers"
  const alerts = useMemo(() => expiryAlerts(batches, medicines), [batches, medicines]);
  const [batchesFor, setBatchesFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Filter catalogue. Search covers name, generic name, code, barcode and every batch number.
  const warnedIds = new Set(alerts.map(a => a.medicineId));
  const term = searchTerm.trim().toLowerCase();
  const compactTerm = term.replace(/\s/g, "");
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = !term ||
      m.name.toLowerCase().includes(term) ||
      (m.genericName || "").toLowerCase().includes(term) ||
      (m.code || "").toLowerCase().includes(term) ||
      (compactTerm && (m.barcode || "").toLowerCase().includes(compactTerm)) ||
      (m.batchNo || "").toLowerCase().includes(term) ||
      batches.some(b => b.medicineId === m.id && b.batchNo.toLowerCase().includes(term));
    const matchesCategory = categoryFilter === "ALL" || m.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "LOW_STOCK") matchesStatus = m.stock <= m.reorderLevel;
    if (statusFilter === "OUT") matchesStatus = (m.sellableStock ?? m.stock) <= 0;
    if (statusFilter === "CONTROLLED") matchesStatus = m.controlledDrug;
    if (statusFilter === "EXPIRED") matchesStatus = (m.expiredStock || 0) > 0;
    if (statusFilter === "NEAR_EXPIRY") matchesStatus = warnedIds.has(m.id);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // A barcode scanner types the code and presses Enter: open that medicine's batches.
  const handleSearchKey = (e) => {
    if (e.key !== "Enter" || !compactTerm) return;
    const exact = medicines.find(m => (m.barcode || "").toLowerCase() === compactTerm || (m.code || "").toLowerCase() === compactTerm);
    if (exact) setBatchesFor(exact);
  };

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
    // Opening stock and stock corrections are booked into batches on the server.
    const fresh = await loadData(['medicine_batches', 'stock_movements']);
    if (fresh.data) {
      setBatches?.(fresh.data.medicine_batches || []);
      setStockMovements?.(fresh.data.stock_movements || []);
    }
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
  const expiredCount = alerts.length;
  const batchSetters = { setMedicines, setBatches, setStockMovements };

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
            onClick={() => setActiveSubTab("reorder")}
            aria-current={activeSubTab === "reorder" ? "page" : undefined}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeSubTab === "reorder"
                ? "border-[#2563EB] text-[#0B2545]"
                : "border-transparent text-slate-500 hover:text-[#0B2545]"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Reorder suggestions</span>
            {toReorder > 0 ? (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold font-mono flex items-center justify-center">{toReorder}</span>
            ) : (
              <span className="text-xs font-mono text-slate-400">0</span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("expiry")}
            aria-current={activeSubTab === "expiry" ? "page" : undefined}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeSubTab === "expiry"
                ? "border-[#2563EB] text-[#0B2545]"
                : "border-transparent text-slate-500 hover:text-[#0B2545]"
            }`}
          >
            <CalendarX className="w-4 h-4" />
            <span>Expiry tracking</span>
            {alerts.length > 0 ? (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold font-mono flex items-center justify-center">{alerts.length}</span>
            ) : (
              <span className="text-xs font-mono text-slate-400">0</span>
            )}
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

      {activeSubTab === "expiry" ? (
        <ExpiryTracking
          medicines={medicines}
          batches={batches}
          canEdit={canEdit}
          onOpenBatches={setBatchesFor}
          {...batchSetters}
        />
      ) : activeSubTab === "reorder" ? (
        <ReorderSuggestions
          medicines={medicines}
          transactions={transactions}
          purchaseOrders={purchaseOrders}
          setPurchaseOrders={setPurchaseOrders}
          suppliers={suppliers}
          addAuditLog={addAuditLog}
          onViewOrders={() => setActiveSubTab("purchase_orders")}
        />
      ) : activeSubTab === "suppliers" ? (
        <SupplierList
          suppliers={suppliers}
          setSuppliers={setSuppliers}
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
          setBatches={setBatches}
          setStockMovements={setStockMovements}
          suppliers={suppliers}
          transactions={transactions}
          canApprove={canApproveOrders}
        />
      ) : (
        <>
          {toReorder > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {toReorder === 1 ? "1 medicine needs reordering" : `${toReorder} medicines need reordering`}
                  </p>
                  <p className="text-xs text-amber-800">
                    {reorderSuggestions.filter(s => s.openOrders.length === 0).slice(0, 3).map(s => s.medicine.name).join(", ")}
                    {toReorder > 3 ? ` and ${toReorder - 3} more` : ""}
                    {canEdit ? "" : ". Let a pharmacist or the owner know."}
                  </p>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => setActiveSubTab("reorder")}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-xl text-sm font-medium hover:bg-amber-100 shrink-0"
                >
                  View suggestions <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard title="Catalogue items" value={medicines.length} subtitle="Tracked by batch and expiry" icon={Package} />
            <MetricCard title="Low stock" value={lowStockCount} subtitle="At or below reorder level" icon={AlertTriangle} badge="Reorder" colorScheme="amber" />
            <MetricCard title="Batches expiring or expired" value={expiredCount} subtitle="Within the next 90 days" icon={Clock} badge="Inspect" colorScheme="rose" />
            <MetricCard title="Controlled drugs" value={medicines.filter(m => m.controlledDrug).length} subtitle="Pharmacist sign-off required" icon={ShieldCheck} />
          </div>

          {/* Controls & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="search"
                aria-label="Search medicines"
                placeholder="Search name, barcode or batch, or scan a barcode"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKey}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              <select
                aria-label="Filter by category"
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
                aria-label="Filter by stock status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden transition-all"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="LOW_STOCK">Needs reordering</option>
                <option value="OUT">Out of stock</option>
                <option value="NEAR_EXPIRY">Expiring within 90 days</option>
                <option value="EXPIRED">Has expired stock</option>
                <option value="CONTROLLED">Controlled drugs</option>
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
              <table className="w-full text-left text-xs block md:table">
                <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
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
                <tbody className="block md:table-row-group divide-y divide-slate-100">
                  {filteredMedicines.map((med) => {
                    const isLowStock = med.stock <= med.reorderLevel;
                    const status = med.stock > 0 ? expiryStatus(med.expiryDate) : "ok";
                    const isNearExpiry = status !== "ok";

                    return (
                      <tr key={med.id} className="grid grid-cols-2 gap-x-3 gap-y-2.5 p-4 md:table-row md:p-0 hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & Generic */}
                        <td className="col-span-2 md:py-3.5 md:px-4">
                          <div className="font-bold text-slate-900 flex flex-wrap items-center gap-x-2 gap-y-1">
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
                            {med.barcode && (
                              <span className="inline-flex items-center gap-1 ml-2 font-mono text-slate-400">
                                <ScanBarcode className="w-3 h-3" />{med.barcode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="md:py-3.5 md:px-4">
                          <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                            {med.category}
                          </span>
                        </td>

                        {/* Stock Level */}
                        <td className="justify-self-end md:justify-self-auto md:py-3.5 md:px-4">
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
                          <div className="text-[11px] text-slate-500 mt-0.5 text-right md:text-left">
                            {med.batchCount > 0 ? `${med.batchCount} batch${med.batchCount === 1 ? "" : "es"}` : "No batches"}
                            {med.expiredStock > 0 && <span className="text-rose-600 font-semibold"> · {med.expiredStock} expired</span>}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="self-center md:py-3.5 md:px-4 font-medium text-slate-900 whitespace-nowrap tabular-nums">
                          Rs. {(Number(med.unitPrice || med.unit_price || 0)).toFixed(2)}
                        </td>

                        {/* Batch & Expiry */}
                        <td className="justify-self-end text-right md:text-left md:justify-self-auto md:py-3.5 md:px-4">
                          {med.stock > 0 ? (
                            <>
                              <div className="text-slate-800 font-mono whitespace-nowrap">{med.batchNo}</div>
                              <div
                                title={isNearExpiry ? EXPIRY_LABEL[status].label : undefined}
                                className={`text-[11px] flex items-center justify-end md:justify-start whitespace-nowrap ${status === "watch" ? "text-amber-700 font-bold" : isNearExpiry ? "text-rose-600 font-bold" : "text-slate-500"}`}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {status === "expired" ? "Expired " : "Exp: "}{med.expiryDate}
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400">No stock</div>
                          )}
                        </td>

                        {/* Supplier */}
                        <td className="self-center md:py-3.5 md:px-4 text-slate-600 truncate md:max-w-[160px] min-w-0">
                          {med.supplierName}
                        </td>

                        {/* Actions */}
                        <td className="md:py-3.5 md:px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setBatchesFor(med)}
                              title="Batches and stock"
                              aria-label={`Batches of ${med.name}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                            {canEdit && (<>
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
                            </>)}
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

      {batchesFor && (
        <BatchesModal
          medicine={medicines.find(m => m.id === batchesFor.id) || batchesFor}
          batches={batches}
          stockMovements={stockMovements}
          canEdit={canEdit}
          onClose={() => setBatchesFor(null)}
          {...batchSetters}
        />
      )}

      {/* Add / Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineOpen}
        onClose={() => { setIsAddMedicineOpen(false); setEditingMedicine(null); }}
        onSave={handleSaveMedicine}
        medicineToEdit={editingMedicine}
        suppliers={suppliers}
        categories={categories}
      />

    </div>
  );
}
