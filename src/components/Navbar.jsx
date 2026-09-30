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

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

function Avatar({ user }) {
  const [failed, setFailed] = useState(false);
  const initials = (user.name || "?").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="relative shrink-0">
      {user.avatar && !failed ? (
        <img
          src={user.avatar}
          alt=""
          onError={() => setFailed(true)}
          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
        />
      ) : (
        <span className="w-9 h-9 rounded-xl bg-[#0B2545] text-white text-xs font-semibold flex items-center justify-center">
          {initials}
        </span>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white" aria-label="Online"></span>
    </span>
  );
}

export default function Navbar({
  currentRole,
  availableRoles = [],
  setCurrentRole,
  viewMode,
  setViewMode,
  currentUser,
  isStaff = false,
  onOpenAuthModal,
  onLogout,
  unreadNotificationCount,
  onOpenNotifications,
  onOpenAuditLogs
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const roles = [
    { key: "Owner/Admin", label: "Owner", icon: ShieldCheck },
    { key: "Pharmacist", label: "Pharmacist", icon: Pill },
    { key: "Cashier", label: "Cashier", icon: UserCheck }
  ].filter(r => availableRoles.includes(r.key))
    .concat({ key: "Customer", label: "Customer site", icon: Globe });

  const siteLinks = [
    { label: "Assortment", target: "assortment-section" },
    { label: "Location", target: "location-section" },
    { label: "Contact", target: "contact-section" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200/80">
      <div className={`${viewMode === "website" ? "max-w-[1320px]" : "max-w-[1600px]"} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between h-16 items-center gap-2 sm:gap-4">

          {/* Brand */}
          <div className="flex items-center gap-8 min-w-0">
            <button
              className="flex items-center gap-2.5 shrink-0"
              onClick={() => setViewMode("website")}
              aria-label="PHARMART home"
            >
              <span className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/25 relative" aria-hidden>
                <span className="absolute w-4 h-1.5 bg-white rounded-full"></span>
                <span className="absolute h-4 w-1.5 bg-white rounded-full"></span>
              </span>
              <span className={`text-lg font-semibold tracking-tight text-[#0B2545] ${viewMode === "enterprise" ? "hidden sm:inline" : ""}`}>
                PHARMART<span className="text-[#2563EB]">.</span>
              </span>
              {viewMode === "enterprise" && (
                <span className="hidden sm:inline text-xs font-medium text-slate-400 pl-2.5 ml-0.5 border-l border-slate-200">Console</span>
              )}
            </button>

            {viewMode === "website" && (
              <nav aria-label="Main" className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                {siteLinks.map(link => (
                  <a
                    key={link.target}
                    href={`#${link.target}`}
                    onClick={(e) => { e.preventDefault(); scrollToId(link.target); }}
                    className="px-3 py-2 rounded-lg hover:text-[#0B2545] hover:bg-slate-100"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Global search (console) */}
          {viewMode === "enterprise" && (
            <div className="hidden md:flex flex-1 max-w-md">
              <label className="relative w-full">
                <span className="sr-only">Search</span>
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, orders, customers"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border border-transparent focus:border-[#2563EB]/40 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10 text-sm text-slate-800 outline-none"
                />
              </label>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">

            {viewMode === "enterprise" && (
              <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl mr-2" role="group" aria-label="Workstation role">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isActive = currentRole === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setCurrentRole(r.key)}
                      aria-pressed={isActive}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isActive
                          ? "bg-white text-[#0B2545] shadow-sm"
                          : "text-slate-500 hover:text-[#0B2545]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#2563EB]" : ""}`} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {viewMode === "enterprise" && (
              <label className="xl:hidden">
                <span className="sr-only">Workstation role</span>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="max-w-[8.5rem] pl-2.5 pr-7 py-2 rounded-xl bg-slate-100 border border-transparent text-xs font-medium text-[#0B2545] focus:border-[#2563EB]/40 focus:ring-4 focus:ring-[#2563EB]/10 outline-none"
                >
                  {roles.map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </label>
            )}

            {viewMode === "website" && isStaff && (
              <button
                onClick={() => setViewMode("enterprise")}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[#0B2545] hover:bg-slate-100"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Enterprise Console</span>
              </button>
            )}

            {viewMode === "enterprise" && (
              <>
                {onOpenAuditLogs && (
                <button
                  onClick={onOpenAuditLogs}
                  title="Audit trail"
                  aria-label="Audit trail"
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#0B2545] hover:bg-slate-100 rounded-xl"
                >
                  <History className="w-[18px] h-[18px]" />
                </button>
                )}

                <button
                  onClick={onOpenNotifications}
                  aria-label={`Notifications${unreadNotificationCount ? `, ${unreadNotificationCount} unread` : ""}`}
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#0B2545] hover:bg-slate-100 rounded-xl relative"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white font-mono">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 ml-0.5 sm:ml-1 border-l border-slate-200">
                <Avatar user={currentUser} />
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-sm font-medium text-[#0B2545]">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.role || "Customer"}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-4 py-2 bg-[#0B2545] hover:bg-[#091E3A] text-white font-medium text-sm rounded-xl"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </button>
            )}

            {viewMode === "website" && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-9 h-9 flex items-center justify-center text-slate-700 lg:hidden rounded-xl hover:bg-slate-100"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {viewMode === "website" && isMobileMenuOpen && (
          <nav aria-label="Mobile" className="lg:hidden py-3 border-t border-slate-100 space-y-1 animate-fade-in text-base font-medium text-slate-800">
            {siteLinks.map(link => (
              <a
                key={link.target}
                href={`#${link.target}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  scrollToId(link.target);
                }}
                className="block px-3 py-2.5 rounded-xl hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}

            {isStaff && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setViewMode("enterprise");
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                <span>Enterprise Console</span>
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
