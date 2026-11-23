from .base import *  # noqa: F403
from django.core.exceptions import ImproperlyConfigured

if len(SECRET_KEY) < 50:  # noqa: F405
    raise ImproperlyConfigured("Use a random DJANGO_SECRET_KEY of at least 50 characters.")
if not DATABASES["default"]["PASSWORD"]:  # noqa: F405
    raise ImproperlyConfigured("POSTGRES_PASSWORD must be set.")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
# Configure proxy headers only after establishing a trusted reverse proxy boundary.
