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
