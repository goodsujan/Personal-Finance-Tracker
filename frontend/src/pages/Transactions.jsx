import { useState, useCallback } from 'react'
import api from '../api/axios'
import { useFetch } from '../hooks/useApi'
import TransactionModal from '../components/TransactionModal'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDate, currentMonth } from '../utils/format'

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth())
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const params = { month }
  if (typeFilter) params.type = typeFilter
  if (search) params.search = search

  const { data, loading, refetch } = useFetch('/transactions/', params)
  const transactions = Array.isArray(data) ? data : []

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    setDeleting(id)
    try {
      await api.delete(`/transactions/${id}/`)
      refetch()
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (tx) => {
    setEditData(tx)
    setShowModal(true)
  }

  const handleExport = () => {
    const base = 'http://localhost:8000/api/export/'
    const token = localStorage.getItem('access_token')
    const url = `${base}?month=${month}${typeFilter ? `&type=${typeFilter}` : ''}`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `transactions_${month}.csv`
        a.click()
      })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="border border-gray-200 text-gray-600 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => { setEditData(null); setShowModal(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="💸"
            title="No transactions found"
            message="Try adjusting your filters or add a new transaction"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Transaction</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 hidden md:table-cell">Date</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">Amount</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: (tx.category_detail?.color || '#6366f1') + '20' }}
                        >
                          <span style={{ color: tx.category_detail?.color || '#6366f1' }}>
                            {tx.type === 'income' ? '↑' : '↓'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{tx.title}</p>
                          {tx.note && (
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{tx.note}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: (tx.category_detail?.color || '#6366f1') + '15',
                          color: tx.category_detail?.color || '#6366f1'
                        }}
                      >
                        {tx.category_detail?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-semibold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {tx.receipt_url && (
                          <a
                            href={tx.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors text-xs"
                            title="View receipt"
                          >
                            📎
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors text-xs"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deleting === tx.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs"
                        >
                          {deleting === tx.id ? '...' : '✕'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditData(null) }}
          onSave={refetch}
          editData={editData}
        />
      )}
    </div>
  )
}
