import Link from 'next/link'
import Logo from '../components/Logo'
import './globals.css'

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px', 
      background: 'var(--balance-bg)',
      position: 'relative'
    }}>
      {/* Background sutil com a paleta */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, 
          var(--balance-branco-nevoeiro) 0%, 
          #ffffff 50%, 
          var(--balance-branco-nevoeiro) 100%)`,
        opacity: 0.5,
        zIndex: 0
      }} />
      
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '3rem' }}>
          {/* Logo */}
          <div style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Logo variant="isotipo" size="large" />
          </div>
          
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem', 
            fontWeight: '700',
            color: 'var(--balance-azul-gravidade)',
            fontFamily: 'var(--font-brand)',
            letterSpacing: '-0.02em'
          }}>
            Balance Solutions
          </h1>
          
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '0.75rem', 
            color: 'var(--balance-azul-gravidade)', 
            fontWeight: '600',
            letterSpacing: '-0.01em'
          }}>
            Automação que libera seu time
          </p>
          
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '3rem', 
            color: 'var(--balance-cinza-horizonte)', 
            maxWidth: '600px', 
            margin: '0 auto 3rem',
            lineHeight: '1.7'
          }}>
            Conectamos inteligência, automação e pessoas para te entregar tempo. 
            Acesse nosso assistente de IA e otimize seu trabalho.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/login" 
            className="btn btn-primary" 
            style={{ 
              fontSize: '1.1rem', 
              padding: '14px 32px',
              fontWeight: '600'
            }}
          >
            Entrar
          </Link>
          <Link 
            href="/register" 
            className="btn btn-secondary" 
            style={{ 
              fontSize: '1.1rem', 
              padding: '14px 32px',
              fontWeight: '600'
            }}
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  )
}

