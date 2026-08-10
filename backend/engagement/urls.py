from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
    PriceAlertViewSet,
    SavedVendorDetailView,
    SavedVendorView,
    WatchlistDetailView,
    WatchlistView,
)

router = DefaultRouter(trailing_slash=True)
router.register('alerts', PriceAlertViewSet, basename='alert')

urlpatterns = [
    path('watchlist/', WatchlistView.as_view(), name='watchlist'),
    path('watchlist/<str:product_id>/', WatchlistDetailView.as_view(), name='watchlist-detail'),
    path('saved-vendors/', SavedVendorView.as_view(), name='saved-vendors'),
    path('saved-vendors/<str:vendor_id>/', SavedVendorDetailView.as_view(), name='saved-vendors-detail'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notifications-read'),
] + router.urls
