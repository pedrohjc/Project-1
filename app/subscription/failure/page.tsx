'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'

export default function SubscriptionFailurePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
    } catch (err) {
      router.push('/login')
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--balance-bg)', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          fontWeight: '700',
          color: 'var(--balance-text)'
        }}>
          Pagamento Não Aprovado
        </h1>
        <p style={{
          color: 'var(--balance-text-light)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          O pagamento não foi aprovado. Por favor, tente novamente ou entre em contato conosco se o problema persistir.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/subscription"
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '14px 32px' }}
          >
            Tentar Novamente
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-secondary"
            style={{ fontSize: '1rem', padding: '14px 32px' }}
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
