
from rest_framework import serializers
from .models import CashSubmission


class CashSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashSubmission
        fields = "__all__"
        read_only_fields = [
            "id",
            "submission_number",
            "agent",
            "expected_amount",
            "actual_amount",
            "discrepancy",
            "status",
            "submitted_at",
            "reconciled_by",
            "reconciled_at",
        ]
