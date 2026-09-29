import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TONES = {
  sky: { icon: "text-[#2563EB] bg-[#EFF6FF]", badge: "status-chip-blue" },
  emerald: { icon: "text-[#2563EB] bg-[#EFF6FF]", badge: "status-chip-blue" },
  amber: { icon: "text-[#B45309] bg-[#FFFBEB]", badge: "status-chip-amber" },
  rose: { icon: "text-[#B91C1C] bg-[#FEF2F2]", badge: "status-chip-red" }
};

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
  const tone = TONES[colorScheme] || { icon: "text-[#64748B] bg-slate-100", badge: "status-chip-gray" };

  return (
    <div className="group bg-white rounded-2xl p-5 ring-1 ring-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300 flex flex-col h-full min-h-[148px]">

      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[13px] font-medium text-slate-500 leading-snug">
          {title}
        </h4>
        {Icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone.icon}`}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-4 mb-1">
        <div className="text-[1.75rem] leading-none font-semibold tracking-tight text-[#0B2545] tabular-nums">
          {value}
        </div>

        {trendValue ? (
          <span className={`status-chip ${trend === "up" ? "status-chip-green" : "status-chip-red"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendValue}
          </span>
        ) : badge ? (
          <span className={`status-chip ${tone.badge}`}>{badge}</span>
        ) : null}
      </div>

      <p className="text-xs text-slate-500 mt-auto pt-3">
        {subtitle}
      </p>
    </div>
  );
}
