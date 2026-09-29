import React, { useState } from 'react';
import {
  Pill,
  Upload,
  ShoppingCart,
  Clock,
  X
} from 'lucide-react';
import HeroBanner from './HeroBanner';
import HowItWorksSection from './HowItWorksSection';
import FaqAccordion from './FaqAccordion';
import PharmacyServicesSection from './PharmacyServicesSection';
import PatientTestimonialsSection from './PatientTestimonialsSection';
import LocationContactModal from './LocationContactModal';
import CustomerRxUpload from './CustomerRxUpload';
import MyOrders from './MyOrders';
import GoogleFeedbackModal from '../../components/GoogleFeedbackModal';

export default function CustomerStorefront({ 
  medicines, 
  customers, 
  prescriptions, 
  setPrescriptions, 
  currentUser, 
  addAuditLog 
}) {
  const [activePortalTab, setActivePortalTab] = useState("store"); // "store" | "upload_rx" | "my_orders"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isGoogleFeedbackOpen, setIsGoogleFeedbackOpen] = useState(false);

  // Filter products: Show Consumer/OTC items on Storefront
  const consumerProducts = medicines.filter(m => m.isConsumerProduct || !m.prescriptionRequired);

  const categories = Array.from(new Set(consumerProducts.map(m => m.category)));

  const filteredProducts = consumerProducts.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const deliveryFee = subtotal > 2000 ? 0 : 250;
  const grandTotal = subtotal + deliveryFee;

  const handleOnlineCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    alert(`Order placed successfully! Thank you for ordering from PHARMART Pharmacy Store.\n\nTotal: LKR ${grandTotal.toFixed(2)}\nDelivery to: ${currentUser?.address || 'Your Registered Address'}`);
    
    addAuditLog("Online Customer Purchase", `Customer ${currentUser?.name || 'Walk-in'} ordered consumer products LKR ${grandTotal.toFixed(2)}`, "info");
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const openPortalTab = (tab) => {
    setActivePortalTab(tab);
    requestAnimationFrame(() => {
      const el = document.getElementById("portal-nav");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const portalTabs = [
    { id: "store", label: "Wellness store", icon: Pill },
    { id: "upload_rx", label: "Upload prescription", icon: Upload },
    { id: "my_orders", label: "My orders", icon: Clock }
  ];

  return (
    <div className="animate-fade-in pb-8">

      <HeroBanner
        onUploadRx={() => openPortalTab("upload_rx")}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenGoogleFeedback={() => setIsGoogleFeedbackOpen(true)}
      />

      {/* Portal navigation */}
      <nav id="portal-nav" aria-label="Customer portal" className="scroll-mt-20 mt-16 sm:mt-20 mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-1 -mb-px overflow-x-auto">
          {portalTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activePortalTab === id;
            return (
              <button
                key={id}
                onClick={() => setActivePortalTab(id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-[#2563EB] text-[#0B2545]"
                    : "border-transparent text-slate-500 hover:text-[#0B2545] hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#2563EB]" : ""}`} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* DYNAMIC PORTAL VIEWS */}
      {activePortalTab === "upload_rx" && (
        <CustomerRxUpload 
          customers={customers}
          medicines={medicines}
          currentUser={currentUser}
          setPrescriptions={setPrescriptions}
          onSuccess={() => setActivePortalTab("my_orders")}
          addAuditLog={addAuditLog}
        />
      )}

      {activePortalTab === "my_orders" && (
        <MyOrders 
          prescriptions={prescriptions}
          currentUser={currentUser}
        />
      )}

      {activePortalTab === "store" && (
        <div className="space-y-24 sm:space-y-32">
          <div id="assortment-section" className="scroll-mt-24">
            <PharmacyServicesSection 
              onOpenLocation={() => setIsLocationOpen(true)}
            />
          </div>

          <PatientTestimonialsSection onOpenGoogleFeedback={() => setIsGoogleFeedbackOpen(true)} />

          <div id="how-it-works-section" className="scroll-mt-24">
            <HowItWorksSection 
              onUploadRx={() => openPortalTab("upload_rx")}
              onShop={() => {
                const el = document.getElementById("assortment-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          <FaqAccordion />
        </div>
      )}

      {/* Contact footer */}
      <footer id="location-section" className="scroll-mt-24 mt-24 sm:mt-32 pt-12 border-t border-slate-200">
        <div id="contact-section" className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white relative" aria-hidden>
                <span className="absolute w-3.5 h-1 bg-white rounded-full"></span>
                <span className="absolute h-3.5 w-1 bg-white rounded-full"></span>
              </span>
              <span className="text-base font-semibold tracking-tight text-[#0B2545]">PHARMART Pharmacy</span>
            </div>
            <p className="text-sm text-slate-500 max-w-[40ch]">
              Licensed community pharmacy. Prescriptions reviewed by registered pharmacists.
            </p>
          </div>
          <dl className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <dt className="text-slate-500">Visit</dt>
              <dd>
                <button onClick={() => setIsLocationOpen(true)} className="font-medium text-[#0B2545] hover:text-[#2563EB] text-left">
                  Main Street Healthcare Hub, City Center
                </button>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-slate-500">Hours</dt>
              <dd className="font-medium text-[#0B2545]">Mon - Fri 7:30 AM - 8:00 PM<br />Sat - Sun 8:00 AM - 6:00 PM</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-slate-500">Call</dt>
              <dd><a href="tel:055-222-8292" className="font-medium text-[#0B2545] hover:text-[#2563EB]">055-222-8292</a></dd>
            </div>
          </dl>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} PHARMART Pharmacy
        </div>
      </footer>

      {/* Online Cart Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Consumer Checkout Basket
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-6">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-blue-700 font-semibold">Rs. {item.unitPrice.toFixed(2)} × {item.qty}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-0.5 bg-slate-200 rounded font-bold">-</button>
                      <span className="font-bold px-2">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleOnlineCheckout} className="space-y-3 pt-2 border-t border-slate-200 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between"><span>Subtotal:</span><span>Rs. {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Home Delivery Fee:</span><span>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span></div>
                  <div className="flex justify-between font-semibold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Total Amount:</span><span className="text-blue-700">Rs. {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md text-xs"
                >
                  Confirm & Place Delivery Order
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Location & Contact Modal */}
      <LocationContactModal 
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      {/* Google Reviews & Feedback Submission Modal */}
      <GoogleFeedbackModal 
        isOpen={isGoogleFeedbackOpen}
        onClose={() => setIsGoogleFeedbackOpen(false)}
        currentUser={currentUser}
        addAuditLog={addAuditLog}
      />

    </div>
  );
}
