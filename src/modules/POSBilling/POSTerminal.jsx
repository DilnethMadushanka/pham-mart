import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  Receipt,
  UserCheck,
  Percent,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReceiptModal from './ReceiptModal';

export default function POSTerminal({ 
  medicines, 
  setMedicines, 
  customers, 
  prescriptions, 
  transactions, 
  setTransactions, 
  currentRole,
  addAuditLog 
}) {
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [tenderedCash, setTenderedCash] = useState("");
  
  const [completedTxn, setCompletedTxn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || { name: "Walk-in Customer" };

  // Filter medicines for POS grid
  const availableMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (med) => {
    // Check if controlled drug and if approved rx exists
    if (med.controlledDrug) {
      const approvedRx = prescriptions.find(p => p.customerId === selectedCustomerId && p.status === "Approved" && p.isControlledDrug);
      if (!approvedRx) {
        const proceed = window.confirm(`WARNING: ${med.name} is a Controlled Dangerous Drug!\n\nNo approved prescription found for ${activeCustomer.name}.\n\nProceed with Pharmacist override?`);
        if (!proceed) {
          addAuditLog("POS Dispense Blocked", `Blocked POS addition of ${med.name} for ${activeCustomer.name} (No approved Rx)`, "danger");
          return;
        }
      }
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        if (existing.qty >= med.stock) {
          alert(`Cannot exceed available stock level (${med.stock} units).`);
          return prev;
        }
        return prev.map(item => item.id === med.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        if (med.stock < 1) {
          alert(`Product out of stock!`);
          return prev;
        }
        return [...prev, { ...med, qty: 1 }];
      }
    });
  };

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    const med = medicines.find(m => m.id === id);
    if (med && newQty > med.stock) {
      alert(`Cannot exceed available stock level (${med.stock} units).`);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const discountAmt = (subtotal * discountPct) / 100;
  const taxableTotal = subtotal - discountAmt;
  const taxAmt = (taxableTotal * taxPct) / 100;
  const grandTotal = taxableTotal + taxAmt;

  const changeDue = Math.max(0, (parseFloat(tenderedCash) || 0) - grandTotal);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    if (paymentMethod === "Cash" && (parseFloat(tenderedCash) || 0) < grandTotal) {
      alert(`Tendered cash must be at least Rs. ${grandTotal.toFixed(2)}`);
      return;
    }

    const newTxn = {
      id: `TXN-${Math.floor(8800 + Math.random() * 1000)}`,
      invoice_no: `INV-2026-${Math.floor(8800 + Math.random() * 1000)}`,
      invoiceNo: `INV-2026-${Math.floor(8800 + Math.random() * 1000)}`,
      date: new Date().toLocaleString(),
      customerName: activeCustomer.name,
      customer_name: activeCustomer.name,
      cashierName: currentRole === "Cashier" ? "Pathiraja M.M.S" : currentRole === "Pharmacist" ? "Mendis M.M.N" : "Ms. Chathurangika",
      cashier_name: currentRole === "Cashier" ? "Pathiraja M.M.S" : currentRole === "Pharmacist" ? "Mendis M.M.N" : "Ms. Chathurangika",
      items: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.unitPrice,
        total: item.unitPrice * item.qty
      })),
      subtotal: subtotal,
      discountPct: discountPct,
      discountAmt: discountAmt,
      taxPct: taxPct,
      taxAmt: taxAmt,
      total: grandTotal,
      paymentMethod: paymentMethod,
      payment_method: paymentMethod,
      paidAmount: paymentMethod === "Cash" ? parseFloat(tenderedCash) : grandTotal,
      changeAmount: paymentMethod === "Cash" ? changeDue : 0,
      status: "Completed"
    };

    // 1. Save Transaction to Supabase DB in real-time
    await createTransaction(newTxn);

    // 2. AUTOMATIC INVENTORY DEDUCTION (Real-time Supabase Update!)
    for (const item of cart) {
      const med = medicines.find(m => m.id === item.id);
      if (med) {
        const updatedStock = Math.max(0, med.stock - item.qty);
        await updateMedicineStock(med.id, updatedStock);
      }
    }

    // 3. Update local state
    setTransactions(prev => [newTxn, ...prev]);

    setMedicines(prev => prev.map(m => {
      const cartItem = cart.find(c => c.id === m.id);
      if (cartItem) {
        return { ...m, stock: Math.max(0, m.stock - cartItem.qty) };
      }
      return m;
    }));

    // 3. Log audit event
    addAuditLog(
      "POS Sale Completed",
      `Invoice ${newTxn.invoiceNo} issued for ${newTxn.customerName}. Total: LKR ${grandTotal.toFixed(2)}. Inventory stock automatically updated.`,
      "success"
    );

    // 4. Trigger celebration confetti
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch(err){}

    setCompletedTxn(newTxn);
    setCart([]);
    setTenderedCash("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
              Epic 4 POS Counter
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Point-of-Sale Billing Terminal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time barcode search, automatic tax/discount calculation & instant inventory deduction.
          </p>
        </div>

        {/* Customer Select Pill */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <UserCheck className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-500">Customer:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 outline-hidden"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* POS Grid: Left Medicines Grid + Right Cart Billing Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              placeholder="Quick search medicine by name, generic code or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 outline-hidden shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {availableMedicines.map((med) => {
              const isOut = med.stock <= 0;

              return (
                <div
                  key={med.id}
                  onClick={() => !isOut && addToCart(med)}
                  className={`p-4 bg-white rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    isOut 
                      ? "opacity-50 cursor-not-allowed border-slate-200" 
                      : "border-slate-200 hover:border-sky-400 hover:shadow-md cursor-pointer group"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
                        {med.name}
                      </span>
                      {med.controlledDrug && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Controlled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{med.genericName}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Stock Level</span>
                      <span className={`font-black text-xs ${med.stock <= med.reorderLevel ? "text-rose-600" : "text-sky-700"}`}>
                        {med.stock} units
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">
                        Rs. {(Number(med.unitPrice || med.unit_price || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Checkout Billing Counter */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-sky-200 shadow-xl flex flex-col h-full sticky top-20">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-sky-600" />
              Order Checkout Basket ({cart.reduce((a,c) => a + c.qty, 0)})
            </h3>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[320px]">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Cart is empty</p>
                <p className="text-[11px] text-slate-400">Click medicines on the left to add items</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-sky-700 font-semibold">
                      Rs. {(Number(item.unitPrice || item.unit_price || 0)).toFixed(2)} × {item.qty} = Rs. {((Number(item.unitPrice || item.unit_price || 0)) * item.qty).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-extrabold px-2 text-slate-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="p-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount & Tax Options */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount %</label>
                <input 
                  type="number"
                  min="0"
                  max="50"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tax % (VAT)</label>
                <input 
                  type="number"
                  min="0"
                  max="30"
                  value={taxPct}
                  onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-sky-700 font-semibold">
                  <span>Discount ({discountPct}%):</span>
                  <span>- Rs. {discountAmt.toFixed(2)}</span>
                </div>
              )}
              {taxAmt > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({taxPct}%):</span>
                  <span>+ Rs. {taxAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-sky-700">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {["Cash", "Card", "Digital Wallet"].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === m 
                        ? "bg-sky-600 text-white border-sky-600 shadow-xs" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {paymentMethod === "Cash" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Tendered Cash (Rs.)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={tenderedCash}
                      onChange={(e) => setTenderedCash(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-black text-sky-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Change Due</label>
                    <div className="px-2.5 py-1.5 bg-sky-50 rounded-lg font-black text-sky-800 text-center border border-sky-200">
                      Rs. {changeDue.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 mt-2 ${
                cart.length > 0 
                  ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 cursor-pointer" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Complete Sale & Issue Receipt</span>
            </button>

          </div>

        </div>

      </div>

      {/* Printable Receipt Modal */}
      {completedTxn && (
        <ReceiptModal
          txn={completedTxn}
          onClose={() => setCompletedTxn(null)}
        />
      )}

    </div>
  );
}
