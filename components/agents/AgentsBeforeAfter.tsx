const before = [
  'Triagem manual',
  'Copy e preenchimento repetitivo',
  'Repasse sem padrão',
  'Prazos sem visão',
  'Retrabalho',
]

const after = [
  'Triagem com padrão',
  'Rascunhos e checklists consistentes',
  'Handoff organizado',
  'Alertas e relatórios',
  'Menos retrabalho',
]

export default function AgentsBeforeAfter() {
  return (
    <section className="agents-section" id="antes-depois">
      <div className="container">
        <div className="agents-section-title">
          <h2>Antes e depois</h2>
          <p>Comparação direta do fluxo.</p>
        </div>

        <div className="agents-two-columns">
          <div className="agents-card">
            <h3>Antes</h3>
            <ul>
              {before.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="agents-card">
            <h3>Depois</h3>
            <ul>
              {after.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
