from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import _current_aggregate

from .models import Notification, PriceAlert


class PriceAlertSerializer(serializers.ModelSerializer):
    productId = serializers.PrimaryKeyRelatedField(source='product', queryset=Product.objects.all())
    productName = serializers.CharField(source='product.name', read_only=True)
    # coerce_to_string=False — frontend type is `targetPrice: number`.
    targetPrice = serializers.DecimalField(
        source='target_price', max_digits=10, decimal_places=2, coerce_to_string=False
    )
    currentPrice = serializers.SerializerMethodField()
    # default=True (not just required=False) — DRF's BooleanField treats a
    # field missing from non-JSON-encoded POST data as an explicit False
    # (the HTML "unchecked checkbox" convention) rather than omitting it,
    # which would otherwise silently override the model's own default.
    isActive = serializers.BooleanField(source='is_active', required=False, default=True)
    triggeredAt = serializers.DateTimeField(source='triggered_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = PriceAlert
        fields = [
            'id', 'productId', 'productName', 'targetPrice', 'currentPrice',
            'direction', 'isActive', 'triggeredAt', 'createdAt',
        ]

    def get_currentPrice(self, alert):
        best_price, _avg, _worst = _current_aggregate(alert.product)
        return best_price


class NotificationSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source='product_id', allow_null=True, read_only=True)
    vendorId = serializers.CharField(source='vendor_id', allow_null=True, read_only=True)
    isRead = serializers.BooleanField(source='is_read')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'body', 'productId', 'vendorId', 'isRead', 'createdAt']
