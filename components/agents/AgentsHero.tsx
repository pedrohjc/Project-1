import Link from 'next/link'

export default function AgentsHero() {
  return (
    <section className="agents-section agents-hero">
      <div className="container agents-hero-grid">
        <div className="agents-hero-copy">
          <p className="agents-eyebrow">Agents Jurídicos</p>
          <h1>
            Agents Jurídicos que executam tarefas - com controle, registro e
            segurança.
          </h1>
          <p className="agents-lead">
            Automatize rotinas sem perder governança. Cada ação é rastreável,
            revisável e alinhada ao seu fluxo.
          </p>
          <ul className="agents-bullets">
            <li>Menos tempo em tarefas operacionais</li>
            <li>Padrão de qualidade e consistência</li>
            <li>Rastreabilidade e auditoria (logs)</li>
          </ul>
          <div className="agents-actions">
            <Link className="btn btn-primary" href="#agendar-diagnostico">
              Agendar diagnóstico
            </Link>
            <Link className="btn btn-secondary" href="#exemplos">
              Ver exemplos práticos
            </Link>
            <Link className="agents-link" href="#como-funciona">
              Como funciona
            </Link>
          </div>
        </div>

        <div className="agents-hero-flow glass-panel">
          <h3>Fluxo operacional</h3>
          <div className="agents-flow-stack">
            <div className="agents-flow-card">
              <span>Entrada</span>
              <p>Briefing, documentos ou formulário.</p>
            </div>
            <div className="agents-flow-card">
              <span>Regras</span>
              <p>Limites, validações e padrões do time.</p>
            </div>
            <div className="agents-flow-card">
              <span>Execução</span>
              <p>IA + automações integradas ao fluxo.</p>
            </div>
            <div className="agents-flow-card">
              <span>Revisão</span>
              <p>Checks humanos quando necessário.</p>
            </div>
            <div className="agents-flow-card">
              <span>Registro</span>
              <p>Log, trilha e relatório final.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
