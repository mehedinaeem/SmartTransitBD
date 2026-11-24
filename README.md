# SmartTransit BD

An IoT and computer vision public transport platform foundation for Bangladesh. This repository contains separate frontend and backend applications. It is a development foundation, not a completed production system.

```text
frontend/  Next.js passenger and operator application, shared UI, API services, mocks
backend/   Django REST Framework, GeoDjango, Channels, Celery, JWT, infrastructure
firmware/  Hardware integration boundary and current prototype status
vision/    Occupancy model integration boundary and current testing status
docs/      Architecture, API contracts, and validation notes
```

## Frontend

Requires Node.js 22 LTS and npm.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000/app or http://localhost:3000/operator. All requested passenger and operator routes are present with separate layouts. The UI uses the navy/blue design system, Inter, Tailwind, shadcn-style Radix components, Lucide icons, Framer Motion, Zustand, TanStack Query, Zod, Leaflet/OpenStreetMap, and Recharts.

```bash
npm run lint
npm run build
# Install a Playwright browser once, or use an installed Chrome executable.
npx playwright install chromium
npm run test:ui
# On this workstation:
CHROME_PATH=/usr/bin/google-chrome npm run test:ui
```

Browser tests start and stop their own production server on port 3100 (`PLAYWRIGHT_PORT` can override it). They cover every application route at 375, 430, 768, 1024, and 1440px, overflow, runtime errors, responsive navigation, search, dialogs, route filtering, session preferences, and API failure recovery. Screenshots are written to `frontend/artifacts/`.

The default API mode is `mock`. `frontend/.env.example` documents future Django configuration. Environment variables prefixed `NEXT_PUBLIC_` are public and fixed at build time. Never put secrets in them. Switching to Django mode does not implement the planned domain endpoints or connect the frontend authentication flow.

## Backend

See [backend/README.md](backend/README.md) for isolated Python setup, Docker development infrastructure, migrations, API endpoints, and checks. Dependencies are locked with Django 6.1.3. PostgreSQL/PostGIS is the application database; Redis supports channels, caching, and Celery. Unit tests deliberately use SQLite, in-memory channels/cache, and mocked readiness dependencies.

## Actual project status

- GPS/GNSS hardware prototype is working.
- ESP32/A7670E can transmit vehicle location over cellular connectivity.
- The computer vision seat occupancy model is under training and testing.
- Raspberry Pi integration is in progress.
- Booking and passenger applications remain software prototypes.
- Full production deployment is incomplete.

All displayed locations, counts, alerts, timestamps, occupancy estimates, and charts are simulated. Hardware ingestion, authenticated operator access, tenant authorization, production sockets, booking transactions, payments, and model deployment are future integrations.

Read [architecture](docs/architecture.md), [API boundaries](docs/api-contracts.md), and [validation](docs/validation.md) before the next implementation step.

## Passenger home

`/app` now provides a compact passenger home with the Naeem greeting, destination search, quick actions, nearby buses, and popular regional routes. Bus rows open `/app/bus/[id]`; route selections and destination searches feed the existing passenger route browser. Mobile passenger pages include active Home, Routes, Tickets, and Profile tabs.

Nearby vehicle and passenger route fixtures live in `frontend/src/mocks/passenger.ts`. Zod-validated models and service methods are separate from React components. Independent loading, empty, and retry states are covered by `frontend/tests/passenger-home.spec.ts`. Booking remains a preview; no Django backend was changed for this screen.

## Passenger tracking

`/app/live` is a map-first Leaflet/OpenStreetMap experience with a demo passenger location, stops, route geometry, destinations, and BUS-06/BUS-12/BUS-19. Floating controls support zoom, passenger recentering, following the selected vehicle, and showing the entire route. Selecting a bus opens a compact summary linked to its detail page.

BUS-06 receives a development GPS sample every 3 seconds. Its marker interpolates over 2.8 seconds between samples, with reduced-motion support. The simulator, subscription hook, and map-independent interpolation live in separate modules; the map consumes typed positions. The selected panel's timestamp ages honestly and marks stale samples as delayed. Distances, ETAs, and seat counts remain illustrative fixtures. No production hardware or Django WebSocket connection is enabled.

