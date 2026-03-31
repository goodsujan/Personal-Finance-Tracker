from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from decimal import Decimal
from .models import Transaction, Category


def get_summary(user, month=None, year=None):
    queryset = Transaction.objects.filter(user=user)
    if month:
        y, m = month.split('-')
        queryset = queryset.filter(date__year=y, date__month=m)
    elif year:
        queryset = queryset.filter(date__year=year)

    income = queryset.filter(type='income').aggregate(
        total=Sum('amount'))['total'] or Decimal('0')
    expense = queryset.filter(type='expense').aggregate(
        total=Sum('amount'))['total'] or Decimal('0')

    return {
        'total_income': income,
        'total_expense': expense,
        'net_balance': income - expense,
        'transaction_count': queryset.count(),
        'avg_expense': queryset.filter(type='expense').aggregate(
            avg=Avg('amount'))['avg'] or Decimal('0'),
    }


def get_category_breakdown(user, month=None, year=None, type='expense'):
    queryset = Transaction.objects.filter(user=user, type=type)
    if month:
        y, m = month.split('-')
        queryset = queryset.filter(date__year=y, date__month=m)
    elif year:
        queryset = queryset.filter(date__year=year)

    breakdown = (
        queryset
        .values('category__id', 'category__name', 'category__color', 'category__icon')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('-total')
    )

    total = sum(item['total'] for item in breakdown) or Decimal('1')

    return [
        {
            'category_id': item['category__id'],
            'category_name': item['category__name'] or 'Uncategorized',
            'color': item['category__color'] or '#6b7280',
            'icon': item['category__icon'] or '',
            'total': item['total'],
            'count': item['count'],
            'percentage': round(float(item['total'] / total) * 100, 1),
        }
        for item in breakdown
    ]


def get_monthly_trend(user, year=None, months=6):
    from django.utils import timezone
    import datetime

    queryset = Transaction.objects.filter(user=user)
    if year:
        queryset = queryset.filter(date__year=year)
    else:
        cutoff = timezone.now().date() - datetime.timedelta(days=months * 30)
        queryset = queryset.filter(date__gte=cutoff)

    monthly = (
        queryset
        .annotate(month=TruncMonth('date'))
        .values('month', 'type')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    result = {}
    for item in monthly:
        key = item['month'].strftime('%Y-%m')
        if key not in result:
            result[key] = {
                'month': key,
                'label': item['month'].strftime('%b %Y'),
                'income': Decimal('0'),
                'expense': Decimal('0'),
            }
        result[key][item['type']] = item['total']

    for key in result:
        result[key]['net'] = result[key]['income'] - result[key]['expense']

    return sorted(result.values(), key=lambda x: x['month'])


def get_recent_transactions(user, limit=5):
    return Transaction.objects.filter(user=user).select_related(
        'category'
    ).order_by('-date', '-created_at')[:limit]
