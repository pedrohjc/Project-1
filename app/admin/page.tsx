'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  overview: {
    totalUsers: number
    usersLast30d: number
    usersLast7d: number
    totalSubscriptions: number
    activeSubscriptions: number
    cancelledSubscriptions: number
    pendingSubscriptions: number
    totalConversations: number
    conversationsLast7d: number
    totalMessages: number
  }
  subscriptionsByPlan: { plan: string; count: number }[]
  usersByProvider: { provider: string; count: number }[]
  recentUsers: {
    id: string
    name: string
    email: string
    provider: string | null
    createdAt: string
    subscription: { plan: string; status: string } | null
  }[]
  recentSubscriptions: {
    id: string
    plan: string
    status: string
    createdAt: string
    startDate: string
    endDate: string | null
    user: { name: string; email: string }
  }[]
}

const planNames: Record<string, string> = {
  monthly: 'Essentials',
  yearly: 'Operations',
  custom: 'Custom Pro',
  free: 'Free',
}

const statusColors: Record<string, string> = {
  active: '#2ec4a6',
  cancelled: '#e74c3c',
  expired: '#f39c12',
  pending: '#8899a6',
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: '#192734',
      borderRadius: '14px',
      padding: '20px',
      border: accent ? '1px solid rgba(120, 182, 213, 0.3)' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.68rem',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: '#8899a6',
        marginBottom: '8px',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: accent ? '#78b6d5' : '#e7e9ea',
        fontFamily: 'var(--font-brand)',
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '0.8rem', color: '#8899a6', marginTop: '6px' }}>{sub}</p>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          setStats(await res.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <p style={{ color: '#8899a6' }}>Carregando estatísticas...</p>
  }

  if (!stats) {
    return <p style={{ color: '#e74c3c' }}>Erro ao carregar estatísticas.</p>
  }

  const o = stats.overview

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e7e9ea', fontFamily: 'var(--font-brand)', marginBottom: '24px' }}>
        Visão geral
      </h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        <StatCard label="Total de usuários" value={o.totalUsers} sub={`+${o.usersLast7d} nos últimos 7 dias`} accent />
        <StatCard label="Assinaturas ativas" value={o.activeSubscriptions} sub={`${o.cancelledSubscriptions} canceladas`} accent />
        <StatCard label="Conversas" value={o.totalConversations} sub={`+${o.conversationsLast7d} últimos 7 dias`} />
        <StatCard label="Mensagens" value={o.totalMessages} />
        <StatCard label="Cadastros (30 dias)" value={o.usersLast30d} />
      </div>

      {/* Two-column details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Assinaturas por plano */}
        <div style={{ background: '#192734', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea', marginBottom: '14px' }}>
            Assinaturas ativas por plano
          </h3>
          {stats.subscriptionsByPlan.length === 0 ? (
            <p style={{ color: '#8899a6', fontSize: '0.9rem' }}>Nenhuma assinatura ativa</p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {stats.subscriptionsByPlan.map((s) => (
                <div key={s.plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ color: '#e7e9ea', fontSize: '0.9rem', fontWeight: '600' }}>{planNames[s.plan] || s.plan}</span>
                  <span style={{ color: '#78b6d5', fontWeight: '700', fontSize: '1.1rem' }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usuários por provedor */}
        <div style={{ background: '#192734', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea', marginBottom: '14px' }}>
            Cadastros por canal
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {stats.usersByProvider.map((u) => (
              <div key={u.provider} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: '#e7e9ea', fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize' }}>{u.provider}</span>
                <span style={{ color: '#78b6d5', fontWeight: '700', fontSize: '1.1rem' }}>{u.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div style={{ background: '#192734', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea' }}>Últimos cadastros</h3>
          <Link href="/admin/users" style={{ fontSize: '0.82rem', color: '#78b6d5', textDecoration: 'none', fontWeight: '600' }}>
            Ver todos →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nome', 'E-mail', 'Canal', 'Plano', 'Data'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: '10px', fontSize: '0.9rem', color: '#e7e9ea', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Link href={`/admin/users?highlight=${u.id}`} style={{ color: '#e7e9ea', textDecoration: 'none' }}>{u.name}</Link>
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.85rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.email}</td>
                  <td style={{ padding: '10px', fontSize: '0.85rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)', textTransform: 'capitalize' }}>{u.provider || 'email'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {u.subscription ? (
                      <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '999px', background: 'rgba(46, 196, 166, 0.15)', color: '#2ec4a6', fontWeight: '600' }}>
                        {planNames[u.subscription.plan] || u.subscription.plan}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#8899a6' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.82rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div style={{ background: '#192734', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea' }}>Últimas assinaturas</h3>
          <Link href="/admin/subscriptions" style={{ fontSize: '0.82rem', color: '#78b6d5', textDecoration: 'none', fontWeight: '600' }}>
            Ver todas →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Usuário', 'Plano', 'Status', 'Início', 'Fim'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentSubscriptions.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '10px', fontSize: '0.9rem', color: '#e7e9ea', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {s.user.name}
                    <br />
                    <span style={{ fontSize: '0.78rem', color: '#8899a6', fontWeight: '400' }}>{s.user.email}</span>
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.88rem', color: '#e7e9ea', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: '600' }}>
                    {planNames[s.plan] || s.plan}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: `${statusColors[s.status] || '#8899a6'}20`,
                      color: statusColors[s.status] || '#8899a6',
                      fontWeight: '600',
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.82rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {new Date(s.startDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.82rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {s.endDate ? new Date(s.endDate).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
