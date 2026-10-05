import React from 'react';
import { Phone, Upload, ShieldCheck, Truck, CalendarCheck } from 'lucide-react';

// Photo band between the store sections: a person to talk to, and the three
// promises that matter before someone orders.
export default function AskPharmacistBanner({ onUploadRx }) {
  return (
    <section aria-labelledby="ask-title" className="grain relative rounded-[28px] overflow-hidden bg-[#0B2545] text-white">
      <img
        src="/images/female_pharmacist.png"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-y-0 right-0 h-full w-full md:w-[55%] object-cover object-[center_20%] opacity-40 md:opacity-100 [mask-image:linear-gradient(90deg,transparent,#000_35%)]"
      />
      <div aria-hidden className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-[#2563EB]/35 blur-3xl" />

      <div className="relative grid md:grid-cols-12 gap-10 px-6 py-12 sm:px-12 sm:py-16">
        <div className="md:col-span-7 lg:col-span-6 space-y-6">
          <h2 id="ask-title" className="text-3xl sm:text-4xl font-semibold leading-[1.08] max-w-[18ch]">
            Not sure what you need? Ask the pharmacist.
          </h2>
          <p className="text-slate-300 leading-relaxed max-w-[46ch]">
            Describe the symptoms or send the slip. A licensed pharmacist checks doses, interactions and the doctor before anything leaves the counter.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:055-222-8292" className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-white text-[#0B2545] font-semibold text-sm hover:bg-blue-50 transition-colors">
              <Phone className="w-4 h-4 text-[#2563EB]" /> Call 055-222-8292
            </a>
            <button onClick={onUploadRx} className="inline-flex items-center gap-2 h-12 px-5 rounded-xl ring-1 ring-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
              <Upload className="w-4 h-4" /> Upload prescription
            </button>
          </div>

          <ul className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-white/15 text-sm">
            <li className="flex items-start gap-2.5">
              <CalendarCheck className="w-5 h-5 text-blue-300 shrink-0" strokeWidth={1.75} />
              <span className="text-slate-200">Prescriptions accepted within 7 days of issue</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-300 shrink-0" strokeWidth={1.75} />
              <span className="text-slate-200">Doctor checked against our doctor database</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Truck className="w-5 h-5 text-blue-300 shrink-0" strokeWidth={1.75} />
              <span className="text-slate-200">Free delivery on orders over Rs. 2,000</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
