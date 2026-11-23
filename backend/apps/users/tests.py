from django.test import TestCase
from rest_framework.test import APIClient
from .models import User


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="passenger", password="test-password-42")

    def test_profile_requires_authentication(self):
        self.assertEqual(self.client.get("/api/v1/users/me/").status_code, 401)

    def test_jwt_authentication_and_refresh(self):
        response = self.client.post(
            "/api/v1/auth/token/", {"username": "passenger", "password": "test-password-42"}
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        profile = self.client.get("/api/v1/users/me/")
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data["role"], "passenger")
        self.assertNotIn("password", profile.data)
        refreshed = self.client.post(
            "/api/v1/auth/token/refresh/", {"refresh": response.data["refresh"]}
        )
        self.assertEqual(refreshed.status_code, 200)

    def test_invalid_credentials_are_rejected(self):
        response = self.client.post(
            "/api/v1/auth/token/", {"username": "passenger", "password": "wrong"}
        )
        self.assertEqual(response.status_code, 401)

    def test_profile_cannot_promote_its_role(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch("/api/v1/users/me/", {"role": "operator"}, format="json")
        self.assertEqual(response.status_code, 405)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, User.Role.PASSENGER)
