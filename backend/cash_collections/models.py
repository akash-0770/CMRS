
from django.conf import settings
from django.db import models
from loans.models import RepaymentSchedule


class CashCollection(models.Model):
    class Status(models.TextChoices):
        COLLECTED = "COLLECTED", "Collected"
        SUBMITTED = "SUBMITTED", "Submitted"
        RECONCILED = "RECONCILED", "Reconciled"
        REJECTED = "REJECTED", "Rejected"

    receipt_number = models.CharField(max_length=40, unique=True)
    schedule = models.ForeignKey(
        RepaymentSchedule,
        on_delete=models.PROTECT,
        related_name="collections",
    )
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="cash_collections",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    collected_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.COLLECTED,
    )
    remarks = models.TextField(blank=True)

    def __str__(self):
        return self.receipt_number
