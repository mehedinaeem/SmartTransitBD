from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Role is descriptive groundwork, not an operator authorization policy."""

    class Role(models.TextChoices):
        PASSENGER = "passenger", "Passenger"
        OPERATOR = "operator", "Operator"

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.PASSENGER)
