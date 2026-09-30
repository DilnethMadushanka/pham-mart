import React from 'react';
import { LogIn } from 'lucide-react';

export default function MyOrders({ prescriptions, currentUser, onRequestSignIn }) {
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3 animate-fade-in">
        <h2 className="text-xl font-semibold text-slate-900">Sign in to see your orders</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Your prescriptions and order status are private, so they only show after you sign in to your own account.
        </p>
        <button
          onClick={onRequestSignIn}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2563EB]/20"
        >
          <LogIn className="w-4 h-4" />
          Sign in
        </button>
      </div>
    );
  }

  // The server only sends a customer their own prescriptions; the id check is a second guard.
  const customerRx = prescriptions.filter(p => p.customerId === currentUser.id);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My Orders & Prescription Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live tracking for pharmacist review, dispensing, and home delivery</p>
        </div>

        <div className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200">
          Account: {currentUser.name}
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
            const remarks = rx.status === "Rejected" ? rx.rejectionReason : rx.pharmacistNotes;

            return (
              <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-semibold text-slate-900 text-sm">{rx.rxNumber}</span>
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
                      ? "bg-blue-100 text-blue-800 border-blue-300" 
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}>
                    {isPending ? "Under Pharmacist Review" : isApproved ? (rx.dispensedAt ? "Dispensed" : "Approved & Ready for Pickup / Delivery") : "Rejected"}
                  </span>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-700">Prescribed Items:</div>
                  {rx.medicines.length === 0 && (
                    <div className="text-slate-500">See the attached prescription photo.</div>
                  )}
                  {rx.medicines.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-slate-800 font-medium">
                      <span>{m.name}{m.dosage ? ` (${m.dosage})` : ""}</span>
                      <span className="font-mono">{m.quantity} units</span>
                    </div>
                  ))}
                </div>

                {remarks && (
                  <div className="text-xs text-slate-600 italic">
                    Pharmacist remarks: "{remarks}"
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
