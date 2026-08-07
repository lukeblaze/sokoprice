from rest_framework import serializers

from .models import Vendor, VendorListing


class VendorSerializer(serializers.ModelSerializer):
    # coerce_to_string=False — otherwise DRF renders DecimalField as a
    # JSON string ("4.8"), but the frontend type is `rating: number`
    # and calls .toFixed() on it directly.
    rating = serializers.DecimalField(max_digits=2, decimal_places=1, coerce_to_string=False)
    reviewCount = serializers.IntegerField(source='review_count')
    productCount = serializers.SerializerMethodField()
    openingHours = serializers.CharField(source='opening_hours')
    isVerified = serializers.BooleanField(source='is_verified')
    isFavorited = serializers.SerializerMethodField()
    colorHex = serializers.CharField(source='color_hex')
    logoUrl = serializers.URLField(source='logo_url', allow_null=True)
    joinedDate = serializers.DateField(source='joined_date')

    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'initials', 'category', 'description', 'location', 'area',
            'rating', 'reviewCount', 'badge', 'productCount', 'phone', 'email',
            'whatsapp', 'website', 'openingHours', 'isVerified', 'isFavorited',
            'colorHex', 'logoUrl', 'joinedDate',
        ]

    def get_productCount(self, vendor):
        return vendor.listings.values('product').distinct().count()

    def get_isFavorited(self, vendor):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return vendor.saved_by.filter(user=user).exists()


class VendorListingSerializer(serializers.ModelSerializer):
    """Denormalizes VendorListing + its vendor FK back out to the
    frontend's flat VendorListing shape — the frontend never sees
    that this is now a proper join table."""

    vendorId = serializers.CharField(source='vendor.id')
    vendorName = serializers.CharField(source='vendor.name')
    vendorLocation = serializers.CharField(source='vendor.location')
    vendorBadge = serializers.CharField(source='vendor.badge')
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    inStock = serializers.BooleanField(source='in_stock')
    minOrderQty = serializers.IntegerField(source='min_order_qty')
    updatedAt = serializers.DateTimeField(source='updated_at')
    contactPhone = serializers.CharField(source='contact_phone', allow_null=True)
    contactEmail = serializers.EmailField(source='contact_email', allow_null=True)

    class Meta:
        model = VendorListing
        fields = [
            'vendorId', 'vendorName', 'vendorLocation', 'vendorBadge', 'price',
            'inStock', 'minOrderQty', 'updatedAt', 'contactPhone', 'contactEmail', 'notes',
        ]
