from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PricePoint, Product
from .serializers import PricePointSerializer, ProductSerializer

PERIOD_DAYS = {'7d': 7, '30d': 30, '90d': 90}


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only for Phase 2 — vendor mutations are on VendorViewSet in
    Phase 4, and Product has no admin-mutable fields planned yet."""

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category and category != 'All':
            qs = qs.filter(category=category)
        return qs

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = (request.query_params.get('q') or '').strip().lower()
        qs = self.get_queryset()
        if query:
            qs = [
                p for p in qs
                if query in p.name.lower()
                or query in p.category.lower()
                or any(query in tag.lower() for tag in (p.tags or []))
            ]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def trend(self, request, pk=None):
        product = self.get_object()
        period = request.query_params.get('period', '30d')
        days = PERIOD_DAYS.get(period, 30)
        cutoff = PricePoint.objects.filter(product=product).order_by('-date').first()
        points_qs = product.price_points.all()
        if cutoff:
            from django.utils import timezone
            start = cutoff.date - timezone.timedelta(days=days)
            points_qs = points_qs.filter(date__gte=start)
        data_points = PricePointSerializer(points_qs, many=True).data
        return Response({'productId': product.id, 'period': period, 'dataPoints': data_points})

    @action(detail=True, methods=['get'])
    def vendors(self, request, pk=None):
        # Local import avoids a catalog<->vendors circular import at
        # module load time (vendors.models already imports catalog.models).
        from vendors.serializers import VendorListingSerializer

        product = self.get_object()
        serializer = VendorListingSerializer(product.listings.all(), many=True)
        return Response(serializer.data)
