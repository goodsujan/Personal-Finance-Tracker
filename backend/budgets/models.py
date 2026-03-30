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
    month = models.CharField(max_length=7)  # format: YYYY-MM
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
