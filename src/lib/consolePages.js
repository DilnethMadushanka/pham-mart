import { LayoutDashboard, ShoppingCart, Package, FileText, UserCheck, Users } from 'lucide-react';

// Console pages, grouped by the kind of work they cover.
export const CONSOLE_PAGES = [
  { id: "analytics", label: "Home", shortLabel: "Home", sublabel: "Sales, stock and open work", icon: LayoutDashboard, group: "Counter" },
  { id: "pos", label: "Sales & Billing", shortLabel: "Sales", sublabel: "Point of sale and returns", icon: ShoppingCart, group: "Counter" },
  { id: "prescriptions", label: "Prescriptions", shortLabel: "Rx", sublabel: "Verification and doctors", icon: FileText, group: "Counter" },
  { id: "inventory", label: "Inventory", shortLabel: "Stock", sublabel: "Batches, expiry and purchasing", icon: Package, group: "Stock" },
  { id: "customers", label: "Customers", shortLabel: "Customers", sublabel: "Patients and history", icon: UserCheck, group: "People" },
  { id: "staff", label: "Settings", shortLabel: "Settings", sublabel: "Staff and access", icon: Users, group: "People" }
];
