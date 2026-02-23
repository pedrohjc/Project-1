'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar código')
        setLoading(false)
        return
      }

      setStep('code')
      startResendTimer()
      setLoading(false)
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerifyCode = async () => {
    setError('')
    const codeStr = code.join('')

    if (codeStr.length !== 6) {
      setError('Digite o código completo de 6 dígitos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeStr, type: 'reset' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Código inválido')
        setLoading(false)
        return
      }

      setStep('newPassword')
      setLoading(false)
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.join(''), newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir senha')
        setLoading(false)
        return
      }

      setSuccess('Senha redefinida com sucesso! Redirecionando...')
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao reenviar código')
        setLoading(false)
        return
      }

      setCode(['', '', '', '', '', ''])
      startResendTimer()
      setLoading(false)
    } catch {
      setError('Erro ao conectar com o servidor')
      setLoading(false)
    }
  }

  const stepTitles = {
    email: 'Recuperar Senha',
    code: 'Verificar Código',
    newPassword: 'Nova Senha',
  }

  const stepDescriptions = {
    email: 'Digite seu email para receber um código de recuperação',
    code: `Enviamos um código de 6 dígitos para ${email}`,
    newPassword: 'Defina sua nova senha',
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
            {stepTitles[step]}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--balance-text-light)' }}>
            {stepDescriptions[step]}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginBottom: '24px' 
        }}>
          {['email', 'code', 'newPassword'].map((s, i) => (
            <div
              key={s}
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                background: i <= ['email', 'code', 'newPassword'].indexOf(step) 
                  ? 'var(--balance-primary)' 
                  : 'var(--balance-border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {success && (
          <div style={{ 
            padding: '12px', 
            background: '#e8f5e9', 
            color: '#2e7d32', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            {success}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendCode}>
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
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              marginBottom: '20px' 
            }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleCodePaste : undefined}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    borderRadius: '10px',
                    border: '2px solid var(--balance-border)',
                    background: 'var(--balance-bg)',
                    color: 'var(--balance-text)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--balance-primary)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--balance-border)' }}
                />
              ))}
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
              className="btn btn-primary" 
              style={{ width: '100%', fontWeight: '600', marginBottom: '12px' }} 
              disabled={loading || code.join('').length !== 6}
              onClick={handleVerifyCode}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleResendCode}
                disabled={resendTimer > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? 'var(--balance-text-light)' : 'var(--balance-primary)',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                }}
              >
                {resendTimer > 0 
                  ? `Reenviar código em ${resendTimer}s` 
                  : 'Reenviar código'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={() => { setStep('email'); setError(''); setCode(['', '', '', '', '', '']) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--balance-text-light)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                ← Voltar
              </button>
            </div>
          </div>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">Nova senha</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repita a nova senha"
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
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        )}

        <p style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          color: 'var(--balance-text-light)' 
        }}>
          Lembrou sua senha?{' '}
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
