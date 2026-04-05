import { useState } from 'react'
import {
  Plus, Target, CheckCircle, Calendar,
  Edit2, Trash2, TrendingUp, Sparkles,
  PiggyBank, DollarSign, X
} from 'lucide-react'
import api from '../api/axios'
import { useFetch } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import ProgressRing from '../components/ProgressRing'
import GoalModal from '../components/GoalModal'
import { formatCurrency, formatDate } from '../utils/format'

// ─── Filter tabs ────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active'    },
  { key: 'completed', label: 'Completed' },
  { key: 'paused',    label: 'Paused'    },
]

// ─── Goal card skeleton ──────────────────────────────────────────────────────
function GoalCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="w-[72px] h-[72px] rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Deposit Modal ────────────────────────────────────────────────────────────
function DepositModal({ goal, onClose, onDeposited }) {
  const toast = useToast()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const quickAmounts = [50, 100, 500]
  const remaining = parseFloat(goal.remaining_amount || 0)

  const handleDeposit = async () => {
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) {
      toast({ message: 'Please enter a valid amount.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const res = await api.post(`/goals/${goal.id}/deposit/`, { amount: num })
      toast({
        message: `Added ${formatCurrency(num)} to "${goal.name}"!`,
        type: 'success',
      })
      onDeposited(res.data)
      onClose()
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Deposit failed.'
      toast({ message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`Deposit — ${goal.name}`} size="sm">
      <div className="space-y-5">
        {/* Mini progress preview */}
        <div className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ background: goal.color + '12', border: `1px solid ${goal.color}30` }}>
          <div className="relative flex-shrink-0">
            <ProgressRing
              percentage={goal.progress_percentage}
              size={64}
              stroke={6}
              color={goal.color}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {Math.round(goal.progress_percentage)}%
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{goal.name}</p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {formatCurrency(goal.saved_amount)} saved of {formatCurrency(goal.target_amount)}
            </p>
            <p className="text-xs mt-1" style={{ color: goal.color }}>
              {formatCurrency(remaining)} remaining
            </p>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Quick add</p>
          <div className="flex gap-2">
            {quickAmounts.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150"
                style={{
                  borderColor: amount === String(q) ? goal.color : 'var(--border)',
                  background: amount === String(q) ? goal.color + '15' : 'var(--bg-secondary)',
                  color: amount === String(q) ? goal.color : 'var(--text-secondary)',
                }}
              >
                +${q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount input */}
        <Input
          label="Custom amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          leftIcon={<DollarSign size={15} />}
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleDeposit} loading={loading} className="flex-1">
            Add funds
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, onDelete, onDeposit }) {
  const color = goal.color || '#6366f1'
  const pct = Math.round(goal.progress_percentage || 0)
  const status = goal.status

  const badgeVariant =
    status === 'completed' ? 'success' :
    status === 'paused'    ? 'warning' : 'accent'

  return (
    <div
      className="border rounded-2xl p-5 flex flex-col gap-4 transition-shadow duration-200 hover:shadow-[var(--shadow-md)]"
      style={{
        background: goal.is_completed
          ? 'color-mix(in srgb, var(--bg-card) 95%, #10b981 5%)'
          : 'var(--bg-card)',
        borderColor: goal.is_completed ? '#10b98130' : 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: color }}
          />
          <p className="font-semibold text-[var(--text-primary)] truncate">{goal.name}</p>
        </div>
        <Badge variant={badgeVariant} className="flex-shrink-0 capitalize">
          {status}
        </Badge>
      </div>

      {/* Completed banner */}
      {goal.is_completed && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: '#10b98118', border: '1px solid #10b98130' }}
        >
          <Sparkles size={14} style={{ color: '#10b981' }} />
          <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
            🎉 Goal reached! Congratulations!
          </span>
        </div>
      )}

      {/* Ring + amounts */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ProgressRing
            percentage={goal.progress_percentage}
            size={72}
            stroke={7}
            color={color}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {Math.min(pct, 100)}%
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-[var(--text-primary)] truncate">
            {formatCurrency(goal.saved_amount)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            of {formatCurrency(goal.target_amount)} goal
          </p>
          <p className="text-xs font-medium mt-1" style={{
            color: goal.is_completed ? '#10b981' : 'var(--text-muted)'
          }}>
            {goal.is_completed
              ? '✓ Fully funded'
              : `${formatCurrency(goal.remaining_amount)} to go`
            }
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(goal.progress_percentage, 100)}%`,
            background: color,
          }}
        />
      </div>

      {/* Deadline info */}
      {goal.deadline && !goal.is_completed && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>
              {goal.days_remaining > 0
                ? `${goal.days_remaining} days left`
                : 'Deadline passed'}
            </span>
          </div>
          {goal.monthly_required && parseFloat(goal.monthly_required) > 0 && (
            <span className="font-medium" style={{ color }}>
              {formatCurrency(goal.monthly_required)}/mo needed
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          size="sm"
          onClick={() => onDeposit(goal)}
          className="flex-1 gap-1.5"
          disabled={goal.is_completed || status === 'paused'}
          style={!goal.is_completed && status !== 'paused' ? {
            background: color,
            borderColor: color,
          } : {}}
        >
          <PiggyBank size={13} /> Deposit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(goal)}
          className="gap-1.5"
        >
          <Edit2 size={13} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(goal.id)}
          className="text-[var(--danger)] hover:bg-[var(--danger-light)]"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Goals() {
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [depositGoal, setDepositGoal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const params = filter !== 'all' ? { status: filter } : {}
  const { data, loading, refetch, setData } = useFetch('/goals/', params)

  const goals = Array.isArray(data) ? data : []

  // Summary stats (always from full list — refetch with no filter for totals)
  const { data: allData } = useFetch('/goals/')
  const allGoals = Array.isArray(allData) ? allData : []
  const totalSaved    = allGoals.reduce((s, g) => s + parseFloat(g.saved_amount  || 0), 0)
  const totalTarget   = allGoals.reduce((s, g) => s + parseFloat(g.target_amount || 0), 0)
  const completedCount = allGoals.filter(g => g.is_completed).length

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return
    setDeleting(id)
    try {
      await api.delete(`/goals/${id}/`)
      toast({ message: 'Goal deleted.', type: 'success' })
      refetch()
    } catch {
      toast({ message: 'Failed to delete goal.', type: 'error' })
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (goal) => {
    setEditData(goal)
    setShowGoalModal(true)
  }

  // Optimistic update after deposit — patch the single goal in the list
  const handleDeposited = (updatedGoal) => {
    if (setData) {
      setData(prev =>
        Array.isArray(prev)
          ? prev.map(g => g.id === updatedGoal.id ? updatedGoal : g)
          : prev
      )
    } else {
      refetch()
    }
    setDepositGoal(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Savings Goals</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {allGoals.length} goal{allGoals.length !== 1 ? 's' : ''} · {completedCount} completed
          </p>
        </div>
        <Button
          onClick={() => { setEditData(null); setShowGoalModal(true) }}
          className="gap-2 whitespace-nowrap"
        >
          <Plus size={16} /> New Goal
        </Button>
      </div>

      {/* Summary strip */}
      {allGoals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total goals',    value: allGoals.length, isCurrency: false, color: 'var(--accent)'  },
            { label: 'Total saved',    value: totalSaved,      isCurrency: true,  color: 'var(--success)' },
            { label: 'Total target',   value: totalTarget,     isCurrency: true,  color: 'var(--warning)' },
            { label: 'Completed',      value: completedCount,  isCurrency: false, color: 'var(--success)' },
          ].map(({ label, value, isCurrency, color }) => (
            <div
              key={label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-4 py-3"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
              <p className="text-lg font-bold mt-0.5 truncate" style={{ color }}>
                {isCurrency ? formatCurrency(value) : value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: filter === f.key ? 'var(--bg-card)' : 'transparent',
              color: filter === f.key ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: filter === f.key ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Goal grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <GoalCardSkeleton key={i} />)}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-light)' }}
            >
              <Target size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold text-[var(--text-primary)] mb-1">
              {filter === 'all' ? 'No savings goals yet' : `No ${filter} goals`}
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-5 max-w-xs">
              {filter === 'all'
                ? 'Set a target, track your progress, and celebrate when you hit it!'
                : `Switch to "All" to see all your goals.`}
            </p>
            {filter === 'all' && (
              <Button
                onClick={() => { setEditData(null); setShowGoalModal(true) }}
                className="gap-2"
              >
                <Plus size={16} /> Create your first goal
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeposit={setDepositGoal}
            />
          ))}
        </div>
      )}

      {/* Goal create/edit modal */}
      <GoalModal
        open={showGoalModal}
        onClose={() => { setShowGoalModal(false); setEditData(null) }}
        onSave={refetch}
        editData={editData}
      />

      {/* Deposit modal */}
      {depositGoal && (
        <DepositModal
          goal={depositGoal}
          onClose={() => setDepositGoal(null)}
          onDeposited={handleDeposited}
        />
      )}
    </div>
  )
}
