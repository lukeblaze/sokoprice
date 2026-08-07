from django.contrib import admin

from .models import Notification, PriceAlert, SavedVendor, Watchlist


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__email', 'product__name')


@admin.register(SavedVendor)
class SavedVendorAdmin(admin.ModelAdmin):
    list_display = ('user', 'vendor', 'created_at')
    search_fields = ('user__email', 'vendor__name')


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'target_price', 'direction', 'is_active', 'triggered_at')
    list_filter = ('direction', 'is_active')
    search_fields = ('user__email', 'product__name')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
    search_fields = ('user__email', 'title', 'body')
