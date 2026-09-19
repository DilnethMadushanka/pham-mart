import React, { useState } from 'react';
import { Truck, Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import GoodsReceiptModal from './GoodsReceiptModal';
import { createPurchaseOrder, updatePurchaseOrderStatus, updateMedicineStock } from '../../services/supabaseService';

export default function PurchaseOrders({ 
  purchaseOrders, 
  setPurchaseOrders, 
  medicines, 
  setMedicines, 
  suppliers,
  addAuditLog 
}) {
  const [selectedPOForReceipt, setSelectedPOForReceipt] = useState(null);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);

  const [newPOSupplierId, setNewPOSupplierId] = useState(suppliers[0]?.id || "");
  const [newPOMedicineId, setNewPOMedicineId] = useState(medicines[0]?.id || "");
  const [newPOQty, setNewPOQty] = useState(100);

  const handleOpenCreateModal = () => {
    if (suppliers.length > 0) setNewPOSupplierId(suppliers[0].id);
    if (medicines.length > 0) setNewPOMedicineId(medicines[0].id);
    setIsCreatePOOpen(true);
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === newPOSupplierId) || suppliers[0];
    const med = medicines.find(m => m.id === newPOMedicineId) || medicines[0];
    if (!sup || !med) {
      console.warn("Cannot create PO: No valid supplier or medicine available.");
      return;
    }

    const unitCost = Math.round((med.unitPrice || med.price || 50) * 0.7);
    const total = unitCost * newPOQty;

    const newPO = {
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      orderDate: new Date().toISOString().split('T')[0],
      status: "Issued",
      expectedDelivery: new Date(Date.now() + (sup.leadTimeDays || 3) * 86400000).toISOString().split('T')[0],
      items: [
        { medicineId: med.id, name: med.name, quantity: newPOQty, unitCost: unitCost, total: total }
      ],
      totalAmount: total
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    await createPurchaseOrder(newPO);
    addAuditLog("Purchase Order Issued", `Issued ${newPO.poNumber} to ${sup.name} for ${med.name} (${newPOQty} units)`, "info");
    setIsCreatePOOpen(false);
  };

  const handleGoodsReceiptConfirmed = async (poId, receivedItems) => {
    // 1. Update PO Status
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return { ...po, status: "Goods Received", receivedDate: new Date().toISOString().split('T')[0] };
      }
      return po;
    }));
    await updatePurchaseOrderStatus(poId, "Goods Received");

    // 2. Update stock level in medicines list automatically!
    // Compute the new stock values from the current `medicines` prop first, then apply
    // the state update and the Supabase writes separately — calling updateMedicineStock
    // from inside a setState updater is unsafe since React may invoke that updater more
    // than once, which would issue duplicate/extra writes.
    const stockUpdates = receivedItems
      .map(item => {
        const med = medicines.find(m => m.id === item.medicineId);
        if (!med) return null;
        const deliveredQty = Math.max(0, item.quantity);
        return { id: med.id, newStock: med.stock + deliveredQty };
      })
      .filter(Boolean);

    setMedicines(prev => prev.map(m => {
      const match = stockUpdates.find(u => u.id === m.id);
      return match ? { ...m, stock: match.newStock } : m;
    }));

    for (const update of stockUpdates) {
      await updateMedicineStock(update.id, update.newStock);
    }

    addAuditLog("Goods Receipt Completed", `Stock received for PO ${poId}. Automated inventory stock deduction/addition executed.`, "success");
    setSelectedPOForReceipt(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-blue-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              Procurement & Supply Chain
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {purchaseOrders.length} Orders Issued
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <Truck className="w-6 h-6 mr-2 text-blue-600" />
            Supplier Purchase Orders & Goods Receipt Processing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
            Automated stock sync & batch inventory updates upon Goods Receipt clearance.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 px-5 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-black text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* PO List Cards */}
      <div className="space-y-4">
        {purchaseOrders.map((po) => {
          const isReceived = po.status === "Goods Received";

          return (
            <div 
              key={po.id}
              className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:border-blue-300 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-black text-slate-900 text-base">{po.poNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    isReceived 
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}>
                    {po.status}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-semibold">
                  Supplier: <strong className="text-slate-900 font-black">{po.supplierName}</strong> • Order Date: <span className="text-slate-500">{po.orderDate}</span>
                </div>

                {/* Items */}
                <div className="pt-1 flex flex-wrap gap-2">
                  {po.items.map((item, idx) => (
                    <span key={idx} className="font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                      {item.name} × {item.quantity} units (Rs. {item.total.toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Valuation</div>
                  <div className="text-lg font-black text-blue-700">Rs. {po.totalAmount.toFixed(2)}</div>
                </div>

                {!isReceived ? (
                  <button
                    onClick={() => setSelectedPOForReceipt(po)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xs rounded-2xl shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Receive Goods
                  </button>
                ) : (
                  <div className="flex items-center text-xs font-black text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Stock Updated
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Create PO Modal */}
      {isCreatePOOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Issue Purchase Order</h3>
            
            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Supplier</label>
                <select
                  value={newPOSupplierId}
                  onChange={(e) => setNewPOSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Medicine Item</label>
                <select
                  value={newPOMedicineId}
                  onChange={(e) => setNewPOMedicineId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Order Quantity (Units)</label>
                <input 
                  type="number"
                  required
                  min="10"
                  value={newPOQty}
                  onChange={(e) => setNewPOQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePOOpen(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Issue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goods Receipt Confirmation Modal */}
      {selectedPOForReceipt && (
        <GoodsReceiptModal
          po={selectedPOForReceipt}
          onClose={() => setSelectedPOForReceipt(null)}
          onConfirm={handleGoodsReceiptConfirmed}
        />
      )}

    </div>
  );
}
