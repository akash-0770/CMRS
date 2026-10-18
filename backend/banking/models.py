
from django.db import models
from reconciliation.models import CashSubmission


class BankDeposit(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SETTLED = "SETTLED", "Settled"
        FAILED = "FAILED", "Failed"

    deposit_reference = models.CharField(max_length=50, unique=True)
    submission = models.ForeignKey(
        CashSubmission,
        on_delete=models.PROTECT,
        related_name="bank_deposits",
    )
    bank_name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    deposit_date = models.DateField()
    bank_reference = models.CharField(max_length=100, unique=True)
    settled_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.deposit_reference
