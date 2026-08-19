import React from 'react';
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
  Sparkles
} from 'lucide-react';

export default function HeroBanner({ 
  onUploadRx, 
  onOpenAuth, 
  onShop,
  onOpenLocation
}) {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,168,107,0.25)] border border-[#00A86B]/20 min-h-[480px] sm:min-h-[520px] md:min-h-[560px] flex flex-col justify-between group transition-all duration-500 font-sans">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out scale-105 group-hover:scale-100"
        style={{ backgroundImage: `url('/images/hero_pharmacist.png')` }}
      ></div>

      {/* Multi-Layer Responsive Gradient & Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/40 backdrop-blur-[1px]"></div>
      <div className="absolute top-0 right-0 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-[#00A86B]/20 rounded-full filter blur-[100px] sm:blur-[140px] pointer-events-none"></div>

      {/* Main Responsive Content Container */}
      <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between h-full min-h-[480px] sm:min-h-[520px] md:min-h-[560px] w-full">
        
        {/* Top Header Row inside Hero */}
        <div className="flex flex-wrap justify-between items-center pb-4 sm:pb-5 border-b border-white/15 gap-3 w-full">
          
          {/* Logo with Green Cross Icon */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#00A86B] flex items-center justify-center text-white shadow-lg shadow-[#00A86B]/30 ring-4 ring-[#00A86B]/20 shrink-0">
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <div className="absolute w-4 sm:w-5 h-1 sm:h-1.5 bg-white rounded-full"></div>
                <div className="absolute h-4 sm:h-5 w-1 sm:w-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white block leading-none font-heading">
                PHARMART Pharmacy
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-[#00A86B] uppercase tracking-widest block mt-0.5 font-sans">
                Premium Healthcare Services
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium font-sans">
            <button 
              onClick={() => {
                const el = document.getElementById("assortment-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onShop) onShop();
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            >
              Assortment
            </button>

            <button 
              onClick={() => {
                if (onOpenLocation) onOpenLocation();
                const el = document.getElementById("location-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all flex items-center space-x-1"
            >
              <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Location</span>
            </button>

            <button 
              onClick={onOpenAuth}
              className="px-4.5 py-2 rounded-xl bg-[#00A86B] hover:bg-[#00925d] text-white font-semibold shadow-lg shadow-[#00A86B]/30 transition-all flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Hero Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 my-auto py-4 sm:py-6 items-center w-full">
          
          {/* Left Column Content */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6 animate-slide-up">
            
            {/* Trust Pill Overlay */}
            <div className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#00A86B]/20 border border-[#00A86B]/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00A86B] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#00A86B] uppercase tracking-wider font-sans">
                Trusted Healthcare & Pharmacy Portal
              </span>
            </div>

            {/* Responsive Main Heading */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-heading">
                PHARMART Pharmacy<span className="text-[#00A86B]">.</span>
              </h1>

              {/* Responsive Subheading */}
              <p className="text-sm sm:text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-3xl pt-1 font-sans">
                We sell medicines in the wider area and beyond. Providing certified pharmaceuticals, prescription clearance, and expert healthcare advice.
              </p>
            </div>

            {/* Responsive CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 font-sans">
              
              {/* Primary Green CTA Button */}
              <a
                href="tel:555-0192"
                className="px-6 sm:px-8 py-3.5 rounded-full bg-[#00A86B] hover:bg-[#00925d] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#00A86B]/40 transition-all flex items-center justify-center space-x-3 transform hover:-translate-y-0.5 active:scale-95"
              >
                <div className="p-1 rounded-full bg-white/20">
                  <Phone className="w-4 h-4 fill-white" />
                </div>
                <span className="tracking-wide">555-0192</span>
              </a>

              {/* Secondary Glassmorphism CTA */}
              <button
                onClick={onOpenLocation}
                className="px-6 sm:px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-sm sm:text-base backdrop-blur-md border border-white/20 shadow-md transition-all flex items-center justify-center space-x-2.5 transform hover:-translate-y-0.5"
              >
                <MapPin className="w-4 h-4 text-[#00A86B]" />
                <span>Where to find us?</span>
              </button>

              {/* Prescription CTA Button */}
              <button
                onClick={onUploadRx}
                className="px-6 sm:px-7 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-slate-700/80 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
              >
                <Upload className="w-4 h-4 text-[#00A86B]" />
                <span>Upload Doctor Rx</span>
              </button>
            </div>

            {/* Social Proof Indicators */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2 text-xs sm:text-sm text-white font-medium font-sans">
              <div className="flex items-center space-x-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>4.8 rating on Google</span>
                <div className="flex items-center text-amber-400 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-[#00A86B] font-semibold px-2 py-1">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span className="text-slate-200">Verified Patient Reviews</span>
              </div>
            </div>

          </div>

          {/* Right Side: Glassmorphism Card (Visible on Desktop / Tablet) */}
          <div className="hidden lg:flex lg:col-span-4 justify-end">
            <div className="w-full max-w-xs p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 text-white hover:border-[#00A86B]/40 transition-all font-sans">
              
              <div className="flex items-center space-x-3 pb-3 border-b border-white/15">
                <div className="w-10 h-10 rounded-2xl bg-[#00A86B]/20 border border-[#00A86B]/40 flex items-center justify-center text-[#00A86B]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-heading">PHARMART Standard</h4>
                  <p className="text-[11px] text-slate-300 font-medium">Licensed Pharmacy Details</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-200">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Availability</span>
                  <span className="font-bold text-[#00A86B]">365 Days / Year</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Consultation</span>
                  <span className="font-bold text-[#00A86B]">Licensed Pharmacist</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Coverage</span>
                  <span className="font-bold text-[#00A86B]">Wide Area Express</span>
                </div>
              </div>

              <div className="pt-1 text-center text-[11px] text-slate-300 italic font-normal">
                "Modern Web 3.0 healthcare experience with high-precision prescription verification."
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Feature Strip - Responsive Grid */}
        <div className="pt-4 sm:pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-200 w-full font-sans">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all">
            <Clock className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#00A86B] shrink-0" />
            <span>Fast Pharmacist Consultation: <strong className="text-white font-bold">Express Service</strong></span>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all">
            <Truck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#00A86B] shrink-0" />
            <span>Local & Wider Area <strong className="text-white font-bold">Direct Delivery</strong></span>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all sm:col-span-2 lg:col-span-1">
            <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#00A86B] shrink-0" />
            <span>Certified <strong className="text-white font-bold">Healthcare Licensed</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
