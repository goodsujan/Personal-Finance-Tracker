from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'type', 'icon',
            'color', 'is_default', 'transaction_count', 'created_at'
        ]
        read_only_fields = ['id', 'is_default', 'created_at']

    def get_transaction_count(self, obj):
        return obj.transactions.count()
