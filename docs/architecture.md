# Architecture and scope

The repository root is the `smarttransit` project boundary. Next.js and Django are separate applications with independent dependencies, processes, configuration, and builds. Firmware and vision remain separate integration boundaries.

## Frontend

`src/app` contains passenger and operator layouts and route entries. Shared controls live in `components/ui`, feature screens in `features`, query hooks in `hooks`, interface state in Zustand `stores`, and validated contracts in `types`.

UI components use TanStack Query hooks and `lib/api` domain services. Mock data lives exclusively in `mocks` and is exposed by mock route handlers. The typed client handles status errors, cancellation, Zod parsing, and DRF pagination envelopes. Switching API modes does not silently fall back to mocks. Authentication integration is deferred; the current-user service can accept a supplied bearer token without persisting it.

The Next.js mock handlers are fixture transport for the frontend prototype. They do not replace the Django backend or implement product business logic. Static project readiness copy and planned-feature empty states remain presentation content.

## Backend

Django REST Framework is the API boundary. GeoDjango and the PostGIS engine provide the spatial persistence foundation. A custom user model is established before domain migrations, with passenger/operator role vocabulary but no tenant authorization model yet.

The ASGI entry point uses Channels and an empty WebSocket router until secure subscriptions are designed. Redis databases separate channel messages, cache, Celery broker, and Celery results. Celery accepts JSON payloads and has an explicit diagnostic task. No scheduled jobs are activated.

Health endpoints distinguish an alive HTTP process from accessible PostGIS and Redis. Unit tests isolate external services; deployment validation must exercise actual infrastructure.

## Future integration boundaries

ESP32/A7670E → authenticated telemetry ingestion → validated timestamped positions → PostGIS → authorized REST/WebSocket subscribers.

Camera and Raspberry Pi → versioned occupancy inference → confidence and freshness validation → occupancy service → authorized passenger/operator summaries.

Booking requires its own transactional seat allocation, idempotency, payment reconciliation, and operator authorization design. None is implemented in this foundation. Never use the prototype's availability estimates as a booking source of truth.

## Passenger live-map boundary

Tracking initial state comes through `lib/api/tracking.ts` and a Zod snapshot contract. A mounted `useLiveTracking` session subscribes to an injected `GpsSource` and applies validated, ordered updates. The development source is isolated in `mocks/gps-simulator.ts`; the source selector refuses to run it for hardware-mode snapshots. UI clock ticks update freshness without reconnecting the source.

The Leaflet view in `features/tracking/live-map.tsx` owns map layers, selection visuals, route fitting, and camera controls. Position interpolation is a separate, map-independent module with an injectable frame clock. GPS sampling does not occur in the map, and animation frames do not rerender the entire React page. Unmounting cancels the source, age timer, animation frames, map observers, and marker icon roots. A manual map drag exits follow mode.

## Shared seat components

The seat system separates persistent allocation (`Seat.status`) from controlled, transient selection (`SeatState.SELECTED`). `components/seats` renders buttons, the 2+2 layout, and the legend without fetching data, changing global booking state, or navigating. It can be reused in an operator read-only view. Passenger policy, trip loading, the fare/selection bar, and routing remain in the passenger feature.

Typed fixtures and Zod contracts ensure 40 unique, correctly labeled seats. One shared fixture supplies allocation counts to both the selector and bus details. Booking query parameters are validated and checked against current availability before the review is displayed. The mock UI does not implement the transactional backend needed to reserve seats.

## Checkout boundary

Passenger fields and query parameters are validated independently. Seat and fare authority comes from a fresh trip resource before confirmation. Checkout uses a TanStack mutation plus a synchronous submission latch, with a stable idempotency key for retry. UI validation state, payment-method selection, and pending feedback remain separate from the booking service.

`lib/booking-service.ts` defines creation and retrieval; `lib/payments/types.ts` defines payment preparation outcomes. Mock adapters use no external SDK or payment network, and a mock confirmation refuses non-simulated payment results. Tab-scoped demo storage powers ticket refresh and My Tickets, with explicit demo labeling. The Django application, transactional seat holding, production provider authorization, and real ticket issuance are unchanged.

Passenger tickets use a dedicated ticket schema and list/detail service methods, independent mock fixtures, and reusable QR/payload/download utilities under `lib/tickets`. Status tabs support keyboard navigation and loading, empty, and error states. Existing passenger transitions and reduced-motion handling apply to both ticket routes. Canvas exports and QR generation execute entirely in the browser.
