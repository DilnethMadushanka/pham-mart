-- ====================================================================
-- PHARMART database setup
--
-- Paste this whole file into the Supabase SQL Editor and run it.
-- It is safe on a brand-new project and safe to re-run on the live one:
-- it never drops a table and only adds what is missing.
--
-- What it sets up:
--   * Hashed passwords (bcrypt) and server-side sign-in sessions.
--   * Row Level Security on every table. The browser can no longer read or
--     write tables directly; everything goes through the functions below,
--     which check the signed-in user's role.
--   * Atomic POS checkout (stock, prices, prescription checks in one step).
--   * Columns that the app used to lose on reload.
--
-- On an existing database it also moves the plain-text passwords into the
-- hashed credentials table and then removes the plain-text columns.
-- ====================================================================

begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Google sign-in is verified by asking Google about the token; that needs the
-- "http" extension. If it can't be enabled, Google sign-in reports that it is
-- unavailable and email/password sign-in keeps working.
do $$
begin
  create extension if not exists http with schema extensions;
exception when others then
  raise notice 'http extension not available: Google sign-in will be disabled';
end $$;

create schema if not exists app_private;
revoke all on schema app_private from public;

-- --------------------------------------------------------------------
-- 1. Tables (created only when missing)
-- --------------------------------------------------------------------

create table if not exists public.staff (
  id text primary key,
  name text not null,
  username text unique not null,
  role text not null,
  email text unique not null,
  phone text,
  status text default 'Active',
  permissions jsonb,
  last_active text,
  created_at timestamptz default current_timestamp
);

create table if not exists public.customers (
  id text primary key,
  name text not null,
  nic text,
  email text,
  phone text,
  address text,
  allergies text default 'None',
  created_at timestamptz default current_timestamp
);

create table if not exists public.medicines (
  id text primary key,
  code text unique not null,
  name text not null,
  category text not null,
  dosage text,
  price numeric(10,2) not null,
  stock int not null default 0,
  reorder_level int default 10,
  is_prescription boolean default false,
  is_controlled boolean default false,
  expiry_date date,
  created_at timestamptz default current_timestamp
);

create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  contact_person text,
  phone text,
  email text,
  lead_days int default 3,
  created_at timestamptz default current_timestamp
);

create table if not exists public.purchase_orders (
  id text primary key,
  supplier_id text,
  supplier_name text not null,
  items jsonb not null,
  total_amount numeric(10,2) not null,
  status text default 'Pending',
  created_at timestamptz default current_timestamp
);

create table if not exists public.prescriptions (
  id text primary key,
  patient_id text,
  patient_name text not null,
  doctor_name text not null,
  doctor_reg text,
  status text default 'Pending',
  medications jsonb,
  rejection_reason text,
  created_at timestamptz default current_timestamp
);

create table if not exists public.transactions (
  id text primary key,
  invoice_no text unique not null,
  customer_name text,
  cashier_name text,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null,
  payment_method text default 'Cash',
  created_at timestamptz default current_timestamp
);

create table if not exists public.audit_logs (
  id text primary key,
  timestamp text,
  user_name text,
  role text,
  action text not null,
  details text,
  severity text default 'info',
  created_at timestamptz default current_timestamp
);

-- Registered doctors. Pharmacists check each prescription's doctor against this list.
create table if not exists public.doctors (
  id text primary key,
  name text not null,
  slmc_no text not null,
  specialty text,
  phone text,
  email text,
  hospital text,
  notes text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
);

-- Stock is held in batches. medicines.stock is always the sum of its batches.
create table if not exists public.medicine_batches (
  id text primary key,
  medicine_id text not null references public.medicines (id) on delete cascade,
  batch_no text not null,
  expiry_date date,
  quantity int not null default 0 check (quantity >= 0),
  received_date date default current_date,
  source text,
  created_at timestamptz default current_timestamp
);

-- Every stock change other than a sale: deliveries, counts, write-offs, returns.
create table if not exists public.stock_movements (
  id text primary key,
  medicine_id text,
  medicine_name text,
  batch_id text,
  batch_no text,
  change int not null,
  quantity_after int,
  reason text not null,
  note text,
  user_id text,
  user_name text,
  created_at timestamptz default current_timestamp
);

-- Each supplier's price for a medicine.
create table if not exists public.supplier_prices (
  supplier_id text not null references public.suppliers (id) on delete cascade,
  medicine_id text not null references public.medicines (id) on delete cascade,
  unit_cost numeric(10,2) not null check (unit_cost >= 0),
  min_order_qty int default 1,
  updated_at timestamptz default current_timestamp,
  primary key (supplier_id, medicine_id)
);

-- Returned medicines and the refund paid for them.
create table if not exists public.sales_returns (
  id text primary key,
  transaction_id text not null,
  invoice_no text,
  customer_id text,
  customer_name text,
  items jsonb not null,
  refund_amount numeric(10,2) not null,
  refund_method text not null,
  reason text,
  processed_by_id text,
  processed_by text,
  created_at timestamptz default current_timestamp
);

-- --------------------------------------------------------------------
-- 2. Columns the app needs but the old schema did not store
-- --------------------------------------------------------------------

alter table public.customers add column if not exists auth_provider text;

alter table public.medicines add column if not exists generic_name text;
alter table public.medicines add column if not exists batch_no text;
alter table public.medicines add column if not exists supplier_id text;
alter table public.medicines add column if not exists supplier_name text;
alter table public.medicines add column if not exists barcode text;

alter table public.suppliers add column if not exists address text;

alter table public.purchase_orders add column if not exists order_date date;
alter table public.purchase_orders add column if not exists expected_delivery date;
alter table public.purchase_orders add column if not exists received_date date;
alter table public.purchase_orders add column if not exists received_by text;
alter table public.purchase_orders add column if not exists created_by text;
alter table public.purchase_orders add column if not exists approved_by text;
alter table public.purchase_orders add column if not exists approved_at timestamptz;
alter table public.purchase_orders add column if not exists deliveries jsonb default '[]'::jsonb;
alter table public.purchase_orders add column if not exists notes text;

alter table public.prescriptions add column if not exists rx_number text;
alter table public.prescriptions add column if not exists notes text;
alter table public.prescriptions add column if not exists contact_phone text;
alter table public.prescriptions add column if not exists delivery_address text;
alter table public.prescriptions add column if not exists order_type text;
alter table public.prescriptions add column if not exists pharmacist_notes text;
alter table public.prescriptions add column if not exists verified_by text;
alter table public.prescriptions add column if not exists verified_at timestamptz;
alter table public.prescriptions add column if not exists is_controlled boolean default false;
alter table public.prescriptions add column if not exists expiry_date date;
alter table public.prescriptions add column if not exists has_attachment boolean default false;
alter table public.prescriptions add column if not exists dispensed_at timestamptz;
alter table public.prescriptions add column if not exists dispensed_txn text;
alter table public.prescriptions add column if not exists doctor_id text;
-- Date the doctor wrote the prescription. It is valid for 7 days from that date.
alter table public.prescriptions add column if not exists prescription_date date;

alter table public.transactions add column if not exists paid_amount numeric(10,2) default 0;
alter table public.transactions add column if not exists change_amount numeric(10,2) default 0;
alter table public.transactions add column if not exists discount_pct numeric(5,2);
alter table public.transactions add column if not exists tax_pct numeric(5,2);
alter table public.transactions add column if not exists customer_id text;
alter table public.transactions add column if not exists cashier_id text;
alter table public.transactions add column if not exists prescription_id text;
alter table public.transactions add column if not exists refunded_amount numeric(10,2) default 0;

alter table public.audit_logs add column if not exists user_id text;

create index if not exists customers_email_idx on public.customers (lower(email));
create index if not exists customers_nic_idx on public.customers (upper(nic));
create index if not exists prescriptions_patient_idx on public.prescriptions (patient_id);
create index if not exists transactions_customer_idx on public.transactions (customer_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create unique index if not exists doctors_slmc_idx on public.doctors (upper(slmc_no));
create index if not exists prescriptions_doctor_idx on public.prescriptions (doctor_id);
create unique index if not exists medicine_batches_no_idx on public.medicine_batches (medicine_id, upper(batch_no));
create index if not exists medicine_batches_expiry_idx on public.medicine_batches (medicine_id, expiry_date);
create index if not exists stock_movements_medicine_idx on public.stock_movements (medicine_id, created_at desc);
create index if not exists sales_returns_txn_idx on public.sales_returns (transaction_id);
create unique index if not exists medicines_barcode_idx on public.medicines (barcode) where barcode is not null;

-- Stock can never go negative (NOT VALID keeps any odd historic rows untouched).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'medicines_stock_nonnegative') then
    alter table public.medicines add constraint medicines_stock_nonnegative check (stock >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'medicines_price_nonnegative') then
    alter table public.medicines add constraint medicines_price_nonnegative check (price >= 0) not valid;
  end if;
end $$;

-- --------------------------------------------------------------------
-- 3. Private tables (not reachable through the API)
-- --------------------------------------------------------------------

create table if not exists app_private.credentials (
  principal_kind text not null check (principal_kind in ('staff', 'customer')),
  principal_id text not null,
  password_hash text not null,
  updated_at timestamptz not null default now(),
  primary key (principal_kind, principal_id)
);

create table if not exists app_private.sessions (
  token_hash text primary key,
  principal_kind text not null check (principal_kind in ('staff', 'customer')),
  principal_id text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_principal_idx on app_private.sessions (principal_kind, principal_id);

create table if not exists app_private.login_failures (
  login text not null,
  failed_at timestamptz not null default now()
);
create index if not exists login_failures_idx on app_private.login_failures (login, failed_at);

create table if not exists app_private.prescription_files (
  rx_id text primary key,
  data_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists app_private.settings (
  key text primary key,
  value text
);
insert into app_private.settings (key, value)
values ('google_client_id', '458326249784-qekor0do0peojbsrpc2rh47m4h5366fi.apps.googleusercontent.com')
on conflict (key) do nothing;

-- --------------------------------------------------------------------
-- 4. One-time moves for databases created with the old schema
-- --------------------------------------------------------------------

-- Plain-text passwords -> bcrypt hashes, then drop the plain-text columns.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'staff' and column_name = 'password') then
    insert into app_private.credentials (principal_kind, principal_id, password_hash)
    select 'staff', id, extensions.crypt(password, extensions.gen_salt('bf', 10))
    from public.staff where coalesce(password, '') <> ''
    on conflict do nothing;
    alter table public.staff drop column password;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'customers' and column_name = 'password') then
    insert into app_private.credentials (principal_kind, principal_id, password_hash)
    select 'customer', id, extensions.crypt(password, extensions.gen_salt('bf', 10))
    from public.customers where coalesce(password, '') <> ''
    on conflict do nothing;
    alter table public.customers drop column password;
  end if;
end $$;

-- Prescription photos move out of the main table so lists stay small and
-- only authorised users can open them.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'prescriptions' and column_name = 'prescription_url') then
    insert into app_private.prescription_files (rx_id, data_url)
    select id, prescription_url from public.prescriptions
    where prescription_url like 'data:%'
    on conflict do nothing;
    update public.prescriptions p set has_attachment = true
    where exists (select 1 from app_private.prescription_files f where f.rx_id = p.id);
    alter table public.prescriptions drop column prescription_url;
  end if;
end $$;

-- The old app saved customer notes and addresses into rejection_reason.
update public.prescriptions
set notes = rejection_reason, rejection_reason = null
where status <> 'Rejected' and notes is null and rejection_reason is not null;

update public.prescriptions set rx_number = id where rx_number is null;

-- The old app stored the generic name in the dosage column.
update public.medicines set generic_name = dosage where generic_name is null;

update public.purchase_orders set order_date = created_at::date where order_date is null;

-- Purchase orders now go Pending -> Approved -> Received. Older orders were
-- sent straight to the supplier, so they count as approved.
update public.purchase_orders set status = 'Approved' where status = 'Issued' or status is null;
update public.purchase_orders set status = 'Received' where status = 'Goods Received';

-- --------------------------------------------------------------------
-- 5. Change counters (the app listens to these for live updates)
-- --------------------------------------------------------------------

