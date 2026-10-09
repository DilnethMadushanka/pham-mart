import React from 'react';

// Small flat illustrations in the brand palette, drawn as SVG so they stay sharp
// and cost nothing to load. Each one fills its box; size it from the parent.
const NAVY = "#0B2545";
const BLUE = "#2563EB";
const SKY = "#93C5FD";
const MIST = "#DBEAFE";
const WHITE = "#FFFFFF";

const Svg = ({ children, className = "" }) => (
  <svg viewBox="0 0 160 120" className={className} aria-hidden="true" focusable="false">{children}</svg>
);

export function PillsArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="104" rx="52" ry="6" fill={NAVY} opacity="0.08" />
      <g transform="rotate(-32 70 62)">
        <rect x="34" y="48" width="72" height="28" rx="14" fill={WHITE} stroke={NAVY} strokeWidth="3" />
        <path d="M70 48h22a14 14 0 0 1 0 28H70z" fill={BLUE} />
        <rect x="42" y="54" width="18" height="5" rx="2.5" fill={MIST} />
      </g>
      <circle cx="116" cy="84" r="15" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <path d="M105 84h22" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="90" r="9" fill={SKY} />
    </Svg>
  );
}

export function SyrupArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="106" rx="44" ry="6" fill={NAVY} opacity="0.08" />
      <rect x="66" y="14" width="28" height="14" rx="3" fill={NAVY} />
      <path d="M62 30h36v8c10 4 14 12 14 22v38a8 8 0 0 1-8 8H56a8 8 0 0 1-8-8V60c0-10 4-18 14-22z" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <path d="M50 70h60v28a6 6 0 0 1-6 6H56a6 6 0 0 1-6-6z" fill={BLUE} />
      <rect x="58" y="76" width="44" height="14" rx="3" fill={WHITE} opacity="0.9" />
      <path d="M118 44c6 8 6 14 0 18-6-4-6-10 0-18z" fill={SKY} />
      <rect x="26" y="84" width="18" height="18" rx="4" fill={MIST} stroke={NAVY} strokeWidth="2.5" />
    </Svg>
  );
}

export function HeartArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="106" rx="46" ry="6" fill={NAVY} opacity="0.08" />
      <path d="M80 98C52 80 38 64 38 46c0-12 9-22 21-22 9 0 16 5 21 12 5-7 12-12 21-12 12 0 21 10 21 22 0 18-14 34-42 52z" fill={BLUE} />
      <path d="M40 58h24l7-14 10 26 8-16 6 4h26" fill="none" stroke={WHITE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="128" cy="26" r="6" fill={SKY} />
    </Svg>
  );
}

export function GlucoseArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="106" rx="48" ry="6" fill={NAVY} opacity="0.08" />
      <rect x="44" y="20" width="56" height="82" rx="12" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <rect x="52" y="30" width="40" height="28" rx="5" fill={NAVY} />
      <text x="72" y="50" textAnchor="middle" fontFamily="Geist Mono Variable, monospace" fontSize="15" fontWeight="700" fill={SKY}>5.4</text>
      <circle cx="62" cy="76" r="6" fill={MIST} stroke={NAVY} strokeWidth="2" />
      <circle cx="82" cy="76" r="6" fill={MIST} stroke={NAVY} strokeWidth="2" />
      <rect x="98" y="58" width="30" height="8" rx="2" fill={SKY} stroke={NAVY} strokeWidth="2.5" />
      <path d="M126 30c7 9 7 16 0 20-7-4-7-11 0-20z" fill={BLUE} />
    </Svg>
  );
}

export function CapsuleArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="106" rx="50" ry="6" fill={NAVY} opacity="0.08" />
      <rect x="30" y="34" width="100" height="62" rx="10" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      {[0, 1, 2].map(col => [0, 1].map(row => (
        <g key={`${col}-${row}`} transform={`translate(${46 + col * 28} ${50 + row * 26})`}>
          <rect x="-10" y="-6" width="20" height="12" rx="6" fill={row === 0 && col === 0 ? MIST : BLUE} />
          {!(row === 0 && col === 0) && <path d="M0 -6h4a6 6 0 0 1 0 12h-4z" fill={NAVY} opacity="0.35" />}
        </g>
      )))}
      <path d="M36 34l10-14h68l10 14" fill={MIST} stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
    </Svg>
  );
}

export function VitaminsArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="106" rx="46" ry="6" fill={NAVY} opacity="0.08" />
      <rect x="54" y="16" width="52" height="14" rx="4" fill={BLUE} />
      <rect x="48" y="30" width="64" height="72" rx="12" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <rect x="48" y="50" width="64" height="30" fill={MIST} />
      <text x="80" y="71" textAnchor="middle" fontFamily="Geist Variable, sans-serif" fontSize="16" fontWeight="700" fill={NAVY}>D3</text>
      <circle cx="126" cy="92" r="8" fill={SKY} />
      <circle cx="34" cy="94" r="6" fill={BLUE} />
    </Svg>
  );
}

export function FridgeArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="108" rx="44" ry="5" fill={NAVY} opacity="0.08" />
      <rect x="50" y="12" width="60" height="94" rx="10" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <path d="M50 44h60" stroke={NAVY} strokeWidth="3" />
      <rect x="98" y="22" width="4" height="14" rx="2" fill={NAVY} />
      <rect x="98" y="52" width="4" height="18" rx="2" fill={NAVY} />
      <rect x="60" y="56" width="12" height="20" rx="3" fill={BLUE} />
      <rect x="76" y="62" width="12" height="14" rx="3" fill={SKY} />
      <rect x="60" y="84" width="30" height="10" rx="3" fill={MIST} stroke={NAVY} strokeWidth="2" />
      <path d="M126 30v24M120 36l12 12M132 36l-12 12" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function ClockArt({ className }) {
  return (
    <Svg className={className}>
      <ellipse cx="80" cy="108" rx="44" ry="5" fill={NAVY} opacity="0.08" />
      <circle cx="80" cy="58" r="42" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <path d="M80 58V32M80 58l18 12" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="58" r="4" fill={BLUE} />
      {[0, 90, 180, 270].map(a => (
        <rect key={a} x="78" y="20" width="4" height="8" rx="2" fill={BLUE} transform={`rotate(${a} 80 58)`} />
      ))}
      <g transform="translate(118 84)">
        <rect x="-14" y="-7" width="28" height="14" rx="7" fill={BLUE} />
        <path d="M0 -7h7a7 7 0 0 1 0 14h-7z" fill={NAVY} opacity="0.3" />
      </g>
    </Svg>
  );
}
