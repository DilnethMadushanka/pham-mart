import React, { useState } from 'react';
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
