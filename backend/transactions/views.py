from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer
from .analytics import (
    get_summary, get_category_breakdown,
    get_monthly_trend, get_recent_transactions
)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        if category.is_default:
            return Response(
                {'error': 'Default categories cannot be deleted.'},
                status=400
            )
        return super().destroy(request, *args, **kwargs)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['type', 'category']
    search_fields = ['title', 'note']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        start = self.request.query_params.get('start_date')
        end = self.request.query_params.get('end_date')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if start:
            queryset = queryset.filter(date__gte=start)
        if end:
            queryset = queryset.filter(date__lte=end)
        if month:
            year_part, month_part = month.split('-')
            queryset = queryset.filter(
                date__year=year_part, date__month=month_part)
        if year:
            queryset = queryset.filter(date__year=year)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        breakdown_type = request.query_params.get('type', 'expense')

        summary = get_summary(request.user, month=month, year=year)
        category_breakdown = get_category_breakdown(
            request.user, month=month, year=year, type=breakdown_type
        )
        monthly_trend = get_monthly_trend(request.user, year=year)
        recent = get_recent_transactions(request.user, limit=5)
        recent_data = TransactionSerializer(
            recent, many=True, context={'request': request}
        ).data

        return Response({
            'summary': {
                'total_income': summary['total_income'],
                'total_expense': summary['total_expense'],
                'net_balance': summary['net_balance'],
                'transaction_count': summary['transaction_count'],
                'avg_expense': summary['avg_expense'],
            },
            'category_breakdown': category_breakdown,
            'monthly_trend': monthly_trend,
            'recent_transactions': recent_data,
        })
