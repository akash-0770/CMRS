from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Loan
from .serializers import LoanSerializer
from rest_framework.generics import ListAPIView
from .models import RepaymentSchedule
from rest_framework import serializers


class LoanViewSet(ModelViewSet):
    queryset = Loan.objects.select_related("customer").all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]


class RepaymentScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepaymentSchedule
        fields = "__all__"


class RepaymentScheduleListView(ListAPIView):
    queryset = RepaymentSchedule.objects.select_related("loan").all()
    serializer_class = RepaymentScheduleSerializer
    permission_classes = [IsAuthenticated]
