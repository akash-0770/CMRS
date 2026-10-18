
from decimal import Decimal

from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cash_collections.models import CashCollection
from reconciliation.models import CashSubmission
from banking.models import BankDeposit


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_collected = (
            CashCollection.objects.filter(
                status__in=[
                    CashCollection.Status.COLLECTED,
                    CashCollection.Status.SUBMITTED,
                    CashCollection.Status.RECONCILED,
                ]
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        pending_reconciliation = CashSubmission.objects.filter(
            status=CashSubmission.Status.PENDING
        ).count()

        total_deposited = (
            BankDeposit.objects.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        total_settled = (
            BankDeposit.objects.filter(
                status=BankDeposit.Status.SETTLED
            ).aggregate(total=Sum("settled_amount"))["total"]
            or Decimal("0.00")
        )

        return Response({
            "total_collected": str(total_collected),
            "pending_reconciliation": pending_reconciliation,
            "total_deposited": str(total_deposited),
            "total_settled": str(total_settled),
        })
