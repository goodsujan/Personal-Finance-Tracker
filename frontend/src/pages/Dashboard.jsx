import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useApi'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDate, currentMonth } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth())
  const { data, loading, error } = useFetch('/summary/', { month })

  const summary = data?.summary
  const recent = data?.recent_transactions || []
  const breakdown = data?.category_breakdown || []

  if (loading) return <Spinner />
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>
  )

  const netPositive = parseFloat(summary?.net_balance) >= 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Good day, {user?.username} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's your financial overview
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.total_income)}
          sub="This month"
          color="green"
          icon="↑"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.total_expense)}
          sub="This month"
          color="red"
          icon="↓"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.net_balance)}
          sub={netPositive ? 'You are saving well' : 'Overspending this month'}
          color={netPositive ? 'indigo' : 'amber'}
          icon="◈"
        />
        <StatCard
          title="Transactions"
          value={summary?.transaction_count || 0}
          sub="This month"
          color="indigo"
          icon="↕"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <Link
              to="/transactions"
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon="💸"
              title="No transactions yet"
              message="Add your first transaction to get started"
            />
          ) : (
            <div className="space-y-3">
              {recent.map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: tx.category_detail?.color + '20' }}
                  >
                    <span style={{ color: tx.category_detail?.color }}>
                      {tx.type === 'income' ? '↑' : '↓'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.category_detail?.name || 'Uncategorized'} · {formatDate(tx.date)}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${
                    tx.type === 'income' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Spending Categories</h3>
            <Link
              to="/analytics"
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Full report
            </Link>
          </div>

          {breakdown.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No spending data"
              message="Your category breakdown will appear here"
            />
          ) : (
            <div className="space-y-3">
              {breakdown.slice(0, 5).map(cat => (
                <div key={cat.category_id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-gray-700">{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{cat.percentage}%</span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
