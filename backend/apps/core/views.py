from django.conf import settings
from django.db import connections
from redis import Redis
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class LivenessView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "smarttransit-api", "stage": "foundation"})


class ReadinessView(LivenessView):
    def get(self, request):
        dependencies = {}
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT PostGIS_Version()")
                cursor.fetchone()
            dependencies["postgis"] = "ok"
        except Exception:
            dependencies["postgis"] = "unavailable"
        try:
            with Redis.from_url(
                settings.REDIS_URL, socket_connect_timeout=2, socket_timeout=2
            ) as client:
                client.ping()
            dependencies["redis"] = "ok"
        except Exception:
            dependencies["redis"] = "unavailable"
        ready = all(status == "ok" for status in dependencies.values())
        return Response(
            {"status": "ready" if ready else "not_ready", "dependencies": dependencies},
            status=200 if ready else 503,
        )


class ServiceIndexView(LivenessView):
    def get(self, request):
        return Response(
            {
                "service": "SmartTransit BD API",
                "stage": "foundation",
                "health": "/api/v1/health/live/",
                "readiness": "/api/v1/health/ready/",
                "admin": "/admin/",
            }
        )
