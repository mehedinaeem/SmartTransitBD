# API service boundaries

Base path planned for Django: `/api/v1`. The frontend defaults to `/api/mock` and makes no production-domain calls.

| Service | Frontend module | Mock resource | Django implementation |
| --- | --- | --- | --- |
| Vehicles | `lib/api/vehicles.ts` | `GET /api/mock/vehicles` | Planned |
| Routes | `lib/api/routes.ts` | `GET /api/mock/routes` | Planned |
| Trips | `lib/api/trips.ts` | `GET /api/mock/trips` (empty) | Planned |
| Bookings | `lib/api/bookings.ts` | `GET /api/mock/bookings` (empty) | Planned |
| Occupancy | `lib/api/occupancy.ts` | `GET /api/mock/occupancy` | Planned |
| Current user | `lib/api/users.ts` | `GET /api/mock/users/me` | `GET /api/v1/users/me/` implemented |
| Overview | `lib/api/overview.ts` | `GET /api/mock/overview` | Planned |

Django collection contracts are expected to use DRF page-number pagination: `{count, next, previous, results}`. The current services return the first page as a list; pagination controls and full page metadata should be introduced alongside domain implementation. Mock collections return arrays. Single resources return objects. Zod validates all responses. Frontend TypeScript contracts are proposals for unimplemented domains, not finalized backend models.

Future Django endpoints should use trailing slashes. Next.js normalizes mock paths. Fetch requests support AbortSignal and throw `ApiError` for non-2xx responses. Query hooks provide caching, loading, and failure/retry UI. JWT login/refresh return SimpleJWT `access`/`refresh` tokens; `/users/me/` returns `id`, `username`, `first_name`, `last_name`, and `role`.

No booking creation, payment action, device registration, telemetry write, or model inference endpoint is exposed. Occupancy fixtures identify `source: simulated` and use null confidence; this prevents representing fixture values as model accuracy. Production models need device identity, timestamp freshness, event ordering, tenant ownership, and inference versioning decisions before implementation.

## Passenger home service additions

`vehiclesApi.nearby()` requests `GET /vehicles/nearby/` beneath the selected API base. It returns typed rows with `id`, `routeId`, `from`, `to`, `distanceKm`, `etaMinutes`, `availableSeats`, and `status` (`Approaching` or `On Route`). `vehiclesApi.detail(id)` requests `/vehicles/{id}/` for the bus preview and handles missing IDs separately from transient errors. Both use fixtures in mock mode; these Django endpoints remain unimplemented.

Passenger routes use the existing `/routes/` service with `audience=passenger`; `popular=true` selects the three home-screen recommendations. These query filters are proposed API contracts, implemented only by the mock transport for now. Operator route fixtures remain separate. Route fares, stop counts, and schedules are optional: the passenger fixtures do not invent unpublished service details. Future DRF collection responses use the shared pagination adapter. Device location permissions and real nearby queries are not enabled; JKKNIU is labeled as a demo location.

## Live tracking and future GPS transport

`trackingApi.snapshot()` requests `/tracking/` beneath the selected API base. The mock snapshot contains `mode`, a demo `passengerLocation`, static vehicle metadata and initial positions, plus route points, stops, and destinations. `trackingSnapshotSchema` validates the response. The Django snapshot endpoint is planned, not implemented.

`GpsSource.subscribe({onUpdate, onConnection})` returns an unsubscribe function that must stop listeners, timers, and the eventual socket. `useLiveTracking` selects its source factory once per mounted tracking session; clock or selection redraws do not restart the source. A different adapter can be injected by the caller when the production transport is implemented. Hardware snapshots never automatically fall back to simulated GPS.

Each update is validated before reaching the position store:

```json
{
  "vehicleId": "BUS-06",
  "sequence": 42,
  "position": {"lat": 24.5791, "lng": 90.3851},
  "recordedAt": "2026-11-23T10:00:00.000Z",
  "speedKmh": 32,
  "source": "hardware"
}
```

Sequence numbers must increase within the active stream, and observation timestamps cannot move backwards. Unknown vehicle IDs, invalid coordinates, and out-of-order updates are ignored. The panel shows delayed status after 15 seconds without a fresh sample. WebSocket endpoint selection, authentication, subscriptions, reconnect/session cursors, authorization, and real GNSS integration remain future work.

`mocks/gps-simulator.ts` is independent of Leaflet. It emits BUS-06 coordinates from a predefined path every 3000ms, reversing at the path ends to avoid a teleporting reset. BUS-12 and BUS-19 are static reference fixtures and will age to delayed status. `lib/tracking/interpolate.ts` uses cancellable animation frames, starts a retargeted animation from the marker's displayed position, and skips movement animation under reduced-motion preferences. All coordinates, stop placements, route geometry, ETA, distance, speed, and seats in this demonstration are illustrative, not surveyed or routing-engine output.

## Bus details and seat preview

`vehiclesApi.detail(id)` now parses `busDetailsSchema`, extending nearby vehicle fields with a trip ID, operator, speed, capacity, occupied seats, latest position and observation timestamp, device state, a location label, and route stop progression. Available, occupied, reserved, and blocked seats must sum to capacity. The BUS-06 detail status is `On Route`; its nearby-list `Approaching` label describes proximity in that separate preview context.

