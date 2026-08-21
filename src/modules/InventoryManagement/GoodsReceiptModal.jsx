import React, { useState } from 'react';
import { X, CheckCircle2, Truck, PackageCheck } from 'lucide-react';

export default function GoodsReceiptModal({ po, onClose, onConfirm }) {
  const [items, setItems] = useState(po.items);

  const handleQtyChange = (idx, newQty) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: newQty } : item));
  };

  const handleConfirm = () => {
    onConfirm(po.id, items);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-sky-100 overflow-hidden">
        
        <div className="p-4 border-b border-sky-100 bg-sky-50/70 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-sky-600 text-white">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Verify Goods Receipt</h3>
              <p className="text-xs text-slate-500">Confirm physical shipment arrival for PO #{po.poNumber}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900">Supplier: {po.supplierName}</div>
            <div className="text-slate-500 mt-0.5">Order Date: {po.orderDate}</div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-700">Received Items & Verified Quantities:</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                <div>
                  <div className="font-bold text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-slate-400">Unit Cost: Rs. {item.unitCost.toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-semibold">Qty Delivered:</span>
                  <input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-center font-bold text-sky-800"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-sky-50 text-sky-900 rounded-xl border border-sky-200">
            <div className="font-bold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-sky-600" />
              Automated Stock Synchronization
            </div>
            <p className="text-[11px] mt-1 text-sky-700">
              Confirming goods receipt will automatically update medicine inventory quantities in real-time.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Confirm Goods Receipt
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
