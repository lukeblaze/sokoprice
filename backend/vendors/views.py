from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Vendor
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only for Phase 2 — create/update/delete (the admin panel's
    vendor CRUD) land in Phase 4 once IsAdminRole permission exists."""

    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = (request.query_params.get('q') or '').strip()
        qs = self.get_queryset()
        if query:
            qs = qs.filter(
                Q(name__icontains=query) | Q(category__icontains=query) | Q(area__icontains=query)
            )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
