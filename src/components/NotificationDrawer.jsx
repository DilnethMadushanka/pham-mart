import React from 'react';
import { X, AlertTriangle, Clock, FileText, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  medicines, 
  prescriptions,
  onNavigate 
}) {
  if (!isOpen) return null;

  const lowStock = medicines.filter(m => m.stock <= m.reorderLevel);
  const nearExpiry = medicines.filter(m => new Date(m.expiryDate) <= new Date("2026-09-30"));
  const pendingRx = prescriptions.filter(p => p.status === "Pending");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-sky-100 bg-sky-50/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-sky-600 text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">System Notifications & Alerts</h3>
              <p className="text-[11px] text-slate-500">Real-time inventory and prescription action items</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Pending Prescriptions Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-sky-600" />
                Pending Prescriptions ({pendingRx.length})
              </h4>
              {pendingRx.length > 0 && (
                <button 
                  onClick={() => { onNavigate("prescriptions"); onClose(); }} 
                  className="text-xs text-sky-700 hover:underline font-semibold flex items-center"
                >
                  Verify All <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>

            {pendingRx.length === 0 ? (
              <div className="p-3 bg-sky-50 rounded-xl text-xs text-sky-800 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-sky-600 mr-2 shrink-0" />
                All customer prescriptions verified! No pending items.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRx.map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-sky-200 bg-sky-50/40 hover:bg-sky-50 transition-colors text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{p.rxNumber}</span>
                      <span className="text-sky-700 font-semibold">{p.customerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">Doctor: {p.doctorName}</p>
                    {p.isControlledDrug && (
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-md border border-rose-200">
                        Controlled Drug Warning
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Low Stock Threshold Alerts ({lowStock.length})
              </h4>
              {lowStock.length > 0 && (
                <button 
                  onClick={() => { onNavigate("inventory"); onClose(); }} 
                  className="text-xs text-sky-700 hover:underline font-semibold flex items-center"
                >
                  Create PO <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {lowStock.map(m => (
                <div key={m.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{m.name}</span>
                    <span className="text-amber-800 font-extrabold">{m.stock} units left</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">Reorder Level: {m.reorderLevel} units | Supplier: {m.supplierName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Near Expiry Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-rose-600" />
                Near Expiry Warning ({nearExpiry.length})
              </h4>
            </div>

            <div className="space-y-2">
              {nearExpiry.map(m => (
                <div key={m.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{m.name}</span>
                    <span className="text-rose-700 font-bold">{m.expiryDate}</span>
                  </div>
                  <p className="text-[11px] text-rose-600 mt-0.5">Batch: {m.batchNo} | Stock: {m.stock}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          Automated Baseline Monitoring Active (Report Epic 2 & 3)
        </div>

      </div>
    </div>
  );
}
