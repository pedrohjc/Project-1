'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type {
  CopyOutput,
  CreativeBrief,
  RenderOutput,
  ResearchIdea,
  ResearchOutput,
} from '@/lib/instagramCreative'

const defaultBrief: CreativeBrief = {
  niche: 'advogados que querem crescer no Instagram',
  audience: 'advogados autônomos e pequenos escritórios',
  goal: 'autoridade e salvamentos',
  format: 'carousel',
  slideCount: 6,
  tone: 'moderno, claro e profissional',
  countryOrLanguage: 'pt-BR',
  brandStyle: 'premium minimalista azul e branco',
  mustAvoid: ['promessas exageradas', 'sensacionalismo'],
}

type Stage = 'brief' | 'ideas' | 'copy' | 'creative'
type ImageProvider = 'gemini' | 'openai'

export default function InstagramCreativeStudio() {
  const [brief, setBrief] = useState<CreativeBrief>(defaultBrief)
  const [imageProvider, setImageProvider] = useState<ImageProvider>('gemini')
  const [lastRenderProvider, setLastRenderProvider] = useState<ImageProvider>('gemini')
  const [mustAvoidInput, setMustAvoidInput] = useState(defaultBrief.mustAvoid.join(', '))
  const [loadingStage, setLoadingStage] = useState<Stage | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState('')
  const [researchOutput, setResearchOutput] = useState<ResearchOutput | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<ResearchIdea | null>(null)
  const [copyOutput, setCopyOutput] = useState<CopyOutput | null>(null)
  const [renderOutput, setRenderOutput] = useState<RenderOutput | null>(null)

  const stepItems = useMemo(
    () => [
      { id: 'brief', label: 'Briefing' },
      { id: 'ideas', label: 'Ideias' },
      { id: 'copy', label: 'Copy' },
      { id: 'creative', label: 'Criativos' },
    ] as const,
    []
  )

  const currentStageIndex = renderOutput
    ? 3
    : copyOutput
      ? 2
      : selectedIdea || researchOutput
        ? 1
        : 0

  const parsedMustAvoid = mustAvoidInput
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const requestBrief = {
    ...brief,
    mustAvoid: parsedMustAvoid,
  }

  useEffect(() => {
    if (!loadingStage) {
      setLoadingProgress(0)
      return
    }

    setLoadingProgress(8)
    const interval = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 92) return current

        if (current < 40) return current + 9
        if (current < 70) return current + 5
        if (current < 85) return current + 2
        return current + 1
      })
    }, 450)

    return () => window.clearInterval(interval)
  }, [loadingStage])

  const updateBrief = (field: keyof CreativeBrief, value: string | number) => {
    setBrief((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateIdeas = async () => {
    setLoadingStage('brief')
    setError('')
    setSelectedIdea(null)
    setCopyOutput(null)
    setRenderOutput(null)

    try {
      const response = await fetch('/api/instagram-creative/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBrief),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar ideias')
      setLoadingProgress(100)
      setResearchOutput(data)
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar ideias')
    } finally {
      setLoadingStage(null)
    }
  }

  const handleGenerateCopy = async () => {
    if (!selectedIdea) return
    setLoadingStage('ideas')
    setError('')
    setCopyOutput(null)
    setRenderOutput(null)

    try {
      const response = await fetch('/api/instagram-creative/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: requestBrief,
          idea: selectedIdea,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar copy')
      setLoadingProgress(100)
      setCopyOutput(data)
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar copy')
    } finally {
      setLoadingStage(null)
    }
  }

  const handleRenderSlides = async () => {
    if (!copyOutput) return
    setLoadingStage('copy')
    setError('')
    setRenderOutput(null)

    try {
      const response = await fetch('/api/instagram-creative/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: requestBrief,
          copy: copyOutput,
          imageProvider,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao renderizar criativos')
      setLoadingProgress(100)
      setRenderOutput(data)
      setLastRenderProvider(imageProvider)
    } catch (err: any) {
      setError(err?.message || 'Erro ao renderizar criativos')
    } finally {
      setLoadingStage(null)
    }
  }

  const handleSelectIdea = (idea: ResearchIdea) => {
    setSelectedIdea(idea)
    setCopyOutput(null)
    setRenderOutput(null)
  }

  const loadingMessage =
    loadingStage === 'brief'
      ? 'Pesquisando temas e montando ideias com potencial de retenção...'
      : loadingStage === 'ideas'
        ? 'Estruturando a copy e organizando os slides...'
        : loadingStage === 'copy'
          ? `Criando os slides com ${imageProvider === 'gemini' ? 'Gemini' : 'OpenAI'}...`
          : ''

  return (
    <div style={{ padding: '32px 24px 120px', background: 'var(--balance-bg)', minHeight: '100%' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
            borderRadius: '24px',
            padding: '32px',
            color: 'white',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
          }}
        >
          <p style={{ margin: 0, opacity: 0.78, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            MVP local do novo produto
          </p>
          <h2 style={{ margin: '10px 0 12px', fontSize: '2rem', lineHeight: 1.15 }}>
            Criador de Carrossel para Instagram
          </h2>
          <p style={{ margin: 0, maxWidth: '820px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7 }}>
            Fluxo completo em 3 engines: pesquisa de temas, geração da copy e criação visual por slide. Agora a etapa final
            tenta gerar imagem real com o prompt do `Designer`, usando Gemini ou OpenAI, e mantém preview local só como fallback.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginTop: '24px' }}>
            {stepItems.map((item, index) => {
              const active = index <= currentStageIndex
              return (
                <div
                  key={item.id}
                  style={{
                    borderRadius: '16px',
                    padding: '14px 16px',
                    background: active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                    border: active ? '1px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', opacity: 0.74 }}>Etapa {index + 1}</div>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>{item.label}</div>
                </div>
              )
            })}
          </div>
        </section>

        {loadingStage && (
          <section
            style={{
              background: 'white',
              border: '1px solid #dbeafe',
              borderRadius: '22px',
              padding: '18px 20px',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
              display: 'grid',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>Processando</strong>
                <p style={{ margin: '6px 0 0', color: '#475569', lineHeight: 1.6 }}>{loadingMessage}</p>
              </div>
              <span style={pillStyle('#dbeafe', '#1d4ed8')}>{Math.min(99, loadingProgress)}%</span>
            </div>
            <div
              style={{
                height: '12px',
                borderRadius: '999px',
                background: '#e2e8f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(99, loadingProgress)}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #38bdf8 100%)',
                  transition: 'width 0.35s ease',
                }}
              />
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
              Aguarde essa etapa terminar. Os botões ficam bloqueados enquanto o processo estiver rodando para evitar retrabalho.
            </p>
          </section>
        )}

        {error && (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#9f1239',
              borderRadius: '16px',
              padding: '14px 18px',
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>1. Briefing do projeto</h3>
              <p style={{ margin: '8px 0 0', color: '#64748b', lineHeight: 1.6 }}>
                Defina o contexto do conteúdo. Esse bloco já modela o contrato do produto e alimenta as três engines.
              </p>
            </div>
            <button
              onClick={handleGenerateIdeas}
              disabled={Boolean(loadingStage)}
              style={{
                border: 'none',
                borderRadius: '14px',
                background: '#1d4ed8',
                color: 'white',
                padding: '14px 18px',
                fontWeight: 700,
                cursor: loadingStage ? 'not-allowed' : 'pointer',
                minWidth: '180px',
                opacity: loadingStage ? 0.65 : 1,
              }}
            >
              {loadingStage === 'brief' ? 'Gerando ideias...' : 'Gerar 5 ideias'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            <Field label="Nicho">
              <input value={brief.niche} onChange={(e) => updateBrief('niche', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Público">
              <input value={brief.audience} onChange={(e) => updateBrief('audience', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Objetivo">
              <input value={brief.goal} onChange={(e) => updateBrief('goal', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Tom">
              <input value={brief.tone} onChange={(e) => updateBrief('tone', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Formato">
              <select value={brief.format} onChange={(e) => updateBrief('format', e.target.value)} style={inputStyle}>
                <option value="carousel">Carrossel</option>
                <option value="post">Post estático</option>
              </select>
            </Field>
            <Field label="Quantidade de slides">
              <input
                type="number"
                min={1}
                max={10}
                value={brief.slideCount}
                onChange={(e) => updateBrief('slideCount', Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            <Field label="Idioma / país">
              <input value={brief.countryOrLanguage} onChange={(e) => updateBrief('countryOrLanguage', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Estilo visual da marca">
              <input value={brief.brandStyle} onChange={(e) => updateBrief('brandStyle', e.target.value)} style={inputStyle} />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Evitar">
                <input
                  value={mustAvoidInput}
                  onChange={(e) => setMustAvoidInput(e.target.value)}
                  style={inputStyle}
                  placeholder="separe por vírgula"
                />
              </Field>
            </div>
          </div>
        </section>

        {researchOutput && (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h3 style={sectionTitleStyle}>2. Ideias sugeridas</h3>
                <p style={sectionDescriptionStyle}>
                  Escolha um tema para transformar em copy. Aqui o usuário ganha controle antes de avançar para a produção.
                </p>
              </div>
              <button
                onClick={handleGenerateCopy}
                disabled={!selectedIdea || Boolean(loadingStage)}
                style={primaryButtonStyle}
              >
                {loadingStage === 'ideas' ? 'Gerando copy...' : 'Gerar copy da ideia selecionada'}
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {researchOutput.ideas.map((idea) => {
                const selected = selectedIdea?.ideaId === idea.ideaId
                return (
                  <button
                    key={idea.ideaId}
                    type="button"
                    onClick={() => handleSelectIdea(idea)}
                    style={{
                      textAlign: 'left',
                      background: selected ? '#eff6ff' : '#f8fafc',
                      border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '18px',
                      cursor: 'pointer',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={pillStyle(idea.viralityPotential === 'high' ? '#dbeafe' : '#e2e8f0', idea.viralityPotential === 'high' ? '#1d4ed8' : '#334155')}>
                        {idea.viralityPotential.toUpperCase()}
                      </span>
                      <span style={pillStyle('#f8fafc', '#475569')}>{idea.formatFit}</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.06rem', color: '#0f172a' }}>{idea.title}</h4>
                      <p style={{ margin: '8px 0 0', color: '#334155', fontWeight: 600 }}>{idea.hook}</p>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>{idea.whyItCanPerform}</p>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569', display: 'grid', gap: '6px' }}>
                      {idea.researchSummary.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {copyOutput && (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h3 style={sectionTitleStyle}>3. Copy estruturada</h3>
                <p style={sectionDescriptionStyle}>
                  A saída já vem pronta para renderização: headline, subtexto, corpo e intenção visual por slide.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <label style={{ display: 'grid', gap: '6px', minWidth: '180px' }}>
                  <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>Motor de imagem</span>
                  <select value={imageProvider} onChange={(e) => setImageProvider(e.target.value as ImageProvider)} style={inputStyle} disabled={Boolean(loadingStage)}>
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </label>
                <button
                  onClick={handleRenderSlides}
                  disabled={Boolean(loadingStage)}
                  style={primaryButtonStyle}
                >
                  {loadingStage === 'copy' ? 'Renderizando slides...' : `Gerar criativos com ${imageProvider === 'gemini' ? 'Gemini' : 'OpenAI'}`}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '18px' }}>
              <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: 0, fontSize: '1.12rem', color: '#0f172a' }}>{copyOutput.title}</h4>
                <p style={{ margin: '10px 0 0', color: '#475569', lineHeight: 1.7 }}>{copyOutput.caption}</p>
              </div>

              <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {copyOutput.slides.map((slide) => (
                  <div key={slide.slideNumber} style={{ padding: '18px', borderRadius: '18px', border: '1px solid #e2e8f0', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={pillStyle('#eef2ff', '#3730a3')}>{slide.role}</span>
                      <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Slide {slide.slideNumber}</span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{slide.headline}</h4>
                    {slide.subtext && (
                      <p style={{ margin: '8px 0 0', color: '#1d4ed8', fontWeight: 600 }}>{slide.subtext}</p>
                    )}
                    {slide.body && (
                      <p style={{ margin: '10px 0 0', color: '#475569', lineHeight: 1.65 }}>{slide.body}</p>
                    )}
                    <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Intenção visual: {slide.visualIntent}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {renderOutput && (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h3 style={sectionTitleStyle}>4. Preview dos criativos</h3>
                <p style={sectionDescriptionStyle}>
                  Cada slide agora tenta sair como imagem real. Se a API falhar em algum slide, o sistema mantém um fallback
                  local para você não perder o fluxo. O motor selecionado nesta rodada foi {lastRenderProvider === 'gemini' ? 'Gemini' : 'OpenAI'}.
                </p>
              </div>
              <span style={pillStyle('#ecfeff', '#0f766e')}>{renderOutput.styleLockApplied.artDirection}</span>
            </div>

            <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {renderOutput.slides.map((slide) => (
                <div key={slide.slideNumber} style={{ borderRadius: '22px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>Slide {slide.slideNumber}</strong>
                      <span style={{ color: slide.status === 'success' ? '#15803d' : '#b45309', fontSize: '0.78rem', fontWeight: 700 }}>
                        {slide.status === 'success' ? `Imagem real • ${slide.generationModel}` : `Fallback • ${slide.generationModel}`}
                      </span>
                    </div>
                    <a
                      href={slide.imageUrl}
                      download={`instagram-slide-${slide.slideNumber}.${slide.downloadExtension}`}
                      style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                      Baixar
                    </a>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${slide.slideNumber}`}
                      style={{ width: '100%', borderRadius: '18px', display: 'block', boxShadow: '0 18px 36px rgba(15,23,42,0.14)' }}
                    />
                    {slide.warning && (
                      <div
                        style={{
                          marginTop: '12px',
                          borderRadius: '14px',
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          color: '#9a3412',
                          padding: '10px 12px',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {slide.warning}
                      </div>
                    )}
                    <details style={{ marginTop: '12px' }}>
                      <summary style={{ cursor: 'pointer', color: '#334155', fontWeight: 600 }}>Ver prompt do Designer</summary>
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '12px',
                          borderRadius: '14px',
                          background: '#0f172a',
                          color: '#e2e8f0',
                          fontSize: '0.82rem',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {slide.generationPrompt}
                        {slide.negativePrompt ? `\n\nNEGATIVE PROMPT:\n${slide.negativePrompt}` : ''}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '8px' }}>
      <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.92rem' }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  padding: '13px 14px',
  fontSize: '0.95rem',
  color: '#0f172a',
  background: '#fff',
}

const panelStyle: CSSProperties = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '28px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '20px',
}

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.35rem',
  color: '#0f172a',
}

const sectionDescriptionStyle: CSSProperties = {
  margin: '8px 0 0',
  color: '#64748b',
  lineHeight: 1.6,
}

const primaryButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '14px',
  background: '#1d4ed8',
  color: 'white',
  padding: '14px 18px',
  fontWeight: 700,
  cursor: 'pointer',
  minWidth: '200px',
}

function pillStyle(background: string, color: string): CSSProperties {
  return {
    background,
    color,
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }
}
