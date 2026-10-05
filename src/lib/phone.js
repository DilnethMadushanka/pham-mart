// Sri Lankan phone numbers: 0XX XXX XXXX, or the same with +94 / 94 in place
// of the leading 0. Spaces, dashes, dots and brackets are allowed between digits.
const LK_PHONE = /^(?:\+94|0094|94|0)([1-9]\d{8})$/;

export const PHONE_HINT = "Enter a valid Sri Lankan phone number, for example 077 123 4567 or +94 77 123 4567.";

export function isValidPhone(value) {
  const compact = String(value || "").replace(/[\s\-().]/g, "");
  return LK_PHONE.test(compact);
}

// "" when the number is fine (or optional and left empty), otherwise the message to show.
export function phoneError(value, { required = false } = {}) {
  if (!String(value || "").trim()) return required ? "Enter a phone number." : "";
  return isValidPhone(value) ? "" : PHONE_HINT;
}

// Shows the toast and returns false when the number can't be used, so a form's
// submit handler can stop with `if (!checkPhone(phone, notify)) return;`.
export function checkPhone(value, notify, options) {
  const message = phoneError(value, options);
  if (message) notify("Check the phone number", message, "error");
  return !message;
}
