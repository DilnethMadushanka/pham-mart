// PHARMART Pharmacy Enterprise System Initial Data

export const INITIAL_STAFF = [
  {
    id: "STF-001",
    name: "Ms. Chathurangika Kahandawaarachchi",
    username: "admin_chathurangika",
    role: "Owner/Admin",
    email: "owner@pharmart.lk",
    phone: "+94 77 123 4567",
    status: "Active",
    permissions: ["user_management", "inventory_full", "prescription_approve", "pos_checkout", "reports_access", "void_refund"],
    lastActive: "Just now",
    createdAt: "2025-01-10"
  },
  {
    id: "STF-002",
    name: "Mendis M.M.N",
    username: "pharmacist_mendis",
    role: "Pharmacist",
    email: "mendis@pharmart.lk",
    phone: "+94 71 987 6543",
    status: "Active",
    permissions: ["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve", "pos_checkout"],
    lastActive: "5 mins ago",
    createdAt: "2025-02-01"
  },
  {
    id: "STF-003",
    name: "Pathiraja M.M.S",
    username: "cashier_pathiraja",
    role: "Cashier",
    email: "pathiraja@pharmart.lk",
    phone: "+94 76 555 4321",
    status: "Active",
    permissions: ["pos_checkout", "customer_register", "inventory_view"],
    lastActive: "12 mins ago",
    createdAt: "2025-03-15"
  },
  {
    id: "STF-004",
    name: "Madushanka E.D",
    username: "pharmacist_madushanka",
    role: "Pharmacist",
    email: "madushanka@pharmart.lk",
    phone: "+94 70 111 2233",
    status: "Active",
    permissions: ["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve"],
    lastActive: "1 hour ago",
    createdAt: "2025-04-10"
  },
  {
    id: "STF-005",
    name: "Heshan S.A.R",
    username: "cashier_heshan",
    role: "Cashier",
    email: "heshan@pharmart.lk",
    phone: "+94 75 444 8899",
    status: "Inactive",
    permissions: ["pos_checkout"],
    lastActive: "2 days ago",
    createdAt: "2025-05-20"
  }
];

