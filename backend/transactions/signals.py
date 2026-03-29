from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Category

DEFAULT_CATEGORIES = [
    # Expense categories
    {'name': 'Food & Dining',    'type': 'expense', 'icon': 'utensils',    'color': '#f97316'},
    {'name': 'Transport',        'type': 'expense', 'icon': 'car',         'color': '#3b82f6'},
    {'name': 'Shopping',         'type': 'expense', 'icon': 'shopping-bag','color': '#ec4899'},
    {'name': 'Bills & Utilities','type': 'expense', 'icon': 'zap',         'color': '#eab308'},
    {'name': 'Health',           'type': 'expense', 'icon': 'heart',       'color': '#ef4444'},
    {'name': 'Entertainment',    'type': 'expense', 'icon': 'tv',          'color': '#8b5cf6'},
    {'name': 'Education',        'type': 'expense', 'icon': 'book',        'color': '#06b6d4'},
    {'name': 'Other Expense',    'type': 'expense', 'icon': 'more-horizontal','color': '#6b7280'},
    # Income categories
    {'name': 'Salary',           'type': 'income',  'icon': 'briefcase',   'color': '#10b981'},
    {'name': 'Freelance',        'type': 'income',  'icon': 'code',        'color': '#14b8a6'},
    {'name': 'Investment',       'type': 'income',  'icon': 'trending-up', 'color': '#6366f1'},
    {'name': 'Other Income',     'type': 'income',  'icon': 'plus-circle', 'color': '#84cc16'},
]

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        Category.objects.bulk_create([
            Category(user=instance, is_default=True, **cat)
            for cat in DEFAULT_CATEGORIES
        ])
