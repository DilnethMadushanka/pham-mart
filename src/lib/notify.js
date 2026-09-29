// App-wide toasts and dialogs, replacing the browser's alert(), confirm() and prompt().
// App.jsx renders the toast and <DialogHost />, which listen for these events.

const TOAST_EVENT = "pharmart:toast";
const DIALOG_EVENT = "pharmart:dialog";

export function notify(title, message = "", type = "success") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { title, message, type } }));
}

export function notifyError(error, title = "Something went wrong") {
  notify(title, error?.message || String(error || ""), "error");
}

export function onToast(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}

function openDialog(options) {
  return new Promise(resolve => {
    window.dispatchEvent(new CustomEvent(DIALOG_EVENT, { detail: { ...options, resolve } }));
  });
}

// Resolves to true or false.
export function confirmDialog({ title, message, confirmLabel = "Confirm", tone = "default" }) {
  return openDialog({ kind: "confirm", title, message, confirmLabel, tone });
}

// Resolves to the typed text, or null when cancelled.
export function promptDialog({ title, message, label, placeholder, confirmLabel = "Save", inputType = "text", minLength = 1, multiline = false, tone = "default" }) {
  return openDialog({ kind: "prompt", title, message, label, placeholder, confirmLabel, inputType, minLength, multiline, tone });
}

export function onDialog(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(DIALOG_EVENT, listener);
  return () => window.removeEventListener(DIALOG_EVENT, listener);
}
