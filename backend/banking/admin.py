
from django.contrib import admin
from .models import BankDeposit


@admin.register(BankDeposit)
class BankDepositAdmin(admin.ModelAdmin):
    list_display = (
        "deposit_reference",
        "submission",
        "bank_name",
        "amount",
        "bank_reference",
        "settled_amount",
        "status",
        "deposit_date",
    )

    search_fields = (
        "deposit_reference",
        "bank_reference",
        "bank_name",
    )

    list_filter = (
        "status",
        "bank_name",
        "deposit_date",
    )

    readonly_fields = ("created_at",)
