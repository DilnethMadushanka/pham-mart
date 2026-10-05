import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Each figure gets a solid icon tile and a thin top rule in its status colour:
// blue for routine figures, green for good news, amber to watch, red to act on.
const TONES = {
  sky: { icon: "text-white bg-[#2563EB] shadow-[#2563EB]/30", bar: "bg-[#2563EB]", wash: "from-[#EFF6FF]", badge: "status-chip-blue" },
  emerald: { icon: "text-white bg-[#059669] shadow-[#059669]/30", bar: "bg-[#10B981]", wash: "from-[#ECFDF5]", badge: "status-chip-green" },
  amber: { icon: "text-white bg-[#D97706] shadow-[#D97706]/30", bar: "bg-[#F59E0B]", wash: "from-[#FFFBEB]", badge: "status-chip-amber" },
  rose: { icon: "text-white bg-[#DC2626] shadow-[#DC2626]/30", bar: "bg-[#EF4444]", wash: "from-[#FEF2F2]", badge: "status-chip-red" }
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
  const tone = TONES[colorScheme] || { icon: "text-white bg-[#64748B] shadow-slate-400/30", bar: "bg-slate-300", wash: "from-slate-50", badge: "status-chip-gray" };

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={`group relative bg-white bg-gradient-to-b ${tone.wash} to-white to-60% p-4 sm:p-5 transition-colors duration-200 flex flex-col h-full min-h-[120px] sm:min-h-[136px] text-left w-full ${onClick ? "hover:to-[#FBFCFE] focus-visible:z-10" : ""}`}
    >
      <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${tone.bar}`} />

      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-600 leading-snug">
          {title}
        </span>
        {Icon && (
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${tone.icon}`}>
            <Icon className="w-4 h-4" strokeWidth={2} />
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
