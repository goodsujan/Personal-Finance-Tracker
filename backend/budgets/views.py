from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Budget
from .serializers import BudgetSerializer

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        if month:
            queryset = queryset.filter(month=month)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        month = request.query_params.get('month')
        queryset = self.get_queryset()
        if month:
            queryset = queryset.filter(month=month)
        over_budget = [b for b in queryset if b.is_over_budget]
        near_limit = [b for b in queryset if not b.is_over_budget and b.percentage_used >= 80]
        serializer = self.get_serializer(over_budget + near_limit, many=True)
        return Response({
            'over_budget': self.get_serializer(over_budget, many=True).data,
            'near_limit': self.get_serializer(near_limit, many=True).data,
        })
