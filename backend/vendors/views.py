from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminRole

from .models import Vendor
from .serializers import VendorSerializer, VendorWriteSerializer


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return VendorWriteSerializer
        return VendorSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminRole()]
        return [permissions.AllowAny()]

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
