
import uuid

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import BankDeposit
from .serializers import BankDepositSerializer
from decimal import Decimal, InvalidOperation
from django.db import transaction
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

class BankDepositListCreateView(generics.ListCreateAPIView):
    serializer_class = BankDepositSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BankDeposit.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            deposit_reference=f"DEP-{uuid.uuid4().hex[:16].upper()}"
        )


class SettleBankDepositView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        if request.user.role not in ["ADMIN", "BRANCH_USER"]:
            raise ValidationError(
                "Only admins or branch users can update settlements."
            )

        try:
            settled_amount = Decimal(str(request.data.get("settled_amount")))
        except (InvalidOperation, TypeError, ValueError):
            raise ValidationError(
                {"settled_amount": "Enter a valid amount."}
            )

        if not settled_amount.is_finite() or settled_amount < Decimal("0"):
            raise ValidationError(
                {"settled_amount": "Amount cannot be negative."}
            )

        try:
            deposit = BankDeposit.objects.select_for_update().get(pk=pk)
        except BankDeposit.DoesNotExist:
            return Response(
                {"detail": "Bank deposit not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if deposit.status != BankDeposit.Status.PENDING:
            raise ValidationError(
                "This deposit has already been processed."
            )

        deposit.settled_amount = settled_amount
        deposit.status = (
            BankDeposit.Status.SETTLED
            if settled_amount == deposit.amount
            else BankDeposit.Status.FAILED
        )
        deposit.save(update_fields=["settled_amount", "status"])

        return Response(BankDepositSerializer(deposit).data)
