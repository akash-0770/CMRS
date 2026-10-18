
from django.contrib import admin
from .models import Loan
from .models import RepaymentSchedule
@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = (
        "loan_id",
        "customer",
        "principal_amount",
        "interest_rate",
        "tenure_months",
        "start_date",
        "is_active",
    )

    search_fields = (
        "loan_id",
        "customer__full_name",
        "customer__customer_id",
    )

    list_filter = (
        "is_active",
        "start_date",
    )

@admin.register(RepaymentSchedule)
class RepaymentScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "loan",
        "installment_number",
        "due_date",
        "installment_amount",
        "paid_amount",
        "status",
    )

    search_fields = ("loan__loan_id",)

    list_filter = ("status", "due_date")
