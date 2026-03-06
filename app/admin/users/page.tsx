'use client'

import { useEffect, useState } from 'react'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  subscription: { plan: string; status: string; endDate: string | null } | null
}

interface UserDetail {
  id: string
  name: string
  email: string
  role: string
  provider: string | null
  avatarUrl: string | null
  extraTokens: number
  createdAt: string
  updatedAt: string
  subscription: {
    id: string
    plan: string
    status: string
    startDate: string
    endDate: string | null
    cancelledAt: string | null
  } | null
  conversations: {
    id: string
    title: string | null
    productId: string
    createdAt: string
    updatedAt: string
    _count: { messages: number }
  }[]
  tokenUsages: {
    id: string
    periodStart: string
    periodEnd: string
    usedTokens: number
  }[]
}

const planNames: Record<string, string> = {
  monthly: 'Essentials',
  yearly: 'Operations',
  free: 'Free',
  monthly_10k: 'Starter 10k',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editRole, setEditRole] = useState('')
  const [editTokens, setEditTokens] = useState('')
  const [trialPlan, setTrialPlan] = useState<'monthly_10k' | 'monthly' | 'yearly' | 'free'>('monthly_10k')
  const [trialDays, setTrialDays] = useState('7')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (userId: string) => {
    setDetailLoading(true)
    setSelectedUser(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedUser(data.user)
        setEditRole(data.user.role)
        setEditTokens(String(data.user.extraTokens))
      setTrialPlan((data.user.subscription?.plan as any) || 'monthly_10k')
      setTrialDays('7')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleGrantTrial = async () => {
    if (!selectedUser) return
    const days = Number(trialDays)
    if (!Number.isFinite(days) || days <= 0) {
      alert('Dias inválidos')
      return
    }
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/grant-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: trialPlan,
          days,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error || 'Erro ao conceder trial')
        return
      }
      alert('Trial concedido')
      loadUsers()
      openDetail(selectedUser.id)
    } catch {
      alert('Erro ao conceder trial')
    }
  }

  const handleSave = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          extraTokens: Number(editTokens) || 0,
        }),
      })
      if (res.ok) {
        alert('Usuário atualizado com sucesso')
        loadUsers()
        openDetail(selectedUser.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao atualizar')
      }
    } catch {
      alert('Erro ao salvar')
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${userName}"? Essa ação é irreversível.`)) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Usuário excluído')
        setSelectedUser(null)
        loadUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir')
      }
    } catch {
      alert('Erro ao excluir')
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p style={{ color: '#8899a6' }}>Carregando usuários...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e7e9ea', fontFamily: 'var(--font-brand)' }}>
          Usuários ({users.length})
        </h1>
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#192734',
            color: '#e7e9ea',
            fontSize: '0.9rem',
            width: '280px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser || detailLoading ? '1fr 400px' : '1fr', gap: '20px' }}>
        {/* Table */}
        <div style={{ background: '#192734', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nome', 'E-mail', 'Função', 'Plano', 'Status', 'Cadastro'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#15202b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openDetail(u.id)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(120, 182, 213, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontSize: '0.9rem', color: '#e7e9ea', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontWeight: '600',
                        background: u.role === 'admin' ? 'rgba(120, 182, 213, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: u.role === 'admin' ? '#78b6d5' : '#8899a6',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#e7e9ea', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {u.subscription ? planNames[u.subscription.plan] || u.subscription.plan : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {u.subscription ? (
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontWeight: '600',
                          background: u.subscription.status === 'active' ? 'rgba(46, 196, 166, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: u.subscription.status === 'active' ? '#2ec4a6' : '#e74c3c',
                        }}>
                          {u.subscription.status}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#8899a6' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#8899a6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#8899a6' }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {(selectedUser || detailLoading) && (
          <div style={{ background: '#192734', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', alignSelf: 'start', position: 'sticky', top: '80px' }}>
            {detailLoading ? (
              <p style={{ color: '#8899a6' }}>Carregando...</p>
            ) : selectedUser ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e7e9ea' }}>{selectedUser.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#8899a6' }}>{selectedUser.email}</p>
                    {selectedUser.provider && (
                      <p style={{ fontSize: '0.75rem', color: '#78b6d5', textTransform: 'capitalize', marginTop: '4px' }}>
                        via {selectedUser.provider}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{ background: 'none', border: 'none', color: '#8899a6', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6' }}>
                    Função
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: '4px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#0f1419',
                        color: '#e7e9ea',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </label>
                  <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6' }}>
                    Tokens extras
                    <input
                      type="number"
                      value={editTokens}
                      onChange={(e) => setEditTokens(e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: '4px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#0f1419',
                        color: '#e7e9ea',
                        fontSize: '0.9rem',
                      }}
                    />
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#78b6d5',
                    color: '#0f1419',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginBottom: '10px',
                  }}
                >
                  Salvar alterações
                </button>

                {/* Subscription info */}
                {selectedUser.subscription && (
                  <div style={{ marginTop: '14px', padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', marginBottom: '6px' }}>Assinatura</p>
                    <p style={{ color: '#e7e9ea', fontSize: '0.9rem' }}>
                      <strong>{planNames[selectedUser.subscription.plan] || selectedUser.subscription.plan}</strong> — {selectedUser.subscription.status}
                    </p>
                    <p style={{ color: '#8899a6', fontSize: '0.82rem' }}>
                      Desde {new Date(selectedUser.subscription.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {/* Grant trial */}
                <div style={{ marginTop: '14px', padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', marginBottom: '10px' }}>
                    Conceder trial
                  </p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6' }}>
                      Plano
                      <select
                        value={trialPlan}
                        onChange={(e) => setTrialPlan(e.target.value as any)}
                        style={{
                          display: 'block',
                          width: '100%',
                          marginTop: '4px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#0f1419',
                          color: '#e7e9ea',
                          fontSize: '0.9rem',
                        }}
                      >
                        <option value="free">free</option>
                        <option value="monthly_10k">monthly_10k</option>
                        <option value="monthly">monthly</option>
                        <option value="yearly">yearly</option>
                      </select>
                    </label>
                    <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6' }}>
                      Dias
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={trialDays}
                        onChange={(e) => setTrialDays(e.target.value)}
                        style={{
                          display: 'block',
                          width: '100%',
                          marginTop: '4px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#0f1419',
                          color: '#e7e9ea',
                          fontSize: '0.9rem',
                        }}
                      />
                    </label>
                    <button
                      onClick={handleGrantTrial}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(120, 182, 213, 0.35)',
                        background: 'rgba(120, 182, 213, 0.12)',
                        color: '#78b6d5',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      Conceder trial
                    </button>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#8899a6' }}>
                      Isso ativa a assinatura e define expiração automática.
                    </p>
                  </div>
                </div>

                {/* Conversations */}
                {selectedUser.conversations.length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', marginBottom: '8px' }}>
                      Conversas recentes ({selectedUser.conversations.length})
                    </p>
                    <div style={{ display: 'grid', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                      {selectedUser.conversations.map((c) => (
                        <div key={c.id} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.82rem', color: '#8899a6' }}>
                          <span style={{ color: '#e7e9ea', fontWeight: '600' }}>{c.title || 'Sem título'}</span>
                          <span style={{ float: 'right' }}>{c._count.messages} msgs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Token usage */}
                {selectedUser.tokenUsages.length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8899a6', marginBottom: '8px' }}>
                      Uso de tokens
                    </p>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {selectedUser.tokenUsages.map((t) => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.82rem', color: '#8899a6' }}>
                          <span>{new Date(t.periodStart).toLocaleDateString('pt-BR')}</span>
                          <span style={{ color: '#78b6d5', fontWeight: '600' }}>{t.usedTokens.toLocaleString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(selectedUser.id, selectedUser.name)}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(231, 76, 60, 0.3)',
                    background: 'transparent',
                    color: '#e74c3c',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Excluir usuário
                </button>

                <p style={{ fontSize: '0.72rem', color: '#8899a6', marginTop: '10px', textAlign: 'center' }}>
                  ID: {selectedUser.id}
                </p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
