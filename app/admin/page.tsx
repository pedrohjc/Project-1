'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  subscription: {
    plan: string
    status: string
    endDate: string | null
  } | null
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const meResponse = await fetch('/api/auth/me')
      if (!meResponse.ok) {
        router.push('/login')
        return
      }

      const meData = await meResponse.json()
      if (meData.user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erro ao carregar usuários')
        return
      }

      setUsers(data.users || [])
    } catch (err) {
      setError('Erro ao carregar painel')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--balance-bg)' }}>
        <p style={{ color: 'var(--balance-text-light)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--balance-bg)' }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--balance-border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Logo size="medium" />
        <Link
          href="/dashboard"
          style={{
            padding: '8px 20px',
            color: 'var(--balance-text)',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          Voltar ao Dashboard
        </Link>
      </header>

      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--balance-text)' }}>
          Administração
        </h1>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: 'white',
          border: '1px solid var(--balance-border)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--balance-border)',
            fontWeight: '700',
            color: 'var(--balance-text)'
          }}>
            Usuários ({users.length})
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--balance-bg-light)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.85rem' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.85rem' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.85rem' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.85rem' }}>Assinatura</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--balance-border)' }}>
                    <td style={{ padding: '12px 16px' }}>{user.name}</td>
                    <td style={{ padding: '12px 16px' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>{user.role}</td>
                    <td style={{ padding: '12px 16px' }}>{user.subscription?.plan || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>{user.subscription?.status || '-'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', color: 'var(--balance-text-light)' }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
