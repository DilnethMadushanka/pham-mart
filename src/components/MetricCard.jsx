import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Each figure gets a solid icon tile and a thin top rule in its status colour:
// blue for routine figures, green for good news, amber to watch, red to act on.
const TONES = {
  sky: { glow: "rgb(37 99 235 / 0.6)", icon: "text-white bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]", bar: "bg-[#2563EB]", wash: "from-[#EFF6FF]", badge: "status-chip-blue" },
  emerald: { glow: "rgb(5 150 105 / 0.55)", icon: "text-white bg-gradient-to-br from-[#10B981] to-[#059669]", bar: "bg-[#10B981]", wash: "from-[#ECFDF5]", badge: "status-chip-green" },
  amber: { glow: "rgb(217 119 6 / 0.55)", icon: "text-white bg-gradient-to-br from-[#F59E0B] to-[#D97706]", bar: "bg-[#F59E0B]", wash: "from-[#FFFBEB]", badge: "status-chip-amber" },
  rose: { glow: "rgb(220 38 38 / 0.55)", icon: "text-white bg-gradient-to-br from-[#EF4444] to-[#DC2626]", bar: "bg-[#EF4444]", wash: "from-[#FEF2F2]", badge: "status-chip-red" }
};

// Moves the tile's spotlight to where the pointer is.
function trackPointer(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

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
  const tone = TONES[colorScheme] || { glow: "rgb(100 116 139 / 0.5)", icon: "text-white bg-[#64748B]", bar: "bg-slate-300", wash: "from-slate-50", badge: "status-chip-gray" };

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      onMouseMove={trackPointer}
      className={`metric-spot group relative bg-white bg-gradient-to-b ${tone.wash} to-white to-60% p-4 sm:p-5 transition-colors duration-200 flex flex-col h-full min-h-[120px] sm:min-h-[136px] text-left w-full ${onClick ? "hover:to-[#FBFCFE] focus-visible:z-10" : ""}`}
    >
      <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${tone.bar}`} />

      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-600 leading-snug">
          {title}
        </span>
        {Icon && (
          <span style={{ "--tile-glow": tone.glow }} className={`metric-icon w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] ${tone.icon}`}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </span>
        )}
      </span>

      <span className="flex flex-wrap items-center gap-2.5 mt-3 sm:mt-4 mb-1">
        <span className="text-2xl sm:text-[1.9rem] leading-none font-semibold tracking-[-0.03em] text-[#0B2545] tabular-nums">
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
