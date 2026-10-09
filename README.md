# PHARMART

PHARMART is a pharmacy management system for a single retail pharmacy in Sri
Lanka. One web app serves two kinds of user:

- **Customers** use the storefront: browse the catalogue, upload a prescription,
  follow its review in **My orders**, and pay online once a pharmacist approves it.
- **Staff** (Owner/Admin, Pharmacist, Cashier) use the admin console: point of
  sale, inventory and batches, purchasing, prescription verification, customers,
  reports and staff management. Each role only sees the screens it is allowed to.

Live site: https://pham-mart.vercel.app

## Features by epic

| Epic | What it covers | Main code |
| --- | --- | --- |
| Medicine & Inventory | Medicines, batches (FEFO), expiry tracking and write-off, low-stock and expiry alerts | `src/modules/InventoryManagement` |
| Purchase & Supplier | Suppliers, price lists, reorder suggestions, purchase orders, owner approval, goods receipt | `src/modules/InventoryManagement` |
| Customer & Prescription | Customer records and history, online prescription upload, pharmacist review, doctor database, Rx check at the counter | `src/modules/CustomerPrescription`, `src/modules/CustomerPortal` |
| Sales, Payment & Reporting | POS with discount, tax, cash/card/wallet, receipts, returns, Genie online payment, dashboard, daily and monthly reports | `src/modules/POSBilling`, `src/modules/AnalyticsReporting`, `api/payments` |
| Users & security | Staff and customer sign-in, Google sign-in, roles, lockout, audit log | `src/modules/UserManagement`, `src/lib/permissions.js` |

## Architecture

```
Browser (React + Vite + Tailwind)
   |  supabase-js: rpc('pos_checkout', ...), rpc('save_medicine', ...)
   v
Supabase Postgres
   - Row Level Security on every table: the browser cannot read or write tables directly
   - security definer functions check the session token and the role, validate input,
     and do each business action in one transaction (e.g. checkout = stock + sale + Rx)
   - bcrypt password hashes and sessions in the private app_private schema
   - realtime "data_versions" table tells open screens to refresh

Vercel server functions (api/payments/*)
   - hold the Genie and service-role keys, create the hosted checkout,
     and confirm each payment with Genie before the order is marked paid
```

Folder layout:

```
src/
  App.jsx                 app shell, sign-in state, data loading, routing between screens
  components/             shared UI (sidebar, header, dialogs, command palette)
  modules/<Epic>/         one folder per epic, one file per screen or modal
  services/               supabaseService.js (every database call), payments.js
  lib/                    small helpers: permissions, expiry rules, phone validation, ...
api/payments/             Vercel functions for Genie online payment
supabase_schema.sql       the whole database: tables, RLS, functions, starter data
supabase/demo_catalogue.sql  optional extra demo suppliers and medicines
```

## Run it locally

Needs Node 20.19 or newer (Vite 8).

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # oxlint
npm run build      # production build in dist/
```

Without a `.env` the app uses the project's public Supabase URL and anon key
from `src/lib/supabaseClient.js`. To use your own Supabase project, create
`.env.local`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon or publishable key>
VITE_GOOGLE_CLIENT_ID=<optional, for Google sign-in>
```

## Set up the database

1. Open Supabase > SQL Editor.
2. Paste all of `supabase_schema.sql` and run it. It is safe to re-run on the
   live project: it never drops a table and only adds what is missing.
   **Re-run it after pulling changes that touch the schema**, or new screens will
   report errors.
3. Optional: run `supabase/demo_catalogue.sql` for more demo medicines and suppliers.
4. For a demo, sign in as the Owner and press **Settings > Load demo data**. It adds
   demo medicines, customers, prescriptions and two weeks of past sales, and
   never changes existing records (`load_demo_data` in the schema).

On a brand-new project the schema creates four starter staff accounts (one
Owner/Admin, two Pharmacists, one Cashier). Their emails and starter passwords
are in section 11 of `supabase_schema.sql`. Change the passwords from
**Settings > Staff** after the first sign-in. Customers register themselves
from the storefront.

## Roles

| Role | Screens |
| --- | --- |
| Owner/Admin | Everything, including Home (reports), staff management and PO approval |
| Pharmacist | Sales, inventory, prescriptions (approve/reject), customers |
| Cashier | Sales, inventory (view), customers |

The same rules are enforced twice: `src/lib/permissions.js` hides screens in
the UI, and every database function checks the role again on the server.

## Online payments (Genie Business)

Customers pay for an approved prescription order from **My orders**. The
browser never sees the Genie key: `api/payments/*` are Vercel server functions
that create the Genie hosted checkout and confirm every result with Genie
before the database marks an order paid.

Set these in Vercel > Project > Settings > Environment Variables, then redeploy:

| Name | Value |
| --- | --- |
| `GENIE_API_KEY` | Genie dashboard > your app > **API Key (secret)** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API > `service_role` key |
| `SITE_URL` | `https://pham-mart.vercel.app` (must match the Genie app domain) |
| `GENIE_API_BASE_URL` | optional, only for Genie's sandbox |

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already set for the site.
Never put the secret keys in the code or in a `VITE_` variable.
