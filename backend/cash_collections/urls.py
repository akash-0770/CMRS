
from django.urls import path
from .views import CashCollectionListCreateView

urlpatterns = [
    path(
        "collections/",
        CashCollectionListCreateView.as_view(),
        name="cash-collections",
    ),
]
