import Link from 'next/link'
import Logo from '../../components/Logo'
import AgentsHero from '../../components/agents/AgentsHero'
import AgentsWhatIs from '../../components/agents/AgentsWhatIs'
import AgentsValueCards from '../../components/agents/AgentsValueCards'
import AgentsUseCases from '../../components/agents/AgentsUseCases'
import AgentsTimeline from '../../components/agents/AgentsTimeline'
import AgentsGovernance from '../../components/agents/AgentsGovernance'
import AgentsBeforeAfter from '../../components/agents/AgentsBeforeAfter'
import AgentsImpactCalculator from '../../components/agents/AgentsImpactCalculator'
import AgentsFAQ from '../../components/agents/AgentsFAQ'
import AgentsFinalCTA from '../../components/agents/AgentsFinalCTA'

export default function AgentsPage() {
  return (
    <div className="agents-page">
      <header className="agents-header glass-header">
        <div className="container agents-header-inner">
          <Logo size="medium" />
          <nav className="agents-nav">
            <Link href="/">Início</Link>
            <Link href="/agents">Agents</Link>
            <Link href="#exemplos">Exemplos</Link>
            <Link href="#como-funciona">Processo</Link>
            <Link href="#seguranca">Segurança</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="/login" className="agents-link">
              Entrar
            </Link>
          </nav>
          <div className="header-cta-group">
            <a
              className="btn btn-primary"
              href="https://wa.me/5500000000000?text=Quero%20agendar%20um%20diagnostico"
              target="_blank"
              rel="noreferrer"
            >
              Agendar diagnóstico
            </a>
            <Link className="btn btn-secondary" href="/subscription">
              Ver planos
            </Link>
          </div>
        </div>
      </header>

      <main>
        <AgentsHero />
        <AgentsWhatIs />
        <AgentsValueCards />
        <AgentsImpactCalculator />
        <AgentsUseCases />
        <AgentsTimeline />
        <AgentsGovernance />
        <AgentsBeforeAfter />
        <AgentsFAQ />
        <AgentsFinalCTA />
      </main>

      <div className="agents-mobile-cta">
        <a
          className="btn btn-primary"
          href="https://wa.me/5500000000000?text=Quero%20agendar%20um%20diagnostico"
          target="_blank"
          rel="noreferrer"
        >
          Agendar diagnóstico
        </a>
      </div>
    </div>
  )
}
