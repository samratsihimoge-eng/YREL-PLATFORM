# YREL Platform

A mobile-first ride-booking platform with three separate experiences: Customer, Driver/Partner, and Admin.

## Applications

- `/` — Customer app
- `/partner` — Driver / Partner app
- `/admin` — Admin console

## Stack

- Next.js App Router + TypeScript
- Appwrite Cloud (Singapore) for authentication and data services
- MSG91 integration is planned behind server-side routes; secrets must be configured in deployment environment variables only.
- Render deployment (Singapore region)

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local`
3. `npm run dev`

## Security

Never commit API keys, OTP secrets, customer data, or driver documents. Admin authorization must be enforced server-side; hiding a link is not access control.

## Status

Foundation setup. Authentication, database schema, role policies, OTP provider, booking workflows, and end-to-end tests are being implemented in stages. Do not use for live bookings until these are completed and verified.