`tripsApi.seats(tripId)` requests `/trips/{tripId}/` and validates a seat preview containing the trip/vehicle identifiers, origin/destination, capacity, and uniquely numbered seat states. BUS-06 maps to TRIP-001, BUS-12 to TRIP-002, and BUS-19 to TRIP-003. These detail resources are implemented only by the mock transport; Django domain APIs are unchanged.

The session-only tracking store remembers accepted fixes after leaving `/app/live`. Bus details compare the stored observation time against their API snapshot and show the newest position/speed. The Last GPS Update display ages over time, and an old Online device snapshot is marked as delayed after 30 seconds. Device state and all seat data remain simulated.

`/app/seats/{tripId}` is an interactive seat selector. Only AVAILABLE seats can be selected. Continue opens `/app/booking?trip={tripId}&seat={seatId}`, where the trip and current seat availability are validated again. In mock mode the checkout makes no booking POST request, accepts no real payment, and stores a demo confirmation and passenger details in tab-scoped browser storage. Track Live uses `/app/live` for BUS-06 and the `bus` query parameter for other vehicles to keep the chosen context.

## Reusable seat allocation contract

Trip seat resources now include `fare` (integer BDT units), `currency: BDT`, and exactly 40 unique seats. Each seat has `id` (A1–J4), `row` (A–J), `column` (1–4), and an allocation status of `AVAILABLE`, `RESERVED`, `OCCUPIED`, or `BLOCKED`. ID, row, and column must agree. `SELECTED` exists only in the controlled visual state; it is never written into API fixtures or treated as a seat hold.

`SeatButton`, `SeatMap`, and `SeatLegend` are reusable by passenger and operator views. The map supports a read-only mode and an explicit selection policy; the passenger uses the available-only policy and independently validates selections. The Continue action derives its enabled state from the currently loaded allocation, so an unavailable or unknown URL-supplied seat cannot enable booking. The booking review validates query format and actual resource state rather than trusting URL parameters.

TRIP-001 reproduces A1/A2 occupied, A3 available, A4 reserved, B1 available, B2 occupied, B3 available, and B4 blocked. All remaining rows continue the same 2+2 layout through J. Counts for the bus summary derive from this shared layout and include reserved/blocked categories separately. Production seat holding, conflict resolution, pricing, reservation expiration, payment, and ticket issuance remain unimplemented.

## Checkout and mock confirmation

Trip snapshots now include `travelDate` (ISO date in Asia/Dhaka) and `departureTime` (24-hour local time), with an illustrative 08:30 departure. Checkout derives the fare and trip details from the validated service response, never from editable query parameters. `checkoutFormSchema` trims the name, normalizes Bangladesh phone numbers, accepts an empty optional email, and restricts payment methods to `bkash`, `nagad`, `card`, or `cash`.

`BookingService.create(input, {idempotencyKey})` abstracts confirmation. The mock implementation serializes submissions, re-fetches the seat resource, rejects non-available seats and duplicate trip/seat bookings in the same tab, waits 900ms, and calls an injected `PaymentAdapter`. Only `SIMULATED` results may become mock confirmations. The adapter interface also allows pending or completed provider outcomes for a future server-backed workflow; none is implemented or enabled. No card number, wallet PIN, OTP, provider credential, or payment SDK is collected.

The first mock ID is `STB-2026-00183`; subsequent IDs increment within tab storage. Records have `status: CONFIRMED`, `isDemo: true`, and `paymentStatus: SIMULATED`. `get` and `confirmed` power the confirmation page and My Tickets. Records, including demo passenger contact data, are stored in `smarttransit.demo-bookings.v1` in sessionStorage, with memory fallback. This is not authenticated server persistence or production ticket issuance.

Django-mode service methods are prepared for POST `/bookings/` with an `Idempotency-Key` header and GET `/bookings/{id}/`, but these endpoints and production authentication/payment orchestration remain future work. Merely switching API mode does not implement them. Success and error notifications are handled by the checkout feature; a failed confirmation keeps the entered form values for retry.

## Passenger digital tickets

`bookingsApi.tickets()` prepares GET `/api/v1/bookings/`; `bookingsApi.get(bookingId)` prepares GET `/api/v1/bookings/{booking_id}/` when the Django base URL includes `/api/v1`. Lists use the existing DRF paginated envelope (`count`, `next`, `previous`, `results`). `ticketSchema` validates ticket records with CONFIRMED, COMPLETED, or CANCELLED status. The UI consumes these services through TanStack Query rather than reading fixtures directly. These Django endpoints are contracts only; no backend implementation was added.

Mock tickets include two upcoming, two completed, and one cancelled journey with dates relative to Asia/Dhaka. Browser-tab checkout records override matching fixture IDs. Fixtures neither reserve seats nor advance the booking counter. A new checkout invalidates the ticket list query.

QR codes are generated locally with `qrcode`. Payloads contain exactly `bookingId`, `tripId`, `seatId`, and `vehicleId`, excluding passenger contact details. Download Ticket generates a self-contained PNG locally with the same QR. Track Bus preserves vehicle context using the live map's `bus` query parameter. Demo tickets are explicitly labelled and are not signed production boarding credentials.