create table if not exists public.data_versions (
  table_name text primary key,
  version bigint not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function app_private.bump_data_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.data_versions (table_name, version, updated_at)
  values (tg_table_name, 1, now())
  on conflict (table_name) do update set version = public.data_versions.version + 1, updated_at = now();
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['staff','customers','medicines','suppliers','purchase_orders','prescriptions','transactions','audit_logs','doctors',
                           'medicine_batches','stock_movements','supplier_prices','sales_returns'] loop
    execute format('drop trigger if exists bump_data_version on public.%I', t);
    execute format('create trigger bump_data_version after insert or update or delete on public.%I
                    for each statement execute function app_private.bump_data_version()', t);
  end loop;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime' and not puballtables)
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'data_versions') then
    alter publication supabase_realtime add table public.data_versions;
  end if;
end $$;

-- --------------------------------------------------------------------
-- 6. Private helpers
-- --------------------------------------------------------------------

create or replace function app_private.new_id(prefix text)
returns text
language sql
volatile
as $$
  select prefix || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
$$;

-- Today's date in Sri Lanka (the database clock runs in UTC).
create or replace function app_private.today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Colombo')::date
$$;

create or replace function app_private.hash_token(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create or replace function app_private.hash_password(p_password text)
returns text
language sql
volatile
set search_path = public, extensions
as $$
  select extensions.crypt(p_password, extensions.gen_salt('bf', 10))
$$;

create or replace function app_private.check_password(p_kind text, p_id text, p_password text)
returns boolean
language sql
stable
set search_path = public, extensions, app_private
as $$
  select exists (
    select 1 from app_private.credentials c
    where c.principal_kind = p_kind and c.principal_id = p_id
      and c.password_hash = extensions.crypt(coalesce(p_password, ''), c.password_hash)
  )
$$;

create or replace function app_private.set_password(p_kind text, p_id text, p_password text)
returns void
language plpgsql
set search_path = public, extensions, app_private
as $$
begin
  if length(coalesce(p_password, '')) < 8 then
    raise exception 'Passwords must be at least 8 characters.';
  end if;
  insert into app_private.credentials (principal_kind, principal_id, password_hash, updated_at)
  values (p_kind, p_id, app_private.hash_password(p_password), now())
  on conflict (principal_kind, principal_id)
  do update set password_hash = excluded.password_hash, updated_at = now();
end $$;

create or replace function app_private.start_session(p_kind text, p_id text)
returns text
language plpgsql
set search_path = public, extensions, app_private
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  delete from app_private.sessions where expires_at < now();
  insert into app_private.sessions (token_hash, principal_kind, principal_id, expires_at)
  values (app_private.hash_token(v_token), p_kind, p_id,
          now() + case when p_kind = 'staff' then interval '12 hours' else interval '30 days' end);
  return v_token;
end $$;

-- Who is behind a session token. Returns no row for guests, expired sessions
-- and deactivated staff.
create or replace function app_private.session_principal(p_token text)
returns table (kind text, principal_id text, role text, display_name text)
language sql
stable
set search_path = public, extensions, app_private
as $$
  select 'staff'::text, st.id, st.role, st.name
  from app_private.sessions s
  join public.staff st on st.id = s.principal_id
  where s.token_hash = app_private.hash_token(p_token)
    and s.expires_at > now()
    and s.principal_kind = 'staff'
    and coalesce(st.status, 'Active') = 'Active'
  union all
  select 'customer'::text, c.id, 'Customer'::text, c.name
  from app_private.sessions s
  join public.customers c on c.id = s.principal_id
  where s.token_hash = app_private.hash_token(p_token)
    and s.expires_at > now()
    and s.principal_kind = 'customer'
  limit 1
$$;

create or replace function app_private.require_staff(p_token text, p_roles text[] default null)
returns table (principal_id text, role text, display_name text)
language plpgsql
stable
set search_path = public, extensions, app_private
as $$
declare
  p record;
begin
  select * into p from app_private.session_principal(p_token);
  if p.kind is distinct from 'staff' then
    raise exception 'Your session has ended. Please sign in again.' using errcode = '42501';
  end if;
  if p_roles is not null and not (p.role = any (p_roles)) then
    raise exception 'Your role (%) is not allowed to do this.', p.role using errcode = '42501';
  end if;
  return query select p.principal_id, p.role, p.display_name;
end $$;

create or replace function app_private.clean_text(p_value text, p_max int default 500)
returns text
language sql
immutable
as $$
  select nullif(left(btrim(coalesce(p_value, '')), p_max), '')
$$;

create or replace function app_private.as_array(p_value jsonb)
returns jsonb
language sql
immutable
as $$
  select case jsonb_typeof(p_value)
    when 'array' then p_value
    when 'object' then jsonb_build_array(p_value)
    when 'string' then case when left(p_value #>> '{}', 1) = '[' then (p_value #>> '{}')::jsonb else '[]'::jsonb end
    else '[]'::jsonb
  end
$$;

create or replace function app_private.local_stamp()
returns text
language sql
stable
as $$
  select to_char(now() at time zone 'Asia/Colombo', 'YYYY-MM-DD HH24:MI')
$$;

-- JSON shapes the app reads (camelCase, matching the React components).

create or replace function app_private.medicine_json(m public.medicines)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', m.id,
    'code', m.code,
    'name', m.name,
    'genericName', coalesce(m.generic_name, ''),
    'dosage', m.dosage,
    'category', m.category,
    'unitPrice', m.price,
    'stock', m.stock,
    'reorderLevel', coalesce(m.reorder_level, 0),
    'expiryDate', m.expiry_date,
    'batchNo', coalesce(m.batch_no, ''),
    'prescriptionRequired', coalesce(m.is_prescription, false) or coalesce(m.is_controlled, false),
    'controlledDrug', coalesce(m.is_controlled, false),
    'supplierId', m.supplier_id,
    'supplierName', coalesce(m.supplier_name, ''),
    'barcode', coalesce(m.barcode, ''),
    'batchCount', (select count(*) from public.medicine_batches b where b.medicine_id = m.id and b.quantity > 0),
    'expiredStock', coalesce((select sum(b.quantity) from public.medicine_batches b
                              where b.medicine_id = m.id and b.expiry_date < app_private.today()), 0),
    'sellableStock', greatest(0, m.stock - coalesce((select sum(b.quantity) from public.medicine_batches b
                              where b.medicine_id = m.id and b.expiry_date < app_private.today()), 0))
  )
$$;

create or replace function app_private.batch_json(b public.medicine_batches)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', b.id,
    'medicineId', b.medicine_id,
    'batchNo', b.batch_no,
    'expiryDate', b.expiry_date,
    'quantity', b.quantity,
    'receivedDate', b.received_date,
    'source', coalesce(b.source, '')
  )
$$;

create or replace function app_private.movement_json(v public.stock_movements)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', v.id,
    'medicineId', v.medicine_id,
    'medicineName', coalesce(v.medicine_name, ''),
    'batchId', v.batch_id,
    'batchNo', coalesce(v.batch_no, ''),
    'change', v.change,
    'quantityAfter', v.quantity_after,
    'reason', v.reason,
    'note', coalesce(v.note, ''),
    'user', coalesce(v.user_name, ''),
    'createdAt', v.created_at
  )
$$;

create or replace function app_private.return_json(r public.sales_returns)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', r.id,
    'returnNo', r.id,
    'transactionId', r.transaction_id,
    'invoiceNo', r.invoice_no,
    'customerId', r.customer_id,
    'customerName', coalesce(r.customer_name, 'Walk-in Customer'),
    'items', app_private.as_array(r.items),
    'refundAmount', r.refund_amount,
    'refundMethod', r.refund_method,
    'reason', coalesce(r.reason, ''),
    'processedBy', coalesce(r.processed_by, ''),
    'createdAt', r.created_at
  )
$$;

-- Recomputes a medicine's stock, earliest expiry and current batch from its batches.
create or replace function app_private.sync_medicine_stock(p_medicine_id text)
returns public.medicines
language sql
as $$
  update public.medicines m set
    stock = coalesce((select sum(b.quantity) from public.medicine_batches b where b.medicine_id = m.id), 0),
    expiry_date = coalesce((select min(b.expiry_date) from public.medicine_batches b
                            where b.medicine_id = m.id and b.quantity > 0), m.expiry_date),
    batch_no = coalesce((select b.batch_no from public.medicine_batches b
                         where b.medicine_id = m.id and b.quantity > 0
                         order by b.expiry_date nulls last, b.received_date, b.created_at limit 1), m.batch_no)
  where m.id = p_medicine_id
  returning m.*
$$;

-- Adds units to a batch, creating it when this batch number is new for the medicine.
create or replace function app_private.add_batch_stock(p_medicine_id text, p_batch_no text, p_expiry date, p_qty int, p_source text)
returns public.medicine_batches
language plpgsql
as $$
declare
  b public.medicine_batches;
  v_no text := upper(coalesce(nullif(trim(p_batch_no), ''), 'NO-BATCH'));
begin
  select * into b from public.medicine_batches
  where medicine_id = p_medicine_id and upper(batch_no) = v_no for update;
  if found then
    if p_expiry is not null and b.expiry_date is not null and b.expiry_date <> p_expiry then
      raise exception 'Batch % is already recorded with expiry date %. Check the batch number or the expiry date.', b.batch_no, b.expiry_date;
    end if;
    update public.medicine_batches set quantity = quantity + p_qty, expiry_date = coalesce(expiry_date, p_expiry)
    where id = b.id returning * into b;
  else
    insert into public.medicine_batches (id, medicine_id, batch_no, expiry_date, quantity, received_date, source)
    values (app_private.new_id('BAT'), p_medicine_id, v_no, p_expiry, p_qty, app_private.today(), p_source)
    returning * into b;
  end if;
  return b;
end $$;

-- Takes units out of batches, earliest expiry first. Sales skip expired batches.
create or replace function app_private.take_batch_stock(p_medicine_id text, p_qty int, p_include_expired boolean)
returns jsonb
language plpgsql
as $$
declare
  b public.medicine_batches;
  v_left int := p_qty;
  v_take int;
  v_used jsonb := '[]'::jsonb;
begin
  for b in
    select * from public.medicine_batches
    where medicine_id = p_medicine_id and quantity > 0
      and (p_include_expired or expiry_date is null or expiry_date >= app_private.today())
    order by expiry_date nulls last, received_date, created_at
    for update
  loop
    exit when v_left <= 0;
    v_take := least(v_left, b.quantity);
    update public.medicine_batches set quantity = quantity - v_take where id = b.id;
    v_used := v_used || jsonb_build_object('batchId', b.id, 'batchNo', b.batch_no, 'expiryDate', b.expiry_date, 'qty', v_take);
    v_left := v_left - v_take;
  end loop;
  if v_left > 0 then
    raise exception 'Not enough stock in date to take % units.', p_qty;
  end if;
  return v_used;
end $$;

create or replace function app_private.log_movement(p_user_id text, p_user text, b public.medicine_batches, p_change int, p_reason text, p_note text)
returns jsonb
language plpgsql
as $$
declare
  r public.stock_movements;
begin
  insert into public.stock_movements (id, medicine_id, medicine_name, batch_id, batch_no, change, quantity_after, reason, note, user_id, user_name)
  values (app_private.new_id('MOV'), b.medicine_id, (select name from public.medicines where id = b.medicine_id),
          b.id, b.batch_no, p_change, b.quantity, p_reason, nullif(p_note, ''), p_user_id, p_user)
  returning * into r;
  return app_private.movement_json(r);
end $$;

create or replace function app_private.staff_json(s public.staff)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'username', s.username,
    'role', s.role,
    'email', s.email,
    'phone', coalesce(s.phone, ''),
    'status', coalesce(s.status, 'Active'),
    'permissions', coalesce(s.permissions, '[]'::jsonb),
    'lastActive', coalesce(s.last_active, 'Never'),
    'createdAt', s.created_at,
    'userType', 'staff'
  )
$$;

create or replace function app_private.customer_json(c public.customers)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'nic', coalesce(c.nic, ''),
    'email', coalesce(c.email, ''),
    'phone', coalesce(c.phone, ''),
    'address', coalesce(c.address, ''),
    'allergies', coalesce(c.allergies, 'None'),
    'createdAt', c.created_at,
    'historyCount', (select count(*) from public.transactions t where t.customer_id = c.id),
    'lastVisit', coalesce(
      (select max(t.created_at)::date from public.transactions t where t.customer_id = c.id),
      c.created_at::date),
    'userType', 'customer',
    'role', 'Customer'
  )
$$;

create or replace function app_private.supplier_json(s public.suppliers)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'contactPerson', coalesce(s.contact_person, ''),
    'email', coalesce(s.email, ''),
    'phone', coalesce(s.phone, ''),
    'address', coalesce(s.address, ''),
    'leadTimeDays', coalesce(s.lead_days, 3),
    'prices', (select coalesce(jsonb_agg(jsonb_build_object(
                 'medicineId', sp.medicine_id, 'unitCost', sp.unit_cost,
                 'minOrderQty', coalesce(sp.min_order_qty, 1), 'updatedAt', sp.updated_at)
                 order by sp.medicine_id), '[]'::jsonb)
               from public.supplier_prices sp where sp.supplier_id = s.id)
  )
$$;

create or replace function app_private.purchase_order_json(po public.purchase_orders)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', po.id,
    'poNumber', po.id,
    'supplierId', po.supplier_id,
    'supplierName', po.supplier_name,
    'orderDate', coalesce(po.order_date, po.created_at::date),
    'status', coalesce(po.status, 'Pending'),
    'expectedDelivery', po.expected_delivery,
    'receivedDate', po.received_date,
    'receivedBy', po.received_by,
    'createdBy', coalesce(po.created_by, ''),
    'approvedBy', po.approved_by,
    'approvedAt', po.approved_at,
    'deliveries', coalesce(po.deliveries, '[]'::jsonb),
    'notes', coalesce(po.notes, ''),
    'items', app_private.as_array(po.items),
    'totalAmount', po.total_amount
  )
$$;

create or replace function app_private.doctor_json(d public.doctors)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', d.id,
    'name', d.name,
    'slmcNo', d.slmc_no,
    'specialty', d.specialty,
    'phone', d.phone,
    'email', d.email,
    'hospital', d.hospital,
    'notes', d.notes,
    'status', d.status,
    'createdAt', d.created_at,
    'prescriptionCount', (select count(*) from public.prescriptions r where r.doctor_id = d.id)
  )
$$;

create or replace function app_private.prescription_json(r public.prescriptions)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', r.id,
    'rxNumber', coalesce(r.rx_number, r.id),
    'customerId', r.patient_id,
    'customerName', r.patient_name,
    'doctorName', r.doctor_name,
    'doctorSlmcNo', coalesce(r.doctor_reg, ''),
    'doctorId', r.doctor_id,
    'createdAt', r.created_at,
    'expiryDate', r.expiry_date,
    'prescriptionDate', r.prescription_date,
    'medicines', app_private.as_array(r.medications),
    'isControlledDrug', coalesce(r.is_controlled, false),
    'status', coalesce(r.status, 'Pending'),
    'orderType', r.order_type,
    'verifiedBy', r.verified_by,
    'verifiedAt', r.verified_at,
    'hasAttachment', coalesce(r.has_attachment, false),
    'notes', r.notes,
    'contactPhone', r.contact_phone,
    'deliveryAddress', r.delivery_address,
    'pharmacistNotes', r.pharmacist_notes,
    'rejectionReason', r.rejection_reason,
    'dispensedAt', r.dispensed_at,
    'dispensedInvoice', r.dispensed_txn
  )
