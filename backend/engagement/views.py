from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from vendors.models import Vendor

from .models import Notification, PriceAlert, SavedVendor, Watchlist
from .serializers import NotificationSerializer, PriceAlertSerializer


class WatchlistView(APIView):
    """GET returns the plain list of product IDs the user is watching —
    matches the frontend store's existing Set<string> shape directly, so
    search.tsx's watchlist-mode filter needs no other change."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ids = request.user.watchlist.values_list('product_id', flat=True)
        return Response(list(ids))

    def post(self, request):
        product_id = request.data.get('productId')
        product = get_object_or_404(Product, pk=product_id)
        Watchlist.objects.get_or_create(user=request.user, product=product)
        return Response(status=status.HTTP_201_CREATED)


class WatchlistDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        entry = get_object_or_404(Watchlist, user=request.user, product_id=product_id)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SavedVendorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ids = request.user.saved_vendors.values_list('vendor_id', flat=True)
        return Response(list(ids))

    def post(self, request):
        vendor_id = request.data.get('vendorId')
        vendor = get_object_or_404(Vendor, pk=vendor_id)
        SavedVendor.objects.get_or_create(user=request.user, vendor=vendor)
        return Response(status=status.HTTP_201_CREATED)


class SavedVendorDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, vendor_id):
        entry = get_object_or_404(SavedVendor, user=request.user, vendor_id=vendor_id)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PriceAlertViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PriceAlertSerializer

    def get_queryset(self):
        # Per-user isolation — a user can only ever see/modify their own
        # alerts, enforced at the queryset level so a mismatched pk in the
        # URL 404s instead of leaking another user's row.
        return self.request.user.alerts.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = request.user.notifications.all()
        serializer = NotificationSerializer(qs, many=True)
        unread_count = qs.filter(is_read=False).count()
        return Response({'results': serializer.data, 'unreadCount': unread_count})


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notif).data)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
