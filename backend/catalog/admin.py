from django.contrib import admin

from .models import PricePoint, Product


class PricePointInline(admin.TabularInline):
    model = PricePoint
    extra = 0
    ordering = ['-date']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'subcategory', 'updated_at')
    list_filter = ('category',)
    search_fields = ('id', 'name', 'subcategory', 'tags')
    inlines = [PricePointInline]


@admin.register(PricePoint)
class PricePointAdmin(admin.ModelAdmin):
    list_display = ('product', 'date', 'avg_price', 'min_price')
    list_filter = ('date',)
    search_fields = ('product__id', 'product__name')