$$;

create or replace function app_private.transaction_json(t public.transactions)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', t.id,
    'invoiceNo', t.invoice_no,
    'createdAt', t.created_at,
    'customerId', t.customer_id,
    'customerName', coalesce(t.customer_name, 'Walk-in Customer'),
    'cashierName', coalesce(t.cashier_name, 'Staff'),
    'items', app_private.as_array(t.items),
    'subtotal', coalesce(t.subtotal, 0),
    'discountAmt', coalesce(t.discount, 0),
    'discountPct', coalesce(t.discount_pct,
      case when coalesce(t.subtotal, 0) > 0 then round(coalesce(t.discount, 0) * 100 / t.subtotal, 2) else 0 end),
    'taxAmt', coalesce(t.tax, 0),
    'taxPct', coalesce(t.tax_pct,
      case when coalesce(t.subtotal, 0) - coalesce(t.discount, 0) > 0
           then round(coalesce(t.tax, 0) * 100 / (t.subtotal - coalesce(t.discount, 0)), 2) else 0 end),
    'total', coalesce(t.total, 0),
    'paymentMethod', coalesce(t.payment_method, 'Cash'),
    'paidAmount', coalesce(nullif(t.paid_amount, 0), t.total, 0),
    'changeAmount', coalesce(t.change_amount, 0),
    'prescriptionId', t.prescription_id,
    'refundedAmount', coalesce(t.refunded_amount, 0),
    'status', case when coalesce(t.refunded_amount, 0) >= coalesce(t.total, 0) and coalesce(t.refunded_amount, 0) > 0 then 'Refunded'
                   when coalesce(t.refunded_amount, 0) > 0 then 'Partly refunded'
                   else 'Completed' end
  )
$$;

create or replace function app_private.audit_json(l public.audit_logs)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', l.id,
    'timestamp', coalesce(l.timestamp, to_char(l.created_at at time zone 'Asia/Colombo', 'YYYY-MM-DD HH24:MI')),
    'createdAt', l.created_at,
    'user', coalesce(l.user_name, 'Guest'),
    'role', coalesce(l.role, 'Guest'),
    'action', l.action,
    'details', l.details,
    'severity', coalesce(l.severity, 'info')
  )
$$;

create or replace function app_private.write_audit(p_user_id text, p_user text, p_role text, p_action text, p_details text, p_severity text)
returns void
language sql
set search_path = public, app_private
as $$
  insert into public.audit_logs (id, timestamp, user_id, user_name, role, action, details, severity)
  values (app_private.new_id('LOG'), app_private.local_stamp(), p_user_id,
          coalesce(p_user, 'Guest'), coalesce(p_role, 'Guest'),
          left(p_action, 120), left(p_details, 1000),
          case when p_severity in ('info', 'success', 'warning', 'danger') then p_severity else 'info' end)
$$;

-- --------------------------------------------------------------------
-- 7. Sign-in API (callable by anyone)
-- --------------------------------------------------------------------

create or replace function public.app_login(p_login text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  v_login text := lower(btrim(coalesce(p_login, '')));
  v_staff public.staff;
  v_customer public.customers;
  v_token text;
begin
  if v_login = '' or coalesce(p_password, '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Enter your email or username and your password.');
  end if;

  if (select count(*) from app_private.login_failures
      where login = v_login and failed_at > now() - interval '15 minutes') >= 8 then
    return jsonb_build_object('ok', false, 'error', 'Too many failed attempts. Please wait 15 minutes and try again.');
  end if;

  select * into v_staff from public.staff
  where lower(username) = v_login or lower(email) = v_login
  limit 1;

  if found then
    if app_private.check_password('staff', v_staff.id, p_password) then
      if coalesce(v_staff.status, 'Active') <> 'Active' then
        return jsonb_build_object('ok', false, 'error', 'This staff account is deactivated. Please contact the owner.');
      end if;
      delete from app_private.login_failures where login = v_login;
      update public.staff set last_active = app_private.local_stamp() where id = v_staff.id
      returning * into v_staff;
      v_token := app_private.start_session('staff', v_staff.id);
      perform app_private.write_audit(v_staff.id, v_staff.name, v_staff.role, 'User Login',
        'Signed in as ' || v_staff.name || ' (' || v_staff.role || ')', 'success');
      return jsonb_build_object('ok', true, 'token', v_token, 'user', app_private.staff_json(v_staff));
    end if;
  else
    for v_customer in
      select c.* from public.customers c
      where lower(c.email) = v_login
      order by c.created_at
    loop
      if app_private.check_password('customer', v_customer.id, p_password) then
        delete from app_private.login_failures where login = v_login;
        v_token := app_private.start_session('customer', v_customer.id);
        return jsonb_build_object('ok', true, 'token', v_token, 'user', app_private.customer_json(v_customer));
      end if;
    end loop;
  end if;

  insert into app_private.login_failures (login) values (v_login);
  delete from app_private.login_failures where failed_at < now() - interval '1 day';
  return jsonb_build_object('ok', false, 'error', 'Incorrect email/username or password.');
end $$;

create or replace function public.customer_register(
  p_name text, p_nic text, p_email text, p_phone text, p_address text, p_allergies text, p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_nic text := upper(btrim(coalesce(p_nic, '')));
  v_customer public.customers;
  v_token text;
begin
  if app_private.clean_text(p_name, 120) is null or v_nic = '' or v_email = '' then
    return jsonb_build_object('ok', false, 'error', 'Name, NIC and email are required.');
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'Please enter a valid email address.');
  end if;
  if length(coalesce(p_password, '')) < 8 then
    return jsonb_build_object('ok', false, 'error', 'Passwords must be at least 8 characters.');
  end if;

  -- A profile the pharmacy created at the counter can be claimed by its owner:
  -- same email and same NIC, and no password set yet.
  select c.* into v_customer from public.customers c
  where lower(c.email) = v_email and upper(coalesce(c.nic, '')) = v_nic
    and not exists (select 1 from app_private.credentials k
                    where k.principal_kind = 'customer' and k.principal_id = c.id)
  order by c.created_at
  limit 1;

  if not found then
    if exists (select 1 from public.customers where lower(email) = v_email) then
      return jsonb_build_object('ok', false, 'error', 'An account with this email already exists. Please sign in instead.');
    end if;
    if exists (select 1 from public.customers where upper(nic) = v_nic) then
      return jsonb_build_object('ok', false, 'error', 'This NIC is already registered. Please sign in, or contact the pharmacy.');
    end if;
    insert into public.customers (id, name, nic, email, phone, address, allergies, auth_provider)
    values (app_private.new_id('CUST'), app_private.clean_text(p_name, 120), v_nic, v_email,
            app_private.clean_text(p_phone, 40), app_private.clean_text(p_address, 300),
            coalesce(app_private.clean_text(p_allergies, 300), 'None'), 'password')
    returning * into v_customer;
  else
    update public.customers set
      name = coalesce(app_private.clean_text(p_name, 120), name),
      phone = coalesce(app_private.clean_text(p_phone, 40), phone),
      address = coalesce(app_private.clean_text(p_address, 300), address),
      allergies = coalesce(app_private.clean_text(p_allergies, 300), allergies),
      auth_provider = 'password'
    where id = v_customer.id
    returning * into v_customer;
  end if;

  perform app_private.set_password('customer', v_customer.id, p_password);
  v_token := app_private.start_session('customer', v_customer.id);
  perform app_private.write_audit(v_customer.id, v_customer.name, 'Customer', 'Customer Registered',
    'Created an online account for ' || v_customer.name, 'success');
  return jsonb_build_object('ok', true, 'token', v_token, 'user', app_private.customer_json(v_customer));
end $$;

create or replace function public.google_login(p_credential text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  v_client_id text;
  v_status int;
  v_body text;
  v_claims jsonb;
  v_email text;
  v_customer public.customers;
  v_token text;
begin
  if coalesce(p_credential, '') !~ '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$' then
    return jsonb_build_object('ok', false, 'error', 'Google sign-in failed. Please try again.');
  end if;

  select value into v_client_id from app_private.settings where key = 'google_client_id';

  begin
    execute 'select status, content from extensions.http_get($1)'
      into v_status, v_body
      using 'https://oauth2.googleapis.com/tokeninfo?id_token=' || p_credential;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'Google sign-in is not available right now. Please use your email and password.');
  end;

  if v_status <> 200 then
    return jsonb_build_object('ok', false, 'error', 'Google could not confirm this sign-in. Please try again.');
  end if;

  v_claims := v_body::jsonb;
  v_email := lower(v_claims ->> 'email');
  if v_claims ->> 'aud' is distinct from v_client_id
     or coalesce(v_claims ->> 'email_verified', 'false') <> 'true'
     or v_email is null then
    return jsonb_build_object('ok', false, 'error', 'Google could not confirm this sign-in. Please try again.');
  end if;

  select * into v_customer from public.customers
  where lower(email) = v_email
  order by created_at
  limit 1;

  if not found then
    insert into public.customers (id, name, email, allergies, auth_provider)
    values (app_private.new_id('CUST'), coalesce(app_private.clean_text(v_claims ->> 'name', 120), split_part(v_email, '@', 1)),
            v_email, 'None', 'google')
    returning * into v_customer;
  end if;

  v_token := app_private.start_session('customer', v_customer.id);
  return jsonb_build_object('ok', true, 'token', v_token,
    'user', app_private.customer_json(v_customer) || jsonb_build_object('avatar', v_claims ->> 'picture'));
end $$;

create or replace function public.session_user_info(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, app_private
as $$
declare
  p record;
begin
  select * into p from app_private.session_principal(p_token);
  if p.kind = 'staff' then
    return (select app_private.staff_json(s) from public.staff s where s.id = p.principal_id);
  elsif p.kind = 'customer' then
    return (select app_private.customer_json(c) from public.customers c where c.id = p.principal_id);
  end if;
  return null;
end $$;

create or replace function public.app_logout(p_token text)
returns void
language sql
security definer
set search_path = public, extensions, app_private
as $$
  delete from app_private.sessions where token_hash = app_private.hash_token(p_token)
$$;

-- --------------------------------------------------------------------
-- 8. Reading data (each caller only gets what their role may see)
-- --------------------------------------------------------------------

create or replace function public.load_data(p_token text, p_tables text[] default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, app_private
as $$
declare
  p record;
  v_all text[] := array['medicines','staff','customers','suppliers','purchase_orders','prescriptions','transactions','audit_logs','doctors',
                         'medicine_batches','stock_movements','sales_returns'];
  v_want text[] := coalesce(p_tables, v_all);
  v_is_staff boolean;
  v_can_stock boolean;
  v_out jsonb := '{}'::jsonb;
begin
  select * into p from app_private.session_principal(p_token);
  v_is_staff := p.kind = 'staff';
  v_can_stock := v_is_staff and p.role in ('Owner/Admin', 'Pharmacist');

  if 'medicines' = any (v_want) then
    v_out := v_out || jsonb_build_object('medicines',
      (select coalesce(jsonb_agg(app_private.medicine_json(m) order by m.name), '[]'::jsonb) from public.medicines m));
  end if;

  if 'staff' = any (v_want) then
    v_out := v_out || jsonb_build_object('staff', case
      when v_is_staff and p.role = 'Owner/Admin' then
        (select coalesce(jsonb_agg(app_private.staff_json(s) order by s.created_at desc), '[]'::jsonb) from public.staff s)
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.staff_json(s)), '[]'::jsonb) from public.staff s where s.id = p.principal_id)
      else '[]'::jsonb end);
  end if;

  if 'customers' = any (v_want) then
    v_out := v_out || jsonb_build_object('customers', case
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.customer_json(c) order by c.created_at desc), '[]'::jsonb) from public.customers c)
      when p.kind = 'customer' then
        (select coalesce(jsonb_agg(app_private.customer_json(c)), '[]'::jsonb) from public.customers c where c.id = p.principal_id)
      else '[]'::jsonb end);
  end if;

  if 'suppliers' = any (v_want) then
    v_out := v_out || jsonb_build_object('suppliers', case
      when v_can_stock then
        (select coalesce(jsonb_agg(app_private.supplier_json(s) order by s.name), '[]'::jsonb) from public.suppliers s)
      else '[]'::jsonb end);
  end if;

  if 'purchase_orders' = any (v_want) then
    v_out := v_out || jsonb_build_object('purchase_orders', case
      when v_can_stock then
        (select coalesce(jsonb_agg(app_private.purchase_order_json(po) order by po.created_at desc), '[]'::jsonb) from public.purchase_orders po)
      else '[]'::jsonb end);
  end if;

  if 'prescriptions' = any (v_want) then
    v_out := v_out || jsonb_build_object('prescriptions', case
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.prescription_json(r) order by r.created_at desc), '[]'::jsonb) from public.prescriptions r)
      when p.kind = 'customer' then
        (select coalesce(jsonb_agg(app_private.prescription_json(r) order by r.created_at desc), '[]'::jsonb)
         from public.prescriptions r where r.patient_id = p.principal_id)
      else '[]'::jsonb end);
  end if;

  if 'transactions' = any (v_want) then
    v_out := v_out || jsonb_build_object('transactions', case
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.transaction_json(t) order by t.created_at desc), '[]'::jsonb) from public.transactions t)
      else '[]'::jsonb end);
  end if;

  if 'doctors' = any (v_want) then
    v_out := v_out || jsonb_build_object('doctors', case
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.doctor_json(d) order by d.name), '[]'::jsonb) from public.doctors d)
      else '[]'::jsonb end);
  end if;

  if 'medicine_batches' = any (v_want) then
    v_out := v_out || jsonb_build_object('medicine_batches', case
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.batch_json(b) order by b.expiry_date nulls last, b.batch_no), '[]'::jsonb)
         from public.medicine_batches b)
      else '[]'::jsonb end);
  end if;

  if 'stock_movements' = any (v_want) then
    v_out := v_out || jsonb_build_object('stock_movements', case
      when v_can_stock then
        (select coalesce(jsonb_agg(app_private.movement_json(v) order by v.created_at desc), '[]'::jsonb)
         from (select * from public.stock_movements order by created_at desc limit 500) v)
      else '[]'::jsonb end);
  end if;

  if 'sales_returns' = any (v_want) then
    v_out := v_out || jsonb_build_object('sales_returns', case
      when v_is_staff then
        (select coalesce(jsonb_agg(app_private.return_json(r) order by r.created_at desc), '[]'::jsonb) from public.sales_returns r)
      else '[]'::jsonb end);
  end if;

  if 'audit_logs' = any (v_want) then
    v_out := v_out || jsonb_build_object('audit_logs', case
      when v_is_staff and p.role = 'Owner/Admin' then
        (select coalesce(jsonb_agg(app_private.audit_json(l) order by l.created_at desc), '[]'::jsonb)
         from (select * from public.audit_logs order by created_at desc limit 500) l)
      else '[]'::jsonb end);
  end if;

  return v_out;
