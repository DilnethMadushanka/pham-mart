// Business Architecture Assessment Report Metadata & Structure

export const REPORT_INFO = {
  title: "Business Architecture Assessment Report",
  module: "IE3121 – Enterprise Architecture",
  project: "Information Systems Project 2026",
  group: "ISE_WD_0101_03",
  submissionDate: "18/08/2026",
  lecturer: "Ms. Chathurangika Kahandawaarachchi",
  client: "PHARMART Pharmacy",
  teamMembers: [
    { id: "IT23782372", name: "Mendis M.M.N" },
    { id: "IT23782204", name: "Pathiraja M.M.S" },
    { id: "IT24101347", name: "Madushanka E.D" },
    { id: "IT24100560", name: "Heshan S.A.R" }
  ]
};

export const REPORT_SECTIONS = [
  {
    num: "1",
    title: "Executive Summary",
    summary: "PHARMART Pharmacy is a growing community pharmacy facing operational bottlenecks due to manual paper-based record-keeping and disconnected spreadsheets. The report establishes a baseline for digital transformation across 4 core epics to improve efficiency, patient safety, billing speed, and regulatory compliance."
  },
  {
    num: "2",
    title: "Organization Profile",
    details: [
      { key: "Organization Name", value: "PHARMART Pharmacy" },
      { key: "Industry Sector", value: "Healthcare Services & Community Retail Pharmacy" },
      { key: "Size", value: "Small-to-medium-sized growing community pharmacy" },
      { key: "Core Services", value: "Prescription fulfilment, controlled-drug dispensing, customer care, medicine sales, inventory management and point-of-sale billing" },
      { key: "Structure", value: "Pharmacy Owner/Admin, Pharmacists, Cashiers, Customers" },
      { key: "As-Is Environment", value: "Paper records, manual checking, fragmented spreadsheets, no unified platform" }
    ]
  },
  {
    num: "3",
    title: "Business Problem Statement",
    issues: [
      "Medicine stock is tracked manually and not updated in real time.",
      "Expired medicines identified only during physical checks.",
      "Cashiers manually search products and calculate discounts/taxes by hand.",
      "Stock is not automatically deducted after sales.",
      "Controlled-drug verification is manual and inconsistent, raising compliance risks.",
      "Management reports require tedious manual compilation."
    ]
  },
  {
    num: "4",
    title: "Stakeholder Matrix & Classification",
    stakeholders: [
      { name: "Owner / Administrator", type: "Internal", interest: "High", influence: "High", impact: "High", strategy: "Manage Closely - Direct oversight, strategic financial tracking." },
      { name: "Pharmacist", type: "Internal", interest: "High", influence: "High", impact: "High", strategy: "Manage Closely - Focus on prescription validation & safety." },
      { name: "Cashier / Sales Staff", type: "Internal", interest: "High", influence: "Medium", impact: "Medium", strategy: "Manage Closely - POS billing, speed, training on digital counter." },
      { name: "Customer / Patient", type: "External", interest: "High", influence: "Low", impact: "High", strategy: "Keep Informed - Notifications, fast checkout, digital records." },
      { name: "Medicine Suppliers", type: "External", interest: "Medium", influence: "Medium", impact: "Medium", strategy: "Monitor / Partner - Automated reordering & electronic POs." }
    ]
  },
  {
    num: "5-10",
    title: "Process Activities & Swimlanes",
    epicsSummary: [
      { id: "epic1", name: "Epic 1: User Management & Authentication", swimlanes: "Owner/Admin, Pharmacist, Cashier, System" },
      { id: "epic2", name: "Epic 2: Medicine & Inventory Management", swimlanes: "Inventory Manager, Pharmacist, Supplier, System" },
      { id: "epic3", name: "Epic 3: Customer & Prescription Management", swimlanes: "Customer, Cashier, Pharmacist, System" },
      { id: "epic4", name: "Epic 4: Sales, Payment & Reporting", swimlanes: "Customer, Cashier, Owner/Admin, Payment Gateway, System" }
    ]
  }
];
