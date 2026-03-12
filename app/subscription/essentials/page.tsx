'use client'

import Link from 'next/link'
import Logo from '../../../components/Logo'

const agents = [
  {
    name: 'Tradutor Juridiquês',
    description: 'Reescreva contratos e pareceres em linguagem simples para clientes e equipes internas.',
  },
  {
    name: 'Checklist Tributário',
    description: 'Gere listas de documentos e etapas com rigor técnico e facilidade de uso.',
  },
  {
    name: 'Conteúdo Jurídico Ético',
    description: 'Crie posts, roteiros e textos jurídicos com orientação ética integrada.',
  },
  {
    name: 'Quebra de Objeções com PNL',
    description: 'Responda objeções comerciais com técnicas de PNL e persuasão.',
  },
  {
    name: 'Organizador de Propostas',
    description: 'Estruture propostas de honorários éticas e atrativas.',
  },
]

const included = [
  '50k tokens por mês incluídos',
  '5 Agents jurídicos prontos para uso',
  'Logs básicos de ações executadas',
  'Suporte assíncrono (e-mail / plataforma)',
  'Atualizações constantes dos Agents',
  'Cancelamento a qualquer momento',
]

const notIncluded = [
  'Agents setoriais (Financeiro, Marketing, etc.)',
  'Agents customizados',
  'Calls de acompanhamento',
  'Governança avançada',
]

export default function EssentialsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--balance-bg)' }}>
      <header className="glass-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size="medium" />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/subscription" style={{ padding: '8px 20px', color: 'var(--balance-text)', fontWeight: '600', textDecoration: 'none', borderRadius: '8px' }}>
            Todos os planos
          </Link>
          <Link href="/login" style={{ padding: '8px 20px', color: 'var(--balance-text)', fontWeight: '600', textDecoration: 'none', borderRadius: '8px' }}>
            Entrar
          </Link>
        </div>
      </header>

      <div className="container" style={{ padding: '60px 20px', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--balance-text-light)', marginBottom: '12px' }}>
            Plano Essentials
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: 'var(--balance-text)', fontFamily: 'var(--font-brand)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            5 Agents prontos para o jurídico
          </h1>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--balance-text)', marginBottom: '4px' }}>
            R$ 29,90<span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--balance-text-light)' }}>/mês</span>
          </div>
          <p style={{ color: 'var(--balance-text-light)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
            Comece a automatizar tarefas operacionais do escritório com 5 Agents prontos, 50k tokens por mês, logs de ações e suporte assíncrono.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Agents inclusos</h2>
          {agents.map((agent) => (
            <div key={agent.name} className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{agent.name}</h3>
              <p style={{ color: 'var(--balance-text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>{agent.description}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--balance-flow)' }}>O que está incluso</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '8px' }}>
              {included.map((item) => (
                <li key={item} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--balance-text-light)' }}>
                  <span style={{ color: 'var(--balance-flow)', flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--balance-text-light)' }}>Não incluso neste plano</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '8px' }}>
              {notIncluded.map((item) => (
                <li key={item} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--balance-text-light)', opacity: 0.6 }}>
                  <span>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px' }}>
            Assinar Essentials
          </Link>
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--balance-text-light)' }}>
            Cancele a qualquer momento. Sem fidelidade.
          </p>
        </div>
      </div>
    </div>
  )
}