end $$;

create or replace function public.get_prescription_file(p_token text, p_rx_id text)
returns text
language plpgsql
stable
security definer
set search_path = public, extensions, app_private
as $$
declare
  p record;
  v_patient text;
begin
  select * into p from app_private.session_principal(p_token);
  select patient_id into v_patient from public.prescriptions where id = p_rx_id;
  if p.kind = 'staff' or (p.kind = 'customer' and v_patient = p.principal_id) then
    return (select data_url from app_private.prescription_files where rx_id = p_rx_id);
  end if;
  raise exception 'You do not have access to this prescription.' using errcode = '42501';
end $$;

-- --------------------------------------------------------------------
-- 9. Changing data
-- --------------------------------------------------------------------

create or replace function public.add_audit_log(p_token text, p_action text, p_details text, p_severity text default 'info')
returns void
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  p record;
begin
  if app_private.clean_text(p_action, 120) is null then
    return;
  end if;
  select * into p from app_private.session_principal(p_token);
  perform app_private.write_audit(p.principal_id, coalesce(p.display_name, 'Guest'), coalesce(p.role, 'Guest'),
    app_private.clean_text(p_action, 120), app_private.clean_text(p_details, 1000), p_severity);
end $$;

create or replace function public.save_medicine(p_token text, p_medicine jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  v_id text := app_private.clean_text(p_medicine ->> 'id', 60);
  v_name text := app_private.clean_text(p_medicine ->> 'name', 160);
  v_code text := upper(app_private.clean_text(p_medicine ->> 'code', 40));
  v_price numeric;
  v_stock int;
  v_reorder int;
  v_controlled boolean := coalesce((p_medicine ->> 'controlledDrug')::boolean, false);
  v_rx boolean := coalesce((p_medicine ->> 'prescriptionRequired')::boolean, false) or v_controlled;
  v_supplier public.suppliers;
  v_barcode text := app_private.clean_text(regexp_replace(coalesce(p_medicine ->> 'barcode', ''), '\s', '', 'g'), 64);
  v_delta int;
  v_used jsonb;
  v_part jsonb;
  b public.medicine_batches;
  r public.medicines;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);

  if v_name is null then
    raise exception 'Medicine name is required.';
  end if;
  if v_barcode is not null and exists (select 1 from public.medicines where barcode = v_barcode and id is distinct from v_id) then
    raise exception 'Another medicine already uses the barcode %.', v_barcode;
  end if;
  v_price := (p_medicine ->> 'unitPrice')::numeric;
  v_stock := (p_medicine ->> 'stock')::int;
  v_reorder := coalesce((p_medicine ->> 'reorderLevel')::int, 0);
  if v_price is null or v_price < 0 then
    raise exception 'Enter a unit price of 0 or more.';
  end if;
  if v_stock is null or v_stock < 0 then
    raise exception 'Enter a stock level of 0 or more.';
  end if;
  if v_reorder < 0 then
    raise exception 'Reorder level cannot be negative.';
  end if;

  select * into v_supplier from public.suppliers where id = p_medicine ->> 'supplierId';

  if v_id is null then
    v_code := coalesce(v_code,
      'MED-' || coalesce(nullif(upper(left(regexp_replace(v_name, '[^A-Za-z]', '', 'g'), 3)), ''), 'DRG')
             || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5)));
    if exists (select 1 from public.medicines where upper(code) = v_code) then
      raise exception 'Another medicine already uses the code %.', v_code;
    end if;
    insert into public.medicines (id, code, name, category, dosage, generic_name, price, stock, reorder_level,
                                  is_prescription, is_controlled, expiry_date, batch_no, supplier_id, supplier_name, barcode)
    values (app_private.new_id('MED'), v_code, v_name,
            coalesce(app_private.clean_text(p_medicine ->> 'category', 80), 'General'),
            app_private.clean_text(p_medicine ->> 'dosage', 120),
            app_private.clean_text(p_medicine ->> 'genericName', 160),
            v_price, 0, v_reorder, v_rx, v_controlled,
            nullif(p_medicine ->> 'expiryDate', '')::date,
            upper(app_private.clean_text(p_medicine ->> 'batchNo', 60)),
            v_supplier.id, v_supplier.name, v_barcode)
    returning * into r;
    -- The opening stock becomes the medicine's first batch.
    if v_stock > 0 then
      b := app_private.add_batch_stock(r.id, p_medicine ->> 'batchNo', nullif(p_medicine ->> 'expiryDate', '')::date, v_stock, 'Opening stock');
      perform app_private.log_movement(s.principal_id, s.display_name, b, v_stock, 'Opening stock', null);
      r := app_private.sync_medicine_stock(r.id);
    end if;
  else
    if v_code is not null and exists (select 1 from public.medicines where upper(code) = v_code and id <> v_id) then
      raise exception 'Another medicine already uses the code %.', v_code;
    end if;
    select * into r from public.medicines where id = v_id for update;
    if not found then
      raise exception 'This medicine no longer exists. Refresh the page and try again.';
    end if;
    -- The edit form sends the stock it started from, so sales made while the
    -- form was open are kept: only the change the user typed is applied.
    v_delta := case when p_medicine ? 'stockBefore' then v_stock - (p_medicine ->> 'stockBefore')::int
                    else v_stock - r.stock end;
    update public.medicines set
      code = coalesce(v_code, code),
      name = v_name,
      category = coalesce(app_private.clean_text(p_medicine ->> 'category', 80), category),
      generic_name = app_private.clean_text(p_medicine ->> 'genericName', 160),
      price = v_price,
      reorder_level = v_reorder,
      is_prescription = v_rx,
      is_controlled = v_controlled,
      barcode = case when p_medicine ? 'barcode' then v_barcode else barcode end,
      supplier_id = case when p_medicine ? 'supplierId' then v_supplier.id else supplier_id end,
      supplier_name = case when p_medicine ? 'supplierId' then v_supplier.name else supplier_name end
    where id = v_id
    returning * into r;
    -- Stock itself lives in batches. A change typed into the form is booked
    -- as a correction: added to the earliest in-date batch, or taken from
    -- the earliest-expiring batches.
    if v_delta > 0 then
      select * into b from public.medicine_batches
      where medicine_id = r.id and (expiry_date is null or expiry_date >= app_private.today())
      order by quantity = 0, expiry_date nulls last, received_date limit 1 for update;
      if found then
        update public.medicine_batches set quantity = quantity + v_delta where id = b.id returning * into b;
      else
        b := app_private.add_batch_stock(r.id, coalesce(nullif(p_medicine ->> 'batchNo', ''), 'ADJ-' || to_char(app_private.today(), 'YYYYMMDD')),
                                         nullif(p_medicine ->> 'expiryDate', '')::date, v_delta, 'Stock correction');
      end if;
      perform app_private.log_movement(s.principal_id, s.display_name, b, v_delta, 'Correction', 'Changed in the medicine form');
    elsif v_delta < 0 and r.stock > 0 then
      v_used := app_private.take_batch_stock(r.id, least(-v_delta, r.stock), true);
      for v_part in select * from jsonb_array_elements(v_used) loop
        select * into b from public.medicine_batches where id = v_part ->> 'batchId';
        perform app_private.log_movement(s.principal_id, s.display_name, b, -(v_part ->> 'qty')::int, 'Correction', 'Changed in the medicine form');
      end loop;
    end if;
    r := app_private.sync_medicine_stock(r.id);
  end if;

  return app_private.medicine_json(r);
end $$;

