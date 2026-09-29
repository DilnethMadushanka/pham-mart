import React from 'react';
import { Pill, Sparkles, FlaskConical, Check, MapPin, ArrowRight } from 'lucide-react';

const RANGE = [
  "Homeopathic medicine",
  "Allergy medication",
  "Glucometers",
  "Food supplements",
  "Dental hygiene",
  "Children's health"
];

export default function PharmacyServicesSection({ onOpenLocation }) {
  return (
    <section aria-labelledby="services-title" className="space-y-10">

      <div className="max-w-2xl space-y-3">
        <h2 id="services-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545]">
          What we stock and prepare
        </h2>
        <p className="text-base text-slate-600 leading-relaxed max-w-[60ch]">
          Prescription and over-the-counter medicine, skincare advice, and medicines made up to order by our pharmacists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:auto-rows-[minmax(200px,auto)]">

        {/* Image tile */}
        <figure className="md:col-span-2 lg:col-span-5 lg:row-span-2 relative rounded-3xl overflow-hidden bg-slate-200 min-h-[320px] group">
          <img
            src="/images/female_pharmacist.png"
            alt="PHARMART pharmacist holding a box of medicine in front of the dispensary shelves"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </figure>

        {/* Prescription drugs: wide tinted tile */}
        <article className="md:col-span-2 lg:col-span-7 rounded-3xl bg-[#EFF6FF] p-7 sm:p-9 flex flex-col justify-between gap-8">
          <Pill className="w-7 h-7 text-[#2563EB]" strokeWidth={1.75} />
          <div className="space-y-2 max-w-lg">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#0B2545]">Prescription and everyday medicine</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Prescription and over-the-counter medication, homeopathic products, natural remedies and children's products.
            </p>
          </div>
        </article>

        {/* Dermocosmetics: white tile */}
        <article className="lg:col-span-3 rounded-3xl bg-white ring-1 ring-slate-200/80 p-7 flex flex-col justify-between gap-8">
          <Sparkles className="w-6 h-6 text-[#2563EB]" strokeWidth={1.75} />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#0B2545]">Dermocosmetics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Skincare advice for atopic skin, acne, psoriasis, body and hair care.
            </p>
          </div>
        </article>

        {/* Compounding: navy tile */}
        <article className="lg:col-span-4 rounded-3xl bg-[#0B2545] text-white p-7 flex flex-col justify-between gap-8 relative overflow-hidden">
          <div aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#2563EB]/30 blur-3xl" />
          <FlaskConical className="w-6 h-6 text-blue-300 relative" strokeWidth={1.75} />
          <div className="space-y-2 relative">
            <h3 className="text-lg font-semibold">Made to order</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Liquid doses, ointments and capsules prepared by our licensed pharmacists.
            </p>
          </div>
        </article>
      </div>

      {/* Range list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start pt-2">
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-xl font-semibold text-[#0B2545]">A wide range on the shelf</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-[48ch]">
            Pharmaceutical products, certified health supplies and supplements, stocked at our counter.
          </p>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {RANGE.map(item => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-800">
                <Check className="w-4 h-4 text-[#2563EB] shrink-0" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={onOpenLocation}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            <MapPin className="w-4 h-4" />
            <span>Where to find us</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
