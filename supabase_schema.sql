-- ========================================================
-- PHARMART Pharmacy Supabase Database Schema
-- Execute in Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================

-- 1. Staff Accounts Table
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Active',
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nic TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Medicines Inventory Table
CREATE TABLE IF NOT EXISTS medicines (
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

-- 4. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_reg TEXT,
  status TEXT DEFAULT 'Pending',
  medications JSONB,
  prescription_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transactions Table (POS Sales)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  cashier_name TEXT,
  items JSONB,
  subtotal NUMERIC(10,2),
  discount NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. System Audit Trail Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  user_name TEXT,
  role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Seed Data for Staff Members
INSERT INTO staff (id, name, username, role, email, phone, status, permissions)
VALUES 
  ('STF-001', 'Ms. Chathurangika Kahandawaarachchi', 'admin_chathurangika', 'Owner/Admin', 'owner@pharmart.lk', '+94 77 123 4567', 'Active', '["user_management", "inventory_full", "prescription_approve", "pos_checkout", "reports_access"]'),
  ('STF-002', 'Mendis M.M.N', 'pharmacist_mendis', 'Pharmacist', 'mendis@pharmart.lk', '+94 71 987 6543', 'Active', '["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve"]'),
  ('STF-003', 'Pathiraja M.M.S', 'cashier_pathiraja', 'Cashier', 'pathiraja@pharmart.lk', '+94 76 555 4321', 'Active', '["pos_checkout", "customer_register", "inventory_view"]')
ON CONFLICT (id) DO NOTHING;
