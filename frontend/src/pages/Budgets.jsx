import { useState } from 'react'
import {
  Plus, AlertTriangle, CheckCircle,
  TrendingUp, Edit2, Trash2
} from 'lucide-react'
import api from '../api/axios'
import { useFetch } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/Spinner'
import ProgressRing from '../components/ProgressRing'
import BudgetModal from '../components/BudgetModal'
import { formatCurrency, currentMonth } from '../utils/format'

export default function Budgets() {
  const toast = useToast()
  const [month, setMonth] = useState(currentMonth())
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data: budgets, loading, refetch } = useFetch('/budgets/', { month })
  const { data: alerts } = useFetch('/budgets/alerts/', { month })

  const list = Array.isArray(budgets) ? budgets : []
  const overBudget = alerts?.over_budget || []
  const nearLimit = alerts?.near_limit || []

  const totalBudgeted = list.reduce((s, b) => s + parseFloat(b.amount), 0)
  const totalSpent = list.reduce((s, b) => s + parseFloat(b.spent), 0)
  const overallPct = totalBudgeted > 0
    ? Math.round((totalSpent / totalBudgeted) * 100)
    : 0

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    setDeleting(id)
    try {
      await api.delete(`/budgets/${id}/`)
      toast({ message: 'Budget deleted.', type: 'success' })
      refetch()
    } catch {
      toast({ message: 'Failed to delete budget.', type: 'error' })
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (b) => {
    setEditData(b)
    setShowModal(true)
  }

  const statusOf = (b) => {
    if (b.is_over_budget) return 'over'
    if (b.percentage_used >= 80) return 'near'
    return 'ok'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Budgets</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {list.length} budget{list.length !== 1 ? 's' : ''} set for this month
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <Button
            onClick={() => { setEditData(null); setShowModal(true) }}
            className="gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> New Budget
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {overBudget.length > 0 && (
        <div className="bg-[var(--danger-light)] border border-[var(--danger)] border-opacity-30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} style={{ color: 'var(--danger)' }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
              Over budget in {overBudget.length} categor{overBudget.length > 1 ? 'ies' : 'y'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--danger)' }}>
              {overBudget.map(b => b.category_detail?.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {nearLimit.length > 0 && (
        <div className="bg-[var(--warning-light)] border border-[var(--warning)] border-opacity-30 rounded-2xl p-4 flex items-start gap-3">
          <TrendingUp size={18} style={{ color: 'var(--warning)' }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
              Approaching limit in {nearLimit.length} categor{nearLimit.length > 1 ? 'ies' : 'y'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--warning)' }}>
              {nearLimit.map(b => b.category_detail?.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Overview card */}
      {list.length > 0 && (
        <Card>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <ProgressRing
                percentage={overallPct}
                size={88}
                stroke={8}
                color="var(--accent)"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {overallPct}%
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)]">Overall spending</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudgeted)} budgeted
              </p>
              <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(overallPct, 100)}%`,
                    background: overallPct >= 100
                      ? 'var(--danger)'
                      : overallPct >= 80
                      ? 'var(--warning)'
                      : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Budget grid */}
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-light)' }}
            >
              <TrendingUp size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold text-[var(--text-primary)] mb-1">No budgets yet</p>
            <p className="text-sm text-[var(--text-muted)] mb-5 max-w-xs">
              Set monthly limits for your spending categories to stay on track
            </p>
            <Button
              onClick={() => { setEditData(null); setShowModal(true) }}
              className="gap-2"
            >
              <Plus size={16} /> Create your first budget
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(b => {
            const status = statusOf(b)
            const color = b.category_detail?.color || '#6366f1'

            return (
              <Card key={b.id} className="hover:shadow-[var(--shadow-md)] transition-shadow">
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {b.category_detail?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <Badge variant={
                    status === 'over' ? 'danger' :
                    status === 'near' ? 'warning' : 'success'
                  }>
                    {status === 'over' ? 'Over limit' :
                     status === 'near' ? 'Near limit' : 'On track'}
                  </Badge>
                </div>

                {/* Ring + amounts */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <ProgressRing
                      percentage={b.percentage_used}
                      size={72}
                      stroke={7}
                      color={color}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {Math.min(Math.round(b.percentage_used), 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-[var(--text-primary)] truncate">
                      {formatCurrency(b.spent)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      of {formatCurrency(b.amount)} budget
                    </p>
                    <p className={`text-xs font-medium mt-1 ${
                      b.is_over_budget
                        ? 'text-[var(--danger)]'
                        : 'text-[var(--success)]'
                    }`}>
                      {b.is_over_budget
                        ? `${formatCurrency(Math.abs(b.remaining))} over`
                        : `${formatCurrency(b.remaining)} remaining`
                      }
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(b.percentage_used, 100)}%`,
                      background: status === 'over'
                        ? 'var(--danger)'
                        : status === 'near'
                        ? 'var(--warning)'
                        : color,
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(b)}
                    className="flex-1 gap-1.5"
                  >
                    <Edit2 size={13} /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(b.id)}
                    disabled={deleting === b.id}
                    className="text-[var(--danger)] hover:bg-[var(--danger-light)]"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <BudgetModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        onSave={refetch}
        editData={editData}
      />
    </div>
  )
}
