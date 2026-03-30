import React from 'react'
import './Dashboard.css'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)

export default function Dashboard({ payments }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalOverdue = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const upcomingPayments = payments
    .filter(p => {
      if (p.status !== 'pending') return false
      const due = new Date(p.dueDate)
      const diff = (due - today) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const cards = [
    {
      label: '未払い合計',
      value: formatCurrency(totalPending),
      count: payments.filter(p => p.status === 'pending').length,
      color: '#3b82f6',
      bg: '#eff6ff',
      icon: '📋',
    },
    {
      label: '期限超過',
      value: formatCurrency(totalOverdue),
      count: payments.filter(p => p.status === 'overdue').length,
      color: '#ef4444',
      bg: '#fef2f2',
      icon: '⚠️',
    },
    {
      label: '支払済合計',
      value: formatCurrency(totalPaid),
      count: payments.filter(p => p.status === 'paid').length,
      color: '#10b981',
      bg: '#ecfdf5',
      icon: '✅',
    },
    {
      label: '7日以内の支払い',
      value: formatCurrency(upcomingPayments.reduce((s, p) => s + p.amount, 0)),
      count: upcomingPayments.length,
      color: '#f59e0b',
      bg: '#fffbeb',
      icon: '🔔',
    },
  ]

  return (
    <div className="dashboard">
      <div className="summary-cards">
        {cards.map((card) => (
          <div key={card.label} className="summary-card" style={{ '--accent': card.color, '--bg': card.bg }}>
            <div className="card-icon">{card.icon}</div>
            <div className="card-body">
              <div className="card-label">{card.label}</div>
              <div className="card-value">{card.value}</div>
              <div className="card-count">{card.count}件</div>
            </div>
          </div>
        ))}
      </div>

      {upcomingPayments.length > 0 && (
        <div className="upcoming-section">
          <h3 className="upcoming-title">直近7日間の支払い予定</h3>
          <div className="upcoming-list">
            {upcomingPayments.map(p => {
              const due = new Date(p.dueDate)
              const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
              return (
                <div key={p.id} className="upcoming-item">
                  <span className="upcoming-name">{p.title}</span>
                  <span className="upcoming-due">
                    {diff === 0 ? '今日' : `${diff}日後`} ({p.dueDate})
                  </span>
                  <span className="upcoming-amount">{formatCurrency(p.amount)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
