'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
    FB?: {
      init: (config: Record<string, unknown>) => void
      login: (callback: (response: { authResponse?: { accessToken: string } }) => void, config: Record<string, unknown>) => void
    }
    fbAsyncInit?: () => void
  }
}

interface SocialLoginProps {
  mode?: 'login' | 'register'
}

export default function SocialLogin({ mode = 'login' }: SocialLoginProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [publicConfig, setPublicConfig] = useState<{
    googleClientId: string | null
    facebookAppId: string | null
    linkedInClientId: string | null
  } | null>(null)

  const googleClientId = publicConfig?.googleClientId?.trim() || null
  const fbAppId = publicConfig?.facebookAppId?.trim() || null
  const linkedInClientId = publicConfig?.linkedInClientId?.trim() || null

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/public-config', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setPublicConfig(data)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSocialAuth = useCallback(async (provider: string, token: string) => {
    setLoading(provider)
    setError('')

    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro no login social')
        setLoading(null)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(null)
    }
  }, [router])

  // Load Google Identity Services
  useEffect(() => {
    if (!googleClientId) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          handleSocialAuth('google', response.credential)
        },
      })

      const btn = document.getElementById('google-signin-btn')
      if (btn) {
        btn.innerHTML = ''
        window.google?.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: mode === 'register' ? 'signup_with' : 'signin_with',
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [handleSocialAuth, googleClientId, mode])

  // Load Facebook SDK
  useEffect(() => {
    if (!fbAppId) return

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: fbAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      })
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [fbAppId])

  const handleFacebook = () => {
    if (!fbAppId) {
      setError('Login com Facebook não configurado.')
      return
    }

    window.FB?.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          handleSocialAuth('facebook', response.authResponse.accessToken)
        } else {
          setError('Login com Facebook cancelado')
        }
      },
      { scope: 'email,public_profile' }
    )
  }

  const handleLinkedIn = () => {
    if (!linkedInClientId) {
      setError('Login com LinkedIn não configurado.')
      return
    }

    const redirectUri = `${window.location.origin}/api/auth/linkedin/callback`
    const scope = 'openid profile email'
    const state = Math.random().toString(36).substring(7)

    sessionStorage.setItem('linkedin_state', state)

    window.location.href =
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedInClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`
  }

  const label = mode === 'register' ? 'Cadastrar' : 'Entrar'

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'grid',
        gap: '10px',
      }}>
        {/* Google */}
        <div
          id="google-signin-btn"
          style={{
            minHeight: '44px',
            display: 'flex',
            justifyContent: 'center',
          }}
        />

        {/* Facebook */}
        <button
          type="button"
          onClick={handleFacebook}
          disabled={loading === 'facebook'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #1877F2',
            background: '#1877F2',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#166FE5'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1877F2'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {loading === 'facebook' ? 'Conectando...' : `${label} com Facebook`}
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={handleLinkedIn}
          disabled={loading === 'linkedin'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #0A66C2',
            background: '#0A66C2',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#004182'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0A66C2'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          {loading === 'linkedin' ? 'Conectando...' : `${label} com LinkedIn`}
        </button>
      </div>

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#fee',
          color: '#c33',
          borderRadius: '8px',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '20px 0',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--balance-border)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--balance-text-light)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ou com e-mail
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--balance-border)' }} />
      </div>
    </div>
  )
}
