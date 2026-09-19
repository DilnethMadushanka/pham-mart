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

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden flex flex-col justify-between h-full min-h-[160px]">

      {/* Card Header (Title & Icon) */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-xs font-bold text-[#64748B] leading-snug break-words">
          {title}
        </h4>
        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isSky ? "bg-[#EFF6FF] text-[#2563EB]" :
            isAmber ? "bg-[#FFFBEB] text-[#B45309]" :
            isRose ? "bg-[#FEF2F2] text-[#B91C1C]" :
            "bg-slate-100 text-[#64748B]"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Main Value & Trend Pill */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 my-2">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          {value}
        </div>

        {trendValue ? (
          <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
            trend === "up" ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEF2F2] text-[#B91C1C]"
          }`}>
            {trend === "up" ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
            {trendValue}
          </div>
        ) : badge ? (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
            isAmber ? "bg-[#FFFBEB] text-[#B45309]" :
            isRose ? "bg-[#FEF2F2] text-[#B91C1C]" :
            "bg-slate-100 text-[#64748B]"
          }`}>
            {badge}
          </span>
        ) : null}
      </div>

      {/* Subtitle Footer */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
        <p className="text-xs text-[#64748B] font-medium">
          {subtitle}
        </p>
      </div>

    </div>
  );
}
