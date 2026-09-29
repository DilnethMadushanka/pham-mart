import React, { useState } from 'react';
import { Truck, Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import GoodsReceiptModal from './GoodsReceiptModal';
import { createPurchaseOrder, receivePurchaseOrder } from '../../services/supabaseService';
import { notify, notifyError } from '../../lib/notify';

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
    const sup = suppliers.find(s => s.id === newPOSupplierId);
    const med = medicines.find(m => m.id === newPOMedicineId);
    if (!sup || !med) {
      notify("Details needed", "Choose a supplier and a medicine for this order.", "error");
      return;
    }
    if (!(newPOQty > 0)) {
      notify("Check the quantity", "Order at least 1 unit.", "error");
      return;
    }

    const unitCost = Math.round(Number(med.unitPrice ?? 0) * 0.7 * 100) / 100;
    const { data, error } = await createPurchaseOrder({
      supplierId: sup.id,
      items: [{ medicineId: med.id, quantity: newPOQty, unitCost }]
    });
    if (error) {
      notifyError(error, "Purchase order not issued");
      return;
    }
    setPurchaseOrders(prev => [data, ...prev]);
    addAuditLog("Purchase Order Issued", `Issued ${data.poNumber} to ${sup.name} for ${med.name} (${newPOQty} units)`, "info");
    setIsCreatePOOpen(false);
  };

  // The server adds the delivered stock and closes the order in one step,
  // and refuses to receive the same order twice.
  const handleGoodsReceiptConfirmed = async (poId, receivedItems) => {
    const { data, error } = await receivePurchaseOrder(poId, receivedItems.map(item => ({
      medicineId: item.medicineId,
      quantity: Math.max(0, item.quantity)
    })));
    if (error) {
      notifyError(error, "Goods receipt not saved");
      return;
    }
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? data.purchaseOrder : po));
    setMedicines(prev => prev.map(m => data.medicines.find(u => u.id === m.id) || m));
    addAuditLog("Goods Receipt Completed", `Stock received for PO ${poId}. Inventory levels updated.`, "success");
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
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center">
            <Truck className="w-6 h-6 mr-2 text-blue-600" />
            Supplier Purchase Orders & Goods Receipt Processing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
            Automated stock sync & batch inventory updates upon Goods Receipt clearance.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 px-5 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
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
                  <span className="font-mono font-semibold text-slate-900 text-base">{po.poNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    isReceived 
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}>
                    {po.status}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-semibold">
                  Supplier: <strong className="text-slate-900 font-semibold">{po.supplierName}</strong> • Ordered <span className="text-slate-500">{po.orderDate}</span>
                  {isReceived
                    ? <> • Received <span className="text-slate-500">{po.receivedDate || "earlier"}</span></>
                    : po.expectedDelivery && <> • Expected <span className="text-slate-500">{po.expectedDelivery}</span></>}
                </div>

                {/* Items */}
                <div className="pt-1 flex flex-wrap gap-2">
                  {po.items.map((item, idx) => (
                    <span key={idx} className="font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                      {item.name} × {item.quantity} units (Rs. {Number(item.total).toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Valuation</div>
                  <div className="text-lg font-semibold text-blue-700">Rs. {Number(po.totalAmount).toFixed(2)}</div>
                </div>

                {!isReceived ? (
                  <button
                    onClick={() => setSelectedPOForReceipt(po)}
                    className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-2xl shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Receive Goods
                  </button>
                ) : (
                  <div className="flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-300">
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
