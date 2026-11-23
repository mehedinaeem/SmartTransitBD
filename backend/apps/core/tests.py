from unittest.mock import MagicMock, patch
from django.test import SimpleTestCase
from rest_framework.test import APIClient
from .tasks import worker_health


class HealthTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_liveness_is_public(self):
        response = self.client.get("/api/v1/health/live/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["stage"], "foundation")

    @patch("apps.core.views.Redis.from_url")
    @patch("apps.core.views.connections")
    def test_readiness_requires_postgis_and_redis(self, connections, redis):
        cursor = MagicMock()
        connections.__getitem__.return_value.cursor.return_value.__enter__.return_value = cursor
        redis.return_value.__enter__.return_value.ping.return_value = True
        response = self.client.get("/api/v1/health/ready/")
        self.assertEqual(response.status_code, 200)
        cursor.execute.assert_called_once_with("SELECT PostGIS_Version()")

    @patch("apps.core.views.Redis.from_url")
    @patch("apps.core.views.connections")
    def test_readiness_failure_does_not_expose_errors(self, connections, redis):
        connections.__getitem__.side_effect = RuntimeError("private database password")
        redis.side_effect = RuntimeError("private redis url")
        response = self.client.get("/api/v1/health/ready/")
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("private", str(response.data))

    def test_worker_diagnostic(self):
        self.assertEqual(worker_health.apply().get(), {"status": "ok", "stage": "foundation"})

    def test_domain_api_is_not_implemented_with_mock_data(self):
        self.assertEqual(self.client.get("/api/v1/vehicles/").status_code, 404)

    def test_cors_only_allows_configured_frontend(self):
        allowed = self.client.options(
            "/api/v1/health/live/",
            HTTP_ORIGIN="http://localhost:3000",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
        )
        self.assertEqual(allowed["Access-Control-Allow-Origin"], "http://localhost:3000")
        rejected = self.client.options(
            "/api/v1/health/live/",
            HTTP_ORIGIN="https://untrusted.example",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
        )
        self.assertNotIn("Access-Control-Allow-Origin", rejected)


class EnvironmentLoadingTests(SimpleTestCase):
    def test_development_loads_dotenv_without_overriding_shell(self):
        import os
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from config.environment import load_development_environment

        with TemporaryDirectory() as directory:
            path = Path(directory) / ".env"
            path.write_text("DJANGO_SECRET_KEY=local-file-value\nPOSTGRES_DB=local-db\n")
            with patch.dict(
                os.environ,
                {
                    "DJANGO_SETTINGS_MODULE": "config.settings.development",
                    "DJANGO_SECRET_KEY": "exported-value",
                },
                clear=True,
            ):
                load_development_environment(path)
                self.assertEqual(os.environ["DJANGO_SECRET_KEY"], "exported-value")
                self.assertEqual(os.environ["POSTGRES_DB"], "local-db")

    def test_production_does_not_load_local_dotenv(self):
        import os
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from config.environment import load_development_environment

        with TemporaryDirectory() as directory:
            path = Path(directory) / ".env"
            path.write_text("DJANGO_SECRET_KEY=local-file-value\n")
            with patch.dict(
                os.environ, {"DJANGO_SETTINGS_MODULE": "config.settings.production"}, clear=True
            ):
                load_development_environment(path)
                self.assertNotIn("DJANGO_SECRET_KEY", os.environ)

    def test_backend_root_has_service_information(self):
        response = APIClient().get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["service"], "SmartTransit BD API")
