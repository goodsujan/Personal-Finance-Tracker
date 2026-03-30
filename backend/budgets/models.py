from django.db import models
from django.conf import settings
from transactions.models import Category

class Budget(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-month']
        unique_together = ['user', 'category', 'month']

    def __str__(self):
        return f"{self.user.email} — {self.category.name} — {self.month}"

    @property
    def spent(self):
        from transactions.models import Transaction
        year, month = self.month.split('-')
        total = self.category.transactions.filter(
            user=self.user,
            type='expense',
            date__year=year,
            date__month=month
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        return total

    @property
    def remaining(self):
        return self.amount - self.spent

    @property
    def percentage_used(self):
        if self.amount == 0:
            return 0
        return round((self.spent / self.amount) * 100, 1)

    @property
    def is_over_budget(self):
        return self.spent > self.amount


class SavingsGoal(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='savings_goals'
    )
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    icon = models.CharField(max_length=50, blank=True, default='target')
    color = models.CharField(max_length=7, blank=True, default='#6366f1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.user.email}"

    @property
    def remaining_amount(self):
        return max(self.target_amount - self.saved_amount, 0)

    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return min(round((self.saved_amount / self.target_amount) * 100, 1), 100)

    @property
    def is_completed(self):
        return self.saved_amount >= self.target_amount

    @property
    def days_remaining(self):
        if not self.deadline:
            return None
        from django.utils import timezone
        delta = self.deadline - timezone.now().date()
        return max(delta.days, 0)

    @property
    def monthly_required(self):
        if not self.deadline or self.days_remaining == 0:
            return None
        months = self.days_remaining / 30
        if months <= 0:
            return None
        return round(float(self.remaining_amount) / months, 2)