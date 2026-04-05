import { useState, useEffect } from 'react'
import {
  X, DollarSign, Calendar, Tag,
  FileText, Upload, Check, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'
import api from '../api/axios'
import { useToast } from './ui/Toast'
import Button from './ui/Button'
import Input from './ui/Input'

export default function TransactionModal({ onClose, onSave, editData = null }) {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: '',
    note: '',
    receipt: null,
  })

  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data))
    if (editData) {
      setForm({
        title: editData.title || '',
        amount: editData.amount || '',
        type: editData.type || 'expense',
        date: editData.date || new Date().toISOString().split('T')[0],
        category: editData.category || '',
        note: editData.note || '',
        receipt: null,
      })
      if (editData.receipt_url) setPreview(editData.receipt_url)
      setStep(1)
    }
  }, [editData])

  const filteredCategories = categories.filter(c => c.type === form.type)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ message: 'File too large. Max 5MB.', type: 'error' })
      return
    }
    set('receipt', file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ message: 'Please enter a title.', type: 'error' })
      return
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast({ message: 'Please enter a valid amount.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('amount', form.amount)
      payload.append('type', form.type)
      payload.append('date', form.date)
      payload.append('note', form.note)
      if (form.category) payload.append('category', form.category)
      if (form.receipt) payload.append('receipt', form.receipt)

      if (editData) {
        await api.patch(`/transactions/${editData.id}/`, payload)
        toast({ message: 'Transaction updated!', type: 'success' })
      } else {
        await api.post('/transactions/', payload)
        toast({ message: 'Transaction added!', type: 'success' })
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--bg-card)] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-[var(--border)] shadow-[var(--shadow-lg)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              {editData ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Step {step} of 2 — {step === 1 ? 'Basic details' : 'Category & notes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-5 pt-4">
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: step >= s ? 'var(--accent)' : 'var(--bg-tertiary)' }}
            />
          ))}
        </div>

        <div className="px-5 py-5 space-y-5">

          {step === 1 && (
            <>
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'expense', label: 'Expense', icon: ArrowDownCircle, color: 'var(--danger)' },
                  { val: 'income',  label: 'Income',  icon: ArrowUpCircle,   color: 'var(--success)' },
                ].map(({ val, label, icon: Icon, color }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { set('type', val); set('category', '') }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150"
                    style={{
                      borderColor: form.type === val ? color : 'var(--border)',
                      background: form.type === val ? color + '10' : 'var(--bg-secondary)',
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: form.type === val ? color : 'var(--text-muted)' }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: form.type === val ? color : 'var(--text-secondary)' }}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Title */}
              <Input
                label="What was this for?"
                placeholder={form.type === 'expense' ? 'e.g. Grocery shopping' : 'e.g. Monthly salary'}
                value={form.title}
                onChange={e => set('title', e.target.value)}
                leftIcon={<FileText size={15} />}
              />

              {/* Amount */}
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                leftIcon={<DollarSign size={15} />}
              />

              {/* Date */}
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                leftIcon={<Calendar size={15} />}
              />
            </>
          )}

          {step === 2 && (
            <>
              {/* Category grid */}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Category</p>
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No categories found.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => set('category', cat.id)}
                        className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center"
                        style={{
                          borderColor: form.category === cat.id ? cat.color : 'var(--border)',
                          background: form.category === cat.id ? cat.color + '15' : 'var(--bg-secondary)',
                        }}
                      >
                        {form.category === cat.id && (
                          <Check size={12} style={{ color: cat.color }} className="absolute top-1 right-1" />
                        )}
                        <span
                          className="text-xs font-medium leading-tight"
                          style={{ color: form.category === cat.id ? cat.color : 'var(--text-secondary)' }}
                        >
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Note <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  placeholder="Add any extra details..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Receipt upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Receipt <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <label className="flex items-center gap-3 border-2 border-dashed border-[var(--border)] rounded-xl px-4 py-4 cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all group">
                  <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {form.receipt ? form.receipt.name : 'Click to upload receipt image'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
                {preview && (
                  <div className="mt-3 relative">
                    <img
                      src={preview}
                      alt="Receipt preview"
                      className="w-full max-h-36 object-cover rounded-xl border border-[var(--border)]"
                    />
                    <button
                      type="button"
                      onClick={() => { setPreview(null); set('receipt', null) }}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-[var(--danger)] text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={() => {
                if (!form.title.trim()) {
                  toast({ message: 'Please enter a title.', type: 'error' })
                  return
                }
                if (!form.amount || parseFloat(form.amount) <= 0) {
                  toast({ message: 'Please enter a valid amount.', type: 'error' })
                  return
                }
                setStep(2)
              }}
              className="flex-1"
            >
              Continue →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex-1"
            >
              {editData ? 'Save changes' : 'Add transaction'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
