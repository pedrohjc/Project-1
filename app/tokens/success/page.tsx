'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'

export default function TokensSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [])

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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          fontWeight: '700',
          color: 'var(--balance-text)'
        }}>
          Tokens adicionados!
        </h1>
        <p style={{
          color: 'var(--balance-text-light)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Seu saldo foi atualizado. Você já pode continuar usando os produtos.
        </p>
        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{ fontSize: '1rem', padding: '14px 32px' }}
        >
          Voltar ao Dashboard
        </Link>
        <p style={{
          marginTop: '1rem',
          fontSize: '0.85rem',
          color: 'var(--balance-text-light)'
        }}>
          Redirecionando automaticamente em alguns segundos...
        </p>
      </div>
    </div>
  )
}
