const faqs = [
  {
    question: 'Isso substitui advogado?',
    answer: 'Não. O agent automatiza operação; a decisão segue humana.',
  },
  {
    question: 'E seguro?',
    answer: 'Sim, com governança, logs e permissões por função.',
  },
  {
    question: 'A IA pode errar?',
    answer: 'Sim - por isso existem regras e revisão configuradas.',
  },
  {
    question: 'Vocês acessam meus dados?',
    answer: 'Somente conforme configuração e política definida no contrato.',
  },
  {
    question: 'Integra com meu sistema?',
    answer: 'Depende do sistema. Integrações são avaliadas sob consulta.',
  },
  {
    question: 'Quanto tempo pra rodar?',
    answer: 'O primeiro agent normalmente entra em dias, após mapeamento.',
  },
  {
    question: 'Precisa de treinamento?',
    answer: 'Sim, curto e orientado ao fluxo do escritório.',
  },
  {
    question: 'Dá pra limitar o que ele faz?',
    answer: 'Sim, escopo e permissões definem o limite.',
  },
  {
    question: 'Posso comecar pequeno?',
    answer: 'Sim, comece com um fluxo crítico.',
  },
  {
    question: 'E se eu quiser cancelar?',
    answer: 'Retenção e dados seguem o contrato. Ajustável conforme política.',
  },
]

export default function AgentsFAQ() {
  return (
    <section className="agents-section" id="faq">
      <div className="container">
        <div className="agents-section-title">
          <h2>Perguntas frequentes</h2>
          <p>Respostas diretas.</p>
        </div>

        <div className="agents-faq">
          {faqs.map((item) => (
            <details key={item.question} className="agents-faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
