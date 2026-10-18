from rest_framework import serializers
from .models import Loan


class LoanSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.full_name",
        read_only=True,
    )

    class Meta:
        model = Loan
        fields = "__all__"