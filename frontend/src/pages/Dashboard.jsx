import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Wallet, Activity,
  ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react'
import { useFetch } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import AnimatedStatCard from '../components/AnimatedStatCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { StatCardSkeleton, TableRowSkeleton } from '../components/ui/Skeleton'
import { formatCurrency, formatDate, currentMonth } from '../utils/format'

export default function Dashboard() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth())
  const { data, loading } = useFetch('/summary/', { month })

  const summary = data?.summary
  const recent = data?.recent_transactions || []
  const breakdown = data?.category_breakdown || []

  const netBalance = parseFloat(summary?.net_balance || 0)
  const isPositive = netBalance >= 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Good {getGreeting()}, {user?.username} 👋
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Your financial overview for{' '}
            <span className="font-medium text-[var(--text-secondary)]">
              {formatMonthLabel(month)}
            </span>
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Hero net balance card */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Net Balance</p>
          {loading ? (
            <div className="h-10 w-48 bg-white/20 rounded-xl animate-pulse" />
          ) : (
            <p className="text-4xl font-bold tracking-tight">
              {formatCurrency(summary?.net_balance || 0)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
              isPositive ? 'bg-white/20' : 'bg-red-400/30'
            }`}>
              {isPositive
                ? <TrendingUp size={13} />
                : <TrendingDown size={13} />
              }
              {isPositive ? 'On track' : 'Over budget'}
            </span>
            <span className="text-white/60 text-sm">
              {summary?.transaction_count || 0} transactions this month
            </span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full bg-white/5" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <AnimatedStatCard
              title="Total income this month"
              value={summary?.total_income || 0}
              icon={TrendingUp}
              color="success"
              prefix="$"
            />
            <AnimatedStatCard
              title="Total expenses this month"
              value={summary?.total_expense || 0}
              icon={TrendingDown}
              color="danger"
              prefix="$"
            />
            <AnimatedStatCard
              title="Avg. expense per transaction"
              value={summary?.avg_expense || 0}
              icon={Activity}
              color="warning"
              prefix="$"
            />
          </>
        )}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Recent transactions — 3 cols */}
        <Card padding={false} className="lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Recent Transactions
            </h3>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ChevronRight size={14} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <table className="w-full">
              <tbody>
                {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} cols={3} />)}
              </tbody>
            </table>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Wallet size={32} className="mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium text-[var(--text-secondary)]">No transactions yet</p>
              <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">
                Add your first transaction to get started
              </p>
              <Link to="/transactions">
                <Button size="sm">Add transaction</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recent.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: (tx.category_detail?.color || '#6366f1') + '20' }}
                  >
                    {tx.type === 'income'
                      ? <ArrowUpRight size={16} style={{ color: 'var(--success)' }} />
                      : <ArrowDownRight size={16} style={{ color: 'var(--danger)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {tx.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {tx.category_detail?.name || 'Uncategorized'} · {formatDate(tx.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'income'
                        ? 'text-[var(--success)]'
                        : 'text-[var(--danger)]'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                      {tx.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Category breakdown — 2 cols */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Top Spending</h3>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="gap-1">
                Details <ChevronRight size={14} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                    <div className="h-3.5 w-12 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : breakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity size={28} className="mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm text-[var(--text-muted)]">No spending data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breakdown.slice(0, 5).map(cat => (
                <div key={cat.category_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: cat.color }}
                      />
                      <span className="text-sm text-[var(--text-secondary)] truncate">
                        {cat.category_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {cat.percentage}%
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${cat.percentage}%`,
                        background: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-')
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  })
}
