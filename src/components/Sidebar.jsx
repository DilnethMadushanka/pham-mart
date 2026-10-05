import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  UserCheck,
  Users,
  Globe,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { canAccessTab } from '../lib/permissions';

// Console pages, grouped by the kind of work they cover.
export const CONSOLE_PAGES = [
  { id: "analytics", label: "Home", shortLabel: "Home", sublabel: "Sales, stock and open work", icon: LayoutDashboard, group: "Counter" },
  { id: "pos", label: "Sales & Billing", shortLabel: "Sales", sublabel: "Point of sale and returns", icon: ShoppingCart, group: "Counter" },
  { id: "prescriptions", label: "Prescriptions", shortLabel: "Rx", sublabel: "Verification and doctors", icon: FileText, group: "Counter" },
  { id: "inventory", label: "Inventory", shortLabel: "Stock", sublabel: "Batches, expiry and purchasing", icon: Package, group: "Stock" },
  { id: "customers", label: "Customers", shortLabel: "Customers", sublabel: "Patients and history", icon: UserCheck, group: "People" },
  { id: "staff", label: "Settings", shortLabel: "Settings", sublabel: "Staff and access", icon: Users, group: "People" }
];

function BrandMark() {
  return (
    <span className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-black/20 relative shrink-0" aria-hidden>
      <span className="absolute w-4 h-1.5 bg-white rounded-full"></span>
      <span className="absolute h-4 w-1.5 bg-white rounded-full"></span>
    </span>
  );
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentRole,
  lowStockCount = 0,
  pendingRxCount = 0,
  expiredCount = 0,
  collapsed = false,
  onToggleCollapsed,
  onOpenSite
}) {
  const badges = {
    inventory: lowStockCount + expiredCount,
    prescriptions: pendingRxCount
  };
  const visibleItems = CONSOLE_PAGES.filter(item => canAccessTab(currentRole, item.id));
  const groups = [...new Set(visibleItems.map(i => i.group))];

  return (
    <>
    <aside
      aria-label="Console navigation"
      className={`hidden md:flex flex-col shrink-0 sticky top-0 h-[100dvh] bg-[#0B2545] bg-[radial-gradient(120%_60%_at_0%_100%,rgb(37_99_235/0.28),transparent_60%)] text-white transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed ? "w-[76px]" : "w-60 lg:w-64"}`}
    >
      <div className={`h-16 flex items-center gap-2.5 border-b border-white/[0.06] ${collapsed ? "justify-center px-0" : "px-5"}`}>
        <BrandMark />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">PHARMART<span className="text-blue-300">.</span></div>
            <div className="text-[11px] text-slate-400">{currentRole}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={group} className={gi > 0 ? "mt-5" : ""}>
            {collapsed
              ? gi > 0 && <div aria-hidden className="mx-3 mb-3 border-t border-white/[0.06]" />
              : <div className="px-3 mb-1.5 text-[11px] font-medium text-slate-500">{group}</div>}
            <div className="space-y-0.5">
              {visibleItems.filter(i => i.group === group).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge = badges[item.id] > 0 ? badges[item.id] : null;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : item.sublabel}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative w-full flex items-center rounded-xl text-sm group ${collapsed ? "justify-center h-11" : "justify-between px-3 py-2.5"} ${isActive
                      ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                      }`}
                  >
                    <span className={`flex items-center gap-3 min-w-0`}>
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-[#93C5FD]/70 group-hover:text-[#93C5FD]"}`}
                        strokeWidth={1.75}
                      />
                      <span className={collapsed ? "sr-only" : `truncate ${isActive ? "font-medium" : ""}`}>{item.label}</span>
                    </span>
                    {badge && (collapsed ? (
                      <span className="absolute top-1.5 right-2 min-w-4 h-4 px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-semibold font-mono flex items-center justify-center">{badge}</span>
                    ) : (
                      <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md shrink-0 ${item.id === "inventory" ? "bg-amber-400 text-[#0B2545]" : isActive ? "bg-white text-[#1D4ED8]" : "bg-[#2563EB] text-white"}`}>
                        {badge}
                      </span>
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-white/[0.06] p-3 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <div className={`flex items-center gap-2 text-xs text-slate-400 ${collapsed ? "justify-center h-8" : "px-3 py-2"}`} title="Changes from every counter appear as they happen">
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#10B981] opacity-60 animate-ping"></span>
            <span className="relative w-2 h-2 rounded-full bg-[#10B981]"></span>
          </span>
          {!collapsed && <span>Live sync on</span>}
        </div>
        {onOpenSite && (
          <button onClick={onOpenSite} title="Customer site" className={`w-full flex items-center gap-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] ${collapsed ? "justify-center h-10" : "px-3 py-2"}`}>
            <Globe className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            <span className={collapsed ? "sr-only" : ""}>Customer site</span>
          </button>
        )}
        {onToggleCollapsed && (
          <button onClick={onToggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full flex items-center gap-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] ${collapsed ? "justify-center h-10" : "px-3 py-2"}`}>
            {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.75} /> : <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.75} />}
            <span className={collapsed ? "sr-only" : ""}>Collapse</span>
          </button>
        )}
      </div>
    </aside>

    {/* Phones: the sidebar is hidden, so the same tabs sit in a bar at the bottom. */}
    <nav
      aria-label="Console navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B2545] border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badges[item.id] > 0 ? badges[item.id] : null;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`relative flex-1 min-w-0 flex flex-col items-center gap-1 pt-2 pb-2 text-[11px] ${
                isActive ? "text-white font-medium" : "text-slate-400"
              }`}
            >
              <span className={`relative px-3.5 py-1 rounded-full transition-colors ${isActive ? "bg-[#2563EB] shadow-md shadow-[#2563EB]/40" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} strokeWidth={1.75} />
                {badge && (
                  <span className="absolute -top-1.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-[#0B2545] ring-2 ring-[#0B2545] text-[10px] font-semibold font-mono flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </span>
              <span className="truncate max-w-full px-0.5">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
}
