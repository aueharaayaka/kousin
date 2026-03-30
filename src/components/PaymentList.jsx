import React from 'react'
import PaymentCard from './PaymentCard'
import './PaymentList.css'

export default function PaymentList({ payments, filter, onEdit, onDelete, onMarkPaid }) {
  const filtered = filter === 'all'
    ? [...payments].sort((a, b) => {
        const order = { overdue: 0, pending: 1, paid: 2 }
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
    : payments
        .filter(p => p.status === filter)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p>該当する支払いはありません</p>
      </div>
    )
  }

  return (
    <div className="payment-list">
      {filtered.map(payment => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkPaid={onMarkPaid}
        />
      ))}
    </div>
  )
}
