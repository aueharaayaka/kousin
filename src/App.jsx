import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import PaymentList from './components/PaymentList'
import PaymentForm from './components/PaymentForm'
import './App.css'

const STORAGE_KEY = 'payment_schedules'

const SAMPLE_DATA = [
  {
    id: '1',
    title: '家賃',
    amount: 80000,
    dueDate: '2026-04-01',
    category: 'housing',
    status: 'pending',
    recurring: 'monthly',
    note: '',
  },
  {
    id: '2',
    title: '電気代',
    amount: 8500,
    dueDate: '2026-03-25',
    category: 'utilities',
    status: 'overdue',
    recurring: 'monthly',
    note: '3月分',
  },
  {
    id: '3',
    title: 'インターネット',
    amount: 5500,
    dueDate: '2026-03-20',
    category: 'utilities',
    status: 'paid',
    recurring: 'monthly',
    note: '',
  },
  {
    id: '4',
    title: 'クレジットカード',
    amount: 45000,
    dueDate: '2026-04-10',
    category: 'credit',
    status: 'pending',
    recurring: 'monthly',
    note: '3月利用分',
  },
  {
    id: '5',
    title: '保険料',
    amount: 15000,
    dueDate: '2026-04-15',
    category: 'insurance',
    status: 'pending',
    recurring: 'monthly',
    note: '',
  },
]

export default function App() {
  const [payments, setPayments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : SAMPLE_DATA
    } catch {
      return SAMPLE_DATA
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
  }, [payments])

  const addPayment = (payment) => {
    setPayments(prev => [...prev, { ...payment, id: Date.now().toString() }])
    setShowForm(false)
  }

  const updatePayment = (payment) => {
    setPayments(prev => prev.map(p => p.id === payment.id ? payment : p))
    setEditingPayment(null)
    setShowForm(false)
  }

  const deletePayment = (id) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  const markAsPaid = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p))
  }

  const handleEdit = (payment) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPayment(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-logo">$</div>
            <div>
              <h1 className="app-title">支払いスケジュール管理</h1>
              <p className="app-subtitle">Payment Schedule Manager</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + 支払いを追加
          </button>
        </div>
      </header>

      <main className="app-main">
        <Dashboard payments={payments} />

        <div className="list-section">
          <div className="list-header">
            <h2>支払い一覧</h2>
            <div className="tabs">
              {['all', 'pending', 'overdue', 'paid'].map(tab => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' && 'すべて'}
                  {tab === 'pending' && '未払い'}
                  {tab === 'overdue' && '期限超過'}
                  {tab === 'paid' && '支払済'}
                  <span className="tab-count">
                    {tab === 'all' ? payments.length : payments.filter(p => p.status === tab).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <PaymentList
            payments={payments}
            filter={activeTab}
            onEdit={handleEdit}
            onDelete={deletePayment}
            onMarkPaid={markAsPaid}
          />
        </div>
      </main>

      {showForm && (
        <PaymentForm
          payment={editingPayment}
          onSubmit={editingPayment ? updatePayment : addPayment}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
