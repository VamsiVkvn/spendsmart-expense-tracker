import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || '/api'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']

const CAT_COLORS = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Bills: 'bg-red-100 text-red-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Health: 'bg-green-100 text-green-700',
  Education: 'bg-indigo-100 text-indigo-700',
  Other: 'bg-gray-100 text-gray-700',
}

const CAT_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '🧾',
  Entertainment: '🎬', Health: '💊', Education: '📚', Other: '📦',
}

function Modal({ open, onClose, onSave, editData }) {
  const empty = { title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], note: '' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        amount: editData.amount,
        category: editData.category,
        date: editData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        note: editData.note || '',
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [editData, open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">{editData ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text" required value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Lunch at Cafe"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number" required min="0" step="0.01" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date" required value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input
              type="text" value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Any extra details..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm">
              {loading ? 'Saving...' : editData ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = { month: filterMonth, year: filterYear }
      if (filterCat !== 'All') params.category = filterCat
      const res = await axios.get(`${API}/expenses`, { params })
      setExpenses(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterMonth, filterYear, filterCat])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleSave = async (data) => {
    if (editData) {
      await axios.put(`${API}/expenses/${editData._id}`, data)
    } else {
      await axios.post(`${API}/expenses`, data)
    }
    fetchExpenses()
    setEditData(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    await axios.delete(`${API}/expenses/${id}`)
    fetchExpenses()
  }

  const openEdit = (exp) => { setEditData(exp); setModalOpen(true) }
  const openAdd  = () => { setEditData(null); setModalOpen(true) }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const maxBar = byCategory[0]?.total || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <span className="text-lg font-bold text-gray-900">SpendSmart</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Hi, {user?.name?.split(' ')[0]} 👋</span>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={filterYear}
              onChange={e => setFilterYear(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Add Expense
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Avg/Day</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{expenses.length ? Math.round(total / new Date(filterYear, filterMonth, 0).getDate()).toLocaleString('en-IN') : 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Top Category</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{byCategory[0] ? CAT_ICONS[byCategory[0].cat] : '—'}</p>
            <p className="text-xs text-gray-500">{byCategory[0]?.cat || 'None'}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Category breakdown chart */}
          {byCategory.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
              <div className="space-y-3">
                {byCategory.map(({ cat, total: t }) => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{CAT_ICONS[cat]} {cat}</span>
                      <span className="text-sm font-medium text-gray-800">₹{t.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${(t / maxBar) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense list */}
          <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${byCategory.length > 0 ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Expenses</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">🧾</div>
                <p className="text-sm">No expenses this month</p>
                <button onClick={openAdd} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">
                  Add your first one
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                {expenses.map(exp => (
                  <div key={exp._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <div className="text-2xl">{CAT_ICONS[exp.category]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{exp.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[exp.category]}`}>
                          {exp.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        {exp.note && <span className="text-xs text-gray-400 truncate hidden sm:block">{exp.note}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <button onClick={() => openEdit(exp)} className="text-gray-300 hover:text-indigo-500 transition text-sm">✏️</button>
                      <button onClick={() => handleDelete(exp._id)} className="text-gray-300 hover:text-red-400 transition text-sm">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null) }}
        onSave={handleSave}
        editData={editData}
      />
    </div>
  )
}
