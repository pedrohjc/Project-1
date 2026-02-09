const timeline = [
  {
    title: 'Diagnóstico',
    copy: 'Processos + gargalos com foco em impacto.',
  },
  {
    title: 'Mapeamento',
    copy: 'Fluxo atual + regra de negócio aplicada.',
  },
  {
    title: 'Construção do Agent',
    copy: 'Ferramentas + limites + dados certos.',
  },
  {
    title: 'Validação',
    copy: 'Testes + ajustes + critérios de aprovação.',
  },
  {
    title: 'Operação',
    copy: 'Monitoramento + melhoria contínua.',
  },
]

const requirements = [
  'Acesso às ferramentas necessárias',
  'Modelos e padrões do escritório (quando existir)',
  'Responsável pela validação',
  'Escopo da primeira automação',
]

export default function AgentsTimeline() {
  return (
    <section className="agents-section" id="como-funciona">
      <div className="container">
        <div className="agents-section-title">
          <h2>Como a BALANCE implementa</h2>
          <p>Cinco etapas com governança em cada fase.</p>
        </div>

        <div className="agents-timeline">
          {timeline.map((step, index) => (
            <div className="agents-timeline-step" key={step.title}>
              <div className="agents-timeline-index">{index + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="agents-requirements glass-panel">
          <h3>O que você precisa ter pronto</h3>
          <ul>
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
