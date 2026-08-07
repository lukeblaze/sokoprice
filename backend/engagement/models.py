from django.conf import settings
from django.db import models

from catalog.models import Product
from vendors.models import Vendor


class Watchlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='watchlist', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='watched_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')


class SavedVendor(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='saved_vendors', on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, related_name='saved_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'vendor')


class PriceAlert(models.Model):
    DIRECTION_CHOICES = [
        ('below', 'Below'),
        ('above', 'Above'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='alerts', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='alerts', on_delete=models.CASCADE)
    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_id} alert on {self.product_id}'


class Notification(models.Model):
    TYPE_CHOICES = [
        ('price_drop', 'Price drop'),
        ('price_rise', 'Price rise'),
        ('alert_triggered', 'Alert triggered'),
        ('new_vendor', 'New vendor'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = models.TextField()
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
    vendor = models.ForeignKey(Vendor, null=True, blank=True, on_delete=models.SET_NULL)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
