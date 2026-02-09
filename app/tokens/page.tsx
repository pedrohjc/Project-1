'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { TOKEN_PACKS } from '../../lib/tokenPacks'

interface TokenStatus {
  tokensUsed: number
  tokenLimit: number
  extraTokens: number
  totalAvailable: number
  resetLabel: string
}

export default function TokensPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<TokenStatus | null>(null)
  const [userName, setUserName] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const [tokenResponse, meResponse] = await Promise.all([
        fetch('/api/tokens/status'),
        fetch('/api/auth/me')
      ])

      if (!tokenResponse.ok || !meResponse.ok) {
        router.push('/login')
        return
      }
      const [tokenData, meData] = await Promise.all([
        tokenResponse.json(),
        meResponse.json()
      ])
      setStatus(tokenData)
      setUserName(meData?.user?.name || '')
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (packId: string) => {
    setProcessing(packId)
    try {
      const response = await fetch('/api/tokens/topup/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId })
      })
      const data = await response.json()
      if (response.ok && data.initPoint) {
        window.location.href = data.initPoint
        return
      }

      const errorMessage = data.error || 'Erro ao criar pagamento'
      alert(errorMessage)
    } catch {
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setProcessing(null)
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

      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '1rem',
            fontWeight: '800',
            color: 'var(--balance-text)',
            fontFamily: 'var(--font-brand)'
          }}>
            Adicionar Tokens
          </h1>
          {userName && (
            <p style={{ color: 'var(--balance-text)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Olá, {userName}
            </p>
          )}
          <p style={{ color: 'var(--balance-text-light)' }}>
            Compre tokens adicionais para continuar usando a plataforma sem esperar o reset.
          </p>
        </div>

        <div style={{
          maxWidth: '900px',
          margin: '0 auto 2rem',
          background: 'white',
          border: '1px solid var(--balance-border)',
          borderRadius: '12px',
          padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--balance-text-light)' }}>Tokens usados</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {status?.tokensUsed?.toLocaleString()} / {status?.totalAvailable?.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--balance-text-light)' }}>Tokens extras disponíveis</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {status?.extraTokens?.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--balance-text-light)' }}>Reset do plano</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {status?.resetLabel || '—'}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {TOKEN_PACKS.map((pack) => (
            <div key={pack.id} style={{
              background: 'white',
              border: '1px solid var(--balance-border)',
              borderRadius: '12px',
              padding: '20px',
              position: 'relative'
            }}>
              {pack.highlight && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--balance-primary)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {pack.highlight}
                </div>
              )}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                {pack.name}
              </h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--balance-primary)' }}>
                R$ {pack.price.toFixed(2).replace('.', ',')}
              </div>
              <p style={{ color: 'var(--balance-text-light)', margin: '8px 0 16px' }}>
                {pack.tokens.toLocaleString('pt-BR')} tokens adicionais
              </p>
              <button
                onClick={() => handleBuy(pack.id)}
                disabled={processing === pack.id}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--balance-primary)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: processing === pack.id ? 0.7 : 1
                }}
              >
                {processing === pack.id ? 'Processando...' : 'Comprar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
