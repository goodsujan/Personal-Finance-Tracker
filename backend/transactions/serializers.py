from rest_framework import serializers
from .models import Category, Transaction

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


class TransactionSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    receipt_url = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'title', 'amount', 'type', 'date',
            'note', 'receipt', 'receipt_url',
            'category', 'category_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'receipt': {'write_only': True}
        }

    def get_receipt_url(self, obj):
        request = self.context.get('request')
        if obj.receipt and request:
            return request.build_absolute_uri(obj.receipt.url)
        return None

    def validate_category(self, value):
        request = self.context.get('request')
        if value and value.user != request.user:
            raise serializers.ValidationError(
                "You can only use your own categories."
            )
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )
        return value