const useCases = [
  {
    title: 'Triagem de leads',
    flow: 'Formulário/WhatsApp -> resumo padronizado + classificação + checklist',
  },
  {
    title: 'Onboarding de cliente',
    flow: 'Documentos -> checklist + pendências + pasta organizada',
  },
  {
    title: 'Pré-análise documental',
    flow: 'Contratos/documentos -> highlights + inconsistências + perguntas',
  },
  {
    title: 'Peças internas',
    flow: 'Template + fatos -> rascunho estruturado + pontos a confirmar',
  },
  {
    title: 'Rotina de prazos',
    flow: 'Publicações/agenda -> alerta + resumo + tarefas no sistema',
  },
  {
    title: 'Relatórios',
    flow: 'Base de atendimentos -> KPI + relatório semanal',
  },
  {
    title: 'Pesquisa interna',
    flow: 'Base de documentos -> resposta com referência',
  },
  {
    title: 'Compliance',
    flow: 'Checklist LGPD -> validação e alertas',
  },
]

export default function AgentsUseCases() {
  return (
    <section className="agents-section" id="exemplos">
      <div className="container">
        <div className="agents-section-title">
          <h2>Casos de uso (sem prometer milagre)</h2>
          <p>
            Sempre com revisão do time quando configurado.
          </p>
        </div>

        <div className="agents-card-grid agents-card-grid--4">
          {useCases.map((useCase) => (
            <div className="agents-card agents-card--flow" key={useCase.title}>
              <h3>{useCase.title}</h3>
              <p>{useCase.flow}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
