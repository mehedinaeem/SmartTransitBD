from apps.core.views import ServiceIndexView
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("", ServiceIndexView.as_view(), name="api-index"),
    path("admin/", admin.site.urls),
    path("api/v1/health/", include("apps.core.urls")),
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/v1/users/", include("apps.users.urls")),
]
