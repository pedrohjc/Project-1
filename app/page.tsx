'use client'

import Link from 'next/link'
import Logo from '../components/Logo'
import './globals.css'

export default function Home() {
  const products = [
    {
      title: 'Balance Tradutor Juridiquês',
      tagline: 'Traduza juridiquês para linguagem simples',
      description:
        'Transforme textos jurídicos complexos em linguagem clara e acessível. Ideal para contratos, documentos legais e termos técnicos.',
      accent: 'var(--balance-flow)',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--balance-text)' }}
          aria-hidden="true"
        >
          <path d="M12 3v4" />
          <path d="M7 7h10" />
          <path d="M5 7 3 11h6L7 7Z" />
          <path d="M19 7 17 11h6l-2-4Z" />
          <path d="M6 17h12" />
          <path d="M9 17v2" />
          <path d="M15 17v2" />
        </svg>
      ),
    },
    {
      title: 'Balance Checklist Tributário',
      tagline: 'Checklists completos para serviços tributários',
      description:
        'Gere checklists claros e completos de documentos fiscais e contábeis. Agilize a coleta documental e fortaleça a percepção de valor.',
      accent: 'var(--balance-flow)',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--balance-text)' }}
          aria-hidden="true"
        >
          <path d="M4 7h16v10H4z" />
          <path d="m9 12 2 2 4-4" />
          <path d="M7 7V5h10v2" />
        </svg>
      ),
    },
    {
      title: 'Balance Criador de Conteúdo Jurídico Ético',
      tagline: 'Crie conteúdo ético para redes sociais',
      description:
        'Gere ideias criativas, roteiros e legendas para posts jurídicos em redes sociais. Conteúdo ético, educativo e engajador.',
      accent: 'var(--balance-flow)',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--balance-text)' }}
          aria-hidden="true"
        >
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 7h2" />
          <path d="M10 17h4" />
        </svg>
      ),
    },
    {
      title: 'Balance Comercial Quebra de Objeções com PNL',
      tagline: 'Quebre objeções e feche mais contratos',
      description:
        'Aprenda a responder objeções comerciais com técnicas de PNL e persuasão. Transforme resistências em oportunidades de fechamento.',
      accent: 'var(--balance-flow)',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--balance-text)' }}
          aria-hidden="true"
        >
          <path d="M4 6h16v9H8l-4 3z" />
          <path d="M8 10h8" />
          <path d="M8 13h5" />
        </svg>
      ),
    },
    {
      title: 'Balance Organizador - Propostas e Honorários',
      tagline: 'Crie propostas claras e atrativas',
      description:
        'Estruture propostas de honorários éticas e atrativas. Destaque o valor do serviço, organize fases do processo e quebre objeções.',
      accent: 'var(--balance-flow)',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--balance-text)' }}
          aria-hidden="true"
        >
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 10h8" />
          <path d="M8 14h4" />
        </svg>
      ),
    },
  ]
  const loopedProducts = [...products, ...products]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `radial-gradient(circle at top left, rgba(120, 182, 213, 0.2), transparent 55%),
        radial-gradient(circle at 20% 20%, rgba(46, 196, 166, 0.18), transparent 55%),
        var(--balance-bg)`
    }}>
      {/* Header fixo */}
      <header className="glass-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 20px'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '16px'
      }}>
        <Logo size="medium" />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link 
              href="/agents" 
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
              Agents Jurídicos
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
            <div className="header-cta-group">
              <Link href="/agents#agendar-diagnostico" className="btn btn-primary">
                Agendar diagnóstico
              </Link>
              <Link href="/subscription" className="btn btn-secondary">
                Ver planos
              </Link>
            </div>
          </div>
      </div>
      </header>

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        position: 'relative',
        background: `linear-gradient(135deg, 
          rgba(255, 255, 255, 0.65) 0%, 
          rgba(255, 255, 255, 0.9) 50%, 
          rgba(244, 245, 246, 0.7) 100%)`
      }}>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'var(--balance-glass)',
            border: '1px solid var(--balance-glass-border)',
            boxShadow: '0 14px 30px rgba(28, 44, 59, 0.12)',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--balance-text-light)'
          }}>
            Crie o seu próprio agent
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            marginBottom: '1.5rem', 
            fontWeight: '800',
            color: 'var(--balance-text)',
            fontFamily: 'var(--font-brand)',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Balance Agents
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', 
            marginBottom: '1rem', 
            color: 'var(--balance-text)', 
            fontWeight: '600',
            letterSpacing: '-0.01em'
          }}>
            O seu time entrega mais em menos tempo, com precisão jurídica.
          </p>
          
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '3rem', 
            color: 'var(--balance-text-light)', 
            maxWidth: '700px', 
            margin: '0 auto 3rem',
            lineHeight: '1.7'
          }}>
            Reduza etapas manuais, agilize respostas e aumente a confiança do cliente. 
            Nossos agents entregam clareza em contratos, pareceres e comunicação diária.
          </p>
        
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
              href="/register" 
            className="btn btn-primary" 
            style={{ 
              fontSize: '1.1rem', 
                padding: '16px 40px',
              fontWeight: '600'
            }}
          >
              Começar Agora
          </Link>
          <Link 
              href="#produtos" 
            className="btn btn-secondary" 
            style={{ 
              fontSize: '1.1rem', 
                padding: '16px 40px',
              fontWeight: '600'
              }}
            >
              Conhecer Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Sobre a Balance */}
      <section style={{
        padding: '100px 20px',
        background: 'var(--balance-bg)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              marginBottom: '1rem',
              fontWeight: '800',
              color: 'var(--balance-text)',
              fontFamily: 'var(--font-brand)',
              letterSpacing: '-0.02em'
            }}>
              Sobre a Balance
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--balance-text-light)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Somos especialistas em transformar processos complexos em soluções simples e eficientes
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: '18px',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--balance-glass-strong)',
                border: '1px solid var(--balance-glass-border)'
              }}>
                <Link href="/" aria-label="Ir para a página inicial">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--balance-text)' }}
                    aria-hidden="true"
                  >
                    <path d="M12 2v8" />
                    <path d="M5 10h14" />
                    <path d="M7 10v6a5 5 0 0 0 10 0v-6" />
                    <path d="M4 20h16" />
                  </svg>
                </Link>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Missão
              </h3>
              <p style={{ 
                color: 'var(--balance-text-light)',
                lineHeight: '1.7'
              }}>
                Liberar o potencial das equipes através de automação inteligente, 
                permitindo que profissionais foquem em trabalho estratégico e criativo.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: '18px',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--balance-glass-strong)',
                border: '1px solid var(--balance-glass-border)'
              }}>
                <Link href="/" aria-label="Ir para a página inicial">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--balance-text)' }}
                    aria-hidden="true"
                  >
                    <path d="M12 3a6 6 0 0 0-3 11v3h6v-3a6 6 0 0 0-3-11Z" />
                    <path d="M9 20h6" />
                  </svg>
                </Link>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Visão
              </h3>
              <p style={{ 
                color: 'var(--balance-text-light)',
                lineHeight: '1.7'
              }}>
                Ser a referência em automação inteligente, conectando pessoas, 
                processos e tecnologia para criar um futuro de trabalho mais eficiente.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: '18px',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--balance-glass-strong)',
                border: '1px solid var(--balance-glass-border)'
              }}>
                <Link href="/" aria-label="Ir para a página inicial">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--balance-text)' }}
                    aria-hidden="true"
                  >
                    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
                  </svg>
                </Link>
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Valores
              </h3>
              <p style={{ 
                color: 'var(--balance-text-light)',
                lineHeight: '1.7'
              }}>
                Inovação constante, simplicidade na execução, foco no cliente e 
                compromisso com resultados mensuráveis que transformam negócios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos - Carrossel Horizontal */}
      <section id="produtos" style={{
        padding: '100px 20px',
        background: 'var(--balance-bg-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              marginBottom: '1rem',
              fontWeight: '800',
              color: 'var(--balance-flow)',
              fontFamily: 'var(--font-brand)',
              letterSpacing: '-0.02em'
            }}>
              Nossos Produtos
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--balance-text-light)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Soluções completas para automatizar e otimizar seus processos jurídicos
            </p>
          </div>

          {/* Carrossel Horizontal */}
          <div className="product-carousel" style={{
            position: 'relative',
            marginTop: '3rem'
          }}>
            <div className="product-track" style={{
              display: 'flex',
              gap: '2rem',
              padding: '20px 0'
            }}>
              {loopedProducts.map((product, index) => (
                <div
                  className="card"
                  key={`${product.title}-${index}`}
                  style={{
                    minWidth: '380px',
                    maxWidth: '380px',
                    borderTopWidth: '3px',
                    borderTopStyle: 'solid',
                    borderTopColor: 'var(--balance-primary)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(28, 44, 59, 0.2)'
                    e.currentTarget.style.borderTopColor = 'var(--balance-flow)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow =
                      '0 20px 45px var(--balance-glass-shadow)'
                    e.currentTarget.style.borderTopColor = 'var(--balance-primary)'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    margin: '0 auto 1rem',
                    borderRadius: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--balance-glass-strong)',
                    border: '1px solid var(--balance-glass-border)',
                  }}>
                    <Link href="/" aria-label="Ir para a página inicial">
                      {product.icon}
                    </Link>
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--balance-text)',
                    textAlign: 'center',
                  }}>
                    {product.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    marginBottom: '0.5rem',
                    color: product.accent,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    {product.tagline}
                  </p>
                  <p style={{
                    color: 'var(--balance-text-light)',
                    lineHeight: '1.7',
                    marginBottom: '1.5rem',
                    fontSize: '0.95rem',
                  }}>
                    {product.description}
                  </p>
                  <Link
                    href="/register"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    Experimentar Agora
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section style={{
        padding: '100px 20px',
        background: 'var(--balance-bg)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              marginBottom: '1rem',
              fontWeight: '800',
              color: 'var(--balance-text)',
              fontFamily: 'var(--font-brand)',
              letterSpacing: '-0.02em'
            }}>
              Por que escolher a Balance?
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'var(--balance-text-light)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Resultados que falam por si só
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: 'var(--balance-primary)',
                marginBottom: '1rem'
              }}>80%</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '0.5rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Redução de Tarefas Manuais
              </h3>
              <p style={{ color: 'var(--balance-text-light)' }}>
                Automatize processos e ganhe tempo
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: 'var(--balance-primary)',
                marginBottom: '1rem'
              }}>24/7</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '0.5rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Disponibilidade Total
              </h3>
              <p style={{ color: 'var(--balance-text-light)' }}>
                Suporte e automação sempre ativos
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: 'var(--balance-primary)',
                marginBottom: '1rem'
              }}>5min</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '0.5rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Tempo de Setup
              </h3>
              <p style={{ color: 'var(--balance-text-light)' }}>
                Comece a usar em minutos
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: 'var(--balance-primary)',
                marginBottom: '1rem'
              }}>100%</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '0.5rem',
                fontWeight: '700',
                color: 'var(--balance-text)'
              }}>
                Segurança e Confiabilidade
              </h3>
              <p style={{ color: 'var(--balance-text-light)' }}>
                Seus dados protegidos e seguros
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        padding: '100px 20px',
        background: `linear-gradient(135deg, var(--balance-primary) 0%, var(--balance-primary-dark) 100%)`,
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            marginBottom: '1.5rem',
            fontWeight: '800',
            fontFamily: 'var(--font-brand)',
            letterSpacing: '-0.02em',
            color: '#efefef'
          }}>
            Pronto para transformar seu trabalho?
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '2.5rem',
            opacity: 0.95,
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            Junte-se a centenas de equipes que já estão economizando tempo e aumentando 
            produtividade com a Balance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/register" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '16px 40px',
                fontWeight: '600',
                background: 'white',
                color: 'var(--balance-primary)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Criar Conta Grátis
            </Link>
            <Link 
              href="/login" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '16px 40px',
                fontWeight: '600',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Já tenho conta
          </Link>
        </div>
      </div>
      </section>
    </div>
  )
}

