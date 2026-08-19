import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  badge,
  colorScheme = "emerald" 
}) {
  const isEmerald = colorScheme === "emerald";
  const isAmber = colorScheme === "amber";
  const isRose = colorScheme === "rose";
  const isBlue = colorScheme === "blue";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 relative overflow-hidden group">
      
      {/* Background Subtle Accent Pill */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${
        isEmerald ? "bg-emerald-500" : isAmber ? "bg-amber-500" : isRose ? "bg-rose-500" : "bg-blue-500"
      }`}></div>

      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${
            isEmerald ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
            isAmber ? "bg-amber-50 border-amber-200 text-amber-700" : 
            isRose ? "bg-rose-50 border-rose-200 text-rose-700" : 
            "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-black tracking-tight text-slate-900">
          {value}
        </div>

        {trendValue && (
          <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
            trend === "up" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trendValue}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-2 font-medium">
          {subtitle}
        </p>
      )}

      {badge && (
        <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          {badge}
        </span>
      )}

    </div>
  );
}
