import React, { useState } from 'react'
import './ClientForm.css'

const SERVICE_KEYS = [
  { key: 'domain', label: 'ドメイン' },
  { key: 'server', label: 'サーバー' },
  { key: 'ssl', label: 'SSL' },
]

const EMPTY_SERVICE = { fee: '', nextDueDate: '' }

const INITIAL_STATE = {
  agentName: '',
  clientName: '',
  domain: { ...EMPTY_SERVICE },
  server: { ...EMPTY_SERVICE },
  ssl: { ...EMPTY_SERVICE },
}

export default function ClientForm({ client, onSubmit, onClose }) {
  const [form, setForm] = useState(
    client
      ? {
          ...client,
          domain: { fee: client.domain?.fee ?? '', nextDueDate: client.domain?.nextDueDate ?? '' },
          server: { fee: client.server?.fee ?? '', nextDueDate: client.server?.nextDueDate ?? '' },
          ssl: { fee: client.ssl?.fee ?? '', nextDueDate: client.ssl?.nextDueDate ?? '' },
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({
      ...form,
      domain: { ...form.domain, fee: form.domain.fee !== '' ? Number(form.domain.fee) : '' },
      server: { ...form.server, fee: form.server.fee !== '' ? Number(form.server.fee) : '' },
      ssl: { ...form.ssl, fee: form.ssl.fee !== '' ? Number(form.ssl.fee) : '' },
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

          {SERVICE_KEYS.map(({ key, label }) => (
            <div key={key} className={`service-section service-section-${key}`}>
              <div className="service-section-title">{label}</div>
              <div className="form-row">
                <div className="form-group">
                  <label>管理費 (円)</label>
                  <input
                    type="number"
                    value={form[key].fee}
                    onChange={(e) => handleServiceChange(key, 'fee', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>次回支払い予定日</label>
                  <input
                    type="date"
                    value={form[key].nextDueDate}
                    onChange={(e) => handleServiceChange(key, 'nextDueDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

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
