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
