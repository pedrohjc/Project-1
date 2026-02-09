'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import SocialLogin from '../../components/SocialLogin'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta')
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
            Criar Conta
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--balance-text-light)' }}>
            Comece a usar a Balance agora
          </p>
        </div>

        <SocialLogin mode="register" />
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
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
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          color: 'var(--balance-text-light)' 
        }}>
          Já tem uma conta?{' '}
          <Link 
            href="/login" 
            style={{ 
              color: 'var(--balance-primary)', 
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Fazer login
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

