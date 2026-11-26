# YREL Platform implementation status

This repository is the new platform. The legacy `YREL` repository and its Vercel deployment are intentionally not modified.

## Implemented in repository
- Next.js App Router foundation and Orange/Cream + Purple design tokens.
- Customer home, booking planner, bookings, saved places, profile, menu, rentals, seat-sharing and support route shells.
- Partner dashboard shell.
- Private admin route now fails closed: requires a signed-in Appwrite user carrying the `admin` label. The former preview bypass has been removed.
- Server-side Appwrite session helper.
- Authenticated booking API (create/list), partner availability API with verification and wallet threshold checks, support ticket API, and health endpoint.
- Design baseline documentation.

## Must be configured / verified before production
- Appwrite database/table IDs and exact column schemas; current API handlers use the table names in `src/lib/server/appwrite.ts`.
- Appwrite row permissions: customers may read their own profile/bookings and create their own bookings; drivers may update only their own availability/profile; admins require an Appwrite `admin` label and server-side checks. Never grant public write access.
- Appwrite session cookie name must match the deployed Appwrite SSR/session strategy.
- MSG91 credentials/template and signed OTP verification callback. No OTP secret is stored in source.
- Complete admin CRUD screens, partner dispatch/trip lifecycle, wallet ledger, seat-share reservation transaction, rentals/driver booking persistence, receipt/bill summary messaging, and end-to-end tests.
- Configure production secrets only in Render environment settings.

## Safety
The booking API is session-authenticated, but production must additionally enforce row-level ownership permissions in Appwrite. The API never trusts a client-supplied customer ID. The partner availability endpoint checks verification status, blocked status and the -₹200 wallet floor. It does not interrupt an active trip.
