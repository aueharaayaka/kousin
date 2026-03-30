import React, { useState, useEffect } from 'react'
import PaymentList from './components/PaymentList'
import PaymentForm from './components/PaymentForm'
import './App.css'

const STORAGE_KEY = 'payment_schedules'

export default function App() {
  const [payments, setPayments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
  }, [payments])

  const filteredPayments = payments.filter(p => p.dueDate.startsWith(selectedMonth))

  const addPayment = (payment) => {
    const { nextDueDate, ...data } = payment
    const newPayments = [{ ...data, id: Date.now().toString() }]
    if (nextDueDate) {
      newPayments.push({
        ...data,
        id: (Date.now() + 1).toString(),
        dueDate: nextDueDate,
        status: 'pending',
      })
    }
    setPayments(prev => [...prev, ...newPayments])
    setShowForm(false)
  }

  const updatePayment = (payment) => {
    const { nextDueDate, ...data } = payment
    setPayments(prev => {
      const updated = prev.map(p => p.id === data.id ? data : p)
      if (nextDueDate) {
        updated.push({
          ...data,
          id: Date.now().toString(),
          dueDate: nextDueDate,
          status: 'pending',
        })
      }
      return updated
    })
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
        <div className="list-section">
          <div className="list-header">
            <h2>支払い一覧</h2>
            <div className="list-header-controls">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-picker"
              />
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
                      {tab === 'all' ? filteredPayments.length : filteredPayments.filter(p => p.status === tab).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <PaymentList
            payments={filteredPayments}
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
