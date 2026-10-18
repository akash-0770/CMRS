
from django.urls import path
from .views import BankDepositListCreateView, SettleBankDepositView

urlpatterns = [
    path(
        "deposits/",
        BankDepositListCreateView.as_view(),
        name="bank-deposits",
    ),
    path(
        "deposits/<int:pk>/settle/",
        SettleBankDepositView.as_view(),
        name="settle-bank-deposit",
    ),
]
