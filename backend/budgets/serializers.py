from rest_framework import serializers
from .models import Budget
from transactions.serializers import CategorySerializer

class BudgetSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    spent = serializers.ReadOnlyField()
    remaining = serializers.ReadOnlyField()
    percentage_used = serializers.ReadOnlyField()
    is_over_budget = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_detail',
            'amount', 'month', 'spent', 'remaining',
            'percentage_used', 'is_over_budget', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_category(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError(
                "You can only budget your own categories."
            )
        return value

    def validate_month(self, value):
        import re
        if not re.match(r'^\d{4}-\d{2}$', value):
            raise serializers.ValidationError(
                "Month must be in YYYY-MM format."
            )
        return value
