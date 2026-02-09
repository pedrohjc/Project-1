'use client'

import { useEffect, useState } from 'react'

interface Sub {
  id: string
  plan: string
  status: string
  mercadoPagoId: string | null
  paymentId: string | null
  startDate: string
  endDate: string | null
  cancelledAt: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    provider: string | null
    createdAt: string
  }
}

const planNames: Record<string, string> = {
  monthly: 'Essentials',
  yearly: 'Operations',
  free: 'Free',
}

const statusLabels: Record<string, string> = {
  active: 'Ativa',
  cancelled: 'Cancelada',
  expired: 'Expirada',
  pending: 'Pendente',
}

const statusColors: Record<string, string> = {
  active: '#2ec4a6',
  cancelled: '#e74c3c',
  expired: '#f39c12',
  pending: '#8899a6',
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadSubs()
  }, [filterStatus, filterPlan])

  const loadSubs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      if (filterPlan) params.set('plan', filterPlan)
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSubs(data.subscriptions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Summary stats
  const totalActive = subs.filter((s) => s.status === 'active').length
  const totalCancelled = subs.filter((s) => s.status === 'cancelled').length

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e7e9ea', fontFamily: 'var(--font-brand)', marginBottom: '20px' }}>
        Assinaturas ({subs.length})
      </h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#192734', borderRadius: '12px', padding: '16px', border: '1px solid rgba(46, 196, 166, 0.2)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8899a6' }}>Ativas</p>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2ec4a6' }}>{totalActive}</p>
        </div>
        <div style={{ background: '#192734', borderRadius: '12px', padding: '16px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8899a6' }}>Canceladas</p>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e74c3c' }}>{totalCancelled}</p>
        </div>
        <div style={{ background: '#192734', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8899a6' }}>Total</p>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e7e9ea' }}>{subs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#192734',
            color: '#e7e9ea',
            fontSize: '0.85rem',
          }}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="cancelled">Canceladas</option>
          <option value="expired">Expiradas</option>
          <option value="pending">Pendentes</option>
        </select>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#192734',
            color: '#e7e9ea',
            fontSize: '0.85rem',
          }}
        >
          <option value="">Todos os planos</option>
          <option value="monthly">Essentials</option>
          <option value="yearly">Operations</option>
          <option value="free">Free</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#192734', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '24px', color: '#8899a6', textAlign: 'center' }}>Carregando...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Usuário', 'Plano', 'Status', 'Início', 'Fim', 'MercadoPago'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#15202b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <>
                    <tr
                      key={s.id}
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(120, 182, 213, 0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#e7e9ea', fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>{s.user.name}</span>
                        <span style={{ color: '#8899a6', fontSize: '0.78rem' }}>{s.user.email}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.9rem', color: '#e7e9ea', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {planNames[s.plan] || s.plan}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: `${statusColors[s.status] || '#8899a6'}20`,
                          color: statusColors[s.status] || '#8899a6',
                          fontWeight: '600',
                        }}>
                          {statusLabels[s.status] || s.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {new Date(s.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {s.endDate ? new Date(s.endDate).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)' }}>
                        {s.paymentId ? s.paymentId.slice(0, 12) + '...' : '—'}
                      </td>
                    </tr>
                    {expanded === s.id && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={6} style={{ padding: '16px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                            <div>
                              <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8899a6', marginBottom: '4px' }}>ID da assinatura</p>
                              <p style={{ fontSize: '0.82rem', color: '#e7e9ea', fontFamily: 'var(--font-mono)' }}>{s.id}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8899a6', marginBottom: '4px' }}>MercadoPago ID</p>
                              <p style={{ fontSize: '0.82rem', color: '#e7e9ea', fontFamily: 'var(--font-mono)' }}>{s.mercadoPagoId || '—'}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8899a6', marginBottom: '4px' }}>Payment ID</p>
                              <p style={{ fontSize: '0.82rem', color: '#e7e9ea', fontFamily: 'var(--font-mono)' }}>{s.paymentId || '—'}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8899a6', marginBottom: '4px' }}>Cancelada em</p>
                              <p style={{ fontSize: '0.82rem', color: '#e7e9ea' }}>
                                {s.cancelledAt ? new Date(s.cancelledAt).toLocaleDateString('pt-BR') : '—'}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8899a6', marginBottom: '4px' }}>Canal do usuário</p>
                              <p style={{ fontSize: '0.82rem', color: '#e7e9ea', textTransform: 'capitalize' }}>{s.user.provider || 'email'}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8899a6', marginBottom: '4px' }}>Usuário desde</p>
                              <p style={{ fontSize: '0.82rem', color: '#e7e9ea' }}>{new Date(s.user.createdAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#8899a6' }}>
                      Nenhuma assinatura encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
