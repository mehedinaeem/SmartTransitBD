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
