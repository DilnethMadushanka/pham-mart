import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Can I buy medicines without a prescription on PHARMART Pharmacy?",
      a: "No. In accordance with healthcare regulations and safety standards, all prescription medications require a valid doctor prescription. You can easily upload your prescription on our online portal for fast Pharmacist review and clearance."
    },
    {
      q: "How do I upload my doctor prescription to PHARMART Pharmacy?",
      a: "Click on 'Upload Doctor Rx', fill in patient details and your doctor's medical registration number, attach a clear photograph or PDF scan of your prescription, and submit it. Our licensed Pharmacists will verify and process it within minutes."
    },
    {
      q: "How are controlled dangerous drugs verified & handled?",
      a: "Controlled drugs require mandatory Pharmacist authorization. Our system strictly locks medication dispensing until a licensed Pharmacist approves the prescription credentials against official safety protocols."
    },
    {
      q: "What are the home delivery times and charges?",
      a: "We offer same-day direct delivery across the wider area and express 24-hour dispatch. Home delivery is completely FREE for all medicine orders above $20."
    },
    {
      q: "How does PHARMART Pharmacy prevent billing & pricing errors?",
      a: "Our automated system calculates discounts, applicable taxes, and real-time inventory deductions upon prescription clearance, ensuring 100% accurate billing without manual calculation errors."
    }
  ];

  return (
    <section className="bg-[#F8F9FA] rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 w-full">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-md shadow-[#0284c7]/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions (FAQs)<span className="text-[#0284c7]">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Prescription fulfillment, pharmacy services & direct delivery guidelines
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-sky-100 text-[#0284c7] text-xs font-black border border-sky-200">
          PHARMART Help Center
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-4 w-full">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div 
              key={idx}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? "border-[#0284c7] bg-white shadow-md ring-1 ring-[#0284c7]/30" 
                  : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left font-extrabold text-slate-900 text-sm sm:text-base flex justify-between items-center space-x-4 group"
              >
                <span className="flex items-center space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${isOpen ? "bg-[#0284c7]" : "bg-slate-300 group-hover:bg-sky-500"}`}></span>
                  <span className={isOpen ? "text-[#0284c7]" : "text-slate-900"}>{faq.q}</span>
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-sky-50 text-[#0284c7]" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-slide-up font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
}
