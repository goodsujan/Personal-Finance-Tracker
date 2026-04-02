import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function TransactionModal({ onClose, onSave, editData = null }) {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: '',
    note: '',
    receipt: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data))
    if (editData) {
      setForm({
        title: editData.title || '',
        amount: editData.amount || '',
        type: editData.type || 'expense',
        date: editData.date || '',
        category: editData.category || '',
        note: editData.note || '',
        receipt: null,
      })
      if (editData.receipt_url) setPreview(editData.receipt_url)
    }
  }, [editData])

  const filtered = categories.filter(c => c.type === form.type)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm({ ...form, receipt: file })
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
      } else {
        await api.post('/transactions/', payload)
      }
      onSave()
      onClose()
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Something went wrong.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {editData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category: '' })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t === 'expense' ? '↓ Expense' : '↑ Income'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Grocery shopping"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select category</option>
              {filtered.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              rows={2}
              placeholder="Add a note..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Receipt upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-400 transition-colors">
              <span className="text-gray-400 text-lg">📎</span>
              <span className="text-sm text-gray-500">
                {form.receipt ? form.receipt.name : 'Click to upload receipt'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            {preview && (
              <img
                src={preview}
                alt="Receipt preview"
                className="mt-2 rounded-xl w-full max-h-32 object-cover border border-gray-100"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : editData ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
