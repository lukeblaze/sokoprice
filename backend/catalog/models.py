from django.db import models

# Matches the frontend's closed `ProductCategory` union exactly
# (src/types/index.ts) — kept as fixed choices rather than a dynamic
# model since the UI has no picker for arbitrary categories yet.
CATEGORY_CHOICES = [
    ('IT & Computers', 'IT & Computers'),
    ('Networking', 'Networking'),
    ('Office Supplies', 'Office Supplies'),
    ('Power', 'Power'),
    ('Consumables', 'Consumables'),
    ('Furniture', 'Furniture'),
    ('Stationery', 'Stationery'),
]


class Product(models.Model):
    """Static/catalog fields only. Price-derived fields (bestPrice,
    avgPrice, worstPrice, vendorCount, priceChange24h) and per-user
    fields (isFavorited, hasAlert, alertPrice) are computed at
    serialization time from VendorListing/PricePoint/Watchlist/
    PriceAlert rows — never stored here, so they can't drift from the
    listings that are the actual source of truth."""

    id = models.SlugField(primary_key=True, max_length=80)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    subcategory = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)  # list[str]
    unit = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # -> lastUpdated

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class PricePoint(models.Model):
    """One row per product per day. Replaces the mock's embedded
    PriceTrend.dataPoints — GET /products/:id/trend/ groups these by
    the requested period, and priceChange24h compares the latest
    listing aggregate against the nearest point >=24h old."""

    product = models.ForeignKey(Product, related_name='price_points', on_delete=models.CASCADE)
    date = models.DateField()
    avg_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('product', 'date')
        ordering = ['date']

    def __str__(self):
        return f'{self.product_id} @ {self.date}'
