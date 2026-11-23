#!/usr/bin/env python3
"""Start Ubuntu development services from extracted packages; no sudo or system changes."""

import os
import socket
import subprocess
import tempfile
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg import sql

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env", override=False)
LOCAL = ROOT / ".local-services"
RUNTIME = LOCAL / "runtime"
PG_BIN = RUNTIME / "usr/lib/postgresql/18/bin"
REDIS = RUNTIME / "usr/bin/redis-server"
ENV = dict(os.environ)
ENV["LD_LIBRARY_PATH"] = str(RUNTIME / "usr/lib/x86_64-linux-gnu") + (
    ":" + ENV["LD_LIBRARY_PATH"] if ENV.get("LD_LIBRARY_PATH") else ""
)
ENV["PATH"] = str(PG_BIN) + os.pathsep + ENV.get("PATH", "")


def listening(port):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except OSError:
        return False


def run(*args):
    subprocess.run([str(arg) for arg in args], env=ENV, check=True)


def main():
    if not (PG_BIN / "initdb").exists() or not REDIS.exists():
        raise SystemExit("Local service binaries are missing. See backend/README.md for setup.")
    if os.environ.get("POSTGRES_HOST", "127.0.0.1") not in ("127.0.0.1", "localhost"):
        raise SystemExit("This helper only manages local development services.")
    extensions = RUNTIME / "usr/share/postgresql/18/extension"
    # Debian creates these alternatives during installation; keep them project-local here.
    for control in extensions.glob("*-3.control"):
        alias = control.with_name(control.name.replace("-3.control", ".control"))
        if not alias.exists():
            alias.symlink_to(control.name)
    user = os.environ.get("POSTGRES_USER", "smarttransit")
    password = os.environ.get("POSTGRES_PASSWORD", "")
    database = os.environ.get("POSTGRES_DB", "smarttransit")
    port = int(os.environ.get("POSTGRES_PORT", "5432"))
    if not password:
        raise SystemExit("Set POSTGRES_PASSWORD in backend/.env first.")
    data = LOCAL / "postgres-data"
    sockets = LOCAL / "sockets"
    sockets.mkdir(parents=True, exist_ok=True)
    if not listening(port):
        if not (data / "PG_VERSION").exists():
            with tempfile.NamedTemporaryFile(mode="w", dir=LOCAL) as secret:
                secret.write(password + "\n")
                secret.flush()
                run(
                    PG_BIN / "initdb",
                    "-D",
                    data,
                    "-U",
                    user,
                    "--auth=scram-sha-256",
                    "--pwfile=" + secret.name,
                    "--locale=C",
                    "--encoding=UTF8",
                )
        run(
            PG_BIN / "pg_ctl",
            "-D",
            data,
            "-l",
            LOCAL / "postgres.log",
            "-o",
            f"-h 127.0.0.1 -p {port} -k {sockets}",
            "-w",
            "start",
        )
    with psycopg.connect(
        dbname="postgres",
        user=user,
        password=password,
        host="127.0.0.1",
        port=port,
        autocommit=True,
        connect_timeout=5,
    ) as connection:
        if not connection.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (database,)
        ).fetchone():
            connection.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(database)))
    with psycopg.connect(
        dbname=database,
        user=user,
        password=password,
        host="127.0.0.1",
        port=port,
        autocommit=True,
        connect_timeout=5,
    ) as connection:
        connection.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    if not listening(6379):
        run(
            REDIS,
            "--bind",
            "127.0.0.1",
            "--port",
            "6379",
            "--protected-mode",
            "yes",
            "--save",
            "",
            "--appendonly",
            "no",
            "--daemonize",
            "yes",
            "--pidfile",
            LOCAL / "redis.pid",
            "--logfile",
            LOCAL / "redis.log",
            "--dir",
            LOCAL,
        )
    print(
        "Local PostgreSQL/PostGIS and Redis started. Database data is stored in backend/.local-services/."
    )


if __name__ == "__main__":
    main()
