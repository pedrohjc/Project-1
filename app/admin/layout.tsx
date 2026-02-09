'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

const navItems = [
  { href: '/admin', label: 'Visão geral', icon: 'dashboard' },
  { href: '/admin/users', label: 'Usuários', icon: 'users' },
  { href: '/admin/subscriptions', label: 'Assinaturas', icon: 'subscriptions' },
]

function NavIcon({ type }: { type: string }) {
  switch (type) {
    case 'dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    case 'users':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      )
    case 'subscriptions':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (data.user?.role !== 'admin') {
          router.push('/dashboard')
          return
        }
        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1419' }}>
        <p style={{ color: '#8899a6' }}>Carregando painel...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1419' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
            display: 'none',
          }}
          className="admin-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: '#15202b',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : undefined,
          bottom: 0,
          zIndex: 210,
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Logo size="small" />
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: '#8899a6',
            marginTop: '10px',
          }}>
            Painel Administrativo
          </p>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  fontWeight: active ? '600' : '500',
                  color: active ? '#ffffff' : '#8899a6',
                  background: active ? 'rgba(120, 182, 213, 0.12)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <NavIcon type={item.icon} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--balance-flow)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'white',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e7e9ea' }}>{user.name}</p>
              <p style={{ fontSize: '0.72rem', color: '#8899a6' }}>{user.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/dashboard"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#8899a6',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#8899a6',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        {/* Top bar mobile */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#8899a6',
              cursor: 'pointer',
              padding: '4px',
            }}
            className="admin-menu-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <div />
          <p style={{ fontSize: '0.78rem', color: '#8899a6', fontFamily: 'var(--font-mono)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-overlay { display: block !important; }
          .admin-menu-btn { display: block !important; }
          main { margin-left: 0 !important; }
          aside { transform: translateX(${sidebarOpen ? '0' : '-100%'}); }
        }
      `}</style>
    </div>
  )
}
