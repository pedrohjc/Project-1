const controls = [
  'Permissões por função',
  'Ações registradas (logs)',
  'Aprovação humana em etapas críticas',
  'Versionamento de prompts/regras',
  'Ambiente de teste antes do "produção"',
]

const privacy = [
  'Princípios LGPD (minimização, finalidade, acesso)',
  'Dados do cliente tratados conforme configuração do escritório',
  'Opção de mascaramento em inputs sensíveis (quando aplicável)',
  'Política clara de retenção (ajustável no contrato)',
]

export default function AgentsGovernance() {
  return (
    <section className="agents-section" id="seguranca">
      <div className="container">
        <div className="agents-section-title">
          <h2>Governança e segurança</h2>
          <p>Controle real para reduzir risco.</p>
        </div>

        <div className="agents-two-columns">
          <div className="agents-card">
            <h3>Controles</h3>
            <ul>
              {controls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="agents-card">
            <h3>Privacidade</h3>
            <ul>
              {privacy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="agents-disclaimer">
          Sem garantia de resultado jurídico. O foco é produtividade e
          padronização operacional.
        </p>
      </div>
    </section>
  )
}
