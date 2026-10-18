
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CashCollection
from .serializers import CashCollectionSerializer
from .services import record_collection


class CashCollectionListCreateView(generics.ListCreateAPIView):
    serializer_class = CashCollectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CashCollection.objects.filter(
            collected_by=self.request.user
        ).order_by("-collected_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            collection = record_collection(
                schedule_id=serializer.validated_data["schedule"].id,
                collected_by=request.user,
                amount=serializer.validated_data["amount"],
                remarks=serializer.validated_data.get("remarks", ""),
            )
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages) from exc

        output = self.get_serializer(collection)
        return Response(output.data, status=status.HTTP_201_CREATED)
