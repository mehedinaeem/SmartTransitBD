import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
from django.core.asgi import get_asgi_application

http_application = get_asgi_application()
# Initialize Django before importing future WebSocket consumers that may use models.
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402
from .routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": http_application,
        "websocket": AllowedHostsOriginValidator(URLRouter(websocket_urlpatterns)),
    }
)
