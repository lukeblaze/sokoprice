from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extends Django's built-in user with the SokoPrice profile fields
    from the frontend's UserProfile type, plus a role for admin gating
    (replaces the client-only `isAdmin` mock flag)."""

    CURRENCY_CHOICES = [
        ('KES', 'Kenyan Shilling'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    ]
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('business', 'Business'),
        ('enterprise', 'Enterprise'),
    ]
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    business_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    location = models.CharField(max_length=120, blank=True)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='KES')
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
