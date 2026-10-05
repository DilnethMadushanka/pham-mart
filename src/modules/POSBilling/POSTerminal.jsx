import React, { useState, useEffect } from 'react';
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
  UserPlus,
  History,
  AlertCircle,
  FileText,
  X,
  Percent,
  RefreshCw,
  Undo2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReceiptModal from './ReceiptModal';
import ReturnsModal from './ReturnsModal';
import { saveCustomer, posCheckout } from '../../services/supabaseService';
import { notify, notifyError } from '../../lib/notify';
import PhoneHint from '../../components/PhoneHint';
import { checkPhone } from '../../lib/phone';
import { newlyLowStock } from '../../lib/reorder';
import PageHeader from '../../components/PageHeader';

const needsPrescription = (med) => Boolean(med.prescriptionRequired || med.controlledDrug);
const localToday = () => new Date().toLocaleDateString("en-CA");
// Units that can be sold: stock in batches that haven't expired.
const sellable = (med) => Math.max(0, med.sellableStock ?? med.stock);
const isExpired = (med) => sellable(med) <= 0 &&
  ((med.expiredStock || 0) > 0 || Boolean(med.expiryDate && med.expiryDate < localToday()));

// Does this prescription list the medicine, and how many units may be dispensed?
function prescribedQty(rx, med) {
  const line = (rx.medicines || []).find(m =>
    (m.medicineId && m.medicineId === med.id) ||
    (m.name && m.name.toLowerCase() === med.name.toLowerCase())
  );
  if (!line) return 0;
  return Number(line.quantity) > 0 ? Number(line.quantity) : Infinity;
}

// A customer's history, matched by customer id. Old records saved before ids
// were stored fall back to an exact (not partial) name match.
function filterCustomerRecords(records = [], cust) {
  if (!cust?.id) return [];
  const name = String(cust.name || "").trim().toLowerCase();
  return records.filter(r => r.customerId
    ? r.customerId === cust.id
    : Boolean(name) && String(r.customerName || "").trim().toLowerCase() === name);
}

