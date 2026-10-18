
from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "customer_id",
        "full_name",
        "phone",
        "branch_name",
        "is_active",
        "created_at",
    )

    search_fields = (
        "customer_id",
        "full_name",
        "phone",
    )

    list_filter = (
        "branch_name",
        "is_active",
    )

