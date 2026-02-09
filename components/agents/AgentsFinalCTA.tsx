import Link from 'next/link'

export default function AgentsFinalCTA() {
  return (
    <section className="agents-section agents-final-cta" id="agendar-diagnostico">
      <div className="container agents-final-cta-inner">
        <div>
          <h2>Quer ver um Agent aplicado no seu fluxo real?</h2>
          <p>
            A BALANCE mapeia seu processo e mostra o que dá pra automatizar.
          </p>
        </div>
        <div className="agents-actions">
          <a
            className="btn btn-primary"
            href="https://wa.me/5500000000000?text=Quero%20agendar%20um%20diagnostico"
            target="_blank"
            rel="noreferrer"
          >
            Agendar diagnóstico
          </a>
          <a
            className="btn btn-secondary"
            href="https://wa.me/5500000000000?text=Quero%20falar%20com%20a%20Balance"
            target="_blank"
            rel="noreferrer"
          >
            Falar no WhatsApp
          </a>
          <Link className="agents-link" href="/subscription">
            Ver planos
          </Link>
        </div>
      </div>
    </section>
  )
}
