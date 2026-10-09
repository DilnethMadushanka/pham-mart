# Final demo script

One end-to-end run that touches every epic, in about 15 minutes. Use two
browser windows: a normal one for staff and a private one for the customer.

## Before the demo

- [ ] Latest `supabase_schema.sql` has been run on the live Supabase project.
- [ ] Sign in once as each role (Owner, Pharmacist, Cashier) and open every screen; nothing shows an error.
- [ ] One medicine is close to its reorder level and one batch expires within 90 days, so alerts show.
- [ ] One Rx-only medicine (for example Amoxicillin) has stock.
- [ ] A customer account exists for the private window (or register one live in step 1).
- [ ] Genie keys are set in Vercel, or plan to show the payment step with a small real amount.
- [ ] Phone hotspot ready in case the venue Wi-Fi fails.

## 1. Customer orders with a prescription (Epic 3)

1. Private window: open the storefront, browse a category, show search.
2. **Sign in / register** as a customer. Show that the phone number is validated.
3. **Upload prescription**: photo, notes, delivery address. Submit.
4. Open **My orders**: the order shows as pending review.

Say: uploads need sign-in, so every order belongs to a real customer record.

## 2. Pharmacist reviews it (Epic 3)

1. Staff window: sign in as the **Pharmacist**. Show that the sidebar has no Settings (role-based access).
2. **Prescriptions**: open the new order, check the photo, add the catalogue items and quantities to dispense, approve.
3. Show **Reject with a reason** on another one if there is time.

Say: only the listed items and quantities can be sold against this prescription, and it can be used once.

## 3. Customer pays online (Epic 4)

1. Private window: **My orders** now shows the approved order and its total. Click **Pay online**.
2. Complete the Genie checkout. Back in My orders the order shows as paid with a reference.

Say: the browser never sees the Genie key. A Vercel function creates the checkout and confirms the result with Genie before the order is marked paid.

## 4. Counter sale (Epic 4)

1. Sign in as the **Cashier**. Open **Sales & Billing**.
2. Search by name and by barcode, add two OTC items, apply a discount, pick **Cash**, enter tendered cash, show the change.
3. Try to add the **Rx-only** medicine with a walk-in customer: it is blocked. Pick the registered customer with an approved prescription and it goes through.
4. Checkout, show and print the **receipt**.
5. Show that the Cashier can view **Returns** but not process them. Sign in as the Pharmacist, return one item, and show that stock goes back.

Say: `pos_checkout` re-checks prices, stock, expiry and the prescription on the server and does everything in one transaction, taking stock from the batch that expires first.

## 5. Stock and purchasing (Epics 1 and 2)

1. Sign in as the **Owner**. **Inventory**: show the medicine just sold, its stock went down.
2. Open its **batches**: batch numbers, expiry dates, stock history. Try adding a batch that expires within 7 days: it is refused.
3. **Expiry tracking**: items expiring within 90 days, write one off.
4. Open the **notification bell**: low-stock and expiry alerts.
5. **Reorder suggestions**: create a purchase order from them.
6. **Purchase orders**: approve it as Owner, then **receive** it (show a partial delivery if there is time). Stock goes up and a new batch appears.

## 6. Reports and admin (Epic 4 and security)

1. **Home**: today's sales, best sellers, payment mix, alerts.
2. Open the **daily sales report** and **monthly revenue report**; print one and download the CSV.
3. Open the **inventory report** (once PR #16 is merged).
4. **Settings > Staff**: add a staff member, give a role, deactivate one.
5. Open the **audit log**: every action from this demo is listed with who did it.
6. Sign out and try a wrong password a few times to show the lockout.

## If something fails live

- Data didn't refresh: press **Try again** or reload; screens refresh from the database.
- Genie checkout down: explain the flow with the code (`api/payments/create.js`, `verify.js`) and show an order already paid earlier.
- Database unreachable: switch to the phone hotspot.
