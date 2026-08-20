import React from 'react';
import { X, Printer, CheckCircle, Pill } from 'lucide-react';

export default function ReceiptModal({ txn, onClose }) {
  if (!txn) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden">
        
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-emerald-100 bg-emerald-50/70 flex justify-between items-center no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900 text-sm">Sale Completed Successfully!</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="p-6 text-slate-900 bg-white space-y-4 text-xs font-mono">
          
          {/* Pharmacy Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-center items-center space-x-1 font-sans font-black text-xl text-[#00875A]">
              <Pill className="w-5 h-5" />
              <span>PRAGUE PHARMACY</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Main Street Healthcare Hub, City Center • Tel: 055-222-8292
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              Healthcare & E-Pharmacy Management System
            </p>
          </div>

          {/* Receipt Info */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-bold">{txn.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date / Time:</span>
              <span>{txn.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{txn.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{txn.cashierName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
            <div className="flex justify-between font-bold text-[11px]">
              <span>Item & Qty</span>
              <span>Amount</span>
            </div>
            {txn.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span>{item.name} × {item.qty}</span>
                <span>Rs. {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>Rs. {txn.subtotal.toFixed(2)}</span>
            </div>
            {txn.discountAmt > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({txn.discountPct}%):</span>
                <span>- Rs. {txn.discountAmt.toFixed(2)}</span>
              </div>
            )}
            {txn.taxAmt > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({txn.taxPct}%):</span>
                <span>+ Rs. {txn.taxAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-2 mt-2">
              <span>TOTAL PAID ({txn.paymentMethod}):</span>
              <span>Rs. {txn.total.toFixed(2)}</span>
            </div>

            {txn.paymentMethod === "Cash" && (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>Tendered:</span>
                  <span>Rs. {txn.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Change Given:</span>
                  <span>Rs. {txn.changeAmount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="text-center border-t border-dashed border-slate-300 pt-4 text-[10px] text-slate-500 space-y-1 font-sans">
            <p className="font-bold">Thank you for choosing PHARMART Pharmacy!</p>
            <p>Please retain receipt for returns/exchanges within 7 days.</p>
          </div>

        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center no-print">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Done & Next Sale
          </button>
        </div>

      </div>
    </div>
  );
}
