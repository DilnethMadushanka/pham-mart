import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  UserCheck,
  Users
} from 'lucide-react';

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
      label: "Analytics & Executive Overview",
      icon: LayoutDashboard
    },
    {
      id: "pos",
      label: "POS Billing Counter",
      icon: ShoppingCart
    },
    {
      id: "inventory",
      label: "Medicine & Stock Inventory",
      icon: Package,
      badge: (lowStockCount + expiredCount) > 0 ? (lowStockCount + expiredCount) : null,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300"
    },
    {
      id: "prescriptions",
      label: "Prescription Verification Station",
      icon: FileText,
      badge: pendingRxCount > 0 ? pendingRxCount : null,
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300"
    },
    {
      id: "customers",
      label: "Patient & Customer Directory",
      icon: UserCheck
    },
    {
      id: "staff",
      label: "User Access & Staff Accounts",
      icon: Users
    }
  ];

  return (
    <aside className="w-72 sm:w-72 glass-panel !rounded-none border-r border-sky-100/80 flex flex-col h-[calc(100vh-4rem)] sticky top-16 font-sans shrink-0">

      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          Navigation Modules
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer group ${isActive
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 -translate-y-0.5"
                : "text-slate-600 hover:text-[#0284c7] hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                }`}
            >
              <div className="flex items-center space-x-3 min-w-0 pr-1">
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#0284c7]"}`} />
                <span className="font-extrabold text-[11.5px] tracking-tight text-left leading-tight truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
        <div className="bg-gradient-to-br from-sky-500 to-blue-700 p-3.5 rounded-2xl text-white text-xs depth-card">
          <div className="font-black flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-sky-200 animate-ping"></span>
            <span>PHARMART Active</span>
          </div>
          <p className="text-[11px] text-sky-100 mt-1 font-medium leading-relaxed">
            Real-time synchronization across all 7 enterprise modules.
          </p>
        </div>
      </div>

    </aside>
  );
}
