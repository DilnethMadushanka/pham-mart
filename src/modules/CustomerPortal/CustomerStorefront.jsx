import React, { useState } from 'react';
import { Phone as PhoneIcon } from 'lucide-react';
import { openStatus, HOURS } from '../../lib/hours';
import {
  Pill,
  Upload,
  Clock
} from 'lucide-react';
import HeroBanner from './HeroBanner';
import HowItWorksSection from './HowItWorksSection';
import FaqAccordion from './FaqAccordion';
import PharmacyServicesSection from './PharmacyServicesSection';
import PatientTestimonialsSection from './PatientTestimonialsSection';
import LocationContactModal from './LocationContactModal';
import CustomerRxUpload from './CustomerRxUpload';
import MyOrders from './MyOrders';
import StockChecker from './StockChecker';
import ShopByNeed from './ShopByNeed';
import AskPharmacistBanner from './AskPharmacistBanner';
import HealthTips from './HealthTips';
import GoogleFeedbackModal from '../../components/GoogleFeedbackModal';

export default function CustomerStorefront({ 
  medicines, 
  prescriptions, 
  setPrescriptions, 
  currentUser, 
  onRequestSignIn,
  addAuditLog 
}) {
  const [activePortalTab, setActivePortalTab] = useState("store"); // "store" | "upload_rx" | "my_orders"
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isGoogleFeedbackOpen, setIsGoogleFeedbackOpen] = useState(false);
  const footerStatus = openStatus();

  const openPortalTab = (tab) => {
    setActivePortalTab(tab);
    requestAnimationFrame(() => {
      const el = document.getElementById("portal-nav");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const [stockQuery, setStockQuery] = useState("");
  const scrollToStock = (focus) => {
    setActivePortalTab("store");
    requestAnimationFrame(() => {
      const el = document.getElementById("stock-section");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (focus) setTimeout(() => el?.querySelector("input")?.focus({ preventScroll: true }), 500);
    });
  };

  const portalTabs = [
    { id: "store", label: "Wellness store", short: "Store", icon: Pill },
    { id: "upload_rx", label: "Upload prescription", short: "Upload Rx", icon: Upload },
    { id: "my_orders", label: "My orders", short: "My orders", icon: Clock }
  ];

  return (
    <div className="animate-fade-in pb-24 sm:pb-8">

      <HeroBanner
        onUploadRx={() => openPortalTab("upload_rx")}
        onCheckStock={() => scrollToStock(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenGoogleFeedback={() => setIsGoogleFeedbackOpen(true)}
      />

      {/* Portal navigation: one segmented control for the three things a customer comes to do */}
      <nav id="portal-nav" aria-label="Customer portal" className="scroll-mt-24 mt-16 sm:mt-24 mb-12 sm:mb-16 flex justify-center">
        <div className="relative grid grid-cols-3 w-full sm:w-auto p-1 rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm">
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 rounded-xl bg-[#0B2545] shadow-md shadow-[#0B2545]/20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: "calc((100% - 0.5rem) / 3)", transform: `translateX(${portalTabs.findIndex(t => t.id === activePortalTab) * 100}%)` }}
          />
          {portalTabs.map(({ id, label, short, icon: Icon }) => {
            const isActive = activePortalTab === id;
            return (
              <button
                key={id}
                onClick={() => setActivePortalTab(id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                className={`relative z-10 flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-600 hover:text-[#0B2545]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-300" : "text-slate-400"}`} />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* DYNAMIC PORTAL VIEWS */}
      {activePortalTab === "upload_rx" && (
        <CustomerRxUpload 
          medicines={medicines}
          currentUser={currentUser}
          setPrescriptions={setPrescriptions}
          onSuccess={() => setActivePortalTab(currentUser ? "my_orders" : "store")}
          onRequestSignIn={onRequestSignIn}
        />
      )}

      {activePortalTab === "my_orders" && (
        <MyOrders 
          prescriptions={prescriptions}
          currentUser={currentUser}
          onRequestSignIn={onRequestSignIn}
        />
      )}

      {activePortalTab === "store" && (
        <div className="space-y-24 sm:space-y-32">
          <div id="assortment-section" className="scroll-mt-24 reveal">
            <PharmacyServicesSection 
              onOpenLocation={() => setIsLocationOpen(true)}
            />
          </div>

          <div className="reveal">
            <ShopByNeed medicines={medicines} onPick={(category) => { setStockQuery(category); scrollToStock(false); }} />
          </div>

          <div id="stock-section" className="scroll-mt-24 reveal">
            <StockChecker medicines={medicines} onUploadRx={() => openPortalTab("upload_rx")} query={stockQuery} onQueryChange={setStockQuery} />
          </div>

          <div className="reveal">
            <AskPharmacistBanner onUploadRx={() => openPortalTab("upload_rx")} />
          </div>

          <div className="reveal">
            <PatientTestimonialsSection onOpenGoogleFeedback={() => setIsGoogleFeedbackOpen(true)} />
          </div>

          <div id="how-it-works-section" className="scroll-mt-24 reveal">
            <HowItWorksSection 
              onUploadRx={() => openPortalTab("upload_rx")}
              onShop={() => {
                const el = document.getElementById("assortment-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          <div className="reveal">
            <HealthTips />
          </div>

          <div className="reveal">
            <FaqAccordion />
          </div>
        </div>
      )}

      {/* Contact footer */}
      <footer id="location-section" className="scroll-mt-24 mt-24 sm:mt-32 pt-12 border-t border-slate-200">
        <div id="contact-section" className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white relative" aria-hidden>
                <span className="absolute w-3.5 h-1 bg-white rounded-full"></span>
                <span className="absolute h-3.5 w-1 bg-white rounded-full"></span>
              </span>
              <span className="text-base font-semibold tracking-tight text-[#0B2545]">PHARMART Pharmacy</span>
            </div>
            <p className="text-sm text-slate-500 max-w-[38ch]">
              Licensed community pharmacy. Prescriptions reviewed by registered pharmacists.
            </p>
            <p className={`inline-flex items-center gap-2 text-sm font-medium ${footerStatus.open ? "text-emerald-700" : "text-slate-600"}`}>
              <span aria-hidden className={`w-2 h-2 rounded-full ${footerStatus.open ? "bg-[#10B981]" : "bg-slate-400"}`}></span>
              {footerStatus.text}
            </p>
          </div>

          <div className="md:col-span-2 space-y-3 text-sm">
            <h3 className="font-semibold text-[#0B2545]">Pharmacy</h3>
            <ul className="space-y-2 text-slate-600">
              <li><button onClick={() => openPortalTab("upload_rx")} className="hover:text-[#2563EB]">Upload prescription</button></li>
              <li><button onClick={() => { setActivePortalTab("store"); requestAnimationFrame(() => document.getElementById("stock-section")?.scrollIntoView({ behavior: "smooth" })); }} className="hover:text-[#2563EB]">Check stock</button></li>
              <li><button onClick={() => openPortalTab("my_orders")} className="hover:text-[#2563EB]">My orders</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3 text-sm">
            <h3 className="font-semibold text-[#0B2545]">Visit</h3>
            <button onClick={() => setIsLocationOpen(true)} className="block text-left text-slate-600 hover:text-[#2563EB]">
              Main Street Healthcare Hub, City Center
            </button>
            <p className="text-slate-600">{HOURS.weekday.label}<br />{HOURS.weekend.label}</p>
          </div>

          <div className="col-span-2 md:col-span-3 space-y-3 text-sm">
            <h3 className="font-semibold text-[#0B2545]">Call the pharmacist</h3>
            <a href="tel:055-222-8292" className="block text-2xl font-semibold tracking-tight text-[#0B2545] hover:text-[#2563EB] tabular-nums">055-222-8292</a>
            <p className="text-slate-500">Questions about dosage, stock or an order.</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} PHARMART Pharmacy</span>
          <span>Prescription medicines are dispensed only against a valid prescription.</span>
        </div>
      </footer>

      {/* Phones: the two things people come for stay one tap away */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-200/80 flex gap-2">
        <a href="tel:055-222-8292" aria-label="Call the pharmacist" className="w-12 h-12 shrink-0 rounded-xl ring-1 ring-slate-200 bg-white flex items-center justify-center text-[#0B2545]">
          <PhoneIcon className="w-5 h-5" />
        </a>
        <button onClick={() => openPortalTab("upload_rx")} className="flex-1 h-12 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-md shadow-[#2563EB]/25 flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> Upload prescription
        </button>
      </div>

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
