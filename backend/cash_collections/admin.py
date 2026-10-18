
from django.contrib import admin
from .models import CashCollection


@admin.register(CashCollection)
class CashCollectionAdmin(admin.ModelAdmin):
    list_display = (
        "receipt_number",
        "schedule",
        "collected_by",
        "amount",
        "collected_at",
        "status",
    )

    search_fields = (
        "receipt_number",
        "schedule__loan__loan_id",
        "collected_by__username",
    )

    list_filter = (
        "status",
        "collected_at",
    )

    readonly_fields = ("receipt_number", "collected_at")
