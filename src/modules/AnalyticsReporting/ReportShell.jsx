import React from 'react';
import { X, Printer, Download } from 'lucide-react';

// Frame shared by the printable reports: title bar with CSV and print actions.
export default function ReportShell({ title, subtitle, onClose, onCsv, controls, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto print:static print:bg-white print:p-0">
      <div role="dialog" aria-modal="true" aria-label={title} className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col print:max-h-none print:shadow-none print:border-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 shrink-0 print:hidden">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#0B2545]">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCsv} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs rounded-xl">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} aria-label="Close report" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {controls && <div className="px-4 sm:px-6 pt-4 print:hidden">{controls}</div>}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          <div className="flex flex-wrap justify-between items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="text-lg font-semibold text-[#0B2545]">PHARMART Pharmacy</div>
              <div className="text-xs text-slate-500">{title} · {subtitle}</div>
            </div>
            <div className="text-[11px] text-slate-500">Generated {new Date().toLocaleString()}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Stat({ label, value, note }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="text-lg sm:text-xl font-semibold text-[#0B2545] tabular-nums mt-1">{value}</div>
      {note && <div className="text-[11px] text-slate-500 mt-0.5">{note}</div>}
    </div>
  );
}
