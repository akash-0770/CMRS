
from rest_framework import serializers
from .models import BankDeposit


class BankDepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDeposit
        fields = "__all__"
        read_only_fields = [
            "id",
            "deposit_reference",
            "settled_amount",
            "status",
            "created_at",
        ]
