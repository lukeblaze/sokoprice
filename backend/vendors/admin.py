from django.contrib import admin

from .models import Vendor, VendorListing


class VendorListingInline(admin.TabularInline):
    model = VendorListing
    extra = 0


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'area', 'badge', 'is_verified', 'rating')
    list_filter = ('badge', 'is_verified', 'area')
    search_fields = ('id', 'name', 'category', 'area')
    inlines = [VendorListingInline]


@admin.register(VendorListing)
class VendorListingAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'product', 'price', 'in_stock', 'min_order_qty', 'updated_at')
    list_filter = ('in_stock',)
    search_fields = ('vendor__name', 'product__name')
