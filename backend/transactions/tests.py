from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from transactions.models import Category, Transaction
from budgets.models import Budget, SavingsGoal
from decimal import Decimal
import datetime


class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')

    def test_register_success(self):
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_duplicate_email(self):
        User.objects.create_user(
            username='existing',
            email='test@test.com',
            password='testpass123'
        )
        data = {
            'username': 'newuser',
            'email': 'test@test.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        response = self.client.post(self.login_url, {
            'email': 'test@test.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_login_wrong_password(self):
        User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        response = self.client.post(self.login_url, {
            'email': 'test@test.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TransactionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(
            user=self.user,
            name='Food',
            type='expense',
            color='#f97316'
        )

    def test_create_transaction(self):
        data = {
            'title': 'Lunch',
            'amount': '12.50',
            'type': 'expense',
            'date': '2026-03-01',
            'category': self.category.id
        }
        response = self.client.post('/api/transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Lunch')
        self.assertEqual(Decimal(response.data['amount']), Decimal('12.50'))

    def test_create_transaction_negative_amount(self):
        data = {
            'title': 'Bad transaction',
            'amount': '-50.00',
            'type': 'expense',
            'date': '2026-03-01',
        }
        response = self.client.post('/api/transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_transactions(self):
        Transaction.objects.create(
            user=self.user, title='T1', amount=10,
            type='expense', date=datetime.date.today(), category=self.category
        )
        Transaction.objects.create(
            user=self.user, title='T2', amount=20,
            type='income', date=datetime.date.today(), category=self.category
        )
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_type(self):
        Transaction.objects.create(
            user=self.user, title='Expense', amount=10,
            type='expense', date=datetime.date.today(), category=self.category
        )
        Transaction.objects.create(
            user=self.user, title='Income', amount=100,
            type='income', date=datetime.date.today(), category=self.category
        )
        response = self.client.get('/api/transactions/?type=expense')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_user_isolation(self):
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@test.com',
            password='testpass123'
        )
        Transaction.objects.create(
            user=other_user, title='Other', amount=10,
            type='expense', date=datetime.date.today()
        )
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_delete_transaction(self):
        tx = Transaction.objects.create(
            user=self.user, title='Delete me', amount=10,
            type='expense', date=datetime.date.today()
        )
        response = self.client.delete(f'/api/transactions/{tx.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class BudgetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(
            user=self.user, name='Food',
            type='expense', color='#f97316'
        )

    def test_create_budget(self):
        response = self.client.post('/api/budgets/', {
            'category': self.category.id,
            'amount': '500.00',
            'month': '2026-03'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['percentage_used'], 0.0)

    def test_budget_invalid_month_format(self):
        response = self.client.post('/api/budgets/', {
            'category': self.category.id,
            'amount': '500.00',
            'month': '03-2026'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_savings_goal_deposit(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            name='Vacation',
            target_amount=Decimal('1000.00'),
            saved_amount=Decimal('200.00'),
        )
        response = self.client.post(
            f'/api/goals/{goal.id}/deposit/',
            {'amount': 300}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Decimal(response.data['saved_amount']),
            Decimal('500.00')
        )
        self.assertEqual(response.data['progress_percentage'], 50.0)
