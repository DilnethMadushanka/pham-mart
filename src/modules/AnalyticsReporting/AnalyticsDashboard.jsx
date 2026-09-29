import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Activity,
  Award,
  Zap,
  BarChart3,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import DailySalesReportModal from './DailySalesReportModal';

export default function AnalyticsDashboard({ medicines = [], transactions = [], prescriptions = [] }) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Financial metrics
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.total || 0), 0);
  const totalItemsSold = transactions.reduce((acc, t) => acc + (t.items ? t.items.reduce((a, i) => a + (i.qty || 0), 0) : 0), 0);
  
  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;
  const pendingRxCount = prescriptions.filter(p => p.status === "Pending").length;

  // Chart Mock Data for Daily Revenue
  const salesChartData = [
    { day: "Mon", revenue: 14200, transactions: 18 },
    { day: "Tue", revenue: 18500, transactions: 24 },
    { day: "Wed", revenue: 21000, transactions: 28 },
    { day: "Thu", revenue: 19800, transactions: 22 },
    { day: "Fri", revenue: 27400, transactions: 35 },
    { day: "Sat", revenue: 32100, transactions: 42 },
    { day: "Sun (Today)", revenue: totalRevenue > 0 ? totalRevenue : 24800, transactions: transactions.length || 31 }
  ];

  // Category Breakdown Pie Data
  const categoryData = [
    { name: "Antibiotics", value: 35, color: "#2563EB" },
    { name: "Analgesics", value: 25, color: "#0ea5e9" },
    { name: "Diabetes", value: 15, color: "#60A5FA" },
    { name: "Cardiovascular", value: 15, color: "#1D4ED8" },
    { name: "Controlled", value: 10, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      <PageHeader
        kicker="Overview"
        title="Pharmacy performance"
        description="Revenue, stock turn, billing errors and operating baselines, updated as sales come in."
      >
        <div className="text-right pr-1">
          <div className="text-xs text-slate-500">Total revenue</div>
          <div className="text-xl font-semibold text-[#0B2545] tabular-nums">
            LKR {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-sm rounded-xl shadow-md shadow-[#2563EB]/20"
        >
          <Printer className="w-4 h-4" />
          <span>Daily sales report</span>
        </button>
      </PageHeader>

      {/* Metric Cards Grid - Expanded 4 Columns */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard 
          title="Daily Sales Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          subtitle="+18.4% compared to yesterday"
          icon={TrendingUp}
          trend="up"
          trendValue="+18.4%"
          colorScheme="sky"
        />

        <MetricCard 
          title="Total Transactions"
          value={transactions.length.toString()}
          subtitle="Processed at POS counter"
          icon={ShoppingCart}
          trend="up"
          trendValue="+12%"
          colorScheme="sky"
        />

        <MetricCard 
          title="Low Stock Reorder Alerts"
          value={lowStockCount.toString()}
          subtitle="Items below reorder threshold"
          icon={AlertTriangle}
          badge="Action Required"
          colorScheme="amber"
        />

        <MetricCard 
          title="Pending Rx Clearances"
          value={pendingRxCount.toString()}
          subtitle="Pharmacist verification queue"
          icon={FileText}
          badge="Rx Queue"
          colorScheme="rose"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Revenue Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight font-heading">Weekly revenue</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Sales across all POS counters, last 7 days</p>
            </div>
            <span className="status-chip status-chip-blue shrink-0">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-[#2563EB] opacity-60 animate-ping"></span>
                <span className="relative w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              </span>
              Live
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF2F7" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', boxShadow: '0 12px 28px -8px rgba(11, 37, 69, 0.18)' }}
                  cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
                  formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#skyGrad)" activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight font-heading">Sales by category</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Share of revenue by therapeutic category</p>
            </div>

            <div className="h-60 flex justify-center items-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                    cornerRadius={4}
                    stroke="none"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-700 font-bold">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Daily Sales Report Generator Modal */}
      <DailySalesReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        medicines={medicines}
      />

    </div>
  );
}
