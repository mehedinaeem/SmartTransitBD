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
