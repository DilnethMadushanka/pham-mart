import React from 'react';

// Today's date at the pharmacy, e.g. "Monday, 5 October".
const today = () => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", weekday: "long", day: "numeric", month: "long" }).format(new Date());

// Navy banner shared by every console module: title and summary on the left, actions on the right.
// The console top bar already names the section, so the kicker is not repeated here.
// eslint-disable-next-line no-unused-vars
export default function PageHeader({ kicker, title, description, children }) {
  return (
    <header className="console-banner grain relative overflow-hidden rounded-3xl bg-[#0B2545] text-white px-5 py-6 sm:px-8 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-[0_24px_48px_-28px_rgba(11,37,69,0.7)]">
      <span aria-hidden className="console-banner-cross" />
      <span aria-hidden className="console-banner-sheen" />
      <div className="relative space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-[#93C5FD]">
          <span className="relative flex w-1.5 h-1.5"><span className="absolute inset-0 rounded-full bg-[#34D399] opacity-70 animate-ping"></span><span className="relative w-1.5 h-1.5 rounded-full bg-[#34D399]"></span></span>
          {today()}
        </div>
        <h1 className="text-2xl sm:text-[1.75rem] font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#BFDBFE] max-w-[65ch]">{description}</p>
        )}
      </div>
      {children && <div className="relative flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </header>
  );
}
