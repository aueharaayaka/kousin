import React, { useState, useEffect } from 'react'
import ClientForm from './components/ClientForm'
import './App.css'

const STORAGE_KEY = 'clients_data'

const SERVICE_LABELS = { domain: 'ドメイン', server: 'サーバー', ssl: 'SSL' }

const formatCurrency = (amount) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(amount) || 0)

function MonthlyItem({ client, serviceType, service, checked, onUpdateNextDueDate }) {
  const [inputValue, setInputValue] = useState('')
  const isChecked = checked || inputValue !== ''

  const handleBlur = () => {
    if (inputValue) onUpdateNextDueDate(client.id, serviceType, inputValue)
  }

  return (
    <div className={`monthly-item${isChecked ? ' is-checked' : ''}`}>
      <div className="monthly-item-left">
        {client.agentName && <div className="item-agent">{client.agentName}</div>}
        <div className="item-client">{client.clientName}</div>
        <div className="item-meta">
          <span className={`service-badge service-${serviceType}`}>{SERVICE_LABELS[serviceType]}</span>
          <span className="item-date">{service.nextDueDate}</span>
        </div>
      </div>

      <div className="monthly-item-amounts">
        {service.fee !== '' && service.fee !== undefined && (
          <div className="amount-row">
            <span className="amount-label">管理費</span>
            <span className="amount-value">{formatCurrency(service.fee)}</span>
          </div>
        )}
        {service.billingAmount !== '' && service.billingAmount !== undefined && (
          <div className="amount-row">
            <span className="amount-label">請求額</span>
            <span className="amount-value amount-billing">{formatCurrency(service.billingAmount)}</span>
          </div>
        )}
        {serviceType === 'ssl' && service.manualFee !== '' && service.manualFee !== undefined && (
          <div className="amount-row">
            <span className="amount-label">手動代行費</span>
            <span className="amount-value">{formatCurrency(service.manualFee)}</span>
          </div>
        )}
      </div>

      <div className="monthly-item-right">
        <div className="next-due-group">
          <span className="next-due-label">次回支払い予定日</span>
          <div className="next-due-input-row">
            <input
              type="date"
              className="next-due-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
            />
            {isChecked && inputValue && <span className="check-mark">✔</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [clients, setClients] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [checkedKeys, setCheckedKeys] = useState(new Set())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    setCheckedKeys(new Set())
  }, [selectedMonth])

  const monthlyPayments = []
  clients.forEach(client => {
    ;['domain', 'server', 'ssl'].forEach(type => {
      const service = client[type]
      const key = `${client.id}-${type}`
      if (service?.nextDueDate?.startsWith(selectedMonth) || checkedKeys.has(key)) {
        monthlyPayments.push({ client, serviceType: type, service, checked: checkedKeys.has(key) })
      }
    })
  })

  const addClient = (client) => {
    setClients(prev => [...prev, { ...client, id: Date.now().toString() }])
    setShowForm(false)
  }

  const updateClient = (client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c))
    setEditingClient(null)
    setShowForm(false)
  }

  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const updateNextDueDate = (clientId, serviceType, nextDueDate) => {
    const key = `${clientId}-${serviceType}`
    setCheckedKeys(prev => new Set([...prev, key]))
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c
      return { ...c, [serviceType]: { ...c[serviceType], nextDueDate } }
    }))
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClient(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-logo">$</div>
            <div>
              <h1 className="app-title">支払い管理</h1>
              <p className="app-subtitle">Payment Manager</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + クライアントを登録
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="section">
          <div className="section-header">
            <h2>今月の支払い</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-picker"
            />
          </div>
          {monthlyPayments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>この月に予定されている支払いはありません</p>
            </div>
          ) : (
            <div className="monthly-list">
              {monthlyPayments.map(({ client, serviceType, service, checked }) => (
                <MonthlyItem
                  key={`${client.id}-${serviceType}`}
                  client={client}
                  serviceType={serviceType}
                  service={service}
                  checked={checked}
                  onUpdateNextDueDate={updateNextDueDate}
                />
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>クライアント一覧</h2>
          </div>
          {clients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>登録されたクライアントはありません</p>
            </div>
          ) : (
            <div className="client-grid">
              {clients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleEdit}
                  onDelete={deleteClient}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? updateClient : addClient}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

function ClientCard({ client, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const services = [
    { key: 'domain', label: 'ドメイン' },
    { key: 'server', label: 'サーバー' },
    { key: 'ssl', label: 'SSL' },
  ]

  const hasServices = services.some(
    ({ key }) => client[key]?.fee || client[key]?.billingAmount || client[key]?.manualFee || client[key]?.nextDueDate
  )

  return (
    <div className="client-card">
      <div className="client-card-head">
        {client.agentName && <div className="client-agent-label">{client.agentName}</div>}
        <div className="client-name-label">{client.clientName}</div>
      </div>
      {hasServices && (
        <div className="client-services">
          {services.map(({ key, label }) => {
            const s = client[key]
            if (!s?.fee && !s?.billingAmount && !s?.manualFee && !s?.nextDueDate) return null
            return (
              <div key={key} className="client-service-row">
                <span className={`service-badge service-${key}`}>{label}</span>
                {s.fee ? (
                  <span className="service-fee">
                    {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(s.fee))}
                  </span>
                ) : null}
                {s.nextDueDate && (
                  <span className="service-next-date">次回: {s.nextDueDate}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="client-actions">
        <button className="btn btn-sm btn-secondary" onClick={() => onEdit(client)}>編集</button>
        {confirmDelete ? (
          <>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(client.id)}>確認</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setConfirmDelete(false)}>キャンセル</button>
          </>
        ) : (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(true)}>削除</button>
        )}
      </div>
    </div>
  )
}
