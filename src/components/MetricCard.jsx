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
  colorScheme = "sky",
  onClick
}) {
  const Wrapper = onClick ? "button" : "div";
  const tone = TONES[colorScheme] || { icon: "text-[#64748B] bg-slate-100", badge: "status-chip-gray" };

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={`group bg-white p-4 sm:p-5 transition-colors duration-200 flex flex-col h-full min-h-[120px] sm:min-h-[136px] text-left w-full ${onClick ? "hover:bg-slate-50/80 focus-visible:relative focus-visible:z-10" : ""}`}
    >

      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-500 leading-snug">
          {title}
        </span>
        {Icon && (
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tone.icon}`}>
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
        )}
      </span>

      <span className="flex flex-wrap items-center gap-2.5 mt-3 sm:mt-4 mb-1">
        <span className="text-2xl sm:text-[1.75rem] leading-none font-semibold tracking-tight text-[#0B2545] tabular-nums">
          {value}
        </span>

        {trendValue ? (
          <span className={`status-chip ${trend === "up" ? "status-chip-green" : "status-chip-red"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendValue}
          </span>
        ) : badge ? (
          <span className={`status-chip ${tone.badge}`}>{badge}</span>
        ) : null}
      </span>

      <span className="text-xs text-slate-500 mt-auto pt-3 flex items-end justify-between gap-2">
        <span className="line-clamp-2">{subtitle}</span>
        {onClick && <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-[#2563EB] transition-colors" aria-hidden />}
      </span>
    </Wrapper>
  );
}
