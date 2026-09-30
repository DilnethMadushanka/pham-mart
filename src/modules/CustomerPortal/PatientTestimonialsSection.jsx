import React from 'react';
import { Star, PenLine } from 'lucide-react';

const REVIEWS = [
  {
    name: "Dilani Wijesekara",
    detail: "Regular customer",
    text: "The pharmacists know their medicines and take time to explain dosages. I trust them with my family's prescriptions.",
    featured: true
  },
  {
    name: "Ruwan Jayasinghe",
    detail: "Home delivery",
    text: "Fast and friendly. Their skincare advice for my son's eczema made a real difference."
  },
  {
    name: "Fathima Rizvi",
    detail: "Prescription upload",
    text: "They always have the exact medication I need in stock, and the upload was easy."
  }
];

function Initials({ name, className = "" }) {
  const initials = name.split(" ").map(p => p[0]).slice(0, 2).join("");
  return (
    <span aria-hidden className={`inline-flex items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8] font-semibold ${className}`}>
      {initials}
    </span>
  );
}

function Stars({ size = "w-4 h-4" }) {
  return (
    <span className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} fill-amber-400 stroke-amber-400`} />
      ))}
    </span>
  );
}

export default function PatientTestimonialsSection({ onOpenGoogleFeedback }) {
  const [featured, ...rest] = REVIEWS;

  return (
    <section aria-labelledby="reviews-title" className="space-y-10">

      {/* Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h2 id="reviews-title" className="text-3xl sm:text-4xl font-semibold text-[#0B2545]">
          What patients say
        </h2>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="flex items-end gap-4">
          <span className="text-6xl font-semibold tracking-tight text-[#0B2545] leading-none tabular-nums">4.8</span>
          <div className="pb-1 space-y-1">
            <Stars />
            <div className="text-sm text-slate-500">Average rating on Google</div>
          </div>
        </div>
        {onOpenGoogleFeedback && (
          <button
            onClick={onOpenGoogleFeedback}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 hover:ring-[#2563EB]/40 hover:text-[#2563EB] text-sm font-semibold text-[#0B2545] shadow-xs"
          >
            <PenLine className="w-4 h-4" />
            Write a review
          </button>
        )}
        </div>
      </div>

      {/* Quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <figure className="relative md:col-span-2 lg:col-span-3 lg:row-span-2 rounded-3xl bg-white ring-1 ring-slate-200/80 p-7 sm:p-10 flex flex-col justify-between gap-10 shadow-sm overflow-hidden">
          <span aria-hidden className="absolute -top-6 right-6 text-[10rem] leading-none font-semibold text-[#EFF6FF] select-none">&rdquo;</span>
          <blockquote className="relative text-xl sm:text-2xl text-[#0B2545] leading-relaxed font-medium max-w-[60ch]">
            &ldquo;{featured.text}&rdquo;
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <Initials name={featured.name} className="w-11 h-11 text-sm" />
            <div>
              <div className="text-sm font-semibold text-[#0B2545]">{featured.name}</div>
              <div className="text-xs text-slate-500">{featured.detail}</div>
            </div>
          </figcaption>
        </figure>

        {rest.map(rev => (
          <figure key={rev.name} className="lg:col-span-2 rounded-3xl bg-slate-100/70 p-6 sm:p-7 flex flex-col justify-between gap-6">
            <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed">
              &ldquo;{rev.text}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <Initials name={rev.name} className="w-9 h-9 text-xs bg-white" />
              <div>
                <div className="text-sm font-semibold text-[#0B2545]">{rev.name}</div>
                <div className="text-xs text-slate-500">{rev.detail}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
