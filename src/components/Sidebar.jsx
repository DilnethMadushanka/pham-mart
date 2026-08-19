import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  TrendingUp, 
  GitBranch, 
  AlertTriangle,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentRole,
  lowStockCount,
  pendingRxCount,
  expiredCount
}) {
  const menuItems = [
    {
      id: "analytics",
      label: "Analytics & Executive Overview",
      epic: "Epic 4",
      icon: LayoutDashboard,
      roles: ["Owner/Admin"]
    },
    {
      id: "pos",
      label: "POS Billing Counter",
      epic: "Epic 4",
      icon: ShoppingCart,
      roles: ["Owner/Admin", "Cashier", "Pharmacist"]
    },
    {
      id: "inventory",
      label: "Medicine & Stock Inventory",
      epic: "Epic 2",
      icon: Package,
      badge: lowStockCount + expiredCount > 0 ? lowStockCount + expiredCount : null,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      roles: ["Owner/Admin", "Pharmacist", "Cashier"]
    },
    {
      id: "prescriptions",
      label: "Prescription Verification Station",
      epic: "Epic 3",
      icon: FileText,
      badge: pendingRxCount > 0 ? pendingRxCount : null,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      roles: ["Owner/Admin", "Pharmacist"]
    },
    {
      id: "staff",
      label: "User Access & Staff Accounts",
      epic: "Epic 1",
      icon: Users,
      roles: ["Owner/Admin"]
    },
    {
      id: "kpis",
      label: "13 Baseline Indicators (KPIs)",
      epic: "Report Sec 13",
      icon: TrendingUp,
      roles: ["Owner/Admin", "Pharmacist", "Cashier"]
    },
    {
      id: "architecture",
      label: "Architecture & As-Is Analysis",
      epic: "Full Report",
      icon: GitBranch,
      roles: ["Owner/Admin", "Pharmacist", "Cashier"]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-emerald-100 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = item.roles.includes(currentRole);

          if (!isAllowed) {
            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 bg-slate-50/50 cursor-not-allowed opacity-60 text-xs font-medium"
                title={`Access restricted to ${item.roles.join(", ")}`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className="w-4 h-4 text-slate-300" />
                  <span className="truncate">{item.label}</span>
                </div>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs" 
                  : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60"
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="bg-emerald-gradient p-3 rounded-xl text-white text-xs">
          <div className="font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            <span>PHARMART Active</span>
          </div>
          <p className="text-[11px] text-emerald-100 mt-1">
            Real-time synchronization across all 4 business architecture modules.
          </p>
        </div>
      </div>

    </aside>
  );
}
