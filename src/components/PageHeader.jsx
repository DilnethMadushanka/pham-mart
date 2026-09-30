import React from 'react';

// Unboxed page header shared by every console module: title and summary on the left, actions on the right.
// The console top bar already names the section, so the kicker is not repeated here.
// eslint-disable-next-line no-unused-vars
export default function PageHeader({ kicker, title, description, children }) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-2">
      <div className="space-y-1.5 min-w-0">
        <h1 className="text-2xl sm:text-[1.75rem] font-semibold text-[#0B2545] leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 max-w-[65ch]">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </header>
  );
}
