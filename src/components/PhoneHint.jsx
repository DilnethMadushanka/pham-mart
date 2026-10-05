import React from 'react';
import { phoneError } from '../lib/phone';

// Inline note under a phone field once the user moves on from an invalid number.
// Place it right after an input that has the `peer` class; it stays hidden while
// the field has focus so it doesn't nag mid-typing.
export default function PhoneHint({ value, id }) {
  const message = phoneError(value);
  if (!message) return null;
  return <p id={id} className="hidden peer-not-focus:block mt-1 text-[11px] font-medium text-red-600">{message}</p>;
}
