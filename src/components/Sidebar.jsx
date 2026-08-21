import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  TrendingUp, 
  GitBranch
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
      epic: "Epic 4",
      icon: LayoutDashboard
    },
    {
      id: "pos",
      label: "POS Billing Counter",
      epic: "Epic 4",
      icon: ShoppingCart
    },
    {
      id: "inventory",
      label: "Medicine & Stock Inventory",
      epic: "Epic 2",
      icon: Package,
      badge: (lowStockCount + expiredCount) > 0 ? (lowStockCount + expiredCount) : null,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300"
    },
    {
      id: "prescriptions",
      label: "Prescription Verification Station",
      epic: "Epic 3",
      icon: FileText,
      badge: pendingRxCount > 0 ? pendingRxCount : null,
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300"
    },
    {
      id: "staff",
      label: "User Access & Staff Accounts",
      epic: "Epic 1",
      icon: Users
    },
    {
      id: "kpis",
      label: "13 Baseline Indicators (KPIs)",
      epic: "Report Sec 13",
      icon: TrendingUp
    },
    {
      id: "architecture",
      label: "Architecture & As-Is Analysis",
      epic: "Full Report",
      icon: GitBranch
    }
  ];

  return (
    <aside className="w-72 sm:w-72 bg-white border-r border-sky-100/80 flex flex-col h-[calc(100vh-4rem)] sticky top-16 font-sans shrink-0 shadow-2xs">
      
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
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${
                isActive 
                  ? "bg-gradient-to-r from-sky-50 to-blue-50/60 text-[#0284c7] border border-sky-200/80 shadow-xs" 
                  : "text-slate-600 hover:text-[#0284c7] hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 pr-1">
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? "text-[#0284c7]" : "text-slate-400 group-hover:text-[#0284c7]"}`} />
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
        <div className="bg-[#0284c7] p-3.5 rounded-2xl text-white text-xs shadow-md shadow-sky-500/10">
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
