from django.db import models

from catalog.models import Product


class Vendor(models.Model):
    BADGE_CHOICES = [
        ('Verified', 'Verified'),
        ('Premium', 'Premium'),
        ('New', 'New'),
        ('Trusted', 'Trusted'),
    ]

    id = models.SlugField(primary_key=True, max_length=80)
    name = models.CharField(max_length=150)
    initials = models.CharField(max_length=4)
    # Free text — Vendor.category in the frontend type is `string`,
    # not the closed ProductCategory union that Product.category uses.
    category = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    area = models.CharField(max_length=100, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    badge = models.CharField(max_length=20, choices=BADGE_CHOICES, default='New')
    phone = models.CharField(max_length=32, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    whatsapp = models.CharField(max_length=32, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    opening_hours = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    color_hex = models.CharField(max_length=7, default='#1a3a5c')
    logo_url = models.URLField(blank=True, null=True)
    joined_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class VendorListing(models.Model):
    """Normalizes the mock's MOCK_VENDOR_LISTINGS, which duplicated
    vendorName/vendorLocation/vendorBadge on every listing row. Here
    those are derived from the `vendor` FK at serialization time —
    the serializer denormalizes back out to the frontend's flat
    VendorListing shape, so the frontend sees no difference."""

    vendor = models.ForeignKey(Vendor, related_name='listings', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='listings', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    in_stock = models.BooleanField(default=True)
    min_order_qty = models.PositiveIntegerField(default=1)
    contact_phone = models.CharField(max_length=32, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    notes = models.CharField(max_length=300, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('vendor', 'product')
        ordering = ['price']

    def __str__(self):
        return f'{self.vendor_id} -> {self.product_id}'
