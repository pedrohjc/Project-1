'use client'

import Link from 'next/link'
import Logo from '../components/Logo'
import './globals.css'

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--balance-bg)'
    }}>
      {/* Header fixo */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--balance-border)',
        padding: '16px 20px'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
      }}>
        <Logo size="medium" />
          <div style={{ display: 'flex', gap: '1rem' }}>
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
                e.currentTarget.style.background = 'var(--balance-bg-light)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Entrar
            </Link>
            <Link 
              href="/register" 
              className="btn btn-primary"
              style={{ 
                padding: '8px 20px',
                fontSize: '0.95rem'
              }}
            >
              Criar Conta
            </Link>
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
          var(--balance-bg-light) 0%, 
          #ffffff 50%, 
          var(--balance-bg-light) 100%)`
      }}>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            marginBottom: '1.5rem', 
            fontWeight: '800',
            color: 'var(--balance-text)',
            fontFamily: 'var(--font-brand)',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Automação que libera seu time
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', 
            marginBottom: '1rem', 
            color: 'var(--balance-text)', 
            fontWeight: '600',
            letterSpacing: '-0.01em'
          }}>
            Conectamos inteligência, automação e pessoas
          </p>
          
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '3rem', 
            color: 'var(--balance-text-light)', 
            maxWidth: '700px', 
            margin: '0 auto 3rem',
            lineHeight: '1.7'
          }}>
            Transforme a forma como sua equipe trabalha. Nossa plataforma de IA e automação 
            elimina tarefas repetitivas e libera tempo para o que realmente importa.
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
                fontSize: '3rem',
                marginBottom: '1rem',
                fontWeight: '800',
                color: 'var(--balance-primary)'
              }}>🎯</div>
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
                fontSize: '3rem',
                marginBottom: '1rem',
                fontWeight: '800',
                color: 'var(--balance-primary)'
              }}>💡</div>
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
                fontSize: '3rem',
                marginBottom: '1rem',
                fontWeight: '800',
                color: 'var(--balance-primary)'
              }}>⚡</div>
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
              color: 'var(--balance-text)',
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
          <div style={{
            position: 'relative',
            marginTop: '3rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '2rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              padding: '20px 0',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--balance-primary) var(--balance-bg-light)',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: '-ms-autohiding-scrollbar'
            }}
            onScroll={(e) => {
              // Adicionar lógica de scroll se necessário
            }}
            >
              {/* Balance Tradutor Juridiquês */}
              <div className="card" style={{ 
                minWidth: '380px',
                maxWidth: '380px',
                borderTop: '4px solid var(--balance-primary)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 102, 255, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px var(--balance-shadow)'
              }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem', 
                  textAlign: 'center' 
                }}>⚖️</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--balance-text)',
                  textAlign: 'center'
                }}>
                  Balance Tradutor Juridiquês
                </h3>
                <p style={{ 
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: 'var(--balance-primary)',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Traduza juridiquês para linguagem simples
                </p>
                <p style={{ 
                  color: 'var(--balance-text-light)',
                  lineHeight: '1.7',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem'
                }}>
                  Transforme textos jurídicos complexos em linguagem clara e acessível. Ideal para contratos, documentos legais e termos técnicos.
                </p>
                <Link 
                  href="/register" 
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Experimentar Agora
                </Link>
              </div>

              {/* Balance Checklist Tributário */}
              <div className="card" style={{ 
                minWidth: '380px',
                maxWidth: '380px',
                borderTop: '4px solid #00c853',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 200, 83, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px var(--balance-shadow)'
              }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem', 
                  textAlign: 'center' 
                }}>✅</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--balance-text)',
                  textAlign: 'center'
                }}>
                  Balance Checklist Tributário
                </h3>
                <p style={{ 
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: '#00c853',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Checklists completos para serviços tributários
                </p>
                <p style={{ 
                  color: 'var(--balance-text-light)',
                  lineHeight: '1.7',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem'
                }}>
                  Gere checklists claros e completos de documentos fiscais e contábeis. Agilize a coleta documental e fortaleça a percepção de valor.
                </p>
                <Link 
                  href="/register" 
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Experimentar Agora
                </Link>
              </div>

              {/* Balance Criador de Conteúdo Jurídico Ético */}
              <div className="card" style={{ 
                minWidth: '380px',
                maxWidth: '380px',
                borderTop: '4px solid #4ecdc4',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(78, 205, 196, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px var(--balance-shadow)'
              }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem', 
                  textAlign: 'center' 
                }}>📱</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--balance-text)',
                  textAlign: 'center'
                }}>
                  Balance Criador de Conteúdo Jurídico Ético
                </h3>
                <p style={{ 
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: '#4ecdc4',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Crie conteúdo ético para redes sociais
                </p>
                <p style={{ 
                  color: 'var(--balance-text-light)',
                  lineHeight: '1.7',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem'
                }}>
                  Gere ideias criativas, roteiros e legendas para posts jurídicos em redes sociais. Conteúdo ético, educativo e engajador.
                </p>
                <Link 
                  href="/register" 
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Experimentar Agora
                </Link>
              </div>

              {/* Balance Comercial Quebra de Objeções com PNL */}
              <div className="card" style={{ 
                minWidth: '380px',
                maxWidth: '380px',
                borderTop: '4px solid #f5576c',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(245, 87, 108, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px var(--balance-shadow)'
              }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem', 
                  textAlign: 'center' 
                }}>💬</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--balance-text)',
                  textAlign: 'center'
                }}>
                  Balance Comercial Quebra de Objeções com PNL
                </h3>
                <p style={{ 
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: '#f5576c',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Quebre objeções e feche mais contratos
                </p>
                <p style={{ 
                  color: 'var(--balance-text-light)',
                  lineHeight: '1.7',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem'
                }}>
                  Aprenda a responder objeções comerciais com técnicas de PNL e persuasão. Transforme resistências em oportunidades de fechamento.
                </p>
                <Link 
                  href="/register" 
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Experimentar Agora
                </Link>
              </div>

              {/* Balance Organizador – Propostas e Honorários */}
              <div className="card" style={{ 
                minWidth: '380px',
                maxWidth: '380px',
                borderTop: '4px solid #ffd700',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 215, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px var(--balance-shadow)'
              }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem', 
                  textAlign: 'center' 
                }}>💰</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--balance-text)',
                  textAlign: 'center'
                }}>
                  Balance Organizador – Propostas e Honorários
                </h3>
                <p style={{ 
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: '#ff8c00',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Crie propostas claras e atrativas
                </p>
                <p style={{ 
                  color: 'var(--balance-text-light)',
                  lineHeight: '1.7',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem'
                }}>
                  Estruture propostas de honorários éticas e atrativas. Destaque o valor do serviço, organize fases do processo e quebre objeções.
                </p>
                <Link 
                  href="/register" 
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Experimentar Agora
                </Link>
              </div>
            </div>

            {/* Indicador de scroll */}
            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: 'var(--balance-text-light)',
              fontSize: '0.9rem'
            }}>
              ← Role para ver todos os produtos →
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
            letterSpacing: '-0.02em'
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

