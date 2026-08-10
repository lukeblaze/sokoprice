from rest_framework import serializers

from .models import Vendor, VendorListing


def _generate_unique_slug(name):
    base = name.lower().strip()
    base = ''.join(c if c.isalnum() else '-' for c in base)
    while '--' in base:
        base = base.replace('--', '-')
    base = base.strip('-')[:70] or 'vendor'
    slug = base
    suffix = 1
    while Vendor.objects.filter(pk=slug).exists():
        suffix += 1
        slug = f'{base}-{suffix}'
    return slug


def _initials_from_name(name):
    words = [w for w in name.split() if w]
    letters = ''.join(w[0] for w in words[:2]).upper()
    return letters or 'V'


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


class VendorWriteSerializer(serializers.ModelSerializer):
    """Handles admin create/update — the writable subset matching the
    frontend's VendorInput type. id/initials/rating/reviewCount/
    productCount/joinedDate are all derived or start at zero for a new
    vendor, mirroring the old mock's create() logic but for real."""

    openingHours = serializers.CharField(source='opening_hours', required=False, allow_blank=True)
    isVerified = serializers.BooleanField(source='is_verified', required=False, default=False)
    colorHex = serializers.CharField(source='color_hex', required=False, default='#1a3a5c')
    logoUrl = serializers.URLField(source='logo_url', required=False, allow_null=True)

    class Meta:
        model = Vendor
        fields = [
            'name', 'category', 'description', 'location', 'area', 'badge',
            'phone', 'email', 'whatsapp', 'website', 'openingHours',
            'isVerified', 'colorHex', 'logoUrl',
        ]

    def create(self, validated_data):
        validated_data['id'] = _generate_unique_slug(validated_data['name'])
        validated_data['initials'] = _initials_from_name(validated_data['name'])
        return super().create(validated_data)

    def to_representation(self, instance):
        # Always respond with the full read shape (rating, reviewCount,
        # productCount, isFavorited, joinedDate, ...), not just the
        # writable subset — the frontend expects a complete Vendor back.
        return VendorSerializer(instance, context=self.context).data


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
