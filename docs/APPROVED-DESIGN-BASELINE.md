# YREL approved design baseline

This document records the prior approved visual references recovered for the fresh YREL-PLATFORM build. Preserve the approved orange/cream visual language, rounded cards, clear mobile-first layouts, and YREL branding. Do not redesign these experiences without the user's approval.

## Customer app — recovered storyboard

Reference assets found in the conversation/library:
- `a_detailed_ui_design_presentation_collage_a_clean.png`
- `a_polished_ui_design_presentation_image_a_large_c.png`
- `a_composed_ui_showcase_poster_a_dark_purple_to_or.png`
- `a_high_detail_mockup_collage_of_a_mobile_ride_book.png`

The detailed 14-screen storyboard describes:
1. Splash
2. Login
3. Home dashboard
4. All services
5. Cab booking (City/Outstation, pickup/drop, instant/advance, AC preference)
6. Choose your ride
7. Cab rentals
8. City rental packages
9. Seat sharing
10. Driver booking
11. Booking summary
12. Live tracking
13. My bookings
14. Menu/Profile

Other storyboard variants additionally show offers, profile, language, support, booking details and receipts. Implement the exact approved screen sequence when the full selected screen set is recovered; do not treat this abbreviated storyboard as the entire final screen inventory.

## Customer app — established product rules

- Customer-facing default language: English; Kannada and Hindi are selectable.
- Main services: cab, driver, rentals and eligible seat sharing.
- Customer payment is directly to the driver by Cash or UPI after the ride; no customer wallet.
- Location stack: device GPS + OpenStreetMap + Photon search + OSRM routing. Do not introduce paid Google Maps APIs.
- Cab booking supports City/Outstation and Instant/Advance.
- Seat sharing is not offered for ordinary within-city trips; show it only for eligible intercity/outstation/airport journeys.
- AC and Non-AC are the same fare.
- Customer bottom navigation and screen labels must follow the approved screen references, not this technical document.

## Driver / Partner app — recovered visual reference

Reference asset: `YREL Driver and Admin Dashboard UI Mockup.png`.

Preserve the mobile orange/cream/white driver design:
- Partner home: YREL Partner header, profile/verified status, online/offline switch, earnings, trips, rating and completion stats.
- New booking request card: service type, distance, fare, pickup/drop, accept/reject controls and countdown.
- Live trip/map screen: route, pickup/drop, distance, ETA, fare, SOS and trip progression controls.
- Main navigation: Home, Trips, Wallet, Profile.
- Feature areas: Online/Offline, Live Map & Navigation, Earnings & Wallet, Trip History & Details, SOS & Support, Profile & Documents.

Driver login and role access must follow the separately approved driver onboarding flow. Admin verification and authorization must be enforced by backend permissions.

## Admin panel — recovered visual reference

Reference asset: `YREL Driver and Admin Dashboard UI Mockup.png`.

Preserve the desktop/tablet admin layout:
- YREL branding and dark/navy sidebar with orange active state.
- Sidebar sections: Dashboard, Bookings, Drivers, Customers, Vehicles, Wallet & Settlements, Commission, Pricing & Packages, Seat Sharing, Reports & Analytics, Complaints & SOS, Notifications, Settings.
- Dashboard KPI cards: Today Bookings, Today Revenue, Active Drivers, Total Customers.
- Booking Overview chart and Service Wise Bookings breakdown.
- Live Operations map.
- Pending Actions: Driver Verification, Vehicle Approval, KYC Review, Withdrawal Requests.
- Recent Bookings list with status labels.
- Feature areas: real-time dashboard, booking management, driver/vehicle management, wallet/commission, reports/analytics, pricing/packages/settings.

## Architecture for the fresh repository

- Customer experience: `/`
- Driver/Partner experience: `/partner` (mobile-first)
- Admin console: `/admin` (desktop/tablet responsive; private server-enforced access)
- Shared Appwrite backend with strict role/record permissions.
- Render is the intended hosting platform.
- MSG91 / WhatsApp OTP credentials and provider setup are supplied by the user and stored only as Render secrets/environment variables.

## Important source limitation

The recovered image references are visual collages/mockups, not editable design files. The complete previously selected screen-by-screen set (including the user's larger selected screen count) and the exact Admin Panel PDF pages must be checked against the original PDFs/screenshots before claiming every individual screen has been faithfully reproduced. Never invent missing screen designs or call placeholder/demo behaviour production-ready.
