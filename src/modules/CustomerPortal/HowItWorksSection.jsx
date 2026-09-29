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

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 stagger">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <li key={step.title} style={{ '--i': idx }} className="relative pt-6 border-t-2 border-slate-200 group">
              <span
                aria-hidden
                className="absolute -top-[2px] left-0 h-[2px] w-10 bg-[#2563EB] transition-all duration-500 group-hover:w-full"
              />
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-mono text-slate-400">{idx + 1}</span>
                <Icon className="w-5 h-5 text-[#2563EB]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#0B2545] mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </li>
          );
        })}
      </ol>

      {/* CTA band */}
      <div className="rounded-3xl bg-[#EFF6FF] ring-1 ring-[#2563EB]/10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-semibold text-[#0B2545]">Have a prescription ready?</h3>
          <p className="text-sm text-slate-600">Upload it now and a pharmacist will start the review.</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <button
            onClick={onUploadRx}
            className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md shadow-[#2563EB]/20"
          >
            <Upload className="w-4 h-4" />
            Upload prescription
          </button>
          <button
            onClick={onShop}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B2545] hover:text-[#2563EB]"
          >
            Browse the store
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
