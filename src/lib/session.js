// The sign-in session token issued by the database. The user's name and role
// are never trusted from browser storage: they are re-read from the server
// with this token on every page load.

const TOKEN_KEY = "pharmart_session_token";
const LEGACY_KEYS = ["pharmart_current_user", "pharmart_deleted_medicines", "pharmart_deleted_customers"];

let token = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
  LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
} catch {
  token = null;
}

export function getSessionToken() {
  return token;
}

export function setSessionToken(next) {
  token = next || null;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private windows can block storage; the session then lasts until reload.
  }
}
