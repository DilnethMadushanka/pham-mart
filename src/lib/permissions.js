// Role-based access policy for the enterprise console.
// The signed-in user's role decides which screens and actions are available;
// the navbar role switcher can only preview roles at or below that level.

export const STAFF_ROLES = ["Owner/Admin", "Pharmacist", "Cashier"];

const ROLE_LEVEL = { "Owner/Admin": 3, "Pharmacist": 2, "Cashier": 1 };

const ROLE_TABS = {
  "Owner/Admin": ["analytics", "pos", "inventory", "prescriptions", "customers", "staff"],
  "Pharmacist": ["pos", "inventory", "prescriptions", "customers"],
  "Cashier": ["pos", "inventory", "customers"]
};

const ROLE_ACTIONS = {
  "Owner/Admin": ["inventory_edit", "prescription_approve", "customer_edit", "customer_delete", "staff_manage", "reports_view", "po_approve", "returns_process"],
  "Pharmacist": ["inventory_edit", "prescription_approve", "customer_edit", "returns_process"],
  "Cashier": ["customer_edit"]
};

export function isStaffUser(user) {
  return Boolean(user && user.userType === "staff" && STAFF_ROLES.includes(user.role));
}

// Roles a signed-in staff member may switch the console into.
export function assumableRoles(user) {
  if (!isStaffUser(user)) return [];
  const level = ROLE_LEVEL[user.role];
  return STAFF_ROLES.filter(r => ROLE_LEVEL[r] <= level);
}

export function canAccessTab(role, tab) {
  return (ROLE_TABS[role] || []).includes(tab);
}

export function allowedTabs(role) {
  return ROLE_TABS[role] || [];
}

export function defaultTab(role) {
  return allowedTabs(role)[0] || null;
}

export function can(role, action) {
  return (ROLE_ACTIONS[role] || []).includes(action);
}
