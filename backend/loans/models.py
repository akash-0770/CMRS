
from django.db import models
from customers.models import Customer


class Loan(models.Model):
    loan_id = models.CharField(max_length=30, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="loans",
    )
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    tenure_months = models.PositiveIntegerField()
    start_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.loan_id} - {self.customer.full_name}"


class RepaymentSchedule(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"

    loan = models.ForeignKey(
        Loan,
        on_delete=models.PROTECT,
        related_name="repayment_schedules",
    )
    installment_number = models.PositiveIntegerField()
    due_date = models.DateField()
    installment_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["loan", "installment_number"],
                name="unique_loan_installment",
            )
        ]

    def __str__(self):
        return f"{self.loan.loan_id} - Installment {self.installment_number}"
