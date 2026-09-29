import React, { useState } from 'react';
import { Plus, Phone } from 'lucide-react';

const FAQS = [
  {
    q: "Can I buy medicines without a prescription?",
    a: "Over-the-counter products, yes. Prescription medicines always need a valid doctor's prescription. You can upload yours here for a pharmacist to review."
  },
  {
    q: "How do I upload my prescription?",
    a: "Choose Upload prescription, fill in the patient details and your doctor's registration number, attach a clear photo or PDF, and submit. A licensed pharmacist will review it."
  },
  {
    q: "How are controlled drugs handled?",
    a: "Controlled drugs need a pharmacist's authorisation. Dispensing stays locked until a licensed pharmacist has checked the prescription against safety protocols."
  },
  {
    q: "What are the delivery times and charges?",
    a: "We deliver the same day across the area, with express dispatch within 24 hours. Delivery is free on orders over Rs. 2,000, otherwise Rs. 250."
  },
  {
    q: "How do you avoid billing mistakes?",
    a: "Prices, discounts and taxes are calculated by the system when a prescription is approved, and stock is deducted at the same time, so nothing is added up by hand."
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section aria-labelledby="faq-title" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 w-full">

      <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 self-start">
        <h2 id="faq-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545]">
          Common questions
        </h2>
        <p className="text-base text-slate-600 leading-relaxed">
          Can't find your answer? Call the duty pharmacist.
        </p>
        <a
          href="tel:055-222-8292"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >
          <Phone className="w-4 h-4" />
          055-222-8292
        </a>
      </div>

      <div className="lg:col-span-8 divide-y divide-slate-200 border-y border-slate-200">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `faq-panel-${idx}`;
          return (
            <div key={faq.q}>
              <h3>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full py-6 text-left flex justify-between items-center gap-6 group"
                >
                  <span className={`text-base sm:text-lg font-medium ${isOpen ? "text-[#2563EB]" : "text-[#0B2545] group-hover:text-[#2563EB]"}`}>
                    {faq.q}
                  </span>
                  <Plus
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45 text-[#2563EB]" : "text-slate-400 group-hover:text-[#2563EB]"}`}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p className="pb-6 pr-10 text-sm sm:text-base text-slate-600 leading-relaxed max-w-[65ch]">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
