'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import './subscription.css'

interface SubscriptionStatus {
  hasSubscription: boolean
  subscription: {
    id: string
    plan: string
    status: string
    startDate: string
    endDate: string | null
    cancelledAt: string | null
  } | null
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadSubscriptionStatus()
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
    }
  }

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscriptions/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (err) {
      console.error('Erro ao carregar status da assinatura:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setProcessing(plan)
    try {
      const response = await fetch('/api/subscriptions/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (response.ok && data.initPoint) {
        // Redirecionar para o checkout do MercadoPago
        window.location.href = data.initPoint
      } else {
        alert(`Erro: ${data.error || 'Erro ao criar preferência de pagamento'}`)
        setProcessing(null)
      }
    } catch (err) {
      alert('Erro ao processar. Tente novamente.')
      setProcessing(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        alert('Assinatura cancelada com sucesso')
        await loadSubscriptionStatus()
      } else {
        alert(`Erro: ${data.error || 'Erro ao cancelar assinatura'}`)
      }
    } catch (err) {
      alert('Erro ao cancelar. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--balance-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <Logo size="medium" />
          <p style={{ marginTop: '1rem', color: 'var(--balance-text-light)' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  const isActive = subscription?.subscription?.status === 'active'
  const currentPlan = subscription?.subscription?.plan

  return (
    <div style={{ minHeight: '100vh', background: 'var(--balance-bg)' }}>
      {/* Header */}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--balance-bg-light)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Voltar ao Dashboard
        </Link>
      </header>

      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '1rem',
            fontWeight: '800',
            color: 'var(--balance-text)',
            fontFamily: 'var(--font-brand)',
            letterSpacing: '-0.02em'
          }}>
            Escolha seu Plano
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--balance-text-light)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Desbloqueie todo o potencial da Balance Studios
          </p>
        </div>

        {/* Status da assinatura atual */}
        {isActive && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto 3rem',
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            border: '2px solid var(--balance-primary)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--balance-text)' }}>
              Assinatura Ativa
            </h3>
            <p style={{ color: 'var(--balance-text-light)', marginBottom: '1rem' }}>
              Plano: <strong>{currentPlan === 'monthly' ? 'Mensal' : 'Anual'}</strong>
            </p>
            {subscription?.subscription?.endDate && (
              <p style={{ color: 'var(--balance-text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Válida até: {new Date(subscription.subscription.endDate).toLocaleDateString('pt-BR')}
              </p>
            )}
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem', padding: '10px 20px' }}
            >
              Cancelar Assinatura
            </button>
          </div>
        )}

        {/* Planos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Plano Mensal */}
          <div className="card" style={{
            border: isActive && currentPlan === 'monthly' ? '3px solid var(--balance-primary)' : '2px solid var(--balance-border)',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}>
            {isActive && currentPlan === 'monthly' && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--balance-primary)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Ativo
              </div>
            )}
            <h3 style={{
              fontSize: '1.75rem',
              marginBottom: '1rem',
              fontWeight: '700',
              color: 'var(--balance-text)',
              textAlign: 'center'
            }}>
              Plano Mensal
            </h3>
            <div style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: 'var(--balance-primary)',
              textAlign: 'center',
              marginBottom: '0.5rem'
            }}>
              R$ 29,90
            </div>
            <p style={{
              textAlign: 'center',
              color: 'var(--balance-text-light)',
              marginBottom: '2rem',
              fontSize: '0.9rem'
            }}>
              por mês
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: '2rem'
            }}>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Acesso a todos os produtos
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Suporte prioritário
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Atualizações constantes
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Cancelamento a qualquer momento
              </li>
            </ul>
            {isActive && currentPlan === 'monthly' ? (
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled
              >
                Plano Ativo
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('monthly')}
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={processing === 'monthly'}
              >
                {processing === 'monthly' ? 'Processando...' : 'Assinar Mensal'}
              </button>
            )}
          </div>

          {/* Plano Anual */}
          <div className="card" style={{
            border: isActive && currentPlan === 'yearly' ? '3px solid var(--balance-primary)' : '2px solid var(--balance-border)',
            position: 'relative',
            transition: 'all 0.3s ease',
            transform: isActive && currentPlan === 'yearly' ? 'scale(1.05)' : 'scale(1)'
          }}>
            {isActive && currentPlan === 'yearly' && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--balance-primary)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Ativo
              </div>
            )}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--balance-primary)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Mais Popular
            </div>
            <h3 style={{
              fontSize: '1.75rem',
              marginBottom: '1rem',
              fontWeight: '700',
              color: 'var(--balance-text)',
              textAlign: 'center'
            }}>
              Plano Anual
            </h3>
            <div style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: 'var(--balance-primary)',
              textAlign: 'center',
              marginBottom: '0.5rem'
            }}>
              R$ 299,90
            </div>
            <p style={{
              textAlign: 'center',
              color: 'var(--balance-text-light)',
              marginBottom: '0.5rem',
              fontSize: '0.9rem'
            }}>
              por ano
            </p>
            <p style={{
              textAlign: 'center',
              color: 'var(--balance-primary)',
              fontWeight: '600',
              marginBottom: '2rem',
              fontSize: '0.9rem'
            }}>
              Economize 16% (R$ 24,90/mês)
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: '2rem'
            }}>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Acesso a todos os produtos
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Suporte prioritário
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Atualizações constantes
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--balance-primary)' }}>✓</span>
                Cancelamento a qualquer momento
              </li>
              <li style={{ padding: '8px 0', color: 'var(--balance-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <span>🎁</span>
                Economia de 16%
              </li>
            </ul>
            {isActive && currentPlan === 'yearly' ? (
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled
              >
                Plano Ativo
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('yearly')}
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={processing === 'yearly'}
              >
                {processing === 'yearly' ? 'Processando...' : 'Assinar Anual'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
