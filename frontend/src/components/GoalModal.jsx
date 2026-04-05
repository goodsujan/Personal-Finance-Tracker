import { useState, useEffect } from 'react'
import { DollarSign, Target, Calendar, Check } from 'lucide-react'
import api from '../api/axios'
import { useToast } from './ui/Toast'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

const DEFAULT_FORM = {
  name: '',
  target_amount: '',
  saved_amount: '',
  deadline: '',
  color: '#6366f1',
  status: 'active',
}

export default function GoalModal({ open, onClose, onSave, editData = null }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [noDeadline, setNoDeadline] = useState(true)
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (!open) return
    if (editData) {
      setForm({
        name: editData.name || '',
        target_amount: editData.target_amount || '',
        saved_amount: editData.saved_amount || '',
        deadline: editData.deadline || '',
        color: editData.color || '#6366f1',
        status: editData.status || 'active',
      })
      setNoDeadline(!editData.deadline)
    } else {
      setForm(DEFAULT_FORM)
      setNoDeadline(true)
    }
  }, [editData, open])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ message: 'Please enter a goal name.', type: 'error' })
      return
    }
    if (!form.target_amount || parseFloat(form.target_amount) <= 0) {
      toast({ message: 'Please enter a valid target amount.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        target_amount: form.target_amount,
        color: form.color,
        status: form.status,
        deadline: noDeadline ? null : (form.deadline || null),
      }
      if (!editData) {
        payload.saved_amount = form.saved_amount || '0'
      }

      if (editData) {
        await api.patch(`/goals/${editData.id}/`, payload)
        toast({ message: 'Goal updated!', type: 'success' })
      } else {
        await api.post('/goals/', payload)
        toast({ message: 'Goal created!', type: 'success' })
      }
      onSave()
      onClose()
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Something went wrong.'
      toast({ message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editData ? 'Edit Goal' : 'New Savings Goal'}
      size="md"
    >
      <div className="space-y-5">

        {/* Goal Name */}
        <Input
          label="Goal name"
          placeholder="e.g. Emergency Fund, Dream Vacation"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          leftIcon={<Target size={15} />}
        />

        {/* Target Amount */}
        <Input
          label="Target amount"
          type="number"
          step="0.01"
          min="1"
          placeholder="0.00"
          value={form.target_amount}
          onChange={e => set('target_amount', e.target.value)}
          leftIcon={<DollarSign size={15} />}
        />

        {/* Initial saved — create only */}
        {!editData && (
          <Input
            label={
              <span>
                Already saved{' '}
                <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </span>
            }
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.saved_amount}
            onChange={e => set('saved_amount', e.target.value)}
            leftIcon={<DollarSign size={15} />}
          />
        )}

        {/* Deadline */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Deadline
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                className="w-8 h-4 rounded-full relative transition-colors duration-200 flex-shrink-0"
                style={{ background: noDeadline ? 'var(--bg-tertiary)' : 'var(--accent)' }}
                onClick={() => setNoDeadline(p => !p)}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: noDeadline ? 'translateX(2px)' : 'translateX(18px)' }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {noDeadline ? 'No deadline' : 'Set deadline'}
              </span>
            </label>
          </div>
          {!noDeadline && (
            <Input
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              leftIcon={<Calendar size={15} />}
            />
          )}
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                className="w-8 h-8 rounded-full transition-transform duration-150 flex items-center justify-center flex-shrink-0"
                style={{
                  background: c,
                  transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: form.color === c ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${c}` : 'none',
                }}
                aria-label={`Select color ${c}`}
              >
                {form.color === c && <Check size={14} color="#fff" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Status — edit only */}
        {editData && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'active',    label: 'Active',    color: 'var(--accent)'  },
                { val: 'paused',    label: 'Paused',    color: 'var(--warning)' },
                { val: 'completed', label: 'Completed', color: 'var(--success)' },
              ].map(({ val, label, color }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('status', val)}
                  className="py-2 rounded-xl border-2 text-xs font-medium transition-all duration-150"
                  style={{
                    borderColor: form.status === val ? color : 'var(--border)',
                    background: form.status === val ? color + '15' : 'var(--bg-secondary)',
                    color: form.status === val ? color : 'var(--text-secondary)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            {editData ? 'Save changes' : 'Create goal'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
