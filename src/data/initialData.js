// Baseline KPI figures shown in the analytics report.
// Live records (staff, customers, stock, sales) come from the database only.

export const REPORT_BASELINE_KPIS = [
  {
    epic: "Epic 1: User Management & Authentication",
    kpi: "Average User Account Creation Time",
    baseline: "14.5 mins",
    target: "< 2.0 mins",
    measurement: "Elapsed time for Admin to create account, assign role & notify staff.",
    status: "Improved (1.5m)"
  },
  {
    epic: "Epic 1: User Management & Authentication",
    kpi: "Login Authentication Failure Rate",
    baseline: "8.2%",
    target: "< 1.5%",
    measurement: "Percentage of failed login attempts over total authentication calls.",
    status: "Optimal (0.8%)"
  },
  {
    epic: "Epic 1: User Management & Authentication",
    kpi: "Unauthorized Access Attempt Rate",
    baseline: "4.1 attempts/wk",
    target: "0 attempts",
    measurement: "Frequency of users attempting role-restricted features logged by audit system.",
    status: "Blocked (0)"
  },
  {
    epic: "Epic 2: Medicine & Inventory Management",
    kpi: "Average Stock Update Time",
    baseline: "120 mins",
    target: "< 1 min (Realtime)",
    measurement: "Time between physical goods receipt/sale and system inventory record update.",
    status: "Instant (0m)"
  },
  {
    epic: "Epic 2: Medicine & Inventory Management",
    kpi: "Stock Discrepancy Rate",
    baseline: "14.3%",
    target: "< 1.0%",
    measurement: "Percentage of items where physical shelf count differs from system records.",
    status: "Optimal (0.4%)"
  },
  {
    epic: "Epic 2: Medicine & Inventory Management",
    kpi: "Expired Medicine Detection Rate",
    baseline: "65.0% (Manual)",
    target: "100% (Auto alert)",
    measurement: "Percentage of near-expiry/expired drugs flagged before customer sale.",
    status: "100% Active"
  },
  {
    epic: "Epic 3: Customer & Prescription Management",
    kpi: "Average Prescription Verification Time",
    baseline: "18.0 mins",
    target: "< 3.0 mins",
    measurement: "Time for Pharmacist to review dosage, interactions & approve prescription.",
    status: "Fast (2.1m)"
  },
  {
    epic: "Epic 3: Customer & Prescription Management",
    kpi: "Customer Record Retrieval Time",
    baseline: "8.5 mins (Paper)",
    target: "< 10 seconds",
    measurement: "Time required to retrieve full customer purchase & prescription history.",
    status: "Instant (3s)"
  },
  {
    epic: "Epic 4: Sales, Payment & Reporting",
    kpi: "Average Sales Transaction Processing Time",
    baseline: "6.2 mins",
    target: "< 1.5 mins",
    measurement: "Elapsed time from item search at counter to receipt issuance.",
    status: "Fast (1.1m)"
  },
  {
    epic: "Epic 4: Sales, Payment & Reporting",
    kpi: "Billing Error Rate",
    baseline: "5.8%",
    target: "0.0%",
    measurement: "Percentage of transactions with pricing, discount, or tax calculation errors.",
    status: "Zero Errors"
  },
  {
    epic: "Epic 4: Sales, Payment & Reporting",
    kpi: "Stock-Sales Discrepancy Rate",
    baseline: "11.5%",
    target: "0.0%",
    measurement: "Frequency of differences between items sold and inventory deductions.",
    status: "Auto-synced"
  },
  {
    epic: "Epic 4: Sales, Payment & Reporting",
    kpi: "Management Report Preparation Time",
    baseline: "4.5 hours",
    target: "< 5 seconds",
    measurement: "Time to compile daily/monthly sales, inventory, and profit reports.",
    status: "Instant (1s)"
  }
];
