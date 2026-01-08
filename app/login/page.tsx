'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'

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

      // Redirecionar para o dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      background: 'var(--balance-bg)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Logo variant="isotipo" size="medium" />
          </div>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.5rem',
            color: 'var(--balance-azul-gravidade)',
            fontFamily: 'var(--font-brand)',
            fontWeight: '900',
            letterSpacing: '-0.02em'
          }}>
            Balance Solutions
          </h1>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem', 
            color: 'var(--balance-azul-gravidade)',
            fontWeight: '600'
          }}>
            Login
          </h2>
        </div>
        
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
          color: 'var(--balance-cinza-horizonte)' 
        }}>
          Não tem uma conta?{' '}
          <Link 
            href="/register" 
            style={{ 
              color: 'var(--balance-azul-fluxo)', 
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
              color: 'var(--balance-cinza-horizonte)',
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

