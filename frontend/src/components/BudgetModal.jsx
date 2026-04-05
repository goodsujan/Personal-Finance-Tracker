import { useState, useEffect } from 'react'
import { DollarSign, Calendar } from 'lucide-react'
import api from '../api/axios'
import { useToast } from './ui/Toast'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import { currentMonth } from '../utils/format'

export default function BudgetModal({ open, onClose, onSave, editData = null }) {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: '',
    amount: '',
    month: currentMonth(),
  })

  useEffect(() => {
    api.get('/categories/?type=expense').then(res => setCategories(res.data))
    if (editData) {
      setForm({
        category: editData.category || '',
        amount: editData.amount || '',
        month: editData.month || currentMonth(),
      })
    } else {
      setForm({ category: '', amount: '', month: currentMonth() })
    }
  }, [editData, open])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.category) {
      toast({ message: 'Please select a category.', type: 'error' })
      return
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast({ message: 'Please enter a valid amount.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      if (editData) {
        await api.patch(`/budgets/${editData.id}/`, form)
        toast({ message: 'Budget updated!', type: 'success' })
      } else {
        await api.post('/budgets/', form)
        toast({ message: 'Budget created!', type: 'success' })
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
      title={editData ? 'Edit Budget' : 'New Budget'}
    >
      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => set('category', cat.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: form.category === cat.id
                    ? cat.color : 'var(--border)',
                  background: form.category === cat.id
                    ? cat.color + '12' : 'var(--bg-secondary)',
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <span
                  className="text-xs font-medium truncate"
                  style={{
                    color: form.category === cat.id
                      ? cat.color : 'var(--text-secondary)'
                  }}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Monthly budget limit"
          type="number"
          step="0.01"
          min="1"
          placeholder="0.00"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          leftIcon={<DollarSign size={15} />}
        />

        {/* Month */}
        <Input
          label="Month"
          type="month"
          value={form.month}
          onChange={e => set('month', e.target.value)}
          leftIcon={<Calendar size={15} />}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            {editData ? 'Save changes' : 'Create budget'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
