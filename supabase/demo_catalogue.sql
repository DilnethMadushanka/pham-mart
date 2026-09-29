-- Optional: adds the demo suppliers and medicines that older versions of the app
-- showed from code without saving them. Run after supabase_schema.sql if you want
-- them back. Existing rows are never changed (matching id or code is skipped).

insert into public.suppliers (id, name, contact_person, email, phone, address, lead_days) values
  ('SUP-01', 'GlaxoSmithKline Pharmaceuticals', 'Kamal Perera', 'orders@gsk.lk', '+94 11 230 4000', 'Colombo 02, Sri Lanka', 3),
  ('SUP-02', 'State Pharmaceuticals Corporation (SPC)', 'Nimali Silva', 'supplies@spc.gov.lk', '+94 11 243 1845', '75 Sir Baron Jayatilaka Mawatha, Colombo 01', 5),
  ('SUP-03', 'Sun Pharmaceutical Industries', 'Rajesh Sharma', 'distribution@sunpharma.com', '+94 11 471 2200', 'Rajagiriya, Sri Lanka', 4)
on conflict do nothing;

insert into public.medicines (id, code, name, generic_name, category, price, stock, reorder_level, is_prescription, is_controlled, expiry_date, batch_no, supplier_id, supplier_name) values
  ('OTC-201', 'OTC-PED400', 'Anchor PediaPro Infant Milk Powder 400g', 'Infant Growth Formula (1-3 Yrs)', 'Baby Care & Milk Powder', 1450, 120, 25, false, false, '2027-10-15', 'PED-2026-08', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
  ('MED-108', 'MED-VTC100', 'Vitamin C 1000mg Effervescent 20s', 'Ascorbic Acid Immune Booster', 'Supplements & Vitamins', 85, 350, 50, false, false, '2028-01-15', 'VTC-2026-888', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
  ('OTC-202', 'OTC-CET230', 'Cetaphil Baby Wash & Shampoo 230ml', 'Gentle Organic Baby Cleanser', 'Baby Care & Milk Powder', 2150, 85, 15, false, false, '2027-11-20', 'CET-2026-04', 'SUP-01', 'GlaxoSmithKline Pharmaceuticals'),
  ('OTC-203', 'OTC-DET500', 'Dettol Antiseptic Disinfectant 500ml', 'Chloroxylenol First Aid Solution', 'First Aid & Personal Hygiene', 650, 210, 30, false, false, '2028-05-10', 'DET-2025-99', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
  ('OTC-204', 'OTC-MUL060', 'Daily Multivitamin & Minerals 60s', 'Essential Daily Micronutrients', 'Supplements & Vitamins', 1280, 140, 20, false, false, '2027-09-30', 'MUL-2026-12', 'SUP-03', 'Sun Pharmaceutical Industries'),
  ('OTC-205', 'OTC-ORS200', 'ORSL Electrolyte Rehydration Drink 200ml', 'Oral Rehydration Salt Solution', 'First Aid & Personal Hygiene', 180, 300, 40, false, false, '2027-06-15', 'ORS-2026-02', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
  ('MED-101', 'MED-AMX500', 'Amoxicillin 500mg Capsules', 'Amoxicillin Trihydrate', 'Antibiotics', 45, 240, 50, true, false, '2026-11-30', 'AMX-2025-089', 'SUP-01', 'GlaxoSmithKline Pharmaceuticals'),
  ('MED-102', 'MED-PCT500', 'Paracetamol Extra 500mg', 'Paracetamol / Acetaminophen', 'Analgesics', 12, 1200, 200, false, false, '2027-08-15', 'PCT-2026-012', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
  ('MED-103', 'MED-PRG075', 'Pregabalin 75mg Capsules', 'Pregabalin', 'Controlled Drugs', 180, 18, 30, true, true, '2026-09-25', 'PRG-2025-401', 'SUP-03', 'Sun Pharmaceutical Industries'),
  ('MED-104', 'MED-MTF500', 'Metformin ER 500mg', 'Metformin Hydrochloride', 'Diabetes', 28.5, 450, 100, true, false, '2027-04-10', 'MTF-2025-772', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
  ('MED-105', 'MED-ATR010', 'Atorvastatin 10mg Tablets', 'Atorvastatin Calcium', 'Cardiovascular', 95, 8, 40, true, false, '2026-04-05', 'ATR-2025-110', 'SUP-01', 'GlaxoSmithKline Pharmaceuticals'),
  ('MED-107', 'MED-DZP005', 'Diazepam 5mg Tablets', 'Diazepam', 'Controlled Drugs', 120, 45, 20, true, true, '2026-08-30', 'DZP-2024-998', 'SUP-03', 'Sun Pharmaceutical Industries')
on conflict do nothing;
