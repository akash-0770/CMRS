
import uuid
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CashSubmission
from .serializers import CashSubmissionSerializer
from cash_collections.models import CashCollection


class CashSubmissionListCreateView(ListCreateAPIView):
    serializer_class = CashSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["ADMIN", "BRANCH_MANAGER"]:
            return CashSubmission.objects.all().order_by("-submitted_at")

        return CashSubmission.objects.filter(
            agent=user
        ).order_by("-submitted_at")

    def perform_create(self, serializer):
        expected_amount = (
            CashCollection.objects.filter(
                collected_by=self.request.user,
                status=CashCollection.Status.COLLECTED,
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        serializer.save(
            submission_number=f"SUB-{uuid.uuid4().hex[:16].upper()}",
            agent=self.request.user,
            expected_amount=expected_amount,
        )


class ReconcileCashSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        if request.user.role not in ["ADMIN", "BRANCH_MANAGER"]:
            raise ValidationError(
                "Only branch managers or admins can reconcile submissions."
            )

        try:
            actual_amount = Decimal(
                str(request.data.get("actual_amount"))
            )
        except (InvalidOperation, TypeError, ValueError):
            raise ValidationError(
                {"actual_amount": "Enter a valid amount."}
            )

        if not actual_amount.is_finite() or actual_amount < Decimal("0"):
            raise ValidationError(
                {"actual_amount": "Amount cannot be negative."}
            )

        try:
            submission = CashSubmission.objects.select_for_update().get(
                pk=pk
            )
        except CashSubmission.DoesNotExist:
            return Response(
                {"detail": "Cash submission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if submission.status != CashSubmission.Status.PENDING:
            raise ValidationError(
                "This submission has already been reconciled."
            )

        discrepancy = submission.expected_amount - actual_amount

        submission.actual_amount = actual_amount
        submission.discrepancy = discrepancy
        submission.status = (
            CashSubmission.Status.APPROVED
            if discrepancy == Decimal("0.00")
            else CashSubmission.Status.REJECTED
        )
        submission.reconciled_by = request.user
        submission.reconciled_at = timezone.now()

        submission.save(
            update_fields=[
                "actual_amount",
                "discrepancy",
                "status",
                "reconciled_by",
                "reconciled_at",
            ]
        )

        return Response(CashSubmissionSerializer(submission).data)
