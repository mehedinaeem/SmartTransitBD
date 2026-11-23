#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
exec .venv/bin/python manage.py runserver "127.0.0.1:${PORT:-8000}"
