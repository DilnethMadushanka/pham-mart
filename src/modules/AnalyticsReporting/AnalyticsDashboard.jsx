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
  ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import MetricCard from '../../components/MetricCard';

export default function AnalyticsDashboard({ medicines, transactions, prescriptions }) {
  // Financial metrics
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalItemsSold = transactions.reduce((acc, t) => acc + t.items.reduce((a, i) => a + i.qty, 0), 0);
  
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
    { day: "Sun (Today)", revenue: 24800, transactions: 31 }
  ];

  // Category Breakdown Pie Data
  const categoryData = [
    { name: "Antibiotics", value: 35, color: "#059669" },
    { name: "Analgesics", value: 25, color: "#10b981" },
    { name: "Diabetes", value: 15, color: "#34d399" },
    { name: "Cardiovascular", value: 15, color: "#047857" },
    { name: "Controlled", value: 10, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              Epic 4 Executive Dashboard
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Pharmacy Analytics & Business Performance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial trends, stock turn rates, billing error metrics & operational baseline analytics.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs font-bold text-slate-400">Total System Revenue</div>
          <div className="text-2xl font-black text-emerald-700">LKR {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Daily Sales Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          subtitle="+18.4% compared to yesterday"
          icon={TrendingUp}
          trend="up"
          trendValue="+18.4%"
          colorScheme="emerald"
        />

        <MetricCard 
          title="Total Transactions"
          value={transactions.length.toString()}
          subtitle="Processed at POS counter"
          icon={ShoppingCart}
          trend="up"
          trendValue="+12%"
          colorScheme="emerald"
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
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Revenue & Transaction Trend</h3>
              <p className="text-xs text-slate-500">Live sales synchronization across POS counters</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
              Live Feed
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#emeraldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Medicine Category Breakdown</h3>
            <p className="text-xs text-slate-500">Sales revenue distribution by therapeutic category</p>
          </div>

          <div className="h-52 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
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

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-700 font-semibold">{cat.name}</span>
                </div>
                <span className="font-extrabold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
