import React, { useEffect, useRef, useState } from 'react';
import { onDialog } from '../lib/notify';

// Renders the confirm and prompt dialogs requested through src/lib/notify.js.
export default function DialogHost() {
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => onDialog(detail => {
    setValue("");
    setDialog(detail);
  }), []);

  useEffect(() => {
    if (dialog?.kind === "prompt") inputRef.current?.focus();
  }, [dialog]);

  if (!dialog) return null;

  const isPrompt = dialog.kind === "prompt";
  const trimmed = value.trim();
  const canSubmit = !isPrompt || trimmed.length >= (dialog.minLength || 1);

  const close = (result) => {
    dialog.resolve(result);
    setDialog(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    close(isPrompt ? trimmed : true);
  };

  const danger = dialog.tone === "danger";
  const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/50 outline-hidden";

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) close(isPrompt ? null : false); }}
      onKeyDown={(e) => { if (e.key === "Escape") close(isPrompt ? null : false); }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-rise"
      >
        <div className="space-y-1.5">
          <h3 id="dialog-title" className="text-base font-semibold text-[#0B2545]">{dialog.title}</h3>
          {dialog.message && <p className="text-sm text-slate-600 leading-relaxed">{dialog.message}</p>}
        </div>

        {isPrompt && (
          <label className="block space-y-1.5">
            {dialog.label && <span className="block text-xs font-semibold text-slate-700">{dialog.label}</span>}
            {dialog.multiline ? (
              <textarea
                ref={inputRef}
                rows={3}
                value={value}
                placeholder={dialog.placeholder}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
              />
            ) : (
              <input
                ref={inputRef}
                type={dialog.inputType || "text"}
                value={value}
                placeholder={dialog.placeholder}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
              />
            )}
            {dialog.minLength > 1 && (
              <span className="block text-[11px] text-slate-500">At least {dialog.minLength} characters.</span>
            )}
          </label>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => close(isPrompt ? null : false)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              danger ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : "bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[#2563EB]/20"
            }`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
