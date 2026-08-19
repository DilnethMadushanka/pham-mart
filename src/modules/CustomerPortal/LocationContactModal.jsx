import React from 'react';
import { X, MapPin, Phone, Clock, Mail, ExternalLink, Navigation } from 'lucide-react';

export default function LocationContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#00875A] p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">PHARMART Pharmacy Location</h3>
              <p className="text-xs text-emerald-100">Where to find us & Contact Info</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#00875A] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Address</span>
                <span className="text-slate-600 font-medium">Main Street Healthcare Hub, City Center</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-200 pt-2.5">
              <Clock className="w-5 h-5 text-[#00875A] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Operating Hours</span>
                <span className="text-slate-600 font-medium">Monday - Friday: 7:30 AM - 8:00 PM<br/>Saturday - Sunday: 8:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-200 pt-2.5">
              <Phone className="w-5 h-5 text-[#00875A] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Phone Line</span>
                <a href="tel:555-0192" className="text-[#00875A] font-black text-sm hover:underline">555-0192</a>
              </div>
            </div>

            <div className="flex items-start space-x-3 border-t border-slate-200 pt-2.5">
              <Mail className="w-5 h-5 text-[#00875A] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Email</span>
                <span className="text-slate-600 font-medium">info@pharmart.com</span>
              </div>
            </div>
          </div>

          {/* Map Visual */}
          <div className="h-36 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
            <Navigation className="w-7 h-7 text-[#00875A] mb-1 animate-bounce" />
            <div className="font-bold text-slate-900 text-sm">PHARMART Pharmacy Counter</div>
            <p className="text-[11px] text-slate-500">City Healthcare Center</p>
          </div>

          <button
            onClick={() => {
              window.open("https://maps.google.com", "_blank");
            }}
            className="w-full py-3 bg-[#00875A] hover:bg-[#00704a] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Google Maps</span>
          </button>

        </div>

      </div>
    </div>
  );
}
