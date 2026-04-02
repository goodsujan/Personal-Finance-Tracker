from decimal import Decimal
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Budget, SavingsGoal
from .serializers import BudgetSerializer, SavingsGoalSerializer

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
        return Response({
            'over_budget': self.get_serializer(over_budget, many=True).data,
            'near_limit': self.get_serializer(near_limit, many=True).data,
        })


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SavingsGoal.objects.filter(user=self.request.user)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        if goal.is_completed:
            goal.status = 'completed'
            goal.save()

    def perform_update(self, serializer):
        goal = serializer.save()
        if goal.is_completed and goal.status == 'active':
            goal.status = 'completed'
            goal.save()

    @action(detail=True, methods=['post'])
    def deposit(self, request, pk=None):
        goal = self.get_object()
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount is required.'}, status=400)
        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                raise ValueError
        except (ValueError, Exception):
            return Response({'error': 'Amount must be a positive number.'}, status=400)

        goal.saved_amount = goal.saved_amount + amount
        if goal.is_completed:
            goal.status = 'completed'
        goal.save()
        return Response(SavingsGoalSerializer(goal).data)
