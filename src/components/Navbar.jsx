import React, { useState } from 'react';
import {
  Pill,
  ShieldCheck,
  Bell,
  UserCheck,
  History,
  LogIn,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Search
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  viewMode,
  setViewMode,
  currentUser,
  onOpenAuthModal,
  onLogout,
  unreadNotificationCount, 
  onOpenNotifications,
  onOpenAuditLogs
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const roles = [
    { key: "Owner/Admin", label: "Owner / Admin", icon: ShieldCheck },
    { key: "Pharmacist", label: "Pharmacist", icon: Pill },
    { key: "Cashier", label: "Cashier", icon: UserCheck },
    { key: "Customer", label: "Customer Portal", icon: Globe }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer" onClick={() => setViewMode("website")}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/20 shrink-0">
                {/* Light Blue Medical Cross Icon */}
                <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  <div className="absolute w-4 sm:w-5 h-1 sm:h-1.5 bg-white rounded-full"></div>
                  <div className="absolute h-4 sm:h-5 w-1 sm:w-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-heading">
                    PHARMART<span className="text-[#2563EB]">.</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                    Healthcare
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block font-medium">
                  {viewMode === "website" ? "Professional Medical & Pharmacy Portal" : "Enterprise Management System"}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            {viewMode === "website" && (
              <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-700">
                <a 
                  href="#assortment" 
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("assortment-section");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Assortment
                </a>
                <a 
                  href="#location" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenNotifications) onOpenNotifications();
                    const el = document.getElementById("location-section");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Location
                </a>
                <a 
                  href="#contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("contact-section");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Contact
                </a>
                {/* Enterprise Console Link - Only for Staff Users */}
                {currentUser && (currentUser.userType === "staff" || currentUser.role !== "Customer") && (
                  <button
                    onClick={() => setViewMode("enterprise")}
                    className="text-slate-600 hover:text-[#2563EB] transition-colors flex items-center space-x-1.5 font-bold"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Enterprise Console</span>
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Global Search Bar (Enterprise Console) */}
          {viewMode === "enterprise" && (
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, orders, customers..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F1F5F9] border border-transparent focus:border-[#2563EB]/40 focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Role Switcher (When in Enterprise Console) */}
          {viewMode === "enterprise" && (
            <div className="hidden xl:flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              {roles.map((r) => {
                const Icon = r.icon;
                const isActive = currentRole === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setCurrentRole(r.key)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Action Buttons & Mobile Hamburger Button */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            
            {viewMode === "enterprise" && (
              <>
                <button
                  onClick={onOpenAuditLogs}
                  title="System Audit Trail"
                  className="p-2 text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
                >
                  <History className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenNotifications}
                  className="p-2 text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Auth Account Button / Logged In User Pill */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="relative shrink-0">
                  <img
                    src={
                      currentUser.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563EB&color=fff&bold=true&rounded=true`
                    }
                    alt={currentUser.name}
                    className="w-8.5 h-8.5 rounded-full border-2 border-[#2563EB] object-cover shadow-sm"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563EB&color=fff&bold=true`;
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white"></span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-[#2563EB] font-semibold">{currentUser.role || "Customer"}</div>
                </div>
                <button 
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In / Register</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

            {/* Mobile Navigation Toggle Button */}
            {viewMode === "website" && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-[#2563EB] lg:hidden rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {viewMode === "website" && isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3 animate-fade-in text-sm font-medium text-slate-800">
            <a 
              href="#assortment"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                const el = document.getElementById("assortment-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
            >
              Assortment
            </a>

            <a 
              href="#location"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                if (onOpenNotifications) onOpenNotifications();
                const el = document.getElementById("location-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
            >
              Location
            </a>

            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                const el = document.getElementById("contact-section");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
            >
              Contact
            </a>

            {currentUser && (currentUser.userType === "staff" || currentUser.role !== "Customer") && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setViewMode("enterprise");
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white transition-colors flex items-center space-x-2 font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Switch to Enterprise Console</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
