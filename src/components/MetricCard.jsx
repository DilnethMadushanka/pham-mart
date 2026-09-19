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
  colorScheme = "sky" 
}) {
  const isSky = colorScheme === "sky" || colorScheme === "emerald";
  const isAmber = colorScheme === "amber";
  const isRose = colorScheme === "rose";
  const isBlue = colorScheme === "blue";

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 depth-card hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full min-h-[160px]">
      
      {/* Background Accent Subtle Glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-125 ${
        isSky ? "bg-sky-500" : isAmber ? "bg-amber-500" : isRose ? "bg-rose-500" : "bg-blue-500"
      }`}></div>

      {/* Card Header (Title & Icon) */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-xs font-extrabold text-slate-600 leading-snug break-words">
          {title}
        </h4>
        {Icon && (
          <div className={`p-2.5 rounded-2xl border shrink-0 group-hover:scale-110 transition-transform ${
            isSky ? "bg-sky-50 border-sky-200 text-sky-700" : 
            isAmber ? "bg-amber-50 border-amber-200 text-amber-700" : 
            isRose ? "bg-rose-50 border-rose-200 text-rose-700" : 
            "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Main Value & Trend Pill */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 my-2">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
          {value}
        </div>

        {trendValue ? (
          <div className={`flex items-center text-xs font-black px-3 py-1 rounded-full shrink-0 ${
            trend === "up" ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200" : "bg-rose-100/80 text-rose-800 border border-rose-200"
          }`}>
            {trend === "up" ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
            {trendValue}
          </div>
        ) : badge ? (
          <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-2xs shrink-0 ${
            isAmber ? "bg-amber-100 text-amber-800 border-amber-300" : 
            isRose ? "bg-rose-100 text-rose-800 border-rose-300" : 
            "bg-slate-100 text-slate-700 border-slate-200"
          }`}>
            {badge}
          </span>
        ) : null}
      </div>

      {/* Subtitle Footer */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
        <p className="text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      </div>

    </div>
  );
}
