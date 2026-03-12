'use client'

import Link from 'next/link'
import Logo from '../../../components/Logo'

const included = [
  '850k tokens por mês incluídos',
  'Tudo do plano Operations (15 Agents prontos)',
  'Até 3 Agents custom criados por você (com guia)',
  'Templates e modelos prontos para configuração',
  'Validação manual opcional em etapas críticas',
  'Logs + versionamento de regras e prompts',
  'Chat de suporte',
  '1 call de configuração com a equipe Balance',
  'Cancelamento a qualquer momento',
]

const steps = [
  { title: 'Escolha o fluxo', desc: 'Identifique a tarefa repetitiva que mais consome tempo.' },
  { title: 'Use os templates', desc: 'Acesse modelos prontos para montar as regras do Agent.' },
  { title: 'Configure as regras', desc: 'Defina limites, validações e aprovações humanas.' },
  { title: 'Teste e ajuste', desc: 'Rode o Agent em ambiente de teste antes de ativar.' },
  { title: 'Ative e monitore', desc: 'Coloque em operação e acompanhe pelos logs.' },
]

const WHATSAPP = 'https://wa.me/5500000000000?text=Quero%20agendar%20minha%20call%20de%20configuração%20-%20Plano%20Custom%20Pro'

export default function CustomPage() {
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
            Plano Custom Pro
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: 'var(--balance-text)', fontFamily: 'var(--font-brand)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Crie até 3 Agents personalizados
          </h1>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--balance-text)', marginBottom: '4px' }}>
            R$ 499,90<span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--balance-text-light)' }}>/mês</span>
          </div>
          <p style={{ color: 'var(--balance-text-light)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>
            Resolva gargalos específicos do seu negócio com Agents feitos sob medida. Inclui 850k tokens por mês, guia, templates e suporte.
          </p>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: '2.5rem' }}>
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

        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px' }}>Como criar seu Agent</h2>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '2.5rem' }}>
          {steps.map((step, i) => (
            <div key={step.title} className="card" style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px', alignItems: 'start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--balance-flow)', color: 'white', fontWeight: '700', display: 'grid', placeItems: 'center', fontSize: '0.9rem' }}>
                {i + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{step.title}</h3>
                <p style={{ color: 'var(--balance-text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: '3rem', borderTop: '3px solid var(--balance-flow)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Call de configuração</h3>
          <p style={{ color: 'var(--balance-text-light)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
            Você tem direito a 1 call de configuração com a equipe Balance para ajudar na criação do seu primeiro Agent custom. Agende pelo WhatsApp:
          </p>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Agendar call de configuração
          </a>
        </div>

        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px' }}>
            Assinar Custom Pro
          </Link>
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--balance-text-light)' }}>
            Cancele a qualquer momento. Sem fidelidade.
          </p>
        </div>
      </div>
    </div>
  )
}
