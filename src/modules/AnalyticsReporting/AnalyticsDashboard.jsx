import React from 'react';
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
  Zap
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
  Cell 
} from 'recharts';
import MetricCard from '../../components/MetricCard';

export default function AnalyticsDashboard({ medicines = [], transactions = [], prescriptions = [] }) {
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
    { name: "Antibiotics", value: 35, color: "#0284c7" },
    { name: "Analgesics", value: 25, color: "#0ea5e9" },
    { name: "Diabetes", value: 15, color: "#38bdf8" },
    { name: "Cardiovascular", value: 15, color: "#0369a1" },
    { name: "Controlled", value: 10, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans p-6">
      
      {/* Top Glassmorphic Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-sky-900/50">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black border border-sky-400/30 backdrop-blur-md">
                Epic 4 Executive Dashboard
              </span>
              <span className="flex items-center text-xs font-bold text-sky-400">
                <Zap className="w-3.5 h-3.5 mr-1 fill-sky-400" />
                Live Sync
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-heading">
              Pharmacy Analytics & Business Performance
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Real-time financial trends, stock turn rates, billing error metrics & operational baseline analytics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-right min-w-[200px]">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-200">Total System Revenue</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              LKR {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
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
          badge="Epic 3 Active"
          colorScheme="rose"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Revenue Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">Weekly Revenue & Transaction Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Live sales synchronization across POS counters</p>
            </div>
            <span className="px-3 py-1 bg-sky-50 text-[#0284c7] text-xs font-black rounded-xl border border-sky-200/60 shadow-2xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-ping"></span>
              <span>Live Feed</span>
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3.5} fillOpacity={1} fill="url(#skyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3.5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">Medicine Category Breakdown</h3>
            <p className="text-xs text-slate-500 font-medium">Sales revenue distribution by therapeutic category</p>
          </div>

          <div className="h-56 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={5}
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

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-md" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-700 font-bold">{cat.name}</span>
                </div>
                <span className="font-black text-slate-900 font-mono">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
