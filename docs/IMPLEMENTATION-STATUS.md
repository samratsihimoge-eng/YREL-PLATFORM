# YREL Platform implementation status

This repository is the new platform. The legacy `YREL` repository and its Vercel deployment are intentionally not modified.

## Implemented in repository
- Next.js App Router foundation and Orange/Cream + Purple design tokens.
- Customer home, booking planner, bookings, saved places, profile, menu, rentals, seat-sharing and support route shells.
- Partner dashboard shell.
- Private admin route fails closed and requires an Appwrite `admin` label.
- Appwrite server session helper now uses the Node server SDK (`node-appwrite`) with a per-request session client.
- Authenticated booking API (create/list), partner availability API with verification and wallet threshold checks, support ticket API, and health endpoint.
- Design baseline documentation.

## Verified Appwrite schema
The live `yrel-main` database currently contains six enabled, row-secured tables: `bookings`, `customer_profiles`, `driver_profiles`, `trips`, `seat_share_trips`, and `support_tickets`. The current handlers' booking and support field names match the live table columns. Table-level permissions are empty and row security is enabled.

## Must be configured / verified before production
- Configure Appwrite table-level create permissions and narrowly scoped row permissions; never grant public write access.
- Create and verify the first admin user with the Appwrite `admin` label.
- Configure the Render Appwrite environment variables and verify the session cookie/auth flow end to end.
- MSG91 credentials/template and signed OTP verification callback. No OTP secret is stored in source.
- Complete admin CRUD screens, partner dispatch/trip lifecycle, wallet ledger, seat-share reservation transaction, rentals/driver booking persistence, receipt/bill summary messaging, and end-to-end tests.

## Safety
The booking API derives customer identity from the signed-in Appwrite session and never trusts a client-supplied customer ID. The partner availability endpoint checks verification status, blocked status and the -₹200 wallet floor. It does not interrupt an active trip.
