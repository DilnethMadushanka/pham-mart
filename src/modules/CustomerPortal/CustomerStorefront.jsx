import React, { useState } from 'react';
import { 
  Pill, 
  Upload, 
  ShoppingCart, 
  Search, 
  ShieldCheck, 
  Truck, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Minus, 
  X,
  MapPin
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
  onOpenAuth,
  onSwitchToEnterprise,
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

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      
      {/* Full-Screen Hero Banner (Matched to Reference Screenshot 1) */}
      <HeroBanner 
        onUploadRx={() => setActivePortalTab("upload_rx")}
        onOpenAuth={onOpenAuth}
        onShop={() => setActivePortalTab("store")}
        onHowItWorks={() => {
          const el = document.getElementById("how-it-works-section");
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenGoogleFeedback={() => setIsGoogleFeedbackOpen(true)}
      />

      {/* Portal Secondary Navigation Bar */}
      <div className="flex flex-wrap justify-between items-center glass-panel depth-card p-3 rounded-2xl gap-3">

        <div className="flex items-center space-x-2 bg-slate-100/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActivePortalTab("store")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              activePortalTab === "store" ? "bg-white text-sky-800 shadow-md -translate-y-0.5" : "text-slate-600 hover:text-sky-700"
            }`}
          >
            Wellness & Baby Care Store
          </button>
          <button
            onClick={() => setActivePortalTab("upload_rx")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1.5 ${
              activePortalTab === "upload_rx" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 -translate-y-0.5" : "text-slate-600 hover:text-sky-700"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Doctor Prescription</span>
          </button>
          <button
            onClick={() => setActivePortalTab("my_orders")}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1.5 ${
              activePortalTab === "my_orders" ? "bg-white text-sky-800 shadow-md -translate-y-0.5" : "text-slate-600 hover:text-sky-700"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>My Orders & Rx Status</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLocationOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-white hover:shadow-md text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Where to find us?</span>
          </button>
        </div>

      </div>

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
        <div className="space-y-12">
          
          {/* Pharmacy Services & Wide Selection Spotlight Section */}
          <div id="assortment-section">
            <PharmacyServicesSection 
              onOpenLocation={() => setIsLocationOpen(true)}
            />
          </div>

          {/* Patient Testimonials Section */}
          <PatientTestimonialsSection />

          {/* Location & Contact Section Anchor */}
          <div id="location-section" className="pt-4">
            <div id="contact-section"></div>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works-section">
            <HowItWorksSection 
              onUploadRx={() => setActivePortalTab("upload_rx")}
              onShop={() => setActivePortalTab("store")}
            />
          </div>

          {/* FAQs Accordion Section */}
          <FaqAccordion />

        </div>
      )}

      {/* Online Cart Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in">

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center mr-2 shadow-md shadow-sky-500/30">
                  <ShoppingCart className="w-4 h-4" />
                </span>
                Consumer Checkout Basket
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600 hover:rotate-90 transition-transform">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-6">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-sky-700 font-semibold">Rs. {item.unitPrice.toFixed(2)} × {item.qty}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold transition-colors">-</button>
                      <span className="font-bold px-2">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded font-bold shadow-sm transition-transform hover:scale-105">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleOnlineCheckout} className="space-y-3 pt-2 border-t border-slate-200 text-xs">
                <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 space-y-1">
                  <div className="flex justify-between"><span>Subtotal:</span><span>Rs. {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Home Delivery Fee:</span><span>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span></div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-sky-200">
                    <span>Total Amount:</span><span className="text-gradient-brand">Rs. {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-lg hover:shadow-sky-500/30 text-white font-extrabold rounded-xl shadow-md text-xs transition-all hover:-translate-y-0.5"
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
