import React from 'react';
import { Upload, Stethoscope, PackageCheck, Truck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    title: "Upload",
    desc: "Send a photo or PDF of a valid prescription with the patient's details.",
    icon: Upload
  },
  {
    title: "Pharmacist review",
    desc: "A registered pharmacist checks the doctor's SLMC number, dosage limits and interactions.",
    icon: Stethoscope
  },
  {
    title: "Reserve and quote",
    desc: "Approved items are held from stock and you receive an itemised price.",
    icon: PackageCheck
  },
  {
    title: "Deliver or collect",
    desc: "Pay online or on delivery, or pick it up at the counter.",
    icon: Truck
  }
];

export default function HowItWorksSection({ onUploadRx, onShop }) {
  return (
    <section aria-labelledby="how-title" className="space-y-12">

      <div className="max-w-2xl space-y-3">
        <h2 id="how-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545]">
          How prescription orders work
        </h2>
        <p className="text-base text-slate-600 leading-relaxed max-w-[60ch]">
          Pharmacy regulations require a valid prescription for every prescription medicine we dispense.
        </p>
      </div>

      <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 stagger">
        <span aria-hidden className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-[#2563EB]/60 via-slate-200 to-slate-200" />
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <li key={step.title} style={{ '--i': idx }} className="relative group">
              <div className="relative flex items-center gap-3 mb-5">
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-1 transition-colors duration-300 ${idx === 0 ? "bg-[#2563EB] text-white ring-[#2563EB] shadow-lg shadow-[#2563EB]/25" : "bg-white text-[#2563EB] ring-slate-200 group-hover:ring-[#2563EB]/40"}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#0B2545] mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-[34ch]">{step.desc}</p>
            </li>
          );
        })}
      </ol>

      {/* Closing call to action: the page's one navy block */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#0B2545] text-white">
        <img src="/images/hero_pharmacist.png" alt="" aria-hidden loading="lazy"
          className="absolute inset-y-0 right-0 w-full md:w-3/5 h-full object-cover opacity-30 md:opacity-60 [mask-image:linear-gradient(90deg,transparent,#000_45%)]" />
        <div aria-hidden className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-[#2563EB]/35 blur-3xl" />
        <div className="relative px-6 py-10 sm:px-12 sm:py-14 max-w-xl space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-4xl font-semibold leading-tight">Have a prescription ready?</h3>
            <p className="text-slate-300 leading-relaxed">Upload it now. A pharmacist starts the review and sends you an itemised price.</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={onUploadRx}
              className="group inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-[#0B2545] text-sm font-semibold shadow-lg shadow-black/20"
            >
              <Upload className="w-4 h-4 text-[#2563EB]" />
              Upload prescription
            </button>
            <button
              onClick={onShop}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
            >
              Browse the store
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
