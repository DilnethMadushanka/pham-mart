import React from 'react';

// Navy banner shared by every console module: title and summary on the left, actions on the right.
// The console top bar already names the section, so the kicker is not repeated here.
// eslint-disable-next-line no-unused-vars
export default function PageHeader({ kicker, title, description, children }) {
  return (
    <header className="console-banner relative overflow-hidden rounded-3xl bg-[#0B2545] text-white px-5 py-6 sm:px-8 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-[0_24px_48px_-28px_rgba(11,37,69,0.7)]">
      <span aria-hidden className="console-banner-cross" />
      <div className="relative space-y-1.5 min-w-0">
        <h1 className="text-2xl sm:text-[1.75rem] font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#BFDBFE] max-w-[65ch]">{description}</p>
        )}
      </div>
      {children && <div className="relative flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </header>
  );
}
