import React from 'react';
import { FileText, Clock, CheckCircle2, XCircle, ShieldAlert, Truck, User } from 'lucide-react';

export default function MyOrders({ prescriptions, currentUser }) {
  const customerRx = prescriptions.filter(p => p.customerName.toLowerCase().includes((currentUser?.name || "Sunil").toLowerCase()) || p.customerId === (currentUser?.id || "CUST-301"));

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">My Orders & Prescription Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live tracking for pharmacist review, dispensing, and home delivery</p>
        </div>

        <div className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
          Account: {currentUser?.name || "K. A. Sunil Shantha"}
        </div>
      </div>

      <div className="space-y-3">
        {customerRx.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            No prescriptions found for your account.
          </div>
        ) : (
          customerRx.map((rx) => {
            const isPending = rx.status === "Pending";
            const isApproved = rx.status === "Approved";

            return (
              <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-slate-900 text-sm">{rx.rxNumber}</span>
                      {rx.isControlledDrug && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Controlled Drug
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-semibold">
                      Prescribed by: {rx.doctorName} ({rx.doctorSlmcNo})
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isPending 
                      ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse" 
                      : isApproved 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}>
                    {isPending ? "Under Pharmacist Review" : isApproved ? "Approved & Ready for Pickup / Delivery" : "Rejected"}
                  </span>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-700">Prescribed Items:</div>
                  {rx.medicines.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-slate-800 font-medium">
                      <span>• {m.name} ({m.dosage})</span>
                      <span className="font-mono">{m.quantity} units</span>
                    </div>
                  ))}
                </div>

                {rx.notes && (
                  <div className="text-xs text-slate-600 italic">
                    Pharmacist Remarks: "{rx.notes}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