export default function POSTerminal({ 
  medicines, 
  setMedicines, 
  customers, 
  setCustomers,
  prescriptions, 
  setPrescriptions,
  transactions, 
  setTransactions, 
  setBatches,
  salesReturns = [],
  setSalesReturns,
  canProcessReturns = false,
  addAuditLog 
}) {
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedRxId, setSelectedRxId] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [tenderedCash, setTenderedCash] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [completedTxn, setCompletedTxn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Customer Management Modals inside POS
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [isViewHistoryOpen, setIsViewHistoryOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState("purchases"); // "purchases" | "prescriptions"
  const [newCust, setNewCust] = useState({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || { name: "Walk-in Customer", id: null };

  const today = new Date().toISOString().split('T')[0];
  const usablePrescriptions = prescriptions.filter(p =>
    selectedCustomerId &&
    p.customerId === selectedCustomerId &&
    p.status === "Approved" &&
    !p.dispensedAt &&
    (!p.expiryDate || p.expiryDate >= today)
  );
  const linkedRx = usablePrescriptions.find(p => p.id === selectedRxId) || null;

  useEffect(() => {
    if (isViewHistoryOpen && activeCustomer) {
      const custTxns = filterCustomerRecords(transactions, activeCustomer);
      const custRxs = filterCustomerRecords(prescriptions, activeCustomer);
      if (custTxns.length === 0 && custRxs.length > 0) {
        setHistoryTab("prescriptions");
      } else {
        setHistoryTab("purchases");
      }
    }
  }, [isViewHistoryOpen, selectedCustomerId, transactions, prescriptions]);

  // Prescription items belong to one patient, so switching patient takes them out of the cart.
  const handleCustomerChange = (nextId) => {
    const rxItems = cart.filter(needsPrescription);
    if (rxItems.length > 0) {
      setCart(prev => prev.filter(item => !needsPrescription(item)));
      notify("Prescription items removed", "Prescription medicines were removed because the patient changed.", "info");
    }
    setSelectedRxId("");
    setSelectedCustomerId(nextId);
  };

  const handlePOSAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.nic.trim()) {
      notify("Details needed", "Please fill in the customer's name and NIC.", "error");
      return;
    }
    if (!checkPhone(newCust.phone, notify)) return;
    const { data, error } = await saveCustomer(newCust);
    if (error) {
      notifyError(error, "Customer not saved");
      return;
    }
    setCustomers(prev => [data, ...prev]);
    handleCustomerChange(data.id);
    addAuditLog("New Customer Registered via POS", `Registered customer ${data.name} (${data.nic}) at the POS counter`, "success");
    setIsAddCustOpen(false);
    setNewCust({ name: '', nic: '', phone: '', email: '', address: '', allergies: '' });
  };

  // Filter medicines for POS grid
  const term = searchTerm.trim().toLowerCase();
  const compactTerm = term.replace(/\s/g, "");
  const availableMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(term) ||
    (m.genericName || "").toLowerCase().includes(term) ||
    (m.code || "").toLowerCase().includes(term) ||
    (compactTerm && (m.barcode || "").toLowerCase().includes(compactTerm))
  );

  // Barcode scanners type the code and press Enter: add that item straight to the bill.
  const handleSearchKey = (e) => {
    if (e.key !== "Enter" || !compactTerm) return;
    const exact = medicines.find(m => (m.barcode || "").toLowerCase() === compactTerm || (m.code || "").toLowerCase() === compactTerm);
    const only = availableMedicines.length === 1 ? availableMedicines[0] : null;
    const med = exact || only;
    if (!med) {
      notify("No match", `No medicine has the barcode or code "${searchTerm.trim()}".`, "error");
      return;
    }
    addToCart(med);
    setSearchTerm("");
  };

  // Most units of this item that may go in the cart: stock, and for prescription
  // items the quantity on the linked prescription.
  const maxQtyFor = (med, rx = linkedRx) => {
    const stockCap = sellable(med);
    if (!needsPrescription(med)) return stockCap;
    return rx ? Math.min(stockCap, prescribedQty(rx, med)) : 0;
  };

  // Hides the phone basket shortcut while the basket itself is on screen.
  const [basketInView, setBasketInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById("pos-basket");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setBasketInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const addToCart = (med) => {
    if (isExpired(med)) {
      notify("Expired stock", `${med.name} expired on ${med.expiryDate} and can't be sold.`, "error");
      return;
    }
    if (sellable(med) < 1) {
      notify("Out of stock", `${med.name} is out of stock.`, "error");
      return;
    }
    let rx = linkedRx;
    if (needsPrescription(med)) {
      const label = med.controlledDrug ? "Controlled drug" : "Prescription medicine";
      if (!selectedCustomerId) {
        notify(`${label} needs a patient`, `Select the patient before adding ${med.name}.`, "error");
        return;
      }
      if (!rx || prescribedQty(rx, med) === 0) {
        const match = usablePrescriptions.find(p => prescribedQty(p, med) > 0 &&
          cart.filter(needsPrescription).every(item => prescribedQty(p, item) >= item.qty));
        if (!match) {
          notify(
            `${label} blocked`,
            `${activeCustomer.name} has no approved, unused prescription that lists ${med.name}. A pharmacist must approve one first.`,
            "error"
          );
          addAuditLog("Prescription Item Blocked", `Blocked ${med.name} for ${activeCustomer.name}: no approved prescription on file`, "danger");
          return;
        }
        rx = match;
        setSelectedRxId(match.id);
      }
    }

    const existing = cart.find(item => item.id === med.id);
    const nextQty = (existing?.qty || 0) + 1;
    if (nextQty > maxQtyFor(med, rx)) {
      notify("Limit reached", needsPrescription(med) && nextQty <= sellable(med)
        ? `Prescription ${rx.rxNumber} allows ${prescribedQty(rx, med)} units of ${med.name}.`
        : `Only ${sellable(med)} units of ${med.name} can be sold.`, "error");
      return;
    }
    setCart(prev => existing
      ? prev.map(item => item.id === med.id ? { ...item, qty: nextQty } : item)
      : [...prev, { ...med, qty: 1 }]);
  };

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    const med = medicines.find(m => m.id === id);
    if (med && newQty > maxQtyFor(med)) {
      notify("Limit reached", needsPrescription(med) && newQty <= sellable(med) && linkedRx
        ? `Prescription ${linkedRx.rxNumber} allows ${prescribedQty(linkedRx, med)} units of ${med.name}.`
        : `Only ${sellable(med)} units of ${med.name} can be sold.`, "error");
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const next = prev.filter(item => item.id !== id);
      if (!next.some(needsPrescription)) setSelectedRxId("");
      return next;
    });
  };

  // Financial Calculations (the server recalculates from catalogue prices at checkout)
  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const discountAmt = Math.round(subtotal * discountPct) / 100;
  const taxableTotal = subtotal - discountAmt;
  const taxAmt = Math.round(taxableTotal * taxPct) / 100;
  const grandTotal = taxableTotal + taxAmt;

  const changeDue = Math.max(0, (parseFloat(tenderedCash) || 0) - grandTotal);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isCheckingOut) return;
    if (cart.length === 0) {
      notify("Cart is empty", "Add at least one item.", "error");
      return;
    }
    if (grandTotal <= 0) {
      notify("Check the total", "The total must be more than zero. Check the discount and tax.", "error");
      return;
    }
    if (paymentMethod === "Cash" && (parseFloat(tenderedCash) || 0) < grandTotal) {
      notify("Not enough cash", `Tendered cash must be at least Rs. ${grandTotal.toFixed(2)}.`, "error");
      return;
    }

    setIsCheckingOut(true);
    const { data, error } = await posCheckout({
      items: cart.map(item => ({ medicineId: item.id, qty: item.qty })),
      customerId: selectedCustomerId || null,
      prescriptionId: cart.some(needsPrescription) ? selectedRxId || null : null,
      discountPct,
      taxPct,
      paymentMethod,
      paidAmount: paymentMethod === "Cash" ? parseFloat(tenderedCash) || 0 : null
    });
    setIsCheckingOut(false);

    if (error) {
      notifyError(error, "Sale not completed");
      return;
    }

    // The server has already taken the stock off, saved the sale and closed the prescription.
    const { transaction, medicines: updatedMeds, prescription, batches: updatedBatches } = data;
    setTransactions(prev => [transaction, ...prev]);
    setMedicines(prev => prev.map(m => updatedMeds.find(u => u.id === m.id) || m));
    if (setBatches && updatedBatches) {
      const ids = new Set(updatedMeds.map(m => m.id));
      setBatches(prev => [...prev.filter(b => !ids.has(b.medicineId)), ...updatedBatches]);
    }

    // Suggest a reorder the moment a sale takes a medicine down to its reorder level.
    const nowLow = newlyLowStock(medicines, updatedMeds);
    if (nowLow.length > 0) {
      const names = nowLow.map(m => `${m.name} (${m.stock} left)`).join(", ");
      notify("Reorder suggested", `${names} reached the reorder level. See Inventory, Reorder suggestions.`, "info");
      addAuditLog?.("Reorder Suggested", `Low stock after sale ${transaction.id}: ${names}`, "warning");
    }
    if (prescription && setPrescriptions) {
      setPrescriptions(prev => prev.map(p => p.id === prescription.id ? prescription : p));
    }

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // Decorative only.
    }

    setCompletedTxn(transaction);
    setCart([]);
    setSelectedRxId("");
    setTenderedCash("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <PageHeader
        kicker="Counter 01"
        title="Point of sale"
        description="Search by name or barcode. Tax, discounts and stock update automatically."
      >
        <span className="status-chip status-chip-green">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          Counter open
        </span>
        <button
          type="button"
          onClick={() => setIsReturnsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Undo2 className="w-4 h-4" /> Returns
        </button>
      </PageHeader>

      {/* Expanded Dedicated Customer Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center space-x-2.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto min-w-0">
            <UserCheck className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-600 text-sm shrink-0">Customer</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="font-medium text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-hidden focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 transition-all cursor-pointer flex-1 min-w-0 sm:flex-none sm:min-w-[220px]"
            >
              <option value="">Walk-in Customer (General)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Allergy Warning Badge */}
          {activeCustomer.allergies && activeCustomer.allergies !== "None" && activeCustomer.allergies !== "None reported" && (
            <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Allergy: {activeCustomer.allergies}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2.5 w-full xl:w-auto justify-end">
          <button
            onClick={() => setIsAddCustOpen(true)}
            title="Register new customer profile"
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>New customer</span>
          </button>

          {activeCustomer.id && (
            <button
              onClick={() => { setIsViewHistoryOpen(true); setHistoryTab("purchases"); }}
              title="View customer purchase & prescription history"
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-medium text-sm rounded-xl transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>History</span>
            </button>
          )}
        </div>
      </div>

      {/* POS Grid: Left Medicines Grid + Right Cart Billing Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="search"
              aria-label="Search medicines or scan a barcode"
              placeholder="Search by name or barcode, or scan a barcode and press Enter"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKey}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3 lg:max-h-[620px] lg:overflow-y-auto lg:pr-1">
            {availableMedicines.map((med) => {
              const expired = isExpired(med);
              const isOut = sellable(med) <= 0 || expired;

              return (
                <div
                  key={med.id}
                  onClick={() => !isOut && addToCart(med)}
                  className={`p-3 sm:p-4 bg-white rounded-2xl border transition-all text-xs flex flex-col justify-between min-w-0 ${
                    isOut 
                      ? "opacity-50 cursor-not-allowed border-slate-200" 
                      : "border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer group"
                  }`}
                >
                  <div>
                    <div className="flex flex-col-reverse items-start gap-1 sm:flex-row sm:justify-between">
                      <span className="font-semibold text-slate-900 text-[13px] sm:text-sm leading-snug group-hover:text-blue-700 transition-colors break-words">
                        {med.name}
                      </span>
                      {expired ? (
                        <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                          Expired
                        </span>
                      ) : med.controlledDrug ? (
                        <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                          Controlled
                        </span>
                      ) : med.prescriptionRequired && (
                        <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          Rx only
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-2 break-words">{med.genericName}</p>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2 border-t border-slate-100 flex flex-wrap justify-between items-end gap-x-2 gap-y-1">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">In stock</span>
                      <span className={`font-semibold text-xs ${med.stock <= med.reorderLevel ? "text-rose-600" : "text-blue-700"}`}>
                        {sellable(med)} units
                      </span>
                      {med.expiredStock > 0 && !expired && (
                        <span className="block text-[10px] text-rose-600">{med.expiredStock} expired, not for sale</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm sm:text-base font-semibold text-slate-900 whitespace-nowrap">
                        Rs. {(Number(med.unitPrice || med.unit_price || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Phones and tablets: the basket is below the list, so keep a shortcut to it on screen. */}
        {cart.length > 0 && !basketInView && (
          <button
            type="button"
            onClick={() => document.getElementById("pos-basket")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="lg:hidden fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 z-30 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#2563EB] text-white text-sm font-semibold shadow-xl shadow-[#2563EB]/30"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              View basket ({cart.reduce((a, c) => a + c.qty, 0)})
            </span>
            <span className="tabular-nums">Rs. {grandTotal.toFixed(2)}</span>
          </button>
        )}

        {/* Right Column: Checkout Billing Counter */}
        <div id="pos-basket" className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-lg flex flex-col h-full scroll-mt-20 lg:sticky lg:top-20">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center">
              Current sale
              <span className="ml-2 min-w-6 h-6 px-2 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-semibold font-mono flex items-center justify-center">{cart.reduce((a,c) => a + c.qty, 0)}</span>
            </h3>
            {cart.length > 0 && (
              <button 
                onClick={() => { setCart([]); setSelectedRxId(""); }}
                className="text-xs text-slate-500 hover:text-rose-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[320px]">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No items yet</p>
                <p className="text-xs text-slate-500">Pick a medicine or scan a barcode to start a sale.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-blue-700 font-semibold">
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
                    <span className="font-semibold px-2 text-slate-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
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

          {linkedRx && cart.some(needsPrescription) && (
            <div className="mb-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
              Dispensing against prescription <span className="font-mono font-semibold">{linkedRx.rxNumber}</span> for {activeCustomer.name}. It will be marked as used.
            </div>
          )}

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
                  onChange={(e) => setDiscountPct(Math.min(50, Math.max(0, parseFloat(e.target.value) || 0)))}
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
                  onChange={(e) => setTaxPct(Math.min(30, Math.max(0, parseFloat(e.target.value) || 0)))}
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
                <div className="flex justify-between text-blue-700 font-semibold">
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
              <div className="flex justify-between text-base font-semibold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total</span>
                <span className="text-blue-700">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-medium text-slate-500">
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
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
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
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-semibold text-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Change Due</label>
                    <div className="px-2.5 py-1.5 bg-blue-50 rounded-lg font-semibold text-blue-800 text-center border border-blue-200">
                      Rs. {changeDue.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className={`w-full py-3 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 mt-2 ${
                cart.length > 0 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{isCheckingOut ? "Completing sale..." : "Complete sale"}</span>
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

      {isReturnsOpen && (
        <ReturnsModal
          transactions={transactions}
          salesReturns={salesReturns}
          canProcess={canProcessReturns}
          onClose={() => setIsReturnsOpen(false)}
          onViewInvoice={(t) => setCompletedTxn(t)}
          onDone={(data) => {
            setTransactions(prev => prev.map(t => (t.id === data.transaction.id ? data.transaction : t)));
            setSalesReturns?.(prev => [data.return, ...prev]);
            if (data.medicines.length) setMedicines(prev => prev.map(m => data.medicines.find(u => u.id === m.id) || m));
            if (setBatches && data.medicines.length) {
              const ids = new Set(data.medicines.map(m => m.id));
              setBatches(prev => [...prev.filter(b => !ids.has(b.medicineId)), ...data.batches]);
            }
          }}
        />
      )}

      {/* POS Quick Add Customer Modal */}
      {isAddCustOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Register Customer at POS Counter</h3>
              </div>
              <button onClick={() => setIsAddCustOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePOSAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. K. A. Sunil Shantha" value={newCust.name} onChange={e=>setNewCust({...newCust, name:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID (NIC) <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. 781290348V" value={newCust.nic} onChange={e=>setNewCust({...newCust, nic:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" inputMode="tel" placeholder="+94 77 123 4567" value={newCust.phone} onChange={e=>setNewCust({...newCust, phone:e.target.value})} className="peer w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
                  <PhoneHint value={newCust.phone} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input type="email" placeholder="customer@gmail.com" value={newCust.email} onChange={e=>setNewCust({...newCust, email:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Drug Allergies</label>
                <input type="text" placeholder="e.g. Penicillin, Sulfa drugs, Aspirin" value={newCust.allergies} onChange={e=>setNewCust({...newCust, allergies:e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-rose-700 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={()=>setIsAddCustOpen(false)} className="px-4 py-2.5 bg-slate-100 font-bold rounded-xl text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer">Register & Select</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POS Customer Purchase & Rx History Modal */}
      {isViewHistoryOpen && activeCustomer.id && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 font-semibold text-sm flex items-center justify-center border border-blue-200">
                  {activeCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{activeCustomer.name}</h3>
                  <div className="text-xs text-slate-500 font-semibold flex items-center space-x-2 mt-0.5">
                    <span>NIC: {activeCustomer.nic || "N/A"}</span>
                    <span>•</span>
                    <span>Phone: {activeCustomer.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsViewHistoryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeCustomer.allergies && activeCustomer.allergies !== "None" && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-semibold flex items-center space-x-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>CRITICAL ALLERGY ALERT:</strong> {activeCustomer.allergies}</span>
              </div>
            )}

            {/* Tabs Selector */}
            {(() => {
              const custTxns = filterCustomerRecords(transactions, activeCustomer);
              const custRxs = filterCustomerRecords(prescriptions, activeCustomer);

              return (
                <>
                  <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                    <button
                      onClick={() => setHistoryTab("purchases")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        historyTab === "purchases" ? "bg-white text-blue-800 shadow-xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Checkout Purchases ({custTxns.length})</span>
                    </button>

                    <button
                      onClick={() => setHistoryTab("prescriptions")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        historyTab === "prescriptions" ? "bg-white text-blue-800 shadow-xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Prescription Records ({custRxs.length})</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {historyTab === "purchases" ? (
                      custTxns.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 font-semibold space-y-3 bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80">
                          <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                          <div className="text-sm font-bold text-slate-800">No checkout purchase invoices recorded for {activeCustomer.name} yet.</div>
                          {custRxs.length > 0 && (
                            <button
                              onClick={() => setHistoryTab("prescriptions")}
                              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-2xl font-semibold text-xs transition-all cursor-pointer border border-blue-300 shadow-xs"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>Click to View {custRxs.length} Prescription Record(s) Uploaded by Patient</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        custTxns.map((txn) => (
                          <div key={txn.id} className="bg-slate-50/80 p-4 rounded-3xl border border-slate-200/80 space-y-2.5">
                            <div className="flex justify-between items-center">
                              <div className="font-mono font-semibold text-slate-900 text-xs">{txn.invoiceNo}</div>
                              <div className="text-xs text-slate-500 font-bold">{txn.date}</div>
                            </div>

                            <div className="space-y-1 py-2 border-y border-slate-200/80">
                              {txn.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-slate-800 font-semibold">
                                  <span>{item.name} × {item.qty}</span>
                                  <span className="font-semibold">Rs. {Number(item.total).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-1 font-bold">
                              <span className="text-slate-600">Total Paid ({txn.paymentMethod || "Cash"}):</span>
                              <span className="text-blue-700 text-sm font-semibold">Rs. {Number(txn.total).toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      custRxs.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 font-semibold space-y-3 bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80">
                          <FileText className="w-10 h-10 mx-auto text-slate-300" />
                          <div className="text-sm font-bold text-slate-800">No uploaded prescription records found for {activeCustomer.name}.</div>
                        </div>
                      ) : (
                        custRxs.map((rx) => (
                          <div key={rx.id} className="bg-slate-50/80 p-4 rounded-3xl border border-slate-200/80 space-y-2.5">
                            <div className="flex justify-between items-center">
                              <div className="font-mono font-semibold text-slate-900">{rx.rxNumber || rx.id}</div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                rx.status === "Approved" ? "bg-emerald-100 text-emerald-900 border-emerald-300" :
                                rx.status === "Rejected" ? "bg-rose-100 text-rose-900 border-rose-300" :
                                "bg-amber-100 text-amber-900 border-amber-300"
                              }`}>
                                {rx.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 font-semibold">
                              Doctor/Order: <strong className="text-slate-900">{rx.doctorName}</strong> • {rx.uploadDate}
                            </div>

                            {rx.medicines && rx.medicines.length > 0 && (
                              <div className="space-y-1 py-2 border-t border-slate-200/80">
                                <span className="text-[11px] font-medium text-slate-400 block">Items & Dosage:</span>
                                {rx.medicines.map((m, idx) => (
                                  <div key={idx} className="flex justify-between text-slate-800 font-bold bg-white p-2 rounded-xl border border-slate-200">
                                    <span>{m.name} ({m.dosage})</span>
                                    <span className="text-blue-700 font-semibold">{m.quantity} units</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {rx.notes && (
                              <div className="text-[11.5px] text-slate-500 font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                                {rx.notes}
                              </div>
                            )}
                          </div>
                        ))
                      )
                    )}
                  </div>
                </>
              );
            })()}

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setIsViewHistoryOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
