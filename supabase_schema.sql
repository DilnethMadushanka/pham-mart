-- ====================================================================
-- PHARMART Pharmacy Complete Enterprise Supabase Database Schema
-- Paste and Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 0. Clean up any existing partial tables to prevent column mismatch
DROP TABLE IF EXISTS staff, customers, medicines, suppliers, purchase_orders, prescriptions, transactions, audit_logs CASCADE;

-- 1. Staff Accounts & Access Control Table
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Active',
  permissions JSONB,
  last_active TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients & Registered Customers Table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nic TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  allergies TEXT DEFAULT 'None',
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Medicine Inventory & Drug Catalog Table
CREATE TABLE medicines (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dosage TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  reorder_level INT DEFAULT 10,
  is_prescription BOOLEAN DEFAULT FALSE,
  is_controlled BOOLEAN DEFAULT FALSE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Medicine Wholesale Suppliers Table
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  lead_days INT DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inventory Restock Purchase Orders Table
CREATE TABLE purchase_orders (
  id TEXT PRIMARY KEY,
  supplier_id TEXT,
  supplier_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Prescriptions & Doctor Clearances Table
CREATE TABLE prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_reg TEXT,
  status TEXT DEFAULT 'Pending',
  medications JSONB,
  prescription_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. POS Billing & Checkout Transactions Table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  invoice_no TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  cashier_name TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. System Security Audit Trail Logs Table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  user_name TEXT,
  role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INITIAL SEED DATA INSERTION
-- ====================================================================

-- Seed Staff Members
INSERT INTO staff (id, name, username, role, email, phone, status, permissions, last_active)
VALUES 
  ('STF-001', 'Ms. Chathurangika Kahandawaarachchi', 'admin_chathurangika', 'Owner/Admin', 'owner@pharmart.lk', '+94 77 123 4567', 'Active', '["user_management", "inventory_full", "prescription_approve", "pos_checkout", "reports_access"]', 'Just now'),
  ('STF-002', 'Mendis M.M.N', 'pharmacist_mendis', 'Pharmacist', 'mendis@pharmart.lk', '+94 71 987 6543', 'Active', '["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve"]', '5 mins ago'),
  ('STF-003', 'Pathiraja M.M.S', 'cashier_pathiraja', 'Cashier', 'pathiraja@pharmart.lk', '+94 76 555 4321', 'Active', '["pos_checkout", "customer_register", "inventory_view"]', '12 mins ago'),
  ('STF-004', 'Madushanka E.D', 'pharmacist_madushanka', 'Pharmacist', 'madushanka@pharmart.lk', '+94 70 111 2233', 'Active', '["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve"]', '1 hour ago');

-- Seed Customers
INSERT INTO customers (id, name, nic, email, phone, address, allergies)
VALUES 
  ('CUST-301', 'K. A. Sunil Shantha', '781290348V', 'sunil.s@gmail.com', '+94 77 444 1234', 'No 45, Baseline Road, Colombo 09', 'Penicillin'),
  ('CUST-302', 'Kamani Perera', '855420119V', 'kamani.p@yahoo.com', '+94 71 888 5522', '12/A, High Level Road, Nugegoda', 'None');

-- Seed Medicines Inventory
INSERT INTO medicines (id, code, name, category, dosage, price, stock, reorder_level, is_prescription, is_controlled, expiry_date)
VALUES 
  ('MED-101', 'MED-PCM-500', 'Paracetamol Extra 500mg', 'Analgesic', '500mg Tablets', 15.00, 450, 100, FALSE, FALSE, '2027-12-31'),
  ('MED-102', 'MED-AMX-250', 'Amoxicillin Trihydrate', 'Antibiotics', '250mg Capsules', 45.00, 120, 50, TRUE, FALSE, '2026-10-15'),
  ('MED-103', 'MED-MTF-850', 'Metformin HCl 850mg', 'Diabetes', '850mg Tablets', 28.50, 8, 30, TRUE, FALSE, '2026-09-30'),
  ('MED-104', 'MED-ATV-20', 'Atorvastatin Calcium', 'Cardiovascular', '20mg Tablets', 65.00, 60, 20, TRUE, FALSE, '2027-05-20'),
  ('MED-105', 'MED-DZP-05', 'Diazepam 5mg (Valium)', 'Controlled Drugs', '5mg Tablets', 110.00, 4, 15, TRUE, TRUE, '2026-08-30');
