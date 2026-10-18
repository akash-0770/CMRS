
from rest_framework import serializers
from .models import CashCollection


class CashCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashCollection
        fields = [
            "id",
            "receipt_number",
            "schedule",
            "collected_by",
            "amount",
            "collected_at",
            "status",
            "remarks",
        ]
        read_only_fields = [
            "id",
            "receipt_number",
            "collected_by",
            "collected_at",
            "status",
        ]
