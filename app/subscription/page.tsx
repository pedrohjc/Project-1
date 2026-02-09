'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '../../components/Logo'
import AgentsImpactCalculator from '../../components/agents/AgentsImpactCalculator'
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

const plans = [
  {
    id: 'essentials',
    name: 'Essentials',
    price: 'R$ 29,90',
    period: 'por mês',
    highlight: false,
    badge: null,
    description: '5 Agents prontos para o jurídico',
    features: [
      'Tradutor Juridiquês',
      'Checklist Tributário',
      'Conteúdo Jurídico Ético',
      'Quebra de Objeções com PNL',
      'Organizador de Propostas',
      'Logs básicos',
      'Suporte assíncrono',
    ],
    apiPlan: 'monthly' as const,
  },
  {
    id: 'operations',
    name: 'Operations',
    price: 'R$ 169,86',
    period: 'por mês',
    highlight: true,
    badge: 'Mais popular',
    description: '10 Agents setoriais prontos',
    features: [
      'Tudo do Essentials',
      'Conciliação de recibos',
      'Cobrança inteligente',
      'Fluxo de caixa',
      'Calendário editorial',
      'Análise de campanhas',
      'Checklist de linha',
      'Controle de qualidade',
      'Planejamento de insumos',
      'Triagem de chamados',
      'Follow-up automático',
      'Logs + revisão mensal',
      'Chat + 1 call/mês',
    ],
    apiPlan: 'yearly' as const,
  },
  {
    id: 'custom',
    name: 'Custom Pro',
    price: 'R$ 499,93',
    period: 'por mês',
    highlight: false,
    badge: null,
    description: 'Crie até 3 Agents personalizados',
    features: [
      'Tudo do Operations',
      'Até 3 Agents custom (guiado)',
      'Templates e modelos prontos',
      'Validação manual opcional',
      'Logs + versionamento de regras',
      'Chat + 1 call de configuração',
    ],
    apiPlan: 'monthly' as const,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 'R$ 999',
    period: 'por mês',
    highlight: false,
    badge: 'Enterprise',
    description: 'Agents ilimitados + governança forte',
    features: [
      'Tudo do Custom Pro',
      'Agents ilimitados',
      'Até 3 e-mails na mesma assinatura (mesmo consumo)',
      'Governança completa (logs, versões, permissões)',
      'SLA dedicado',
      'Painel de auditoria',
      'Suporte prioritário dedicado',
      'Calls semanais de acompanhamento',
    ],
    apiPlan: 'yearly' as const,
  },
]

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadSubscriptionStatus()
  }, [])

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
    <div className="subscription-page">
      {/* Header */}
      <header className="glass-header" style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Logo size="medium" />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              padding: '8px 20px',
              color: 'var(--balance-text)',
              fontWeight: '600',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(120, 182, 213, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Início
          </Link>
          <Link
            href="/login"
            style={{
              padding: '8px 20px',
              color: 'var(--balance-text)',
              fontWeight: '600',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(120, 182, 213, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Entrar
          </Link>
        </div>
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
            Desbloqueie todo o potencial da Balance com o plano ideal para sua operação
          </p>
        </div>

        <AgentsImpactCalculator />

        {/* Status da assinatura atual */}
        {isActive && (
          <div style={{
            maxWidth: '600px',
            margin: '3rem auto',
            padding: '20px',
            background: 'var(--balance-glass-strong)',
            borderRadius: '16px',
            border: '2px solid var(--balance-flow)',
            textAlign: 'center',
            backdropFilter: 'blur(18px)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--balance-text)' }}>
              Assinatura Ativa
            </h3>
            <p style={{ color: 'var(--balance-text-light)', marginBottom: '1rem' }}>
              Plano: <strong>{currentPlan === 'monthly' ? 'Essentials' : currentPlan === 'yearly' ? 'Operations' : currentPlan}</strong>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '3rem auto 0'
        }}>
          {plans.map((plan) => (
            <div
              className="card"
              key={plan.id}
              style={{
                position: 'relative',
                borderTop: plan.highlight ? '3px solid var(--balance-flow)' : '3px solid var(--balance-primary)',
                transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(28, 44, 59, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 20px 45px var(--balance-glass-shadow)'
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.highlight ? 'var(--balance-flow)' : 'var(--balance-primary)',
                  color: 'white',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap'
                }}>
                  {plan.badge}
                </div>
              )}

              <h3 style={{
                fontSize: '1.4rem',
                marginBottom: '0.5rem',
                fontWeight: '700',
                color: 'var(--balance-text)',
                textAlign: 'center'
              }}>
                {plan.name}
              </h3>

              <p style={{
                textAlign: 'center',
                color: 'var(--balance-text-light)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                {plan.description}
              </p>

              <div style={{
                fontSize: '2.4rem',
                fontWeight: '800',
                color: 'var(--balance-text)',
                textAlign: 'center',
                marginBottom: '0.25rem'
              }}>
                {plan.price}
              </div>

              <p style={{
                textAlign: 'center',
                color: 'var(--balance-text-light)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem'
              }}>
                {plan.period}
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1.5rem',
                display: 'grid',
                gap: '6px'
              }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{
                    padding: '6px 0',
                    color: 'var(--balance-text-light)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: 'var(--balance-flow)', flexShrink: 0, marginTop: '2px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.apiPlan)}
                className={plan.highlight ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ width: '100%' }}
                disabled={processing === plan.apiPlan}
              >
                {processing === plan.apiPlan ? 'Processando...' : 'Assinar'}
              </button>

              <Link
                href={`/subscription/${plan.id}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '10px',
                  fontSize: '0.85rem',
                  color: 'var(--balance-flow)',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                Ver detalhes do plano →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
