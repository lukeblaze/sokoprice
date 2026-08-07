from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('email', 'username', 'business_name', 'role', 'plan', 'is_staff')
    list_filter = ('role', 'plan', 'currency', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'business_name', 'phone')
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('SokoPrice profile', {
            'fields': ('business_name', 'phone', 'location', 'currency', 'plan', 'role'),
        }),
    )
