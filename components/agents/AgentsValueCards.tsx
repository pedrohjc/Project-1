const valueCards = [
  {
    title: 'Tempo recuperado',
    copy: 'Tarefas repetitivas viram fluxo automático.',
  },
  {
    title: 'Menos erro manual',
    copy: 'Padronização e checagens antes da entrega.',
  },
  {
    title: 'Operação previsível',
    copy: 'Rotinas viram processo com visibilidade.',
  },
  {
    title: 'SLA e velocidade',
    copy: 'Respostas e triagens mais rápidas.',
  },
  {
    title: 'Treinamento embutido',
    copy: 'A regra vira um manual executável.',
  },
  {
    title: 'Governança',
    copy: 'Logs, permissões, revisão e trilha.',
  },
]

export default function AgentsValueCards() {
  return (
    <section className="agents-section" id="valor">
      <div className="container">
        <div className="agents-section-title">
          <h2>Onde isso gera valor</h2>
          <p>Benefícios que o cliente sente no dia a dia.</p>
        </div>

        <div className="agents-card-grid agents-card-grid--6">
          {valueCards.map((card) => (
            <div className="agents-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
