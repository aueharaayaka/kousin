import React, { useState } from 'react'
import './PaymentCard.css'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)

const CATEGORY_LABELS = {
  housing: '住居費',
  utilities: '光熱費',
  credit: 'クレジット',
  insurance: '保険',
  subscription: 'サブスク',
  tax: '税金',
  other: 'その他',
}

const STATUS_CONFIG = {
  pending: { label: '未払い', color: '#3b82f6', bg: '#eff6ff' },
  overdue: { label: '期限超過', color: '#ef4444', bg: '#fef2f2' },
  paid: { label: '支払済', color: '#10b981', bg: '#ecfdf5' },
}

const RECURRING_LABELS = {
  none: '一回払い',
  weekly: '毎週',
  monthly: '毎月',
  yearly: '毎年',
}

export default function PaymentCard({ payment, onEdit, onDelete, onMarkPaid }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(payment.dueDate)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  const status = STATUS_CONFIG[payment.status]

  const getDueDateLabel = () => {
    if (payment.status === 'paid') return `引き落とし日: ${payment.dueDate}`
    if (diff < 0) return `${Math.abs(diff)}日超過`
    if (diff === 0) return '今日が引き落とし日'
    if (diff === 1) return '明日が引き落とし日'
    return `${diff}日後 (${payment.dueDate})`
  }

  const getDueDateClass = () => {
    if (payment.status === 'paid') return 'due-paid'
    if (diff < 0) return 'due-overdue'
    if (diff <= 3) return 'due-soon'
    return 'due-normal'
  }

  return (
    <div className={`payment-card status-${payment.status}`}>
      <div className="card-left">
        <div className="card-header-row">
          <div className="card-title">{payment.title}</div>
          {payment.serviceType && (
            <span className="service-type-badge">{payment.serviceType}</span>
          )}
        </div>
        {payment.note && <div className="card-note">{payment.note}</div>}
        <div className="card-meta">
          <span className={`due-badge ${getDueDateClass()}`}>{getDueDateLabel()}</span>
          {payment.recurring !== 'none' && (
            <span className="recurring-badge">{RECURRING_LABELS[payment.recurring]}</span>
          )}
        </div>
      </div>
      <div className="card-right">
        <div className="card-amount">{formatCurrency(payment.amount)}</div>
        <span className="status-badge" style={{ color: status.color, background: status.bg }}>
          {status.label}
        </span>
        <div className="card-actions">
          {payment.status !== 'paid' && (
            <button className="btn btn-sm btn-success" onClick={() => onMarkPaid(payment.id)}>
              支払済にする
            </button>
          )}
          <button className="btn btn-sm btn-secondary" onClick={() => onEdit(payment)}>
            編集
          </button>
          {confirmDelete ? (
            <>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(payment.id)}>確認</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setConfirmDelete(false)}>キャンセル</button>
            </>
          ) : (
            <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(true)}>
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
