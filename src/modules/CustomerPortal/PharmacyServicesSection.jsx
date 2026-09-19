import React from 'react';
import { Pill, Sparkles, FlaskConical, Check, MapPin } from 'lucide-react';

export default function PharmacyServicesSection({ onOpenLocation }) {
  const serviceCards = [
    {
      title: "Wide portfolio of prescription drugs",
      desc: "We offer a wide selection of prescription and over-the-counter medications, homeopathic products, dental hygiene supplies, natural remedies, and specialized children's products.",
      icon: Pill
    },
    {
      title: "Large selection of dermocosmetics",
      desc: "Specialized skincare advice and dermatological formulations for atopic skin, acne, psoriasis, body care, and hair care from top dermatologist-recommended brands.",
      icon: Sparkles
    },
    {
      title: "Individual preparation of medicines",
      desc: "Custom laboratory-manufactured pharmaceuticals, tailored liquid doses, special ointments, and custom capsules prepared precisely by our licensed pharmacists.",
      icon: FlaskConical
    }
  ];

  return (
    <section className="space-y-12 py-6">
      
      {/* 3-Column Features / Services Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1 bg-sky-100 text-[#0284c7] text-xs font-extrabold rounded-full border border-sky-200 inline-block uppercase tracking-wider">
            Healthcare Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            PHARMART Pharmacy<span className="text-[#0284c7]">.</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Providing reliable pharmaceutical care, expert consultation, and custom formulations for your total wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-sky-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-200 shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wide Selection Feature Section (2-Column Grid) */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Image of Female Pharmacist */}
        <div className="md:col-span-5 h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md border border-slate-200 relative group">
          <img 
            src="/images/female_pharmacist.png" 
            alt="Female Pharmacist" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-white/40 shadow-sm text-xs font-bold text-slate-900">
            Certified Pharmacist Care & Consultation
          </div>
        </div>

        {/* Right Column: Text Content & Bullet List */}
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#0284c7] tracking-wider uppercase">Comprehensive Inventory</span>
            <h3 className="text-3xl font-black text-slate-900">Wide Selection</h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We pride ourselves on providing a wide range of pharmaceutical products, certified health supplies, and food supplements. Our primary commitment is customer health and complete satisfaction across the wider area.
          </p>

          {/* Bullet List with Checkmarks */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center space-x-3 text-sm font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Homeopathic medicine</span>
            </div>

            <div className="flex items-center space-x-3 text-sm font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Allergy medication</span>
            </div>

            <div className="flex items-center space-x-3 text-sm font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Glucometers</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-3">
            <button
              onClick={onOpenLocation}
              className="px-7 py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              <span>Where to find us?</span>
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
