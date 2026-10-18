
from django.contrib import admin
from .models import CashSubmission


@admin.register(CashSubmission)
class CashSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "submission_number",
        "agent",
        "branch_name",
        "expected_amount",
        "actual_amount",
        "discrepancy",
        "status",
        "submitted_at",
    )

    search_fields = (
        "submission_number",
        "agent__username",
        "branch_name",
    )

    list_filter = (
        "status",
        "branch_name",
        "submitted_at",
    )

    readonly_fields = (
        "submission_number",
        "expected_amount",
        "discrepancy",
        "submitted_at",
        "reconciled_at",
    )
