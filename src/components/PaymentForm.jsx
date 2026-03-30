import React, { useState } from 'react'
import './PaymentForm.css'

const SERVICE_TYPES = ['サーバー', 'ドメイン', 'SSL']

const CATEGORIES = [
  { value: 'housing', label: '住居費' },
  { value: 'utilities', label: '光熱費' },
  { value: 'credit', label: 'クレジット' },
  { value: 'insurance', label: '保険' },
  { value: 'subscription', label: 'サブスク' },
  { value: 'tax', label: '税金' },
  { value: 'other', label: 'その他' },
]

const RECURRING_OPTIONS = [
  { value: 'none', label: '一回払い' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
  { value: 'yearly', label: '毎年' },
]

const INITIAL_STATE = {
  title: '',
  serviceType: '',
  amount: '',
  dueDate: '',
  nextDueDate: '',
  category: 'other',
  status: 'pending',
  recurring: 'yearly',
  note: '',
}

export default function PaymentForm({ payment, onSubmit, onClose }) {
  const [form, setForm] = useState(payment ? {
    ...payment,
    amount: payment.amount.toString(),
    nextDueDate: '',
  } : INITIAL_STATE)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'タイトルを入力してください'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = '正しい金額を入力してください'
    if (!form.dueDate) errs.dueDate = '引き落とし日を選択してください'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const toggleServiceType = (type) => {
    setForm(prev => ({ ...prev, serviceType: prev.serviceType === type ? '' : type }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({ ...form, amount: Number(form.amount) })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{payment ? '支払いを編集' : '支払いを追加'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>タイトル <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="例: example.com"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-msg">{errors.title}</span>}
            <div className="service-type-group">
              {SERVICE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`service-type-btn ${form.serviceType === type ? 'active' : ''}`}
                  onClick={() => toggleServiceType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>金額 (円) <span className="required">*</span></label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0"
                min="1"
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && <span className="error-msg">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label>引き落とし日 <span className="required">*</span></label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <span className="error-msg">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>次回支払い予定日</label>
            <input
              type="date"
              name="nextDueDate"
              value={form.nextDueDate}
              onChange={handleChange}
            />
            <span className="field-hint">設定するとその日付で次回分の支払いが自動登録されます</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>カテゴリ</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>ステータス</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="pending">未払い</option>
                <option value="overdue">期限超過</option>
                <option value="paid">支払済</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>繰り返し</label>
            <div className="radio-group">
              {RECURRING_OPTIONS.map(opt => (
                <label key={opt.value} className="radio-label">
                  <input
                    type="radio"
                    name="recurring"
                    value={opt.value}
                    checked={form.recurring === opt.value}
                    onChange={handleChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>メモ</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="任意のメモを入力..."
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {payment ? '更新する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
