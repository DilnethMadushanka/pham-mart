import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, History, LogOut, Globe, ChevronDown } from 'lucide-react';

const ROLE_LABELS = { "Owner/Admin": "Owner", Pharmacist: "Pharmacist", Cashier: "Cashier" };

function Initials({ user, size = "w-8 h-8" }) {
  const [failed, setFailed] = useState(false);
  const initials = (user.name || "?").replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  if (user.avatar && !failed) {
    return <img src={user.avatar} alt="" onError={() => setFailed(true)} className={`${size} rounded-full object-cover ring-1 ring-slate-200`} />;
  }
  return <span className={`${size} rounded-full bg-[#0B2545] text-white text-[11px] font-semibold flex items-center justify-center`}>{initials}</span>;
}

// Slim bar above every console page: where you are, search, role preview, alerts and your account.
export default function ConsoleTopbar({
  page,
  currentUser,
  currentRole,
  availableRoles = [],
  onRoleChange,
  onOpenPalette,
  unreadNotificationCount = 0,
  onOpenNotifications,
  onOpenAuditLogs,
  onOpenSite,
  onLogout
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200/80">
      <div className="h-full flex items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 shrink flex items-center gap-2.5">
          <span className="md:hidden w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center relative shrink-0" aria-hidden>
            <span className="absolute w-3.5 h-1 bg-white rounded-full"></span>
            <span className="absolute h-3.5 w-1 bg-white rounded-full"></span>
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-semibold text-[#0B2545] truncate">{page?.label}</div>
            <div className="hidden sm:block text-xs text-slate-500 truncate">{page?.sublabel}</div>
          </div>
        </div>

        <button
          onClick={onOpenPalette}
          className="ml-auto md:ml-6 lg:ml-10 flex items-center gap-2.5 md:flex-1 min-w-0 md:max-w-sm h-9 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 ring-1 ring-transparent hover:ring-slate-200 text-sm text-slate-500"
          aria-label="Search and jump"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline truncate">Search medicines, customers, invoices</span>
          <kbd className="hidden md:inline ml-auto text-[11px] font-mono text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">{isMac ? "⌘K" : "Ctrl K"}</kbd>
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 md:ml-auto shrink-0">
          {availableRoles.length > 1 && (
            <label className="hidden xl:flex items-center gap-1.5 h-9 pl-3 pr-1 rounded-xl ring-1 ring-slate-200 bg-white text-xs text-slate-500">
              View as
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                aria-label="View the console as"
                className="h-7 pl-1 pr-6 rounded-lg bg-transparent text-xs font-medium text-[#0B2545] outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                {availableRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
              </select>
            </label>
          )}

          {onOpenAuditLogs && (
            <button onClick={onOpenAuditLogs} title="Audit trail" aria-label="Audit trail"
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-[#0B2545] hover:bg-slate-100 rounded-xl">
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

          {currentUser && (
            <div className="relative pl-1.5 sm:pl-2 ml-0.5 border-l border-slate-200" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account"
                className="flex items-center gap-2 h-9 pl-1 pr-1.5 rounded-xl hover:bg-slate-100"
              >
                <Initials user={currentUser} />
                <span className="hidden xl:block text-left leading-tight max-w-[10rem]">
                  <span className="block text-[13px] font-medium text-[#0B2545] truncate">{currentUser.name}</span>
                </span>
                <ChevronDown className={`hidden xl:block w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-1.5 animate-slide-up">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <Initials user={currentUser} size="w-10 h-10" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#0B2545] truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.role}{currentRole !== currentUser.role ? `, viewing as ${ROLE_LABELS[currentRole] || currentRole}` : ""}</div>
                    </div>
                  </div>
                  {availableRoles.length > 1 && (
                    <label className="xl:hidden flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-600">
                      View as
                      <select value={currentRole} onChange={(e) => { onRoleChange(e.target.value); setMenuOpen(false); }}
                        className="px-2 py-1 rounded-lg ring-1 ring-slate-200 text-sm text-[#0B2545] bg-white">
                        {availableRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
                      </select>
                    </label>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onOpenSite(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100">
                    <Globe className="w-4 h-4 text-slate-400" /> Customer site
                  </button>
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onLogout(); }} aria-label="Sign out"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-700 hover:bg-rose-50">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
