import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo size="small" />
          <p className="footer-tagline">
            Tecnologia acessível, automação inteligente e pessoas no centro.
          </p>
          <div className="footer-meta">
            <span>Balance Solutions</span>
            <span className="footer-dot" />
            <span>Desde 2024</span>
          </div>
        </div>

        <div className="footer-column">
          <h4>Plataforma</h4>
          <Link href="/register">Criar conta</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>

        <div className="footer-column">
          <h4>Produtos</h4>
          <Link href="/#produtos">Assistentes IA</Link>
          <Link href="/subscription">Assinaturas</Link>
          <Link href="/tokens">Tokens</Link>
        </div>

        <div className="footer-column">
          <h4>Contato</h4>
          <a href="mailto:contato@balancesolutions.com.br">
            contato@balancesolutions.com.br
          </a>
          <span className="footer-mono">Atendimento: seg-sex, 9h-18h</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span className="footer-mono">
          Balance Solutions. Todos os direitos reservados.
        </span>
        <div className="footer-links">
          <Link href="/subscription">Planos</Link>
          <Link href="/login">Acesso</Link>
        </div>
      </div>
    </footer>
  )
}
