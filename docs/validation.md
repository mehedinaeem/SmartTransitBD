# Foundation validation

Validated in this workspace on 23 November 2026 (Asia/Dhaka).

| Check | Result |
| --- | --- |
| Frontend `npm install` | Passed; npm reported zero vulnerabilities |
| Frontend `npm run lint` | Passed without warnings |
| Frontend `npm run build` | Passed with Next.js 16.4.6 |
| Browser route/layout checks | All 14 application URLs at 375, 430, 768, 1024, and 1440px passed |
| Browser interactions | Search, status filters, modal close, journey filter, session preferences, API error/retry passed |
| Browser runtime checks | No uncaught page errors or page-level horizontal overflow |
| Django `manage.py check` | Passed with GeoDjango/PostGIS configuration |
| Django migration drift | None detected |
| Django source lint/format | Ruff passed |
| Django isolated tests | 10 passed; JWT login/refresh, read-only profile, health behavior, worker diagnostic |
| Python dependency consistency | `pip check` passed |

Ten viewport screenshots are saved under `frontend/artifacts/`. Tables scroll within their own containers on small screens. Mobile navigation supports Escape, focus trapping, and a background interaction barrier. Reduced-motion preferences are honored.

Django tests use SQLite for user/authentication migrations, in-memory cache and channel layers, eager Celery diagnostics, and mocks for readiness dependencies. This does not verify PostgreSQL migrations, PostGIS queries against a running database, Redis delivery, Celery worker processes, or a live WebSocket subscription. No sockets or telemetry ingestion routes are exposed.

Docker/Compose is unavailable on this host; the development container stack was prepared but not started or verified. Hardware, vision, payment, booking transaction, tenant authorization, production frontend authentication, and production deployment are outside this foundation step. Map tiles and the Inter font require external network access.

## Passenger home follow-up

The passenger-home update adds `/app/bus/[id]`, destination and popular-route navigation, active mobile tabs, and tests for all three specified nearby buses. The expanded browser suite covers 15 concrete URLs across the five existing widths, plus explicit nearby loading, empty, error, and retry cases. No Django backend changes are part of this update. Browser tests use port 3100 to avoid disturbing a development server on port 3000.

## Backend startup fix

Development entry points now load `backend/.env` automatically while preserving shell overrides; production does not load it. Thirteen backend tests and Ruff checks pass, including regressions for environment precedence and production isolation. PostgreSQL 18/PostGIS and Redis were provisioned locally from Ubuntu packages without system installation. All Django migrations were applied to the local PostGIS database. Live HTTP checks returned 200 for `/`, `/admin/`, `/api/v1/health/live/`, and `/api/v1/health/ready/`, with both PostGIS and Redis reported as ready. The verification Django process was stopped afterward to free port 8000 for the user's terminal; the dependency services remain running. Docker deployment itself remains unverified.

## Passenger live tracking

The live-map update passes lint, production build, and 17 frontend tests. Coverage includes all 15 concrete routes at 375, 430, 768, 1024, and 1440px; tracking-map screenshots are stored in `frontend/artifacts/live-*.png`. A 375×667 check verifies that floating controls, the selected-bus panel, and bottom navigation remain separate.

Tracking tests exercise bus selection, route/destination switching, zoom, passenger recentering, follow mode, selection dismissal, and navigation to BUS-06 details. Chrome with normal motion confirms multiple intermediate marker positions between GPS samples. Pure tests cover interpolation cancellation and reduced motion, validated message ordering, simulator sample cadence/path reversal/cleanup, and refusal to use simulated GPS for hardware-mode snapshots. Browser checks also cover snapshot failure/retry, unavailable map tiles, and delayed-to-live freshness recovery. Django and real hardware integration were not changed in this step.

## Passenger bus-details follow-up

The bus-details update passes lint, production build, and all 20 frontend tests. The route/layout suite covers 16 concrete URLs at 375, 430, 768, 1024, and 1440px, including BUS-06 details and TRIP-001 seat preview. Bus screenshots are available as `frontend/artifacts/bus-details-*.png`.

Added checks verify the requested summary/timeline/occupancy, current GPS retention from live tracking, dynamic BUS-12/BUS-19 context, loading/error/retry and missing resources, occupied-seat disabling, trip-specific booking entry, and local selection review. The existing map movement and passenger/operator regressions continue to pass. No Django backend or production booking changes were made.

## Five-state seat selection

The A1–J4 seat-selection update passes lint, production build, and all 23 frontend tests. Route checks cover 17 concrete URLs at 375, 430, 768, 1024, and 1440px, now including the booking review. Screenshots are saved as `frontend/artifacts/seats-*.png`, with an additional selected-B3 mobile capture.

Seat-specific tests verify all 40 positions and the requested A/B fixtures, available-only selection, reserved/occupied/blocked disabling, single-seat switching and clearing, native Space-key activation, the fixed selected-seat/fare bar, and exact navigation to `/app/booking?trip=TRIP-001&seat=B3`. The mobile legend is checked above the map. Booking validates unavailable/malformed URL choices, preserves trip identity, and restores an available selection when changing seats. Loading, request failure/retry, and existing map/bus/passenger/operator behavior continue to pass.

Counts now come from the shared allocation fixture: TRIP-001 has 30 occupied, 8 available, 1 reserved, and 1 blocked seat. Reserved and blocked seats are no longer incorrectly counted as occupied. Selecting a seat remains local UI state and creates no real reservation or payment.

## Prototype checkout and confirmation

The checkout update passes lint, production build, and all 31 frontend tests. The route suite checks checkout at 375, 430, 768, 1024, and 1440px; screenshots are saved as `frontend/artifacts/checkout-*.png`, with a mobile confirmation capture in `booking-confirmed-375.png`. The mobile success toast was reviewed above the bottom navigation.

New tests verify Today/8:30 AM/BUS-06/B3/৳40 summary data, Naeem prefill, inline Zod validation, phone normalization, optional email, all four payment methods, short pending feedback, double-submit protection, and exact navigation to STB-2026-00183. They confirm CONFIRMED/SIMULATED ticket content, refresh persistence, My Tickets visibility, retry after request failure, fresh seat-availability checks, and missing-ticket behavior. Mock confirmation produces no POST request or external payment call. Existing seat, GPS, passenger, and operator checks continue to pass.

The first mock confirmation ID is fixed to STB-2026-00183, with subsequent tab-local records incrementing the numeric suffix. No Django booking endpoint, provider integration, actual charge, seat reservation, or valid boarding ticket was introduced.

## Digital tickets

Ticket list/detail updates pass `npm run lint`, `npm run build`, and all 33 Playwright tests. Both ticket routes are covered at 375, 430, 768, 1024, and 1440px with horizontal overflow and browser-error checks. Mobile/desktop screenshots and the local PNG export were visually reviewed (`frontend/artifacts/ticket-*.png`, `tickets-*.png`, `ticket-download.png`).

Tests decode the displayed QR and downloaded PNG with an independent QR reader and assert the exact bookingId/tripId/seatId/vehicleId payload. They verify download filename, requested ticket fields, status-tab keyboard navigation, completed/cancelled records, vehicle-specific tracking links, unknown-ticket recovery, and all existing checkout/seat/map regressions. Seeded tickets do not change the first checkout ID or create duplicate list entries.
