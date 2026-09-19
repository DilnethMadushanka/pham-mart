import React from 'react';
import { X, ShieldCheck, History, Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AuditLogModal({ isOpen, onClose, logs }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel bg-white/95 rounded-3xl max-w-3xl w-full depth-card border border-sky-100 overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50/60 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-sky-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gradient-brand">System Audit Trail & Security Logs</h3>
              <p className="text-xs text-slate-500">Epic 1 Requirement: Centralized access, verification & security history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-all hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Log List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {logs.map((log) => {
            const isDanger = log.severity === "danger";
            const isSuccess = log.severity === "success";

            return (
              <div 
                key={log.id} 
                className={`p-3.5 rounded-2xl border transition-all duration-300 text-xs hover:-translate-y-0.5 hover:shadow-md ${
                  isDanger
                    ? "bg-rose-50/70 border-rose-200 text-rose-900"
                    : isSuccess
                    ? "bg-sky-50/70 border-sky-200 text-sky-900"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    {isDanger ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white border border-slate-200 text-slate-600">
                      {log.role}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                </div>

                <p className="text-slate-600 mt-1 pl-6 leading-relaxed">
                  {log.details}
                </p>

                <div className="mt-2 pl-6 text-[10px] font-semibold text-slate-400">
                  User: <span className="text-slate-700">{log.user}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Immutable audit record enforced by system architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-xl font-bold text-xs hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
}
