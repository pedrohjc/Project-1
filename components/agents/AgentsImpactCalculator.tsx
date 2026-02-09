'use client'

import { useMemo, useState } from 'react'

export default function AgentsImpactCalculator() {
  const [weekly, setWeekly] = useState('40')
  const [minutes, setMinutes] = useState('30')
  const [people, setPeople] = useState('4')
  const [hourlyRate, setHourlyRate] = useState('150')
  const [monthlySalary, setMonthlySalary] = useState('4500')
  const [replaceable, setReplaceable] = useState('1')

  const result = useMemo(() => {
    const weeklyNum = Number(weekly) || 0
    const minutesNum = Number(minutes) || 0
    const peopleNum = Number(people) || 1
    const rateNum = Number(hourlyRate) || 0
    const salaryNum = Number(monthlySalary) || 0
    const replaceableNum = Number(replaceable) || 0

    // Horas economizadas por pessoa * nº de pessoas
    const hoursPerWeekPerPerson = (weeklyNum * minutesNum) / 60
    const hoursPerMonthPerPerson = hoursPerWeekPerPerson * 4.3
    const totalHoursPerMonth = hoursPerMonthPerPerson * peopleNum
    const totalDays = totalHoursPerMonth / 8

    // Economia direta (horas x valor/hora x pessoas)
    const directSavings = totalHoursPerMonth * rateNum

    // Custo CLT estimado (salário x 1.8 encargos médios)
    const cltMultiplier = 1.8
    const cltCostPerPerson = salaryNum * cltMultiplier
    const cltTotalReplaceable = cltCostPerPerson * Math.min(replaceableNum, peopleNum)

    return {
      hoursTotal: Math.max(0, totalHoursPerMonth),
      daysTotal: Math.max(0, totalDays),
      people: Math.max(1, peopleNum),
      directSavings: Math.max(0, directSavings),
      cltCostPerPerson: Math.max(0, cltCostPerPerson),
      cltTotalReplaceable: Math.max(0, cltTotalReplaceable),
      replaceableNum: Math.min(replaceableNum, peopleNum),
      totalSavings: Math.max(0, directSavings + cltTotalReplaceable),
    }
  }, [weekly, minutes, people, hourlyRate, monthlySalary, replaceable])

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <section className="agents-section" id="impacto">
      <div className="container">
        <div className="agents-section-title">
          <h2>Calculadora de impacto</h2>
          <p>Descubra quanto você pode economizar com os Agents.</p>
        </div>

        <div className="agents-calculator glass-panel">
          <div className="agents-form">
            <label>
              Atendimentos por semana
              <input
                type="number"
                min="0"
                value={weekly}
                onChange={(e) => setWeekly(e.target.value)}
              />
            </label>
            <label>
              Tempo por atendimento em tarefas repetitivas
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginTop: '8px'
              }}>
                {[
                  { label: '30min', value: '30' },
                  { label: '1h', value: '60' },
                  { label: '1h30', value: '90' },
                  { label: '2h', value: '120' },
                  { label: '2h30', value: '150' },
                  { label: '3h', value: '180' },
                  { label: '3h30', value: '210' },
                  { label: '4h', value: '240' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMinutes(opt.value)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                      background: minutes === opt.value ? 'var(--balance-primary)' : 'rgba(255, 255, 255, 0.85)',
                      color: minutes === opt.value ? '#ffffff' : 'var(--balance-text)',
                      boxShadow: minutes === opt.value
                        ? '0 8px 18px rgba(28, 44, 59, 0.25)'
                        : '0 2px 8px rgba(28, 44, 59, 0.08)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>
            <label>
              Pessoas na operação
              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
            </label>
            <label>
              Valor médio da hora (R$)
              <input
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </label>

            <div style={{
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(28, 44, 59, 0.12)'
            }}>
              <p style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--balance-text-light)',
                marginBottom: '12px'
              }}>
                Simulação de corte de custos
              </p>
              <label>
                Salário médio mensal por pessoa (R$)
                <input
                  type="number"
                  min="0"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                />
              </label>
              <label>
                Posições que os Agents podem substituir
                <input
                  type="number"
                  min="0"
                  value={replaceable}
                  onChange={(e) => setReplaceable(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="agents-calculator-result">
            <h3>Sua economia estimada</h3>

            <div style={{
              display: 'grid',
              gap: '16px',
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(28, 44, 59, 0.08)'
            }}>
              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--balance-text-light)'
                }}>
                  Tempo economizado ({result.people} pessoas)
                </span>
                <strong style={{ display: 'block', fontSize: '1.3rem' }}>
                  {result.hoursTotal.toFixed(1)} horas/mês
                </strong>
                <span style={{ color: 'var(--balance-text-light)', fontSize: '0.9rem' }}>
                  Equivalente a {result.daysTotal.toFixed(1)} dias de trabalho
                </span>
              </div>

              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--balance-text-light)'
                }}>
                  Economia direta (horas recuperadas)
                </span>
                <strong style={{ display: 'block', fontSize: '1.3rem' }}>
                  R$ {fmt(result.directSavings)}
                </strong>
              </div>
            </div>

            {result.replaceableNum > 0 && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(46, 196, 166, 0.08)',
                border: '1px solid rgba(46, 196, 166, 0.2)'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--balance-text-light)'
                }}>
                  Corte de custos CLT ({result.replaceableNum} posição{result.replaceableNum > 1 ? 'ões' : ''})
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--balance-text-light)', margin: '6px 0' }}>
                  Custo estimado por pessoa: R$ {fmt(result.cltCostPerPerson)}/mês
                  <br />
                  <span style={{ fontSize: '0.8rem' }}>(salário + ~80% encargos: FGTS, INSS, férias, 13º, etc.)</span>
                </p>
                <strong style={{ display: 'block', fontSize: '1.3rem' }}>
                  R$ {fmt(result.cltTotalReplaceable)}/mês
                </strong>
              </div>
            )}

            <div style={{
              marginTop: '20px',
              padding: '18px',
              borderRadius: '16px',
              background: 'var(--balance-primary)',
              color: 'white',
              textAlign: 'center'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                opacity: 0.8
              }}>
                Economia total estimada
              </span>
              <strong style={{ display: 'block', fontSize: '2.2rem', marginTop: '4px' }}>
                R$ {fmt(result.totalSavings)}/mês
              </strong>
            </div>

            <p style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--balance-text-light)' }}>
              Esta é uma estimativa do que você pode economizar com os Agents.
              O ganho real depende do processo, da complexidade e do volume.
              Encargos CLT calculados com multiplicador médio de 1.8x sobre o salário.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
