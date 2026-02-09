'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import SocialLogin from '../../components/SocialLogin'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      paddingTop: '80px',
      background: 'var(--balance-bg)'
    }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
        <Logo size="medium" />
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem', 
            color: 'var(--balance-text)',
            fontWeight: '700',
            fontFamily: 'var(--font-brand)',
          }}>
            Entrar
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--balance-text-light)' }}>
            Acesse sua conta Balance
          </p>
        </div>

        <SocialLogin mode="login" />
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fee', 
              color: '#c33', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', fontWeight: '600' }} 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          color: 'var(--balance-text-light)' 
        }}>
          Não tem uma conta?{' '}
          <Link 
            href="/register" 
            style={{ 
              color: 'var(--balance-primary)', 
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Criar conta
          </Link>
        </p>

        <p style={{ marginTop: '10px', textAlign: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              color: 'var(--balance-text-light)',
              textDecoration: 'none'
            }}
          >
            ← Voltar para home
          </Link>
        </p>
      </div>
    </div>
  )
}

