import React from 'react';
import { X, MapPin, Phone, Clock, Mail, ExternalLink, Navigation } from 'lucide-react';

export default function LocationContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl ring-1 ring-slate-200/70 overflow-hidden animate-rise">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0B2545]">Visit PHARMART</h3>
              <p className="text-xs text-slate-500">Address, hours and contact details</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#0B2545] hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Address</span>
                <span className="text-slate-600 font-medium">Main Street Healthcare Hub, City Center</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-200 pt-2.5">
              <Clock className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Operating Hours</span>
                <span className="text-slate-600 font-medium">Monday - Friday: 7:30 AM - 8:00 PM<br/>Saturday - Sunday: 8:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-200 pt-2.5">
              <Phone className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Phone Line</span>
                <a href="tel:055-222-8292" className="text-[#2563EB] font-semibold text-sm hover:underline">055-222-8292</a>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-200 pt-2.5">
              <Mail className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Email</span>
                <span className="text-slate-600 font-medium">info@pharmart.com</span>
              </div>
            </div>
          </div>

          {/* Map Visual */}
          <div className="h-36 rounded-xl bg-blue-50 border border-blue-200 flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
            <Navigation className="w-6 h-6 text-[#2563EB] mb-1.5" />
            <div className="font-bold text-slate-900 text-sm">PHARMART Pharmacy Counter</div>
            <p className="text-[11px] text-slate-500">City Healthcare Center</p>
          </div>

          <button
            onClick={() => {
              window.open("https://maps.google.com", "_blank");
            }}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Google Maps</span>
          </button>

        </div>

      </div>
    </div>
  );
}
