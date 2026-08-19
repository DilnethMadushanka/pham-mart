import React from 'react';
import { X, ShieldCheck, History, Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AuditLogModal({ isOpen, onClose, logs }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-emerald-100 bg-emerald-50/60 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Audit Trail & Security Logs</h3>
              <p className="text-xs text-slate-500">Epic 1 Requirement: Centralized access, verification & security history</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
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
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isDanger 
                    ? "bg-rose-50/70 border-rose-200 text-rose-900" 
                    : isSuccess 
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" 
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    {isDanger ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
}
