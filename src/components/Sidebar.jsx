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
      label: "Home",
      sublabel: "Analytics & Executive Overview",
      icon: LayoutDashboard
    },
    {
      id: "pos",
      label: "Sales & Billing",
      sublabel: "POS Billing Counter",
      icon: ShoppingCart
    },
    {
      id: "inventory",
      label: "Inventory",
      sublabel: "Purchases & Suppliers",
      icon: Package,
      badge: (lowStockCount + expiredCount) > 0 ? (lowStockCount + expiredCount) : null,
      badgeColor: "bg-amber-400 text-[#0B2545]"
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      sublabel: "Verification Station",
      icon: FileText,
      badge: pendingRxCount > 0 ? pendingRxCount : null,
      badgeColor: "bg-blue-400 text-[#0B2545]"
    },
    {
      id: "customers",
      label: "Customers",
      sublabel: "Patients & Directory",
      icon: UserCheck
    },
    {
      id: "staff",
      label: "Settings",
      sublabel: "User Access & Staff",
      icon: Users
    }
  ];

  return (
    <aside className="w-72 sm:w-72 flex flex-col h-[calc(100vh-4rem)] sticky top-16 font-sans shrink-0" style={{ backgroundColor: '#0B2545' }}>

      {/* Navigation Header */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shrink-0 relative">
          <div className="absolute w-4 h-1.5 bg-white rounded-full"></div>
          <div className="absolute h-4 w-1.5 bg-white rounded-full"></div>
        </div>
        <div>
          <div className="text-sm font-extrabold text-white tracking-tight leading-none">PHARMART</div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Pharmacy System</div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.sublabel}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${isActive
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
            >
              <div className="flex items-center space-x-3 min-w-0 pr-1">
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                <span className="font-bold text-[12.5px] tracking-tight text-left leading-tight truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-white/10">
        <div className="bg-white/5 p-3.5 rounded-xl text-white text-xs border border-white/10">
          <div className="font-black flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>PHARMART Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
            Real-time synchronization across all 7 enterprise modules.
          </p>
        </div>
      </div>

    </aside>
  );
}
