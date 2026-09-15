import React, { useState } from 'react';
import { Truck, Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import GoodsReceiptModal from './GoodsReceiptModal';

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

  const handleCreatePO = (e) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === newPOSupplierId);
    const med = medicines.find(m => m.id === newPOMedicineId);
    if (!sup || !med) return;

    const unitCost = Math.round(med.unitPrice * 0.7); // 30% wholesale margin assumption
    const total = unitCost * newPOQty;

    const newPO = {
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      orderDate: new Date().toISOString().split('T')[0],
      status: "Issued",
      expectedDelivery: new Date(Date.now() + sup.leadTimeDays * 86400000).toISOString().split('T')[0],
      items: [
        { medicineId: med.id, name: med.name, quantity: newPOQty, unitCost: unitCost, total: total }
      ],
      totalAmount: total
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    addAuditLog("Purchase Order Issued", `Issued ${newPO.poNumber} to ${sup.name} for ${med.name} (${newPOQty} units)`, "info");
    setIsCreatePOOpen(false);
  };

  const handleGoodsReceiptConfirmed = (poId, receivedItems) => {
    // 1. Update PO Status
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return { ...po, status: "Goods Received", receivedDate: new Date().toISOString().split('T')[0] };
      }
      return po;
    }));

    // 2. Update stock level in medicines list automatically!
    receivedItems.forEach(item => {
      setMedicines(prev => prev.map(m => {
        if (m.id === item.medicineId) {
          return { ...m, stock: m.stock + item.quantity };
        }
        return m;
      }));
    });

    addAuditLog("Goods Receipt Completed", `Stock received for PO ${poId}. Automated inventory stock deduction/addition executed.`, "success");
    setSelectedPOForReceipt(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-sky-600" />
            Supplier Purchase Orders & Delivery Processing
          </h3>
          <p className="text-xs text-slate-500">Automated stock sync upon Goods Receipt (Report Epic 2)</p>
        </div>

        <button
          onClick={() => setIsCreatePOOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* PO List Cards */}
      <div className="space-y-3">
        {purchaseOrders.map((po) => {
          const isReceived = po.status === "Goods Received";

          return (
            <div 
              key={po.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">{po.poNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isReceived 
                      ? "bg-sky-100 text-sky-800 border-sky-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}>
                    {po.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mt-1 font-semibold">
                  Supplier: <span className="text-slate-900">{po.supplierName}</span> • Order Date: {po.orderDate}
                </div>

                {/* Items */}
                <div className="mt-2 text-xs text-slate-500">
                  {po.items.map((item, idx) => (
                    <span key={idx} className="mr-3 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {item.name} × {item.quantity} units (Rs. {item.total.toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Valuation</div>
                  <div className="text-base font-black text-sky-700">Rs. {po.totalAmount.toFixed(2)}</div>
                </div>

                {!isReceived ? (
                  <button
                    onClick={() => setSelectedPOForReceipt(po)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Receive Goods
                  </button>
                ) : (
                  <div className="flex items-center text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-sky-600" />
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
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
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