create or replace function public.delete_medicine(p_token text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
begin
  perform app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  delete from public.medicines where id = p_id;
  if not found then
    raise exception 'This medicine no longer exists.';
  end if;
end $$;

-- Receive stock into a new or existing batch without a purchase order, or
-- correct a batch's number or expiry date.
create or replace function public.save_batch(p_token text, p_batch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  v_id text := app_private.clean_text(p_batch ->> 'id', 60);
  v_no text := upper(app_private.clean_text(p_batch ->> 'batchNo', 60));
  v_expiry date := nullif(p_batch ->> 'expiryDate', '')::date;
  v_qty int := coalesce((p_batch ->> 'quantity')::int, 0);
  v_note text := app_private.clean_text(p_batch ->> 'note', 300);
  v_move jsonb;
  b public.medicine_batches;
  m public.medicines;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  if v_no is null then
    raise exception 'Enter the batch number.';
  end if;
  if v_expiry is null then
    raise exception 'Enter the expiry date.';
  end if;

  if v_id is null then
    select * into m from public.medicines where id = p_batch ->> 'medicineId' for update;
    if not found then
      raise exception 'This medicine is no longer in the catalogue.';
    end if;
    if v_qty <= 0 then
      raise exception 'Enter how many units were received.';
    end if;
    if v_expiry < app_private.today() then
      raise exception 'This batch expired on %. Expired stock can''t be added.', v_expiry;
    end if;
    b := app_private.add_batch_stock(m.id, v_no, v_expiry, v_qty, 'Received without order');
    v_move := app_private.log_movement(s.principal_id, s.display_name, b, v_qty, 'Stock received', v_note);
    perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Stock Received',
      m.name || ': ' || v_qty || ' units into batch ' || b.batch_no || ' (expires ' || v_expiry || ')', 'success');
  else
    select * into b from public.medicine_batches where id = v_id;
    if not found then
      raise exception 'This batch no longer exists.';
    end if;
    select * into m from public.medicines where id = b.medicine_id for update;
    if exists (select 1 from public.medicine_batches where medicine_id = b.medicine_id and upper(batch_no) = v_no and id <> b.id) then
      raise exception 'This medicine already has a batch %.', v_no;
    end if;
    if b.batch_no = v_no and b.expiry_date is not distinct from v_expiry then
      raise exception 'Nothing changed.';
    end if;
    update public.medicine_batches set batch_no = v_no, expiry_date = v_expiry where id = b.id;
    v_move := app_private.log_movement(s.principal_id, s.display_name, (select x from public.medicine_batches x where x.id = b.id), 0,
      'Batch details corrected',
      concat_ws('; ', case when b.batch_no <> v_no then 'Batch ' || b.batch_no || ' renamed to ' || v_no end,
                      case when b.expiry_date is distinct from v_expiry then 'Expiry ' || coalesce(b.expiry_date::text, 'none') || ' changed to ' || v_expiry end,
                      v_note));
    select * into b from public.medicine_batches where id = v_id;
  end if;

  m := app_private.sync_medicine_stock(m.id);
  return jsonb_build_object('medicine', app_private.medicine_json(m), 'batch', app_private.batch_json(b), 'movement', v_move);
end $$;

-- Sets a batch to the quantity actually on the shelf (stock count, damage,
-- expiry write-off, return to supplier) and records why.
create or replace function public.adjust_batch(p_token text, p_batch_id text, p_quantity int, p_reason text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  b public.medicine_batches;
  m public.medicines;
  v_change int;
  v_move jsonb;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  if p_reason is null or p_reason not in ('Stock count', 'Damaged', 'Expired write-off', 'Returned to supplier', 'Correction') then
    raise exception 'Choose a reason for the change.';
  end if;
  if p_quantity is null or p_quantity < 0 then
    raise exception 'Enter a quantity of 0 or more.';
  end if;
  select * into b from public.medicine_batches where id = p_batch_id;
  if not found then
    raise exception 'This batch no longer exists.';
  end if;
  select * into m from public.medicines where id = b.medicine_id for update;
  select * into b from public.medicine_batches where id = p_batch_id for update;
  v_change := p_quantity - b.quantity;
  if v_change = 0 then
    raise exception 'The quantity is already %. Nothing to change.', b.quantity;
  end if;
  if v_change > 0 and p_reason in ('Damaged', 'Expired write-off', 'Returned to supplier') then
    raise exception '% can only lower the quantity.', p_reason;
  end if;
  update public.medicine_batches set quantity = p_quantity where id = b.id returning * into b;
  v_move := app_private.log_movement(s.principal_id, s.display_name, b, v_change, p_reason, app_private.clean_text(p_note, 300));
  m := app_private.sync_medicine_stock(m.id);
  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Stock Adjusted',
    m.name || ' batch ' || b.batch_no || ': ' || case when v_change > 0 then '+' else '' end || v_change
      || ' (' || p_reason || coalesce(', ' || nullif(trim(p_note), ''), '') || '). Now ' || b.quantity || '.',
    case when v_change < 0 then 'warning' else 'info' end);
  return jsonb_build_object('medicine', app_private.medicine_json(m), 'batch', app_private.batch_json(b), 'movement', v_move);
end $$;

-- Removes an empty batch.
create or replace function public.delete_batch(p_token text, p_batch_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  b public.medicine_batches;
  m public.medicines;
begin
  perform app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  select * into b from public.medicine_batches where id = p_batch_id;
  if not found then
    raise exception 'This batch no longer exists.';
  end if;
  if b.quantity > 0 then
    raise exception 'Batch % still has % units. Adjust it to 0 first.', b.batch_no, b.quantity;
  end if;
  delete from public.medicine_batches where id = b.id;
  m := app_private.sync_medicine_stock(b.medicine_id);
  return jsonb_build_object('medicine', app_private.medicine_json(m));
end $$;

create or replace function public.save_supplier(p_token text, p_supplier jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  v_id text := app_private.clean_text(p_supplier ->> 'id', 60);
  v_name text := app_private.clean_text(p_supplier ->> 'name', 160);
  v_lead int := coalesce((p_supplier ->> 'leadTimeDays')::int, 3);
  r public.suppliers;
begin
  perform app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  if v_name is null then
    raise exception 'Supplier name is required.';
  end if;
  if v_lead < 0 or v_lead > 365 then
    raise exception 'Lead time must be between 0 and 365 days.';
  end if;
  if exists (select 1 from public.suppliers where lower(name) = lower(v_name) and id is distinct from v_id) then
    raise exception 'A supplier named % already exists.', v_name;
  end if;

  if v_id is null then
    insert into public.suppliers (id, name, contact_person, phone, email, address, lead_days)
    values (app_private.new_id('SUP'), v_name,
            app_private.clean_text(p_supplier ->> 'contactPerson', 120),
            app_private.clean_text(p_supplier ->> 'phone', 40),
            app_private.clean_text(p_supplier ->> 'email', 160),
            app_private.clean_text(p_supplier ->> 'address', 300),
            v_lead)
    returning * into r;
  else
    update public.suppliers set
      name = v_name,
      contact_person = app_private.clean_text(p_supplier ->> 'contactPerson', 120),
      phone = app_private.clean_text(p_supplier ->> 'phone', 40),
      email = app_private.clean_text(p_supplier ->> 'email', 160),
      address = app_private.clean_text(p_supplier ->> 'address', 300),
      lead_days = v_lead
    where id = v_id
    returning * into r;
    if not found then
      raise exception 'This supplier no longer exists. Refresh the page and try again.';
    end if;
    update public.medicines set supplier_name = r.name where supplier_id = r.id;
  end if;

  return app_private.supplier_json(r);
end $$;

create or replace function public.delete_supplier(p_token text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
begin
  perform app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  delete from public.suppliers where id = p_id;
  if not found then
    raise exception 'This supplier no longer exists.';
  end if;
end $$;

create or replace function public.create_purchase_order(p_token text, p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  v_supplier public.suppliers;
  v_items jsonb := '[]'::jsonb;
  v_item jsonb;
  v_med public.medicines;
  v_qty int;
  v_cost numeric;
  v_total numeric := 0;
  s record;
  r public.purchase_orders;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);

  select * into v_supplier from public.suppliers where id = p_order ->> 'supplierId';
  if not found then
    raise exception 'Choose a supplier for this order.';
  end if;

  for v_item in select * from jsonb_array_elements(app_private.as_array(p_order -> 'items')) loop
    select * into v_med from public.medicines where id = v_item ->> 'medicineId';
    if not found then
      raise exception 'One of the medicines on this order is no longer in the catalogue.';
    end if;
    v_qty := (v_item ->> 'quantity')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Order quantities must be more than 0.';
    end if;
    -- Cost: what the user entered, else the supplier's price list, else 70% of the selling price.
    v_cost := round(coalesce((v_item ->> 'unitCost')::numeric,
                             (select unit_cost from public.supplier_prices where supplier_id = v_supplier.id and medicine_id = v_med.id),
                             v_med.price * 0.7), 2);
    if exists (select 1 from jsonb_array_elements(v_items) x where x ->> 'medicineId' = v_med.id) then
      raise exception '% is on this order twice. Combine the quantities into one line.', v_med.name;
    end if;
    if v_cost < 0 then
      raise exception 'Unit cost cannot be negative.';
    end if;
    v_items := v_items || jsonb_build_object('medicineId', v_med.id, 'name', v_med.name,
      'quantity', v_qty, 'unitCost', v_cost, 'total', v_cost * v_qty);
    v_total := v_total + v_cost * v_qty;
  end loop;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'Add at least one medicine to the order.';
  end if;

  insert into public.purchase_orders (id, supplier_id, supplier_name, items, total_amount, status, order_date, expected_delivery,
                                     created_by, notes, deliveries)
  values ('PO-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
          v_supplier.id, v_supplier.name, v_items, v_total, 'Pending', app_private.today(),
          app_private.today() + coalesce(v_supplier.lead_days, 3),
          s.display_name, app_private.clean_text(p_order ->> 'notes', 500), '[]'::jsonb)
  returning * into r;

  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Purchase Order Created',
    r.id || ' for ' || v_supplier.name || ', Rs. ' || to_char(v_total, 'FM999999990.00') || '. Waiting for approval.', 'info');

  return app_private.purchase_order_json(r);
end $$;

-- Owner approves a pending order (it can then be sent and received) or cancels it.
create or replace function public.set_purchase_order_status(p_token text, p_po_id text, p_status text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  r public.purchase_orders;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  select * into r from public.purchase_orders where id = p_po_id for update;
  if not found then
    raise exception 'This purchase order no longer exists.';
  end if;

  if p_status = 'Approved' then
    if s.role <> 'Owner/Admin' then
      raise exception 'Only the owner can approve purchase orders.' using errcode = '42501';
    end if;
    if r.status <> 'Pending' then
      raise exception 'Only pending orders can be approved. This one is %.', r.status;
    end if;
    update public.purchase_orders set status = 'Approved', approved_by = s.display_name, approved_at = now(),
      expected_delivery = app_private.today() + coalesce((select lead_days from public.suppliers where id = r.supplier_id), 3)
    where id = r.id returning * into r;
  elsif p_status = 'Cancelled' then
    if r.status not in ('Pending', 'Approved') then
      raise exception 'A % order can''t be cancelled.', lower(r.status);
    end if;
    if r.status = 'Approved' and s.role <> 'Owner/Admin' then
      raise exception 'Only the owner can cancel an approved order.' using errcode = '42501';
    end if;
    update public.purchase_orders set status = 'Cancelled',
      notes = concat_ws(E'\n', nullif(notes, ''), 'Cancelled by ' || s.display_name || coalesce(': ' || nullif(trim(p_note), ''), ''))
    where id = r.id returning * into r;
  else
    raise exception 'Unknown status %.', p_status;
  end if;

  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Purchase Order ' || p_status,
    r.id || ' for ' || r.supplier_name, case when p_status = 'Approved' then 'success' else 'warning' end);
  return app_private.purchase_order_json(r);
end $$;

-- A supplier's price for one medicine. A null cost removes it from the price list.
create or replace function public.save_supplier_price(p_token text, p_supplier_id text, p_medicine_id text, p_unit_cost numeric, p_min_qty int default 1)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  r public.suppliers;
begin
  perform app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  select * into r from public.suppliers where id = p_supplier_id;
  if not found then
    raise exception 'This supplier no longer exists.';
  end if;
  if not exists (select 1 from public.medicines where id = p_medicine_id) then
    raise exception 'This medicine is no longer in the catalogue.';
  end if;
  if p_unit_cost is null then
    delete from public.supplier_prices where supplier_id = p_supplier_id and medicine_id = p_medicine_id;
  else
    if p_unit_cost < 0 then
      raise exception 'Unit cost cannot be negative.';
    end if;
    insert into public.supplier_prices (supplier_id, medicine_id, unit_cost, min_order_qty, updated_at)
    values (p_supplier_id, p_medicine_id, round(p_unit_cost, 2), greatest(1, coalesce(p_min_qty, 1)), now())
    on conflict (supplier_id, medicine_id) do update
      set unit_cost = excluded.unit_cost, min_order_qty = excluded.min_order_qty, updated_at = now();
  end if;
  return app_private.supplier_json(r);
end $$;

drop function if exists public.receive_purchase_order(text, text, jsonb);
-- Records a delivery against an approved order. Each line is matched to the
-- order: it can't bring in more than is still outstanding, and needs a batch
-- number and expiry date. Short deliveries leave the order partly received
-- unless p_close is true.
create or replace function public.receive_purchase_order(p_token text, p_po_id text, p_items jsonb, p_close boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  v_po public.purchase_orders;
  v_item jsonb;
  v_line jsonb;
  v_qty int;
  v_outstanding int;
  v_expiry date;
  v_ids text[] := '{}';
  v_got jsonb := '[]'::jsonb;
  v_items jsonb;
  v_complete boolean;
  v_count int := 0;
  b public.medicine_batches;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);

  select * into v_po from public.purchase_orders where id = p_po_id for update;
  if not found then
    raise exception 'This purchase order no longer exists.';
  end if;
  if v_po.status in ('Received', 'Goods Received') then
    raise exception 'This order was already received on %.', coalesce(v_po.received_date::text, 'an earlier day');
  end if;
  if v_po.status = 'Pending' then
    raise exception 'This order is waiting for the owner''s approval. Approve it before recording the delivery.';
  end if;
  if v_po.status = 'Cancelled' then
    raise exception 'This order was cancelled.';
  end if;

  for v_item in select * from jsonb_array_elements(app_private.as_array(p_items)) loop
    v_qty := greatest(0, coalesce((v_item ->> 'quantity')::int, 0));
    continue when v_qty = 0;
    v_line := null;
    select o into v_line from jsonb_array_elements(app_private.as_array(v_po.items)) o
    where o ->> 'medicineId' = v_item ->> 'medicineId' limit 1;
    if v_line is null then
      raise exception 'A delivered item is not on order %.', v_po.id;
    end if;
    v_outstanding := (v_line ->> 'quantity')::int - coalesce((v_line ->> 'receivedQty')::int, 0)
                     - coalesce((select sum((g ->> 'quantity')::int) from jsonb_array_elements(v_got) g
                                 where g ->> 'medicineId' = v_item ->> 'medicineId'), 0);
    if v_qty > v_outstanding then
      raise exception '% units of % were delivered, but only % are still outstanding on this order.',
        v_qty, v_line ->> 'name', v_outstanding;
    end if;
    if app_private.clean_text(v_item ->> 'batchNo', 60) is null then
      raise exception 'Enter the batch number for %.', v_line ->> 'name';
    end if;
    v_expiry := nullif(v_item ->> 'expiryDate', '')::date;
    if v_expiry is null then
      raise exception 'Enter the expiry date for %.', v_line ->> 'name';
    end if;
    if v_expiry < app_private.today() then
      raise exception '% batch % expired on %. Don''t accept expired stock.', v_line ->> 'name', v_item ->> 'batchNo', v_expiry;
    end if;

    perform 1 from public.medicines where id = v_item ->> 'medicineId' for update;
    if not found then
      raise exception '% is no longer in the catalogue.', v_line ->> 'name';
    end if;
    b := app_private.add_batch_stock(v_item ->> 'medicineId', v_item ->> 'batchNo', v_expiry, v_qty, 'PO ' || v_po.id);
    perform app_private.log_movement(s.principal_id, s.display_name, b, v_qty, 'Goods received', 'Order ' || v_po.id);
    perform app_private.sync_medicine_stock(v_item ->> 'medicineId');
    v_ids := v_ids || (v_item ->> 'medicineId');
    v_got := v_got || jsonb_build_object('medicineId', v_item ->> 'medicineId', 'name', v_line ->> 'name',
                                         'quantity', v_qty, 'batchNo', b.batch_no, 'expiryDate', v_expiry);
    v_count := v_count + 1;
  end loop;

  if v_count = 0 and not p_close then
    raise exception 'Enter the quantity delivered for at least one item.';
  end if;

  select coalesce(jsonb_agg(o || jsonb_build_object('receivedQty',
           coalesce((o ->> 'receivedQty')::int, 0)
           + coalesce((select sum((g ->> 'quantity')::int) from jsonb_array_elements(v_got) g
                       where g ->> 'medicineId' = o ->> 'medicineId'), 0))), '[]'::jsonb)
  into v_items
  from jsonb_array_elements(app_private.as_array(v_po.items)) o;

  v_complete := not exists (select 1 from jsonb_array_elements(v_items) o
                            where (o ->> 'receivedQty')::int < (o ->> 'quantity')::int);

  update public.purchase_orders set
    items = v_items,
    deliveries = coalesce(deliveries, '[]'::jsonb) || case when v_count > 0 then jsonb_build_array(jsonb_build_object(
      'date', app_private.today(), 'receivedBy', s.display_name, 'items', v_got)) else '[]'::jsonb end,
    status = case when v_complete or p_close then 'Received' else 'Partly received' end,
    received_date = case when v_complete or p_close then app_private.today() else received_date end,
    received_by = s.display_name,
    notes = case when p_close and not v_complete
                 then concat_ws(E'\n', nullif(notes, ''), 'Closed short by ' || s.display_name || ' on ' || app_private.today())
                 else notes end
  where id = v_po.id
  returning * into v_po;

  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Goods Received',
    'Delivery for ' || v_po.id || ' recorded: ' || coalesce((select string_agg((g ->> 'name') || ' x ' || (g ->> 'quantity') || ' (batch ' || (g ->> 'batchNo') || ')', ', ')
                                                           from jsonb_array_elements(v_got) g), 'nothing')
      || '. Order is now ' || lower(v_po.status) || '.', 'success');

  return jsonb_build_object(
    'purchaseOrder', app_private.purchase_order_json(v_po),
    'medicines', (select coalesce(jsonb_agg(app_private.medicine_json(m)), '[]'::jsonb)
                  from public.medicines m where m.id = any (v_ids)),
    'batches', (select coalesce(jsonb_agg(app_private.batch_json(x)), '[]'::jsonb)
                from public.medicine_batches x where x.medicine_id = any (v_ids)));
end $$;

create or replace function public.save_customer(p_token text, p_customer jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  v_id text := app_private.clean_text(p_customer ->> 'id', 60);
  v_name text := app_private.clean_text(p_customer ->> 'name', 120);
  v_nic text := upper(app_private.clean_text(p_customer ->> 'nic', 20));
  v_email text := lower(app_private.clean_text(p_customer ->> 'email', 160));
  r public.customers;
begin
  perform app_private.require_staff(p_token);

  if v_name is null or v_nic is null then
    raise exception 'Customer name and NIC are required.';
  end if;
  if exists (select 1 from public.customers where upper(nic) = v_nic and id is distinct from v_id) then
    raise exception 'Another customer already has the NIC %.', v_nic;
  end if;
  if v_email is not null and exists (select 1 from public.customers where lower(email) = v_email and id is distinct from v_id) then
    raise exception 'Another customer already uses the email %.', v_email;
  end if;

  if v_id is null then
    insert into public.customers (id, name, nic, email, phone, address, allergies)
    values (app_private.new_id('CUST'), v_name, v_nic, v_email,
            app_private.clean_text(p_customer ->> 'phone', 40),
            app_private.clean_text(p_customer ->> 'address', 300),
            coalesce(app_private.clean_text(p_customer ->> 'allergies', 300), 'None'))
    returning * into r;
  else
    update public.customers set
      name = v_name,
      nic = v_nic,
      email = v_email,
      phone = app_private.clean_text(p_customer ->> 'phone', 40),
      address = app_private.clean_text(p_customer ->> 'address', 300),
      allergies = coalesce(app_private.clean_text(p_customer ->> 'allergies', 300), 'None')
    where id = v_id
    returning * into r;
    if not found then
      raise exception 'This customer no longer exists. Refresh the page and try again.';
    end if;
  end if;

  return app_private.customer_json(r);
end $$;

create or replace function public.delete_customer(p_token text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
begin
  perform app_private.require_staff(p_token, array['Owner/Admin']);
  delete from public.customers where id = p_id;
  if not found then
    raise exception 'This customer no longer exists.';
  end if;
  delete from app_private.credentials where principal_kind = 'customer' and principal_id = p_id;
  delete from app_private.sessions where principal_kind = 'customer' and principal_id = p_id;
end $$;

create or replace function public.save_staff(p_token text, p_staff jsonb, p_password text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  v_id text := app_private.clean_text(p_staff ->> 'id', 60);
  v_name text := app_private.clean_text(p_staff ->> 'name', 120);
  v_username text := lower(app_private.clean_text(p_staff ->> 'username', 60));
  v_email text := lower(app_private.clean_text(p_staff ->> 'email', 160));
  v_role text := p_staff ->> 'role';
  v_status text := coalesce(p_staff ->> 'status', 'Active');
  r public.staff;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin']);

  if v_name is null or v_username is null or v_email is null then
    raise exception 'Name, username and email are required.';
  end if;
  if v_role not in ('Owner/Admin', 'Pharmacist', 'Cashier') then
    raise exception 'Choose a valid role.';
  end if;
  if v_status not in ('Active', 'Inactive') then
    raise exception 'Choose a valid status.';
  end if;
  if exists (select 1 from public.staff where lower(username) = v_username and id is distinct from v_id) then
    raise exception 'The username % is already taken.', v_username;
  end if;
  if exists (select 1 from public.staff where lower(email) = v_email and id is distinct from v_id) then
    raise exception 'The email % is already used by another staff account.', v_email;
  end if;
  if v_id = s.principal_id and (v_role <> 'Owner/Admin' or v_status <> 'Active') then
    raise exception 'You cannot remove your own owner access or deactivate your own account.';
  end if;

  if v_id is null then
    if p_password is null then
      raise exception 'Set an initial password for the new account.';
    end if;
    insert into public.staff (id, name, username, role, email, phone, status, permissions, last_active)
    values (app_private.new_id('STF'), v_name, v_username, v_role, v_email,
            app_private.clean_text(p_staff ->> 'phone', 40), v_status,
            coalesce(p_staff -> 'permissions', '[]'::jsonb), 'Never')
    returning * into r;
  else
    update public.staff set
      name = v_name,
      username = v_username,
      role = v_role,
      email = v_email,
      phone = app_private.clean_text(p_staff ->> 'phone', 40),
      status = v_status,
      permissions = coalesce(p_staff -> 'permissions', permissions)
    where id = v_id
    returning * into r;
    if not found then
      raise exception 'This staff account no longer exists. Refresh the page and try again.';
    end if;
    if v_status <> 'Active' then
      delete from app_private.sessions where principal_kind = 'staff' and principal_id = r.id;
    end if;
  end if;

  if p_password is not null then
    perform app_private.set_password('staff', r.id, p_password);
    if v_id is not null then
      delete from app_private.sessions where principal_kind = 'staff' and principal_id = r.id;
    end if;
  end if;

  return app_private.staff_json(r);
end $$;

create or replace function public.staff_set_password(p_token text, p_staff_id text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
begin
  perform app_private.require_staff(p_token, array['Owner/Admin']);
  if not exists (select 1 from public.staff where id = p_staff_id) then
    raise exception 'This staff account no longer exists.';
  end if;
  perform app_private.set_password('staff', p_staff_id, p_password);
  -- Signs the person out everywhere so the old password stops working at once.
  delete from app_private.sessions where principal_kind = 'staff' and principal_id = p_staff_id;
end $$;

create or replace function public.submit_prescription(p_token text, p_rx jsonb, p_file text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  p record;
  v_customer public.customers;
  v_patient_id text;
  v_patient_name text;
  v_items jsonb := '[]'::jsonb;
  v_item jsonb;
  v_med public.medicines;
  v_controlled boolean := false;
  v_id text;
  v_doctor public.doctors;
  v_today date := (now() at time zone 'Asia/Colombo')::date;
  v_rx_date date;
  r public.prescriptions;
begin
  select * into p from app_private.session_principal(p_token);

  -- A doctor's prescription is valid for 7 days from the date written on it.
  begin
    v_rx_date := nullif(btrim(p_rx ->> 'prescriptionDate'), '')::date;
  exception when others then
    raise exception 'Enter the prescription date as a valid date.';
  end;
  if v_rx_date is null and p.kind = 'staff' then
    v_rx_date := v_today;
  end if;
  if v_rx_date is null and p_file is not null then
    raise exception 'Enter the date written on the prescription.';
  end if;
  if v_rx_date > v_today then
    raise exception 'The prescription date can''t be in the future.';
  end if;
  if v_rx_date < v_today - 7 then
    raise exception 'Invalid prescription. It was written more than 7 days ago, and prescriptions are only valid for 7 days. Please get a new prescription from your doctor.';
  end if;

  -- Link a registered doctor: staff pick one directly; otherwise match the
  -- registration number the patient typed.
  if p.kind = 'staff' and app_private.clean_text(p_rx ->> 'doctorId', 60) is not null then
    select * into v_doctor from public.doctors where id = p_rx ->> 'doctorId';
    if not found then
      raise exception 'That doctor is not in the doctor database.';
    end if;
  elsif app_private.clean_text(p_rx ->> 'doctorSlmcNo', 40) is not null then
    select * into v_doctor from public.doctors
    where upper(slmc_no) = upper(btrim(p_rx ->> 'doctorSlmcNo')) and status = 'Active';
  end if;

  if p.kind = 'staff' then
    select * into v_customer from public.customers where id = p_rx ->> 'customerId';
    if not found then
      raise exception 'Choose the customer this prescription belongs to.';
    end if;
    v_patient_id := v_customer.id;
    v_patient_name := v_customer.name;
  elsif p.kind = 'customer' then
    v_patient_id := p.principal_id;
    v_patient_name := coalesce(app_private.clean_text(p_rx ->> 'customerName', 120), p.display_name);
  else
    v_patient_id := null;
    v_patient_name := app_private.clean_text(p_rx ->> 'customerName', 120);
  end if;

  if v_patient_name is null then
    raise exception 'Enter the patient''s name.';
  end if;
  if p.kind is distinct from 'staff' and app_private.clean_text(p_rx ->> 'contactPhone', 40) is null then
    raise exception 'Enter a contact phone number so the pharmacist can reach you.';
  end if;
  if p_file is not null then
    if length(p_file) > 8000000 then
      raise exception 'The attached file is too large. Please upload a photo or PDF under 5 MB.';
    end if;
    if p_file !~ '^data:(image/(jpeg|png|webp|gif)|application/pdf);base64,' then
      raise exception 'Attach a photo (JPG, PNG, WEBP) or a PDF.';
    end if;
  end if;

  for v_item in select * from jsonb_array_elements(app_private.as_array(p_rx -> 'medicines')) limit 50 loop
    select * into v_med from public.medicines where id = v_item ->> 'medicineId';
    if found then
      v_controlled := v_controlled or coalesce(v_med.is_controlled, false);
      v_items := v_items || jsonb_build_object(
        'medicineId', v_med.id, 'name', v_med.name,
        'dosage', coalesce(app_private.clean_text(v_item ->> 'dosage', 200), v_med.dosage, ''),
        'quantity', greatest(1, coalesce((v_item ->> 'quantity')::int, 1)),
        'durationDays', (v_item ->> 'durationDays')::int);
    elsif app_private.clean_text(v_item ->> 'name', 200) is not null then
      v_items := v_items || jsonb_build_object(
        'medicineId', null, 'name', app_private.clean_text(v_item ->> 'name', 200),
        'dosage', coalesce(app_private.clean_text(v_item ->> 'dosage', 200), 'As requested'),
        'quantity', greatest(1, coalesce((v_item ->> 'quantity')::int, 1)),
        'durationDays', (v_item ->> 'durationDays')::int);
    end if;
  end loop;

  if jsonb_array_length(v_items) = 0 and p_file is null then
    raise exception 'Attach a prescription photo or list the medicines you need.';
  end if;

  v_id := 'RX-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  insert into public.prescriptions (id, rx_number, patient_id, patient_name, doctor_id, doctor_name, doctor_reg, status,
                                    medications, notes, contact_phone, delivery_address, order_type,
                                    is_controlled, expiry_date, has_attachment, prescription_date)
  values (v_id, v_id, v_patient_id, v_patient_name, v_doctor.id,
          coalesce(v_doctor.name, app_private.clean_text(p_rx ->> 'doctorName', 160),
                   case when p_file is not null then 'Doctor prescription (photo)' else 'Patient direct order' end),
          coalesce(v_doctor.slmc_no, app_private.clean_text(p_rx ->> 'doctorSlmcNo', 40),
                   case when p_file is not null then 'VERIFY-SLMC' else 'DIRECT-ORDER' end),
          'Pending', v_items,
          app_private.clean_text(p_rx ->> 'notes', 1000),
          app_private.clean_text(p_rx ->> 'contactPhone', 40),
          app_private.clean_text(p_rx ->> 'deliveryAddress', 300),
          case
            when p_file is not null and jsonb_array_length(v_items) > 0 then 'Photo slip + typed medicines'
            when p_file is not null then 'Doctor slip photo'
            when p.kind = 'staff' then 'Registered at counter'
            else 'Typed medicine order'
          end,
          v_controlled,
          coalesce(v_rx_date + 7, nullif(p_rx ->> 'expiryDate', '')::date, current_date + 30),
          p_file is not null, v_rx_date)
  returning * into r;

  if p_file is not null then
    insert into app_private.prescription_files (rx_id, data_url) values (r.id, p_file);
  end if;

  perform app_private.write_audit(p.principal_id, coalesce(p.display_name, v_patient_name), coalesce(p.role, 'Guest'),
    'Prescription Submitted', 'Prescription ' || r.rx_number || ' submitted for ' || v_patient_name, 'info');

  return app_private.prescription_json(r);
end $$;

-- Doctor database: the owner adds and edits doctors; every staff member can read it.
create or replace function public.save_doctor(p_token text, p_doctor jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  v_id text := app_private.clean_text(p_doctor ->> 'id', 60);
  v_name text := app_private.clean_text(p_doctor ->> 'name', 160);
  v_slmc text := upper(app_private.clean_text(p_doctor ->> 'slmcNo', 40));
  v_status text := coalesce(app_private.clean_text(p_doctor ->> 'status', 20), 'Active');
  v_email text := lower(app_private.clean_text(p_doctor ->> 'email', 160));
  v_next int;
  d public.doctors;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin']);
  if v_name is null then
    raise exception 'Enter the doctor''s name.';
  end if;
  if v_slmc is null then
    raise exception 'Enter the doctor''s SLMC registration number.';
  end if;
  if v_status not in ('Active', 'Inactive') then
    raise exception 'Status must be Active or Inactive.';
  end if;
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address or leave it empty.';
  end if;
  if exists (select 1 from public.doctors where upper(slmc_no) = v_slmc and id is distinct from v_id) then
    raise exception 'Another doctor already has registration number %.', v_slmc;
  end if;

  if v_id is null then
    -- Readable ids in order: DOC001, DOC002, ...
    perform pg_advisory_xact_lock(hashtext('public.doctors'));
    select coalesce(max(substring(id from 4)::int), 0) + 1 into v_next
    from public.doctors where id ~ '^DOC[0-9]+$';
    insert into public.doctors (id, name, slmc_no, specialty, phone, email, hospital, notes, status)
    values ('DOC' || lpad(v_next::text, 3, '0'), v_name, v_slmc,
            app_private.clean_text(p_doctor ->> 'specialty', 120),
            app_private.clean_text(p_doctor ->> 'phone', 40),
            v_email,
            app_private.clean_text(p_doctor ->> 'hospital', 200),
            app_private.clean_text(p_doctor ->> 'notes', 1000),
            v_status)
    returning * into d;
    perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Doctor Added',
      'Added ' || d.name || ' (' || d.id || ', SLMC ' || d.slmc_no || ') to the doctor database', 'info');
  else
    update public.doctors set
      name = v_name,
      slmc_no = v_slmc,
      specialty = app_private.clean_text(p_doctor ->> 'specialty', 120),
      phone = app_private.clean_text(p_doctor ->> 'phone', 40),
      email = v_email,
      hospital = app_private.clean_text(p_doctor ->> 'hospital', 200),
      notes = app_private.clean_text(p_doctor ->> 'notes', 1000),
      status = v_status,
      updated_at = now()
    where id = v_id
    returning * into d;
    if not found then
      raise exception 'This doctor no longer exists. Refresh the page and try again.';
    end if;
    -- Keep linked prescriptions showing the current name and number.
    update public.prescriptions set doctor_name = d.name, doctor_reg = d.slmc_no where doctor_id = d.id;
    perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Doctor Updated',
      'Updated ' || d.name || ' (' || d.id || '), status ' || d.status, 'info');
  end if;

  return app_private.doctor_json(d);
end $$;

create or replace function public.delete_doctor(p_token text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  d public.doctors;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin']);
  select * into d from public.doctors where id = p_id;
  if not found then
    raise exception 'This doctor no longer exists.';
  end if;
  if exists (select 1 from public.prescriptions where doctor_id = p_id) then
    raise exception '% is linked to prescriptions, so the record must stay. Mark the doctor Inactive instead.', d.name;
  end if;
  delete from public.doctors where id = p_id;
  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Doctor Removed',
    'Removed ' || d.name || ' (' || d.id || ') from the doctor database', 'warning');
end $$;

-- The review now also records which registered doctor wrote the prescription.
drop function if exists public.review_prescription(text, text, text, text, jsonb);

create or replace function public.review_prescription(
  p_token text, p_rx_id text, p_decision text, p_notes text default null, p_medicines jsonb default null,
  p_doctor_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  r public.prescriptions;
  v_items jsonb;
  v_item jsonb;
  v_med public.medicines;
  v_controlled boolean := false;
  v_needs_rx boolean := false;
  v_doctor public.doctors;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);

  select * into r from public.prescriptions where id = p_rx_id for update;
  if not found then
    raise exception 'This prescription no longer exists.';
  end if;
  if r.status <> 'Pending' then
    raise exception 'This prescription was already %.', lower(r.status);
  end if;
  if p_decision not in ('Approved', 'Rejected') then
    raise exception 'Choose approve or reject.';
  end if;
  if p_decision = 'Rejected' and app_private.clean_text(p_notes, 1000) is null then
    raise exception 'Give a reason for rejecting the prescription.';
  end if;

  v_items := app_private.as_array(coalesce(p_medicines, r.medications));
  -- Re-resolve items against the catalogue so the controlled-drug flag is accurate.
  for v_item in select * from jsonb_array_elements(v_items) loop
    select * into v_med from public.medicines where id = v_item ->> 'medicineId';
    if found and coalesce(v_med.is_controlled, false) then
      v_controlled := true;
    end if;
    if found and (coalesce(v_med.is_prescription, false) or coalesce(v_med.is_controlled, false)) then
      v_needs_rx := true;
    end if;
  end loop;

  -- The doctor must be in the doctor database before Rx-only or controlled
  -- medicines can be approved.
  if app_private.clean_text(coalesce(p_doctor_id, r.doctor_id), 60) is not null then
    select * into v_doctor from public.doctors where id = coalesce(p_doctor_id, r.doctor_id);
    if not found then
      raise exception 'That doctor is not in the doctor database.';
    end if;
  end if;
  if p_decision = 'Approved' and r.prescription_date is not null
     and r.prescription_date < (now() at time zone 'Asia/Colombo')::date - 7 then
    raise exception 'Invalid prescription. It was written on % and prescriptions are only valid for 7 days. Reject it and ask the patient for a new one.', r.prescription_date;
  end if;
  if p_decision = 'Approved' and v_needs_rx then
    if v_doctor.id is null then
      raise exception 'Pick the prescribing doctor from the doctor database before approving prescription medicines. If the doctor is missing, ask the owner to add them.';
    end if;
    if v_doctor.status <> 'Active' then
      raise exception '% is marked Inactive in the doctor database. Prescriptions from this doctor can''t be approved.', v_doctor.name;
    end if;
  end if;

  update public.prescriptions set
    status = p_decision,
    medications = v_items,
    doctor_id = coalesce(v_doctor.id, doctor_id),
    doctor_name = coalesce(v_doctor.name, doctor_name),
    doctor_reg = coalesce(v_doctor.slmc_no, doctor_reg),
    is_controlled = v_controlled,
    verified_by = s.display_name || ' (' || s.role || ')',
    verified_at = now(),
    pharmacist_notes = case when p_decision = 'Approved' then app_private.clean_text(p_notes, 1000) else pharmacist_notes end,
    rejection_reason = case when p_decision = 'Rejected' then app_private.clean_text(p_notes, 1000) else null end,
    expiry_date = coalesce(expiry_date, current_date + 30)
  where id = r.id
  returning * into r;

  perform app_private.write_audit(s.principal_id, s.display_name, s.role,
    'Prescription ' || p_decision,
    p_decision || ' ' || r.rx_number || ' for ' || r.patient_name
      || coalesce('. Doctor: ' || v_doctor.name || ' (' || v_doctor.id || ')', '')
      || coalesce('. Reason: ' || r.rejection_reason, ''),
    case when p_decision = 'Approved' then 'success' else 'warning' end);

  return app_private.prescription_json(r);
end $$;

-- One sale, all or nothing: checks stock and prescriptions, uses catalogue
-- prices, takes stock off atomically, records the sale, and marks the
-- prescription as dispensed so it cannot be reused.
create or replace function public.pos_checkout(p_token text, p_sale jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  v_customer public.customers;
  v_rx public.prescriptions;
  v_line record;
  v_med public.medicines;
  v_lines jsonb := '[]'::jsonb;
  v_ids text[] := '{}';
  v_needs_rx boolean := false;
  v_rx_item jsonb;
  v_subtotal numeric := 0;
  v_discount_pct numeric := least(50, greatest(0, coalesce((p_sale ->> 'discountPct')::numeric, 0)));
  v_tax_pct numeric := least(30, greatest(0, coalesce((p_sale ->> 'taxPct')::numeric, 0)));
  v_discount numeric;
  v_tax numeric;
  v_total numeric;
  v_method text := coalesce(p_sale ->> 'paymentMethod', 'Cash');
  v_paid numeric;
  v_change numeric := 0;
  v_invoice text;
  v_expired int;
  v_used jsonb;
  v_final jsonb := '[]'::jsonb;
  t public.transactions;
begin
  select * into s from app_private.require_staff(p_token);

  if v_method not in ('Cash', 'Card', 'Digital Wallet') then
    raise exception 'Choose a payment method.';
  end if;

  if app_private.clean_text(p_sale ->> 'customerId', 60) is not null then
    select * into v_customer from public.customers where id = p_sale ->> 'customerId';
    if not found then
      raise exception 'The selected customer no longer exists.';
    end if;
  end if;

  for v_line in
    select x ->> 'medicineId' as medicine_id, sum((x ->> 'qty')::int) as qty
    from jsonb_array_elements(app_private.as_array(p_sale -> 'items')) x
    group by x ->> 'medicineId'
    order by x ->> 'medicineId'
  loop
    if v_line.qty is null or v_line.qty <= 0 then
      raise exception 'Quantities must be at least 1.';
    end if;
    select * into v_med from public.medicines where id = v_line.medicine_id for update;
    if not found then
      raise exception 'An item in the cart is no longer in the catalogue.';
    end if;
    if v_med.stock < v_line.qty then
      raise exception 'Only % left of %.', v_med.stock, v_med.name;
    end if;
    -- Expired batches stay on the books until written off, but can't be sold.
    v_expired := coalesce((select sum(quantity) from public.medicine_batches
                           where medicine_id = v_med.id and expiry_date < app_private.today()), 0);
    if v_med.stock - v_expired < v_line.qty then
      if v_med.stock - v_expired <= 0 then
        raise exception '% expired on % and can''t be sold.', v_med.name,
          (select min(expiry_date) from public.medicine_batches where medicine_id = v_med.id and quantity > 0);
      end if;
      raise exception 'Only % of % can be sold. The other % units are past their expiry date.',
        v_med.stock - v_expired, v_med.name, v_expired;
    end if;
    if coalesce(v_med.is_prescription, false) or coalesce(v_med.is_controlled, false) then
      v_needs_rx := true;
    end if;
    v_lines := v_lines || jsonb_build_object(
      'medicineId', v_med.id, 'name', v_med.name, 'qty', v_line.qty, 'price', v_med.price,
      'total', v_med.price * v_line.qty,
      'needsRx', coalesce(v_med.is_prescription, false) or coalesce(v_med.is_controlled, false));
    v_subtotal := v_subtotal + v_med.price * v_line.qty;
    v_ids := v_ids || v_med.id;
  end loop;

  if jsonb_array_length(v_lines) = 0 then
    raise exception 'The cart is empty.';
  end if;

  if v_needs_rx then
    if v_customer.id is null then
      raise exception 'Prescription medicines need a registered patient. Select the customer first.';
    end if;
    select * into v_rx from public.prescriptions where id = p_sale ->> 'prescriptionId' for update;
    if not found then
      raise exception 'Prescription medicines need an approved prescription for this customer.';
    end if;
    if v_rx.patient_id is distinct from v_customer.id then
      raise exception 'Prescription % belongs to a different patient.', v_rx.rx_number;
    end if;
    if v_rx.status <> 'Approved' then
      raise exception 'Prescription % has not been approved by a pharmacist.', v_rx.rx_number;
    end if;
    if v_rx.dispensed_at is not null then
      raise exception 'Prescription % was already dispensed on invoice %.', v_rx.rx_number, v_rx.dispensed_txn;
    end if;
    if v_rx.expiry_date is not null and v_rx.expiry_date < current_date then
      raise exception 'Prescription % expired on %.', v_rx.rx_number, v_rx.expiry_date;
    end if;
    for v_rx_item in select * from jsonb_array_elements(v_lines) loop
      if (v_rx_item ->> 'needsRx')::boolean and not exists (
        select 1 from jsonb_array_elements(app_private.as_array(v_rx.medications)) m
        where (m ->> 'medicineId' = v_rx_item ->> 'medicineId' or lower(m ->> 'name') = lower(v_rx_item ->> 'name'))
          and coalesce((m ->> 'quantity')::int, 2147483647) >= (v_rx_item ->> 'qty')::int
      ) then
        raise exception '% is not on prescription % (or the quantity is more than prescribed).',
          v_rx_item ->> 'name', v_rx.rx_number;
      end if;
    end loop;
  end if;

  v_discount := round(v_subtotal * v_discount_pct / 100, 2);
  v_tax := round((v_subtotal - v_discount) * v_tax_pct / 100, 2);
  v_total := v_subtotal - v_discount + v_tax;
  if v_total <= 0 then
    raise exception 'The total must be more than zero.';
  end if;

  if v_method = 'Cash' then
    v_paid := coalesce((p_sale ->> 'paidAmount')::numeric, 0);
    if v_paid < v_total then
      raise exception 'Cash tendered must be at least Rs. %.', to_char(v_total, 'FM999999990.00');
    end if;
    v_change := v_paid - v_total;
  else
    v_paid := v_total;
  end if;

  -- Take the stock from the batches that expire first, and record which ones.
  for v_rx_item in select * from jsonb_array_elements(v_lines) loop
    v_used := app_private.take_batch_stock(v_rx_item ->> 'medicineId', (v_rx_item ->> 'qty')::int, false);
    perform app_private.sync_medicine_stock(v_rx_item ->> 'medicineId');
    v_final := v_final || (v_rx_item || jsonb_build_object('batches', v_used));
  end loop;
  v_lines := v_final;

  v_invoice := 'INV-' || to_char(now() at time zone 'Asia/Colombo', 'YYYYMMDD') || '-'
               || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  insert into public.transactions (id, invoice_no, customer_id, customer_name, cashier_id, cashier_name, items,
                                   subtotal, discount, discount_pct, tax, tax_pct, total, payment_method,
                                   paid_amount, change_amount, prescription_id)
  values (v_invoice, v_invoice, v_customer.id, coalesce(v_customer.name, 'Walk-in Customer'), s.principal_id, s.display_name,
          (select jsonb_agg(l - 'needsRx') from jsonb_array_elements(v_lines) l),
          v_subtotal, v_discount, v_discount_pct, v_tax, v_tax_pct, v_total, v_method, v_paid, v_change,
          case when v_needs_rx then v_rx.id end)
  returning * into t;

  if v_needs_rx then
    update public.prescriptions set dispensed_at = now(), dispensed_txn = v_invoice where id = v_rx.id
    returning * into v_rx;
  end if;

  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'POS Sale Completed',
    'Invoice ' || v_invoice || ' for ' || t.customer_name || '. Total Rs. ' || to_char(v_total, 'FM999999990.00')
      || case when v_needs_rx then '. Dispensed prescription ' || v_rx.rx_number else '' end,
    'success');

  return jsonb_build_object(
    'transaction', app_private.transaction_json(t),
    'medicines', (select coalesce(jsonb_agg(app_private.medicine_json(m)), '[]'::jsonb)
                  from public.medicines m where m.id = any (v_ids)),
    'prescription', case when v_needs_rx then app_private.prescription_json(v_rx) end,
    'batches', (select coalesce(jsonb_agg(app_private.batch_json(x)), '[]'::jsonb)
                from public.medicine_batches x where x.medicine_id = any (v_ids)));
end $$;

-- Takes back medicines from a completed sale and records the refund.
-- Refunds are worked out from the invoice (after its discount and tax), and
-- can't exceed what is still unreturned on each line. Items marked restock go
-- back into the batches they were sold from.
create or replace function public.process_return(p_token text, p_return jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, app_private
as $$
declare
  s record;
  t public.transactions;
  v_item jsonb;
  v_line jsonb;
  v_qty int;
  v_sold int;
  v_returned int;
  v_left int;
  v_back int;
  v_part jsonb;
  v_done int;
  v_restock boolean;
  v_refund numeric;
  v_total_refund numeric := 0;
  v_items jsonb := '[]'::jsonb;
  v_batches jsonb;
  v_ids text[] := '{}';
  v_method text := coalesce(nullif(p_return ->> 'refundMethod', ''), 'Cash');
  v_reason text := app_private.clean_text(p_return ->> 'reason', 300);
  v_factor numeric;
  b public.medicine_batches;
  r public.sales_returns;
begin
  select * into s from app_private.require_staff(p_token, array['Owner/Admin', 'Pharmacist']);
  if v_method not in ('Cash', 'Card', 'Digital Wallet') then
    raise exception 'Choose how the refund is paid.';
  end if;
  if v_reason is null then
    raise exception 'Enter the reason for the return.';
  end if;

  select * into t from public.transactions where id = p_return ->> 'transactionId' or invoice_no = p_return ->> 'transactionId' for update;
  if not found then
    raise exception 'No sale with that invoice number was found.';
  end if;

  -- Each unit's share of the bill after the invoice discount and tax.
  v_factor := case when coalesce(t.subtotal, 0) > 0 then t.total / t.subtotal else 1 end;

  for v_item in select * from jsonb_array_elements(app_private.as_array(p_return -> 'items')) loop
    v_qty := coalesce((v_item ->> 'qty')::int, 0);
    continue when v_qty <= 0;
    v_line := null;
    select l into v_line from jsonb_array_elements(app_private.as_array(t.items)) l
    where l ->> 'medicineId' = v_item ->> 'medicineId' limit 1;
    if v_line is null then
      raise exception 'A returned item is not on invoice %.', t.invoice_no;
    end if;
    v_sold := coalesce((v_line ->> 'qty')::int, 0);
    v_returned := coalesce((select sum((ri ->> 'qty')::int) from public.sales_returns sr,
                            jsonb_array_elements(app_private.as_array(sr.items)) ri
                            where sr.transaction_id = t.id and ri ->> 'medicineId' = v_item ->> 'medicineId'), 0);
    if v_qty > v_sold - v_returned then
      raise exception 'Only % of % can still be returned on this invoice.', v_sold - v_returned, v_line ->> 'name';
    end if;
    v_refund := round(coalesce((v_line ->> 'price')::numeric, 0) * v_qty * v_factor, 2);
    v_restock := coalesce((v_item ->> 'restock')::boolean, false);
    v_batches := '[]'::jsonb;

    if v_restock then
      perform 1 from public.medicines where id = v_item ->> 'medicineId' for update;
      if not found then
        raise exception '% is no longer in the catalogue, so it can''t go back into stock. Untick "Back to stock".', v_line ->> 'name';
      end if;
      v_left := v_qty;
      -- Put units back into the batches this sale took them from, never more
      -- than a batch gave (earlier returns count against it).
      for v_part in select * from jsonb_array_elements(app_private.as_array(v_line -> 'batches')) loop
        exit when v_left <= 0;
        v_done := coalesce((select sum((rb ->> 'qty')::int) from public.sales_returns sr,
                            jsonb_array_elements(app_private.as_array(sr.items)) ri,
                            jsonb_array_elements(app_private.as_array(ri -> 'batches')) rb
                            where sr.transaction_id = t.id and rb ->> 'batchId' = v_part ->> 'batchId'), 0);
        v_back := least(v_left, (v_part ->> 'qty')::int - v_done);
        continue when v_back <= 0;
        select * into b from public.medicine_batches where id = v_part ->> 'batchId' for update;
        if found then
          update public.medicine_batches set quantity = quantity + v_back where id = b.id returning * into b;
        else
          b := app_private.add_batch_stock(v_item ->> 'medicineId', v_part ->> 'batchNo', nullif(v_part ->> 'expiryDate', '')::date, v_back, 'Customer return');
        end if;
        perform app_private.log_movement(s.principal_id, s.display_name, b, v_back, 'Customer return', 'Invoice ' || t.invoice_no);
        v_batches := v_batches || jsonb_build_object('batchId', v_part ->> 'batchId', 'batchNo', b.batch_no, 'qty', v_back);
        v_left := v_left - v_back;
      end loop;
      -- Sales from before batches were tracked: return into a batch named after the invoice.
      if v_left > 0 then
        b := app_private.add_batch_stock(v_item ->> 'medicineId', 'RET-' || t.invoice_no,
               (select expiry_date from public.medicines where id = v_item ->> 'medicineId'), v_left, 'Customer return');
        perform app_private.log_movement(s.principal_id, s.display_name, b, v_left, 'Customer return', 'Invoice ' || t.invoice_no);
        v_batches := v_batches || jsonb_build_object('batchId', b.id, 'batchNo', b.batch_no, 'qty', v_left);
      end if;
      perform app_private.sync_medicine_stock(v_item ->> 'medicineId');
      v_ids := v_ids || (v_item ->> 'medicineId');
    end if;

    v_items := v_items || jsonb_build_object('medicineId', v_item ->> 'medicineId', 'name', v_line ->> 'name',
      'qty', v_qty, 'price', (v_line ->> 'price')::numeric, 'refund', v_refund, 'restock', v_restock, 'batches', v_batches);
    v_total_refund := v_total_refund + v_refund;
  end loop;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'Choose at least one item to return.';
  end if;
  v_total_refund := least(v_total_refund, t.total - coalesce(t.refunded_amount, 0));

  insert into public.sales_returns (id, transaction_id, invoice_no, customer_id, customer_name, items, refund_amount,
                                    refund_method, reason, processed_by_id, processed_by)
  values ('RET-' || to_char(now() at time zone 'Asia/Colombo', 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5)),
          t.id, t.invoice_no, t.customer_id, t.customer_name, v_items, v_total_refund, v_method, v_reason,
          s.principal_id, s.display_name)
  returning * into r;

  update public.transactions set refunded_amount = coalesce(refunded_amount, 0) + v_total_refund where id = t.id
  returning * into t;

  perform app_private.write_audit(s.principal_id, s.display_name, s.role, 'Sale Return Processed',
    r.id || ' on invoice ' || t.invoice_no || ': refunded Rs. ' || to_char(v_total_refund, 'FM999999990.00')
      || ' by ' || v_method || '. ' || (select string_agg((i ->> 'name') || ' x ' || (i ->> 'qty')
                                        || case when (i ->> 'restock')::boolean then ' (back to stock)' else ' (not restocked)' end, ', ')
                                        from jsonb_array_elements(v_items) i) || '. Reason: ' || v_reason,
    'warning');

  return jsonb_build_object(
    'return', app_private.return_json(r),
    'transaction', app_private.transaction_json(t),
    'medicines', (select coalesce(jsonb_agg(app_private.medicine_json(m)), '[]'::jsonb) from public.medicines m where m.id = any (v_ids)),
    'batches', (select coalesce(jsonb_agg(app_private.batch_json(x)), '[]'::jsonb) from public.medicine_batches x where x.medicine_id = any (v_ids)));
end $$;

-- --------------------------------------------------------------------
-- 10. Lock the tables: nothing is readable or writable directly
-- --------------------------------------------------------------------

do $$
declare
  t text;
  pol record;
begin
  foreach t in array array['staff','customers','medicines','suppliers','purchase_orders','prescriptions','transactions','audit_logs','doctors',
                           'medicine_batches','stock_movements','supplier_prices','sales_returns','data_versions'] loop
    execute format('alter table public.%I enable row level security', t);
    -- Remove any older "allow everything" policies.
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on table public.%I from anon, authenticated', t);
    end if;
  end loop;

  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant select on public.data_versions to anon, authenticated;
    revoke all on schema app_private from anon, authenticated;
  end if;
end $$;

create policy "Anyone can read change counters" on public.data_versions for select using (true);

-- Only the API functions are callable from the browser.
do $$
declare
  f record;
  v_api text[] := array['app_login','customer_register','google_login','session_user_info','app_logout','load_data',
                        'get_prescription_file','add_audit_log','save_medicine','delete_medicine','save_supplier',
                        'delete_supplier','create_purchase_order','receive_purchase_order','save_customer',
                        'delete_customer','save_staff','staff_set_password','submit_prescription',
                        'review_prescription','pos_checkout','save_doctor','delete_doctor',
                        'save_batch','adjust_batch','delete_batch','process_return','set_purchase_order_status',
                        'save_supplier_price'];
begin
  for f in
    select p.oid::regprocedure as sig, p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any (v_api)
  loop
    execute format('revoke all on function %s from public', f.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('grant execute on function %s to anon, authenticated', f.sig);
    end if;
  end loop;
end $$;

-- --------------------------------------------------------------------
-- 11. Starter data for a brand-new project (skipped when data exists)
-- --------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from public.staff) then
    insert into public.staff (id, name, username, role, email, phone, status, permissions, last_active) values
      ('STF-001', 'Fernando', 'admin_fernando', 'Owner/Admin', 'fernando@gmail.com', '+94 77 123 4567', 'Active', '["user_management", "inventory_full", "prescription_approve", "pos_checkout", "reports_access"]', 'Never'),
      ('STF-002', 'Mendis M.M.N', 'pharmacist_mendis', 'Pharmacist', 'mendis@pharmart.lk', '+94 71 987 6543', 'Active', '["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve"]', 'Never'),
      ('STF-003', 'Pathiraja M.M.S', 'cashier_pathiraja', 'Cashier', 'pathiraja@pharmart.lk', '+94 76 555 4321', 'Active', '["pos_checkout", "customer_register", "inventory_view"]', 'Never'),
      ('STF-004', 'Madushanka E.D', 'pharmacist_madushanka', 'Pharmacist', 'madushanka@pharmart.lk', '+94 70 111 2233', 'Active', '["inventory_view", "inventory_edit", "prescription_verify", "prescription_approve"]', 'Never');
    -- Starter passwords. Change them from Staff and access after the first sign-in.
    perform app_private.set_password('staff', 'STF-001', 'YxY3Xmk#UCvm7D');
    perform app_private.set_password('staff', 'STF-002', 'Wp#aAA@M896q&s');
    perform app_private.set_password('staff', 'STF-003', 'xa68ti8wF8hb3S');
    perform app_private.set_password('staff', 'STF-004', '6WXL^6ihTjrX^J');
  end if;

  if not exists (select 1 from public.suppliers) then
    insert into public.suppliers (id, name, contact_person, email, phone, address, lead_days) values
      ('SUP-01', 'GlaxoSmithKline Pharmaceuticals', 'Kamal Perera', 'orders@gsk.lk', '+94 11 230 4000', 'Colombo 02, Sri Lanka', 3),
      ('SUP-02', 'State Pharmaceuticals Corporation (SPC)', 'Nimali Silva', 'supplies@spc.gov.lk', '+94 11 243 1845', '75 Sir Baron Jayatilaka Mawatha, Colombo 01', 5),
      ('SUP-03', 'Sun Pharmaceutical Industries', 'Rajesh Sharma', 'distribution@sunpharma.com', '+94 11 471 2200', 'Rajagiriya, Sri Lanka', 4);
  end if;

  if not exists (select 1 from public.medicines) then
    insert into public.medicines (id, code, name, generic_name, category, dosage, price, stock, reorder_level,
                                  is_prescription, is_controlled, expiry_date, batch_no, supplier_id, supplier_name) values
      ('MED-101', 'MED-PCM-500', 'Paracetamol Extra 500mg', 'Paracetamol', 'Analgesic', '500mg Tablets', 15.00, 450, 100, false, false, '2027-12-31', 'PCM-2026-01', 'SUP-02', 'State Pharmaceuticals Corporation (SPC)'),
      ('MED-102', 'MED-AMX-250', 'Amoxicillin Trihydrate', 'Amoxicillin', 'Antibiotics', '250mg Capsules', 45.00, 120, 50, true, false, '2026-10-15', 'AMX-2026-02', 'SUP-01', 'GlaxoSmithKline Pharmaceuticals'),
      ('MED-103', 'MED-MTF-850', 'Metformin HCl 850mg', 'Metformin Hydrochloride', 'Diabetes', '850mg Tablets', 28.50, 8, 30, true, false, '2026-09-30', 'MTF-2026-03', 'SUP-03', 'Sun Pharmaceutical Industries'),
      ('MED-104', 'MED-ATV-20', 'Atorvastatin Calcium', 'Atorvastatin', 'Cardiovascular', '20mg Tablets', 65.00, 60, 20, true, false, '2027-05-20', 'ATV-2026-04', 'SUP-01', 'GlaxoSmithKline Pharmaceuticals'),
      ('MED-105', 'MED-DZP-05', 'Diazepam 5mg (Valium)', 'Diazepam', 'Controlled Drugs', '5mg Tablets', 110.00, 4, 15, true, true, '2027-08-30', 'DZP-2026-05', 'SUP-03', 'Sun Pharmaceutical Industries');
  end if;
end $$;

-- --------------------------------------------------------------------
-- 12. Stock held before batches existed becomes one opening batch
-- --------------------------------------------------------------------

insert into public.medicine_batches (id, medicine_id, batch_no, expiry_date, quantity, received_date, source)
select app_private.new_id('BAT'), m.id, upper(coalesce(nullif(trim(m.batch_no), ''), 'OPENING')), m.expiry_date, m.stock,
       coalesce(m.created_at::date, current_date), 'Opening stock'
from public.medicines m
where m.stock > 0 and not exists (select 1 from public.medicine_batches b where b.medicine_id = m.id);

commit;
