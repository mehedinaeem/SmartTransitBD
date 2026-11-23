# Django foundation

Python 3.14 is used by the development image and lockfile. Django 6.1 supports Python 3.12+. GeoDjango requires GDAL, GEOS, and PROJ system libraries. The application uses PostgreSQL/PostGIS and Redis; these are not substituted by SQLite outside tests.

## Docker development environment

From this directory, with Docker Compose installed:

```bash
cp .env.example .env
# Edit .env: generate a random DJANGO_SECRET_KEY and set POSTGRES_PASSWORD.
docker compose up -d db redis
docker compose build
docker compose run --rm api python manage.py migrate
docker compose run --rm api python manage.py createsuperuser
docker compose up -d api worker
```

The API runs on http://localhost:8000. PostgreSQL, Redis, and the API bind only to loopback on the host. Compose is for local development; it does not configure production TLS, backups, monitoring, secret management, or database access policies. It does not schedule tasks or ingest hardware telemetry. The official PostGIS image initializes the PostGIS extension; migrations initialize the user and Django tables.

## Local Python environment

```bash
python3.14 -m venv .venv
. .venv/bin/activate
pip install -r requirements.lock
```

Settings read environment variables directly; they do not automatically load `.env`. For local processes, export values from your environment manager. Container hostnames `db` and `redis` must be changed to `127.0.0.1` when running Python on the host.

```bash
# With DJANGO_SECRET_KEY and infrastructure environment variables exported:
python manage.py check
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
celery -A config worker --loglevel=info
# ASGI alternative:
daphne -b 127.0.0.1 -p 8000 config.asgi:application
```

## Implemented endpoints

- `GET /api/v1/health/live/`: public process liveness; does not imply infrastructure readiness.
- `GET /api/v1/health/ready/`: public PostGIS and Redis checks; returns 503 if either is unavailable. It does not verify worker or vision health.
- `POST /api/v1/auth/token/`: JWT pair for an existing username/password.
- `POST /api/v1/auth/token/refresh/`: refreshes an unexpired refresh token.
- `GET /api/v1/users/me/`: authenticated, read-only profile.
- `/admin/`: Django admin for development management.

No registration, operator authorization, tenant model, logout/token revocation, or frontend login flow is implemented. User roles are descriptive groundwork. Refresh tokens currently expire after one day; access tokens expire after five minutes. No frontend token persistence is implemented. Add authorization policies before any operator data endpoints.

Channels has an ASGI router and Redis channel layer, with no exposed WebSocket routes. Celery has a JSON-only diagnostic task and no periodic jobs. Domain endpoints listed in `docs/api-contracts.md` are planned, not working backend APIs.

## Checks

```bash
pip install -r requirements-dev.txt
ruff check .
ruff format --check .
python manage.py test apps --settings=config.settings.test
python manage.py makemigrations --check --dry-run --settings=config.settings.test
pip check
```

The test settings use an isolated in-memory SQLite database, eager tasks, and in-memory cache/channels. Readiness tests mock PostGIS and Redis. They do not prove end-to-end database, spatial, broker, or worker operation. Test settings must never be used to serve the application.

Production settings are a baseline at `config.settings.production`; they require a strong signing key and database password. They are not a deployment certification. Configure trusted hosts, CORS, TLS termination, static serving, reverse proxy trust, access controls, monitoring, and backups for the eventual hosting environment.