See the GPS boundary notes in `docs/api-contracts.md`. Tracking screenshots are saved as `frontend/artifacts/live-*.png`; `tests/live-tracking.spec.ts` and `tests/gps-logic.spec.ts` verify controls, movement, source lifecycle, reduced motion, and message validation.

## Passenger bus details

`/app/bus/[id]` now provides a passenger journey screen with ETA, speed, available seats, occupancy, latest known coordinates, a vertical route timeline, operator/device information, and a compact occupancy visualization. BUS-06 uses the requested JKKNIU → Trishal → Bhaluka → Mymensingh demo itinerary. The itinerary is illustrative, not validated geographic routing.

The last accepted GPS fix is retained in a session-only Zustand store when moving from the live map to details. Track Live opens the corresponding vehicle; View Seats opens `/app/seats/TRIP-001` for BUS-06. Book Ticket opens the same trip's seat selector. Only available seats can be selected, and Continue opens a booking review with the trip and seat in the URL. Only demo tickets are created; no real seat reservation or payment occurs.

Bus details and seat fixtures are separate from React components and validated through API service models. Loading, retry, missing-bus, missing-trip, GPS retention, and booking-entry behaviors are covered in `frontend/tests/bus-details.spec.ts`. Screenshots are saved as `frontend/artifacts/bus-details-*.png`.

## Seat selection

`/app/seats/[tripId]` now provides a reusable A1–J4, 40-seat layout with a center aisle and a driver position. Available, reserved, occupied, selected, and blocked states have distinct restrained styling and a visible legend. Selection is immediate and exclusive; clicking a selected seat clears it. Only available seats are enabled.

The fixed booking bar shows the chosen seat and the mock BDT 40 fare. Continuing with B3 opens `/app/booking?trip=TRIP-001&seat=B3`; the review validates that the trip exists and the seat is still available. Changing seats restores a valid selection. The legacy `intent=booking` query is no longer required.

Shared components live in `frontend/src/components/seats/` and contain no passenger routing or API dependencies. Seat identifiers and allocation states are Zod-validated in `types/seats.ts`; selection remains local UI state. Fixtures live in `mocks/seat-layouts.ts`. Bus detail occupancy now separates reserved and blocked seats: TRIP-001 has 30 occupied, 8 available, 1 reserved, and 1 blocked, totaling 40. No Django changes are part of this step.

## Prototype booking checkout

`/app/booking?trip=TRIP-001&seat=B3` shows BUS-06, JKKNIU → Mymensingh, Today, 8:30 AM Bangladesh time, seat B3, and the mock fare ৳40. The passenger name starts as Naeem. Zod validates name, a Bangladesh mobile number (including formatted or Bengali digits), and an optional email address.

bKash, Nagad, Card, and Cash are selectable methods with no provider SDK or real payment request. `PaymentAdapter` is isolated from UI and injected into the mock booking service; a future real provider must use server-backed authorization. Confirmation rechecks seat availability, uses a request idempotency key, and simulates 900ms of processing. The first demo booking has ID `STB-2026-00183`, status `CONFIRMED`, and payment status `SIMULATED`, then opens `/app/tickets/STB-2026-00183`.

Mock bookings are stored in sessionStorage for the current browser tab so confirmation survives refresh and appears in My Tickets. If browser storage is unavailable, they remain in memory until reload. Ticket pages clearly state that no money was charged and the demo is not a valid boarding pass. No Django booking or payment endpoints were implemented in this step.

Passenger digital tickets are available at `/app/tickets` and `/app/tickets/STB-2026-00183`. Upcoming, completed, and cancelled demo journeys include locally generated QR codes, PNG ticket downloads, and vehicle-specific live tracking links. Checkout records override demo fixtures within the current browser tab. Future Django list/detail contracts are documented in `docs/api-contracts.md`.
