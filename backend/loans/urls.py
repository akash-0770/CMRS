
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import LoanViewSet, RepaymentScheduleListView

router = DefaultRouter()
router.register("loans", LoanViewSet, basename="loan")

urlpatterns = [
    path(
        "repayment-schedules/",
        RepaymentScheduleListView.as_view(),
        name="repayment-schedules",
    ),
] + router.urls
