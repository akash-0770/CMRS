
from django.urls import path
from .views import (
    CashSubmissionListCreateView,
    ReconcileCashSubmissionView,
)

urlpatterns = [
    path(
        "submissions/",
        CashSubmissionListCreateView.as_view(),
        name="cash-submissions",
    ),
    path(
        "submissions/<int:pk>/reconcile/",
        ReconcileCashSubmissionView.as_view(),
        name="reconcile-cash-submission",
    ),
]
