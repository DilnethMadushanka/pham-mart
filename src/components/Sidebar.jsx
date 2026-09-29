import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  UserCheck,
  Users
} from 'lucide-react';
import { canAccessTab } from '../lib/permissions';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentRole,
  lowStockCount = 0,
  pendingRxCount = 0,
  expiredCount = 0
}) {
  const menuItems = [
    {
      id: "analytics",
      label: "Home",
      shortLabel: "Home",
      sublabel: "Analytics & Executive Overview",
      icon: LayoutDashboard
    },
    {
      id: "pos",
      label: "Sales & Billing",
      shortLabel: "Sales",
      sublabel: "POS Billing Counter",
      icon: ShoppingCart
    },
    {
      id: "inventory",
      label: "Inventory",
      shortLabel: "Stock",
      sublabel: "Purchases & Suppliers",
      icon: Package,
      badge: (lowStockCount + expiredCount) > 0 ? (lowStockCount + expiredCount) : null,
      badgeColor: "bg-amber-400/15 text-amber-300"
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      shortLabel: "Rx",
      sublabel: "Verification Station",
      icon: FileText,
      badge: pendingRxCount > 0 ? pendingRxCount : null,
      badgeColor: "bg-blue-400/15 text-blue-200"
    },
    {
      id: "customers",
      label: "Customers",
      shortLabel: "Customers",
      sublabel: "Patients & Directory",
      icon: UserCheck
    },
    {
      id: "staff",
      label: "Settings",
      shortLabel: "Settings",
      sublabel: "User Access & Staff",
      icon: Users
    }
  ];

  const visibleItems = menuItems.filter(item => canAccessTab(currentRole, item.id));

  return (
    <>
    <aside
      aria-label="Console navigation"
      className="hidden md:flex w-60 lg:w-64 flex-col h-[calc(100dvh-7rem)] sticky top-[5.5rem] shrink-0 rounded-3xl bg-[#0B2545] overflow-hidden shadow-xl shadow-[#0B2545]/15"
    >
      <div className="px-5 pt-6 pb-3">
        <div className="text-[11px] font-medium text-slate-400">Workspace</div>
        <div className="text-sm font-semibold text-white mt-0.5">{currentRole}</div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.sublabel}
              aria-current={isActive ? "page" : undefined}
              className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm group ${isActive
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              {isActive && (
                <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#2563EB]" />
              )}
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300"}`}
                  strokeWidth={1.75}
                />
                <span className={`truncate ${isActive ? "font-medium" : ""}`}>{item.label}</span>
              </span>

              {item.badge && (
                <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="m-3 p-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-medium text-white">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#10B981] opacity-60 animate-ping"></span>
            <span className="relative w-2 h-2 rounded-full bg-[#10B981]"></span>
          </span>
          Live sync on
        </div>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Changes appear across every counter as they happen.
        </p>
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
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`relative flex-1 min-w-0 flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] ${
                isActive ? "text-white font-medium" : "text-slate-400"
              }`}
            >
              {isActive && <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b-full bg-[#2563EB]" />}
              <span className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-300" : ""}`} strokeWidth={1.75} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-semibold font-mono flex items-center justify-center">
                    {item.badge}
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
