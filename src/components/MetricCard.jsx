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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#0284c7]/40 transition-all duration-200 relative overflow-hidden group flex flex-col justify-between h-full min-h-[148px]">
      
      {/* Background Subtle Accent Pill */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${
        isSky ? "bg-sky-500" : isAmber ? "bg-amber-500" : isRose ? "bg-rose-500" : "bg-blue-500"
      }`}></div>

      {/* Card Header (Title & Icon) */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate pr-2">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border shrink-0 ${
            isSky ? "bg-sky-50 border-sky-200 text-sky-700" : 
            isAmber ? "bg-amber-50 border-amber-200 text-amber-700" : 
            isRose ? "bg-rose-50 border-rose-200 text-rose-700" : 
            "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      {/* Main Value & Trend Pill (Perfect Baseline Alignment) */}
      <div className="flex items-center justify-between my-1.5 min-h-[36px]">
        <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
          {value}
        </div>

        {trendValue ? (
          <div className={`flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
            trend === "up" ? "bg-sky-100/80 text-sky-800 border border-sky-200" : "bg-rose-100/80 text-rose-800 border border-rose-200"
          }`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trendValue}
          </div>
        ) : badge ? (
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${
            isAmber ? "bg-amber-100 text-amber-800 border-amber-300" : 
            isRose ? "bg-rose-100 text-rose-800 border-rose-300" : 
            "bg-slate-100 text-slate-700 border-slate-200"
          }`}>
            {badge}
          </span>
        ) : null}
      </div>

      {/* Subtitle Footer (Fixed Line Height Alignment) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
        <p className="text-[11px] text-slate-500 font-medium truncate">
          {subtitle}
        </p>
      </div>

    </div>
  );
}
