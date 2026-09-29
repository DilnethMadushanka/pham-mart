import React, { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  Star,
  Upload,
  Clock,
  Truck,
  ShieldCheck,
  ArrowRight,
  PenLine
} from 'lucide-react';

const HERO_IMAGES = [
  {
    url: '/images/hero_pharmacist.png',
    alt: 'Pharmacist at the PHARMART counter holding a medicine box'
  },
  {
    url: '/images/female_pharmacist.png',
    alt: 'Pharmacist checking stock on the dispensary shelves'
  }
];

const FACTS = [
  { icon: Clock, label: "Open 7 days a week", value: "Weekdays until 8:00 PM" },
  { icon: ShieldCheck, label: "Every prescription", value: "Checked by a pharmacist" },
  { icon: Truck, label: "Home delivery", value: "Free over Rs. 2,000" }
];

export default function HeroBanner({
  onUploadRx,
  onOpenLocation,
  onOpenGoogleFeedback
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section aria-labelledby="hero-title" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4 lg:pt-10">

        {/* Copy */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-7 animate-rise">
          <h1
            id="hero-title"
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#0B2545] leading-[1.02]"
          >
            Your prescription, checked and delivered<span className="text-[#2563EB]">.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[46ch]">
            Upload a photo of your prescription. A licensed pharmacist reviews it, and we deliver to your door.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              onClick={onUploadRx}
              className="group inline-flex items-center gap-2.5 pl-5 pr-4 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-lg shadow-[#2563EB]/25 hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload prescription</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <a
              href="tel:055-222-8292"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#2563EB]"
            >
              <Phone className="w-4 h-4 text-[#2563EB]" />
              <span className="underline decoration-slate-300 underline-offset-4 hover:decoration-[#2563EB]">055-222-8292</span>
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="lg:col-span-6 xl:col-span-7 relative animate-rise [animation-delay:120ms]">
          <div className="relative aspect-[4/3] lg:aspect-[5/4] xl:aspect-[16/12] rounded-3xl overflow-hidden bg-slate-200 shadow-xl ring-1 ring-[#0B2545]/5">
            {HERO_IMAGES.map((img, index) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                aria-hidden={index !== activeImageIndex}
                fetchPriority={index === 0 ? "high" : "low"}
                className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${
                  index === activeImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
                }`}
              />
            ))}
          </div>

          {/* Rating card overlapping the image edge */}
          <button
            onClick={onOpenGoogleFeedback}
            className="group absolute -bottom-6 left-4 sm:left-8 flex items-center gap-4 bg-white rounded-2xl pl-4 pr-5 py-3.5 shadow-lg ring-1 ring-slate-200/70 hover:-translate-y-0.5 text-left"
          >
            <span className="text-3xl font-semibold text-[#0B2545] tracking-tight tabular-nums">4.8</span>
            <span className="space-y-1">
              <span className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                ))}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-[#2563EB]">
                Google reviews
                <PenLine className="w-3 h-3" />
              </span>
            </span>
          </button>

          {/* Slide selector */}
          <div className="absolute -bottom-3 right-6 hidden sm:flex items-center gap-1.5" role="tablist" aria-label="Hero images">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={img.url}
                role="tab"
                aria-selected={i === activeImageIndex}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActiveImageIndex(i)}
                className={`h-1.5 rounded-full ${i === activeImageIndex ? "w-8 bg-[#2563EB]" : "w-3 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Facts strip, directly under the hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200/80 rounded-2xl overflow-hidden ring-1 ring-slate-200/80 mt-14">
        {FACTS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white px-5 py-4 flex items-center gap-3.5">
            <Icon className="w-5 h-5 text-[#2563EB] shrink-0" strokeWidth={1.75} />
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-sm font-semibold text-[#0B2545] truncate">{value}</div>
            </div>
          </div>
        ))}
        <button
          onClick={onOpenLocation}
          className="group bg-white hover:bg-[#EFF6FF] px-5 py-4 flex items-center gap-3.5 text-left"
        >
          <MapPin className="w-5 h-5 text-[#2563EB] shrink-0" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500">Visit the counter</div>
            <div className="text-sm font-semibold text-[#0B2545]">Main Street, City Center</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}
