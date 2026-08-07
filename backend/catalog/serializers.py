from django.db.models import Avg, Max, Min
from django.utils import timezone
from rest_framework import serializers

from .models import PricePoint, Product


def _current_aggregate(product):
    """Min/avg/max price across all vendor listings for a product.
    Falls back to 0/0/0 for products with no listings yet (products
    are catalog entries independent of whether any vendor has listed
    them — the mock data has the same gap)."""
    agg = product.listings.aggregate(best=Min('price'), avg=Avg('price'), worst=Max('price'))
    return (
        agg['best'] or 0,
        round(agg['avg'], 2) if agg['avg'] is not None else 0,
        agg['worst'] or 0,
    )


def _price_change_24h(product, current_avg):
    """Percentage change vs. the nearest PricePoint at least 24h old.
    0 for products with no price history, or no *current* listings
    either — comparing "no price" against a real historical baseline
    would otherwise read as a misleading -100% drop."""
    if not current_avg:
        return 0
    cutoff = timezone.now().date() - timezone.timedelta(days=1)
    baseline = product.price_points.filter(date__lte=cutoff).order_by('-date').first()
    if not baseline or not baseline.avg_price:
        return 0
    change = (float(current_avg) - float(baseline.avg_price)) / float(baseline.avg_price) * 100
    return round(change, 1)


class ProductSerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url', allow_null=True)
    vendorCount = serializers.SerializerMethodField()
    bestPrice = serializers.SerializerMethodField()
    avgPrice = serializers.SerializerMethodField()
    worstPrice = serializers.SerializerMethodField()
    priceChange24h = serializers.SerializerMethodField()
    priceChangePct = serializers.SerializerMethodField()
    lastUpdated = serializers.DateTimeField(source='updated_at')
    isFavorited = serializers.SerializerMethodField()
    hasAlert = serializers.SerializerMethodField()
    alertPrice = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'subcategory', 'description', 'imageUrl', 'tags',
            'vendorCount', 'bestPrice', 'avgPrice', 'worstPrice',
            'priceChange24h', 'priceChangePct', 'lastUpdated',
            'isFavorited', 'hasAlert', 'alertPrice', 'unit',
        ]

    def _prices(self, product):
        # Cache the aggregate per-instance so the three price fields
        # (and vendorCount) don't each re-run the same query.
        if not hasattr(product, '_cached_prices'):
            product._cached_prices = _current_aggregate(product)
        return product._cached_prices

    def get_vendorCount(self, product):
        return product.listings.filter(in_stock=True).count()

    def get_bestPrice(self, product):
        return self._prices(product)[0]

    def get_avgPrice(self, product):
        return self._prices(product)[1]

    def get_worstPrice(self, product):
        return self._prices(product)[2]

    def get_priceChange24h(self, product):
        return _price_change_24h(product, self._prices(product)[1])

    def get_priceChangePct(self, product):
        # Alias of priceChange24h — the frontend type has both, always equal.
        return self.get_priceChange24h(product)

    def _user(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user if user and user.is_authenticated else None

    def get_isFavorited(self, product):
        user = self._user()
        return bool(user and product.watched_by.filter(user=user).exists())

    def _active_alert(self, product):
        user = self._user()
        if not user:
            return None
        if not hasattr(product, '_cached_alert'):
            product._cached_alert = product.alerts.filter(user=user, is_active=True).first()
        return product._cached_alert

    def get_hasAlert(self, product):
        return self._active_alert(product) is not None

    def get_alertPrice(self, product):
        alert = self._active_alert(product)
        return alert.target_price if alert else None


class PricePointSerializer(serializers.ModelSerializer):
    # coerce_to_string=False — frontend type is `avgPrice: number` /
    # `minPrice: number`, not a formatted decimal string.
    avgPrice = serializers.DecimalField(source='avg_price', max_digits=10, decimal_places=2, coerce_to_string=False)
    minPrice = serializers.DecimalField(source='min_price', max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = PricePoint
        fields = ['date', 'avgPrice', 'minPrice']
