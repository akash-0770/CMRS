
import uuid
from decimal import Decimal

from django.db import transaction
from django.core.exceptions import ValidationError

from .models import CashCollection
from loans.models import RepaymentSchedule


@transaction.atomic
def record_collection(*, schedule_id, collected_by, amount, remarks=""):
    try:
        amount = Decimal(str(amount))
    except (ValueError, TypeError):
        raise ValidationError("Enter a valid payment amount.")

    if not amount.is_finite() or amount <= Decimal("0"):
        raise ValidationError("Payment amount must be greater than zero.")

    schedule = RepaymentSchedule.objects.select_for_update().get(
        id=schedule_id
    )

    balance = schedule.installment_amount - schedule.paid_amount

    if balance <= Decimal("0"):
        raise ValidationError("This installment is already fully paid.")

    if amount > balance:
        raise ValidationError(
            f"Collection exceeds the remaining installment balance: {balance}."
        )

    collection = CashCollection.objects.create(
        receipt_number=f"RCPT-{uuid.uuid4().hex[:16].upper()}",
        schedule=schedule,
        collected_by=collected_by,
        amount=amount,
        remarks=remarks,
    )

    schedule.paid_amount += amount

    if schedule.paid_amount >= schedule.installment_amount:
        schedule.status = RepaymentSchedule.Status.PAID
    else:
        schedule.status = RepaymentSchedule.Status.PARTIAL

    schedule.save(update_fields=["paid_amount", "status"])

    return collection
