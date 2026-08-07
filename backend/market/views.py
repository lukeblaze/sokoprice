from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from catalog.serializers import ProductSerializer
from vendors.models import Vendor

# Deliberately computed on every request, not stored — see the backend
# build plan's rationale: cheap at this data volume, always correct,
# no cache-invalidation bugs. Revisit only if product count grows into
# the tens of thousands or these queries show up as slow in practice.


def _serialized_products(request):
    """Reuses ProductSerializer for every derived-price field so this
    view has exactly one source of truth for that math, shared with
    the catalog endpoints — no duplicated aggregate logic to drift."""
    products = Product.objects.all()
    return ProductSerializer(products, many=True, context={'request': request}).data


class MarketSummaryView(APIView):
    def get(self, request):
        serialized = _serialized_products(request)
        drops = sorted((p for p in serialized if p['priceChange24h'] < 0), key=lambda p: p['priceChange24h'])
        gains = sorted((p for p in serialized if p['priceChange24h'] > 0), key=lambda p: -p['priceChange24h'])
        recent = sorted(serialized, key=lambda p: p['lastUpdated'], reverse=True)[:5]
        changes = [p['priceChange24h'] for p in serialized]
        avg_movement = round(sum(changes) / len(changes), 1) if changes else 0

        return Response({
            'totalProducts': Product.objects.count(),
            'activeVendors': Vendor.objects.count(),
            'avgPriceMovement': avg_movement,
            'topDrops': drops[:3],
            'topGains': gains[:3],
            'recentUpdates': recent,
        })


class MarketTickerView(APIView):
    def get(self, request):
        serialized = _serialized_products(request)[:8]
        ticker = []
        for p in serialized:
            name = p['name']
            ticker.append({
                'productId': p['id'],
                'name': name if len(name) <= 22 else name[:22] + '…',
                'price': p['bestPrice'],
                'change': p['priceChange24h'],
                'isUp': p['priceChange24h'] >= 0,
            })
        return Response(ticker)