// Prescripton & OTC Medicines / Products
export const INITIAL_MEDICINES = [
  // Consumer & OTC Products (Purchasable directly online with images)
  {
    id: "OTC-201",
    code: "OTC-PED400",
    name: "Anchor PediaPro Infant Milk Powder 400g",
    genericName: "Infant Growth Formula (1-3 Yrs)",
    category: "Baby Care & Milk Powder",
    stock: 120,
    reorderLevel: 25,
    unitPrice: 1450.00,
    batchNo: "PED-2026-08",
    expiryDate: "2027-10-15",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-02",
    supplierName: "State Pharmaceuticals Corporation (SPC)",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
    isConsumerProduct: true
  },
  {
    id: "MED-108",
    code: "MED-VTC100",
    name: "Vitamin C 1000mg Effervescent 20s",
    genericName: "Ascorbic Acid Immune Booster",
    category: "Supplements & Vitamins",
    stock: 350,
    reorderLevel: 50,
    unitPrice: 85.00,
    batchNo: "VTC-2026-888",
    expiryDate: "2028-01-15",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-02",
    supplierName: "State Pharmaceuticals Corporation (SPC)",
    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?q=80&w=600&auto=format&fit=crop",
    isConsumerProduct: true
  },
  {
    id: "OTC-202",
    code: "OTC-CET230",
    name: "Cetaphil Baby Wash & Shampoo 230ml",
    genericName: "Gentle Organic Baby Cleanser",
    category: "Baby Care & Milk Powder",
    stock: 85,
    reorderLevel: 15,
    unitPrice: 2150.00,
    batchNo: "CET-2026-04",
    expiryDate: "2027-11-20",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-01",
    supplierName: "GlaxoSmithKline Pharmaceuticals",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    isConsumerProduct: true
  },
  {
    id: "OTC-203",
    code: "OTC-DET500",
    name: "Dettol Antiseptic Disinfectant 500ml",
    genericName: "Chloroxylenol First Aid Solution",
    category: "First Aid & Personal Hygiene",
    stock: 210,
    reorderLevel: 30,
    unitPrice: 650.00,
    batchNo: "DET-2025-99",
    expiryDate: "2028-05-10",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-02",
    supplierName: "State Pharmaceuticals Corporation (SPC)",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop",
    isConsumerProduct: true
  },
  {
    id: "OTC-204",
    code: "OTC-MUL060",
    name: "Daily Multivitamin & Minerals 60s",
    genericName: "Essential Daily Micronutrients",
    category: "Supplements & Vitamins",
    stock: 140,
    reorderLevel: 20,
    unitPrice: 1280.00,
    batchNo: "MUL-2026-12",
    expiryDate: "2027-09-30",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-03",
    supplierName: "Sun Pharmaceutical Industries",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop",
    isConsumerProduct: true
  },
  {
    id: "OTC-205",
    code: "OTC-ORS200",
    name: "ORSL Electrolyte Rehydration Drink 200ml",
    genericName: "Oral Rehydration Salt Solution",
    category: "First Aid & Personal Hygiene",
    stock: 300,
    reorderLevel: 40,
    unitPrice: 180.00,
    batchNo: "ORS-2026-02",
    expiryDate: "2027-06-15",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-02",
    supplierName: "State Pharmaceuticals Corporation (SPC)",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop",
    isConsumerProduct: true
  },

  // Prescription Medicines (Internal & POS Catalogue)
  {
    id: "MED-101",
    code: "MED-AMX500",
    name: "Amoxicillin 500mg Capsules",
    genericName: "Amoxicillin Trihydrate",
    category: "Antibiotics",
    stock: 240,
    reorderLevel: 50,
    unitPrice: 45.00,
    batchNo: "AMX-2025-089",
    expiryDate: "2026-11-30",
    prescriptionRequired: true,
    controlledDrug: false,
    supplierId: "SUP-01",
    supplierName: "GlaxoSmithKline Pharmaceuticals",
    isConsumerProduct: false
  },
  {
    id: "MED-102",
    code: "MED-PCT500",
    name: "Paracetamol Extra 500mg",
    genericName: "Paracetamol / Acetaminophen",
    category: "Analgesics",
    stock: 1200,
    reorderLevel: 200,
    unitPrice: 12.00,
    batchNo: "PCT-2026-012",
    expiryDate: "2027-08-15",
    prescriptionRequired: false,
    controlledDrug: false,
    supplierId: "SUP-02",
    supplierName: "State Pharmaceuticals Corporation (SPC)",
    isConsumerProduct: false
  },
  {
    id: "MED-103",
    code: "MED-PRG075",
    name: "Pregabalin 75mg Capsules",
    genericName: "Pregabalin",
    category: "Controlled Drugs",
    stock: 18,
    reorderLevel: 30,
    unitPrice: 180.00,
    batchNo: "PRG-2025-401",
    expiryDate: "2026-09-25",
    prescriptionRequired: true,
    controlledDrug: true,
    supplierId: "SUP-03",
    supplierName: "Sun Pharmaceutical Industries",
    isConsumerProduct: false
  },
  {
    id: "MED-104",
    code: "MED-MTF500",
    name: "Metformin ER 500mg",
    genericName: "Metformin Hydrochloride",
    category: "Diabetes",
    stock: 450,
    reorderLevel: 100,
    unitPrice: 28.50,
    batchNo: "MTF-2025-772",
    expiryDate: "2027-04-10",
    prescriptionRequired: true,
    controlledDrug: false,
    supplierId: "SUP-02",
    supplierName: "State Pharmaceuticals Corporation (SPC)",
    isConsumerProduct: false
  },
  {
    id: "MED-105",
    code: "MED-ATR010",
    name: "Atorvastatin 10mg Tablets",
    genericName: "Atorvastatin Calcium",
    category: "Cardiovascular",
    stock: 8,
    reorderLevel: 40,
    unitPrice: 95.00,
    batchNo: "ATR-2025-110",
    expiryDate: "2026-04-05",
    prescriptionRequired: true,
    controlledDrug: false,
    supplierId: "SUP-01",
    supplierName: "GlaxoSmithKline Pharmaceuticals",
    isConsumerProduct: false
  },
  {
    id: "MED-107",
    code: "MED-DZP005",
    name: "Diazepam 5mg Tablets",
    genericName: "Diazepam",
    category: "Controlled Drugs",
    stock: 45,
    reorderLevel: 20,
    unitPrice: 120.00,
    batchNo: "DZP-2024-998",
    expiryDate: "2026-08-30",
    prescriptionRequired: true,
    controlledDrug: true,
    supplierId: "SUP-03",
    supplierName: "Sun Pharmaceutical Industries",
    isConsumerProduct: false
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: "SUP-01",
    name: "GlaxoSmithKline Pharmaceuticals",
    contactPerson: "Kamal Perera",
    email: "orders@gsk.lk",
    phone: "+94 11 230 4000",
    address: "Colombo 02, Sri Lanka",
    leadTimeDays: 3
  },
  {
    id: "SUP-02",
    name: "State Pharmaceuticals Corporation (SPC)",
    contactPerson: "Nimali Silva",
    email: "supplies@spc.gov.lk",
    phone: "+94 11 243 1845",
    address: "75 Sir Baron Jayatilaka Mawatha, Colombo 01",
    leadTimeDays: 5
  },
  {
    id: "SUP-03",
    name: "Sun Pharmaceutical Industries",
    contactPerson: "Rajesh Sharma",
    email: "distribution@sunpharma.com",
    phone: "+94 11 471 2200",
    address: "Rajagiriya, Sri Lanka",
    leadTimeDays: 4
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: "PO-2026-001",
    poNumber: "PO-2026-001",
    supplierId: "SUP-03",
    supplierName: "Sun Pharmaceutical Industries",
    orderDate: "2026-08-15",
    status: "Issued",
    expectedDelivery: "2026-08-20",
    items: [
      { medicineId: "MED-103", name: "Pregabalin 75mg Capsules", quantity: 100, unitCost: 140.00, total: 14000.00 }
    ],
    totalAmount: 14000.00
  },
  {
    id: "PO-2026-002",
    poNumber: "PO-2026-002",
    supplierId: "SUP-01",
    supplierName: "GlaxoSmithKline Pharmaceuticals",
    orderDate: "2026-08-16",
    status: "Goods Received",
    expectedDelivery: "2026-08-18",
    items: [
      { medicineId: "MED-105", name: "Atorvastatin 10mg Tablets", quantity: 200, unitCost: 70.00, total: 14000.00 }
    ],
    totalAmount: 14000.00
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "CUST-301",
    name: "K. A. Sunil Shantha",
    nic: "781290348V",
    phone: "+94 77 444 1234",
    email: "sunil.s@gmail.com",
    address: "12/A, High Level Road, Nugegoda",
    allergies: "Penicillin, Sulfa drugs",
    historyCount: 14,
    lastVisit: "2026-08-14"
  },
  {
    id: "CUST-302",
    name: "Dr. Anula Wickramasinghe",
    nic: "825541092V",
    phone: "+94 71 888 9900",
    email: "anula.w@yahoo.com",
    address: "45, Galle Road, Dehiwala",
    allergies: "None reported",
    historyCount: 22,
    lastVisit: "2026-08-17"
  },
  {
    id: "CUST-303",
    name: "S. K. Priyantha Bandara",
    nic: "900451230V",
    phone: "+94 76 222 3344",
    email: "priyantha.b@hotmail.com",
    address: "88/3, Kandy Road, Kiribathgoda",
    allergies: "Aspirin",
    historyCount: 6,
    lastVisit: "2026-08-10"
  }
];

