import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Star, 
  Upload, 
  LogIn, 
  Clock,
  Truck,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Pill,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const HERO_IMAGES = [
  { 
    url: '/images/hero_pharmacist.png', 
    title: 'Certified Pharmacists',
    subtitle: 'Expert healthcare advice & consultation' 
  },
  { 
    url: '/images/female_pharmacist.png', 
    title: 'Precision Verification',
    subtitle: 'Licensed doctor prescription clearance' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1600&auto=format&fit=crop', 
    title: 'Modern E-Pharmacy Store',
    subtitle: '100% genuine medical supplies' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1600&auto=format&fit=crop', 
    title: 'Express Doorstep Delivery',
    subtitle: 'Fast medication fulfillment across the region' 
  }
];

export default function HeroBanner({ 
  onUploadRx, 
  onOpenAuth, 
  onShop,
  onOpenLocation,
  onOpenGoogleFeedback
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setActiveImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
  };

  const handlePrevSlide = () => {
    setActiveImageIndex(prev => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/20 shadow-xl min-h-[480px] sm:min-h-[520px] lg:min-h-[540px] flex flex-col justify-between font-sans group">
      
      {/* Dynamic Background Image Slideshow with Smooth Cross-Fade */}
      {HERO_IMAGES.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out mix-blend-overlay transform ${
            index === activeImageIndex 
              ? "opacity-35 scale-100" 
              : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ backgroundImage: `url('${img.url}')` }}
        ></div>
      ))}

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Multi-Layer Soft Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent"></div>

      {/* Content Container */}
      <div className="relative z-10 p-5 sm:p-8 lg:p-10 flex flex-col justify-between h-full min-h-[480px] sm:min-h-[520px] lg:min-h-[540px] w-full">
        
        {/* Top Navigation Row inside Hero */}
        <div className="flex flex-wrap justify-between items-center pb-4 border-b border-white/10 gap-3">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/30 shrink-0">
              <Pill className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white block leading-none">
                PHARMART Pharmacy
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mt-1">
                Licensed Community Pharmacy & Healthcare
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <button 
              onClick={() => {
                const el = document.getElementById("assortment-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onShop) onShop();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
            >
              Browse Medicines
            </button>

            <button 
              onClick={() => {
                if (onOpenLocation) onOpenLocation();
                const el = document.getElementById("location-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all flex items-center space-x-1 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location</span>
            </button>

            <button 
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Central Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4 items-center">
          
          {/* Left Column: Heading & Buttons */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Pill Badge with Active Image Caption */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md transition-all">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                {HERO_IMAGES[activeImageIndex].title} • {HERO_IMAGES[activeImageIndex].subtitle}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Your Health, Our Priority<span className="text-emerald-400">.</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-medium max-w-xl">
                Certified pharmaceuticals, instant doctor prescription clearance by licensed Pharmacists, and express home delivery straight to your door.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-bold">
              
              <button
                onClick={onUploadRx}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all flex items-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer font-bold"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Doctor Prescription</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:055-222-8292"
                className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hotline: 055-222-8292</span>
              </a>

              <button
                onClick={onOpenLocation}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 backdrop-blur-md border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Find Store</span>
              </button>

            </div>

            {/* Ratings & Verification */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white font-semibold">
              <button 
                onClick={onOpenGoogleFeedback}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-400/40 text-amber-300 transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <span className="font-bold text-amber-400">Google 4.8 ★</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
              </button>

              <button 
                onClick={onOpenGoogleFeedback}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white font-extrabold border border-emerald-400/40 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>⭐ Write Patient Review & Feedback</span>
              </button>
            </div>

          </div>

          {/* Right Column: Highlights Card + Slideshow Controls */}
          <div className="hidden lg:flex lg:col-span-4 flex-col justify-end items-end space-y-3">
            <div className="w-full max-w-xs p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl space-y-3 text-white font-sans">
              
              <div className="flex items-center space-x-3 pb-2.5 border-b border-white/15">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">PHARMART Standards</h4>
                  <p className="text-[10px] text-emerald-300 font-medium">Certified Care</p>
                </div>
              </div>

              <div className="space-y-2 text-[11px] font-semibold">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-300">Availability</span>
                  <span className="text-emerald-400 font-bold">365 Days / Year</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-300">Consultation</span>
                  <span className="text-emerald-400 font-bold">Duty Pharmacist</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-slate-300">Delivery</span>
                  <span className="text-emerald-400 font-bold">Express Direct</span>
                </div>
              </div>

              {/* Slideshow Manual Controls & Dots */}
              <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activeImageIndex ? "w-6 bg-emerald-400" : "w-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handlePrevSlide}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleNextSlide}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Feature Strip */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-200 font-medium">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pharmacist Review: <strong className="text-white font-bold">Express Service</strong></span>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Regional <strong className="text-white font-bold">Direct Doorstep Delivery</strong></span>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Certified <strong className="text-white font-bold">Healthcare Licensed</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
