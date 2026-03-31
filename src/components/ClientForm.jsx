import React, { useState } from 'react'
import './ClientForm.css'

const INITIAL_STATE = {
  agentName: '',
  clientName: '',
  domain: { fee: '', billingAmount: '', nextDueDate: '' },
  server: { fee: '', billingAmount: '', nextDueDate: '' },
  ssl:    { fee: '', billingAmount: '', manualFee: '', nextDueDate: '' },
}

export default function ClientForm({ client, onSubmit, onClose }) {
  const [form, setForm] = useState(
    client
      ? {
          ...client,
          domain: { fee: client.domain?.fee ?? '', billingAmount: client.domain?.billingAmount ?? '', nextDueDate: client.domain?.nextDueDate ?? client.domain?.paymentDate ?? '' },
          server: { fee: client.server?.fee ?? '', billingAmount: client.server?.billingAmount ?? '', nextDueDate: client.server?.nextDueDate ?? client.server?.paymentDate ?? '' },
          ssl:    { fee: client.ssl?.fee ?? '', billingAmount: client.ssl?.billingAmount ?? '', manualFee: client.ssl?.manualFee ?? '', nextDueDate: client.ssl?.nextDueDate ?? client.ssl?.paymentDate ?? '' },
        }
      : INITIAL_STATE
  )
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.clientName.trim()) errs.clientName = 'クライアント名を入力してください'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleServiceChange = (serviceKey, field, value) => {
    setForm(prev => ({
      ...prev,
      [serviceKey]: { ...prev[serviceKey], [field]: value },
    }))
  }

  const toNum = (v) => v !== '' ? Number(v) : ''

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({
      ...form,
      domain: { ...form.domain, fee: toNum(form.domain.fee), billingAmount: toNum(form.domain.billingAmount) },
      server: { ...form.server, fee: toNum(form.server.fee), billingAmount: toNum(form.server.billingAmount) },
      ssl:    { ...form.ssl,    fee: toNum(form.ssl.fee),    billingAmount: toNum(form.ssl.billingAmount), manualFee: toNum(form.ssl.manualFee) },
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{client ? 'クライアントを編集' : 'クライアントを登録'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-group">
            <label>エージェント名</label>
            <input
              type="text"
              name="agentName"
              value={form.agentName}
              onChange={handleChange}
              placeholder="例: エージェント名"
            />
          </div>

          <div className="form-group">
            <label>クライアント名 <span className="required">*</span></label>
            <input
              type="text"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              placeholder="例: example.com"
              className={errors.clientName ? 'error' : ''}
            />
            {errors.clientName && <span className="error-msg">{errors.clientName}</span>}
          </div>

          <div className="services-divider">サービス詳細</div>

          {/* ドメイン */}
          <div className="service-section service-section-domain">
            <div className="service-section-title">ドメイン</div>
            <div className="form-row">
              <div className="form-group">
                <label>管理費 (円)</label>
                <input type="number" value={form.domain.fee}
                  onChange={(e) => handleServiceChange('domain', 'fee', e.target.value)}
                  placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>請求額 (円)</label>
                <input type="number" value={form.domain.billingAmount}
                  onChange={(e) => handleServiceChange('domain', 'billingAmount', e.target.value)}
                  placeholder="0" min="0" />
              </div>
            </div>
            <div className="form-group">
              <label>支払日</label>
              <input type="date" value={form.domain.nextDueDate}
                onChange={(e) => handleServiceChange('domain', 'nextDueDate', e.target.value)} />
            </div>
          </div>

          {/* サーバー */}
          <div className="service-section service-section-server">
            <div className="service-section-title">サーバー</div>
            <div className="form-row">
              <div className="form-group">
                <label>管理費 (円)</label>
                <input type="number" value={form.server.fee}
                  onChange={(e) => handleServiceChange('server', 'fee', e.target.value)}
                  placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>請求額 (円)</label>
                <input type="number" value={form.server.billingAmount}
                  onChange={(e) => handleServiceChange('server', 'billingAmount', e.target.value)}
                  placeholder="0" min="0" />
              </div>
            </div>
            <div className="form-group">
              <label>支払日</label>
              <input type="date" value={form.server.nextDueDate}
                onChange={(e) => handleServiceChange('server', 'nextDueDate', e.target.value)} />
            </div>
          </div>

          {/* SSL */}
          <div className="service-section service-section-ssl">
            <div className="service-section-title">SSL</div>
            <div className="form-row">
              <div className="form-group">
                <label>管理費 (円)</label>
                <input type="number" value={form.ssl.fee}
                  onChange={(e) => handleServiceChange('ssl', 'fee', e.target.value)}
                  placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>請求額 (円)</label>
                <input type="number" value={form.ssl.billingAmount}
                  onChange={(e) => handleServiceChange('ssl', 'billingAmount', e.target.value)}
                  placeholder="0" min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>手動代行費 (円)</label>
                <input type="number" value={form.ssl.manualFee}
                  onChange={(e) => handleServiceChange('ssl', 'manualFee', e.target.value)}
                  placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label>支払日</label>
                <input type="date" value={form.ssl.nextDueDate}
                  onChange={(e) => handleServiceChange('ssl', 'nextDueDate', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {client ? '更新する' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