export const INITIAL_PRESCRIPTIONS = [
  {
    id: "RX-901",
    rxNumber: "RX-2026-0901",
    customerId: "CUST-301",
    customerName: "K. A. Sunil Shantha",
    doctorName: "Dr. L. C. Fernando (MBBS, MD)",
    doctorSlmcNo: "SLMC-44912",
    uploadDate: "2026-08-18 10:30 AM",
    expiryDate: "2026-09-18",
    medicines: [
      { medicineId: "MED-104", name: "Metformin ER 500mg", dosage: "1 tablet twice daily after meals", durationDays: 30, quantity: 60 },
      { medicineId: "MED-105", name: "Atorvastatin 10mg Tablets", dosage: "1 tablet at night", durationDays: 30, quantity: 30 }
    ],
    isControlledDrug: false,
    status: "Approved",
    verifiedBy: "Mendis M.M.N (Pharmacist)",
    verifiedAt: "2026-08-18 10:45 AM",
    notes: "Verified against patient diabetes & cholesterol management history."
  },
  {
    id: "RX-902",
    rxNumber: "RX-2026-0902",
    customerId: "CUST-303",
    customerName: "S. K. Priyantha Bandara",
    doctorName: "Dr. K. Jayasuriya (Psychiatrist)",
    doctorSlmcNo: "SLMC-31008",
    uploadDate: "2026-08-18 02:15 PM",
    expiryDate: "2026-08-25",
    medicines: [
      { medicineId: "MED-103", name: "Pregabalin 75mg Capsules", dosage: "1 capsule twice daily", durationDays: 14, quantity: 28 },
      { medicineId: "MED-107", name: "Diazepam 5mg Tablets", dosage: "1 tablet at bedtime as needed", durationDays: 7, quantity: 7 }
    ],
    isControlledDrug: true,
    status: "Pending",
    verifiedBy: null,
    verifiedAt: null,
    notes: "Controlled Drug Verification Required! Check SLMC registration & repeat dispensing records."
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-8801",
    invoiceNo: "INV-2026-8801",
    date: "2026-08-18 11:20 AM",
    customerName: "K. A. Sunil Shantha",
    cashierName: "Pathiraja M.M.S",
    items: [
      { name: "Metformin ER 500mg", qty: 60, price: 28.50, total: 1710.00 },
      { name: "Paracetamol Extra 500mg", qty: 20, price: 12.00, total: 240.00 }
    ],
    subtotal: 1950.00,
    discountPct: 5,
    discountAmt: 97.50,
    taxPct: 2,
    taxAmt: 37.05,
    total: 1889.55,
    paymentMethod: "Cash",
    paidAmount: 2000.00,
    changeAmount: 110.45,
    status: "Completed"
  },
  {
    id: "TXN-8802",
    invoiceNo: "INV-2026-8802",
    date: "2026-08-18 01:40 PM",
    customerName: "Walk-in Customer",
    cashierName: "Pathiraja M.M.S",
    items: [
      { name: "Vitamin C 1000mg Effervescent", qty: 2, price: 85.00, total: 170.00 }
    ],
    subtotal: 170.00,
    discountPct: 0,
    discountAmt: 0,
    taxPct: 0,
    taxAmt: 0,
    total: 170.00,
    paymentMethod: "Digital Wallet (LANKAQR)",
    paidAmount: 170.00,
    changeAmount: 0,
    status: "Completed"
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: "LOG-501",
    timestamp: "2026-08-18 09:00:12",
    user: "Ms. Chathurangika Kahandawaarachchi",
    role: "Owner/Admin",
    action: "System Login",
    details: "Authenticated via 2FA into Administrator Panel",
    severity: "info"
  },
  {
    id: "LOG-502",
    timestamp: "2026-08-18 10:45:33",
    user: "Mendis M.M.N",
    role: "Pharmacist",
    action: "Prescription Approved",
    details: "Approved RX-2026-0901 for Customer K. A. Sunil Shantha",
    severity: "success"
  },
  {
    id: "LOG-503",
    timestamp: "2026-08-18 11:20:04",
    user: "Pathiraja M.M.S",
    role: "Cashier",
    action: "POS Checkout",
    details: "Processed Invoice INV-2026-8801 Total LKR 1,889.55",
    severity: "info"
  },
  {
    id: "LOG-504",
    timestamp: "2026-08-18 02:15:50",
    user: "System Security Engine",
    role: "System",
    action: "Controlled Drug Dispense Block",
    details: "Blocked unauthorized POS attempt for Diazepam 5mg without Pharmacist clearance",
    severity: "danger"
  }
];

// Baseline Indicators directly from Report Section 13 (Pages 29 - 32)
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
