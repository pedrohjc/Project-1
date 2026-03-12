import { z } from 'zod'

export const creativeBriefSchema = z.object({
  niche: z.string().min(3).max(160),
  audience: z.string().min(3).max(160),
  goal: z.string().min(3).max(160),
  format: z.enum(['carousel', 'post']),
  slideCount: z.number().int().min(1).max(10),
  tone: z.string().min(2).max(160),
  countryOrLanguage: z.string().min(2).max(60).default('pt-BR'),
  brandStyle: z.string().max(200).optional().default(''),
  mustAvoid: z.array(z.string().min(1).max(80)).max(8).optional().default([]),
})

export type CreativeBrief = z.infer<typeof creativeBriefSchema>

export const researchIdeaSchema = z.object({
  ideaId: z.string(),
  title: z.string(),
  hook: z.string(),
  angle: z.string(),
  whyItCanPerform: z.string(),
  formatFit: z.enum(['carousel', 'post', 'reels']).default('carousel'),
  viralityPotential: z.enum(['high', 'medium', 'low']).default('medium'),
  researchSummary: z.array(z.string()).min(2).max(5),
  supportingFacts: z.array(z.string()).min(1).max(5).default([]),
  sourceConfidence: z.enum(['high', 'medium', 'low']).default('medium'),
})

export type ResearchIdea = z.infer<typeof researchIdeaSchema>

export const researchOutputSchema = z.object({
  researchSessionId: z.string(),
  niche: z.string(),
  ideas: z.array(researchIdeaSchema).length(5),
})

export type ResearchOutput = z.infer<typeof researchOutputSchema>

export const copySlideSchema = z.object({
  slideNumber: z.number().int().min(1).max(10),
  role: z.enum(['cover', 'content', 'cta']),
  headline: z.string(),
  subtext: z.string().default(''),
  body: z.string().default(''),
  visualIntent: z.string(),
  visualSubject: z.string().optional().default(''),
  supportingVisuals: z.array(z.string()).max(5).optional().default([]),
  compositionNotes: z.string().optional().default(''),
  retentionHook: z.string().optional().default(''),
})

export type CopySlide = z.infer<typeof copySlideSchema>

export const copyOutputSchema = z.object({
  copySessionId: z.string(),
  format: z.enum(['carousel', 'post']),
  goal: z.string(),
  title: z.string(),
  caption: z.string(),
  cta: z.string(),
  slides: z.array(copySlideSchema).min(1).max(10),
  designNotes: z.object({
    overallMood: z.string(),
    textDensity: z.enum(['low', 'medium', 'high']),
    readingPace: z.enum(['fast', 'medium', 'slow']),
    visualSystem: z.string(),
    visualTheme: z.string().optional().default(''),
  }),
})

export type CopyOutput = z.infer<typeof copyOutputSchema>

export interface StyleLock {
  palette: [string, string, string]
  artDirection: string
  typographyStyle: string
  recurringElements: string[]
}

export interface RenderedSlide {
  slideNumber: number
  status: 'success' | 'fallback'
  imageUrl: string
  width: number
  height: number
  generationPrompt: string
  negativePrompt?: string
  generationModel: string
  imageMimeType: 'image/png' | 'image/svg+xml'
  downloadExtension: 'png' | 'svg'
  warning?: string
}

export interface RenderOutput {
  creativeSessionId: string
  styleLockApplied: StyleLock
  slides: RenderedSlide[]
}

export interface DesignerPromptPayload {
  prompt: string
  negativePrompt: string
}

const DEFAULT_STYLE_LOCK: StyleLock = {
  palette: ['#0F172A', '#2563EB', '#F8FAFC'],
  artDirection: 'premium minimalist social design',
  typographyStyle: 'bold geometric headline with clean supporting text',
  recurringElements: ['soft radial gradients', 'glass panels', 'sharp spacing', 'high contrast'],
}

export function createSessionId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function extractJsonBlock(content: string): string {
  const trimmed = content.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }

  throw new Error('Não foi possível encontrar JSON válido na resposta do modelo.')
}

export function buildResearchPrompt(brief: CreativeBrief) {
  return `
Você é o Research Engine de um produto que cria carrosséis prontos para Instagram.
Seu trabalho é sugerir EXATAMENTE 5 ideias com potencial de performance.

Regras:
- Responda SOMENTE em JSON válido.
- Não escreva explicações fora do JSON.
- Não gere copy de slides.
- As ideias devem ser atuais, úteis e fáceis de transformar em carrossel ou post.
- Priorização: autoridade, compartilhamento, salvamento e clareza.
- Idioma: ${brief.countryOrLanguage}.
- Evite: ${brief.mustAvoid.join(', ') || 'nada específico'}.

Contexto do usuário:
- Nicho: ${brief.niche}
- Público: ${brief.audience}
- Objetivo: ${brief.goal}
- Formato preferido: ${brief.format}
- Tom: ${brief.tone}
- Estilo de marca: ${brief.brandStyle || 'não informado'}

Formato de saída:
{
  "researchSessionId": "string",
  "niche": "string",
  "ideas": [
    {
      "ideaId": "idea_1",
      "title": "string",
      "hook": "string",
      "angle": "string",
      "whyItCanPerform": "string",
      "formatFit": "carousel",
      "viralityPotential": "high",
      "researchSummary": ["string", "string", "string"],
      "supportingFacts": ["string", "string"],
      "sourceConfidence": "medium"
    }
  ]
}
`.trim()
}

export function buildCopyPrompt(brief: CreativeBrief, idea: ResearchIdea) {
  return `
Você é o Copy Engine de um produto que cria carrosséis premium para Instagram.
Seu trabalho é transformar a ideia escolhida em uma copy clara, estratégica e altamente renderizável.

Regras:
- Responda SOMENTE em JSON válido.
- Não escreva nada fora do JSON.
- O texto precisa funcionar em design de Instagram.
- Headline curta, body legível, CTA objetiva.
- Priorize retenção, salvamentos, autoridade e clareza.
- Descubra o "ponto de ouro" da ideia e faça cada slide avançar essa narrativa.
- Cada slide precisa trazer direção visual concreta, não genérica.
- Evite visualIntent vazio ou abstrato demais como "impacto", "futurista", "moderno", "neon bonito".
- Para cada slide, descreva um assunto visual real: objeto, cena, metáfora, interface, documento, ambiente, gesto, contraste ou símbolo ligado ao tema.
- O cover precisa ter uma metáfora ou cena magnética.
- Slides de conteúdo precisam parecer ricos e informativos, com sinais de prova, contexto e especificidade.
- O último slide precisa soar conclusivo e acionável.
- Não invente pesquisa além do contexto recebido.
- Idioma: ${brief.countryOrLanguage}.
- Tom: ${brief.tone}.
- Objetivo: ${brief.goal}.

Contexto:
- Nicho: ${brief.niche}
- Público: ${brief.audience}
- Formato: ${brief.format}
- Total de slides: ${brief.slideCount}
- Estilo de marca: ${brief.brandStyle || 'não informado'}

Ideia escolhida:
${JSON.stringify(idea, null, 2)}

Formato de saída:
{
  "copySessionId": "string",
  "format": "${brief.format}",
  "goal": "${brief.goal}",
  "title": "string",
  "caption": "string",
  "cta": "string",
  "slides": [
    {
      "slideNumber": 1,
      "role": "cover",
      "headline": "string",
      "subtext": "string",
      "body": "string",
      "visualIntent": "descrição curta da intenção visual do slide",
      "visualSubject": "assunto principal concreto da imagem",
      "supportingVisuals": ["elemento secundário 1", "elemento secundário 2"],
      "compositionNotes": "instrução curta de composição, enquadramento e hierarquia",
      "retentionHook": "o detalhe visual que faz a pessoa parar o scroll"
    }
  ],
  "designNotes": {
    "overallMood": "string",
    "textDensity": "low",
    "readingPace": "fast",
    "visualSystem": "string",
    "visualTheme": "tema visual comum que amarra todo o carrossel"
  }
}

Critérios visuais obrigatórios:
- O visualSubject deve ser específico e ligado ao tema do slide.
- supportingVisuals deve reforçar credibilidade, contexto ou profundidade.
- compositionNotes deve orientar layout real, por exemplo: "headline no topo esquerdo, prova visual central, painel de apoio no canto inferior direito".
- retentionHook deve ser um detalhe chamativo e elegante, não clickbait bobo.
- Se o tema permitir, use símbolos do nicho de forma premium e editorial.
- Não transforme todos os slides em ícones soltos no vazio.
`.trim()
}

export function buildFallbackResearch(brief: CreativeBrief): ResearchOutput {
  const niche = brief.niche
  const goal = brief.goal
  const ideas: ResearchIdea[] = [
    {
      ideaId: 'idea_1',
      title: `3 erros comuns em ${niche} que ainda travam resultados`,
      hook: 'a maioria ainda perde tempo por repetir um processo ruim',
      angle: 'mostrar erros práticos e como corrigir',
      whyItCanPerform: 'mistura dor real, identificação e utilidade imediata',
      formatFit: 'carousel',
      viralityPotential: 'high',
      researchSummary: [
        `Conteúdos de erro e correção têm boa retenção para ${goal}.`,
        'Listas curtas com aplicação prática tendem a gerar salvamentos.',
        'Exemplos do dia a dia aumentam percepção de autoridade.'
      ],
      supportingFacts: ['Formato fácil de skimmar.', 'Boa adaptação para capa forte.'],
      sourceConfidence: 'medium',
    },
    {
      ideaId: 'idea_2',
      title: `O que quase ninguém te fala sobre ${niche}`,
      hook: 'o ponto invisível que separa o amador de quem cresce',
      angle: 'revelar uma nuance pouco discutida',
      whyItCanPerform: 'curiosidade forte com tom de descoberta',
      formatFit: 'carousel',
      viralityPotential: 'high',
      researchSummary: [
        'Conteúdo de “verdade escondida” gera curiosidade.',
        'Boa combinação com carrossel educativo.',
        'Funciona bem para posicionamento de autoridade.'
      ],
      supportingFacts: ['Capa magnética.', 'Tema adaptável a diferentes públicos.'],
      sourceConfidence: 'medium',
    },
    {
      ideaId: 'idea_3',
      title: `5 ideias de conteúdo para ${niche} que geram mais ${goal}`,
      hook: 'conteúdo bonito não basta se não houver estratégia',
      angle: 'entregar estrutura pronta e reaproveitável',
      whyItCanPerform: 'conteúdo utilitário e altamente salvável',
      formatFit: 'carousel',
      viralityPotential: 'high',
      researchSummary: [
        'Conteúdos prontos para copiar aumentam compartilhamento.',
        'Listas acionáveis melhoram salvamento.',
        'Boa ponte para CTA de comentário ou direct.'
      ],
      supportingFacts: ['Formato evergreen.', 'Fácil de adaptar para série.'],
      sourceConfidence: 'medium',
    },
    {
      ideaId: 'idea_4',
      title: `Pare de fazer isso em ${niche}`,
      hook: 'um hábito comum pode estar sabotando seu crescimento',
      angle: 'quebra de padrão com correção simples',
      whyItCanPerform: 'choque inicial forte e leitura rápida',
      formatFit: 'carousel',
      viralityPotential: 'medium',
      researchSummary: [
        'Aberturas com ruptura costumam segurar atenção.',
        'Conteúdo corretivo amplia comentários.',
        'Boa combinação com CTA de salvar para lembrar depois.'
      ],
      supportingFacts: ['Abre espaço para antes/depois.', 'Boa capa para feed.'],
      sourceConfidence: 'medium',
    },
    {
      ideaId: 'idea_5',
      title: `O passo a passo mais simples para melhorar ${goal} em ${niche}`,
      hook: 'menos teoria, mais execução clara',
      angle: 'framework enxuto em poucos passos',
      whyItCanPerform: 'didático, direto e fácil de aplicar',
      formatFit: 'carousel',
      viralityPotential: 'medium',
      researchSummary: [
        'Estruturas passo a passo facilitam retenção.',
        'Conteúdo claro funciona melhor com público misto.',
        'Pode virar série com continuidade.'
      ],
      supportingFacts: ['Excelente para CTA de salvar.', 'Fácil de expandir depois.'],
      sourceConfidence: 'medium',
    },
  ]

  return {
    researchSessionId: createSessionId('rs'),
    niche,
    ideas,
  }
}

export function buildFallbackCopy(brief: CreativeBrief, idea: ResearchIdea): CopyOutput {
  const slideCount = brief.format === 'post' ? 1 : brief.slideCount
  const slides: CopySlide[] = []

  slides.push({
    slideNumber: 1,
    role: 'cover',
    headline: idea.title,
    subtext: idea.hook,
    body: '',
    visualIntent: 'impact and curiosity',
    visualSubject: `hero scene about ${idea.title}`,
    supportingVisuals: [brief.niche, 'premium lighting'],
    compositionNotes: 'headline in strong focal zone with one clear hero object and supporting depth',
    retentionHook: 'a striking central symbol tied to the main promise',
  })

  for (let index = 2; index <= slideCount; index += 1) {
    const isLast = index === slideCount
    if (isLast) {
      slides.push({
        slideNumber: index,
        role: 'cta',
        headline: 'Agora transforme isso em ação',
        subtext: 'salve este conteúdo para consultar depois',
        body: `Se esse tema faz sentido para ${brief.audience}, use este conteúdo como base para sua próxima publicação.`,
        visualIntent: 'closure and conversion',
        visualSubject: 'closing action scene with clear next step',
        supportingVisuals: ['call-to-action element', 'editorial support panel'],
        compositionNotes: 'clear CTA hierarchy with premium closing composition',
        retentionHook: 'one elegant conversion-focused focal element',
      })
      continue
    }

    const point = idea.researchSummary[(index - 2) % idea.researchSummary.length]
    slides.push({
      slideNumber: index,
      role: 'content',
      headline: `${index - 1}. ${point.split('.')[0] || point}`.slice(0, 80),
      subtext: '',
      body: point,
      visualIntent: 'clarity and authority',
      visualSubject: `editorial scene explaining ${point}`,
      supportingVisuals: idea.supportingFacts.slice(0, 2),
      compositionNotes: 'editorial layout with one proof element and one support information block',
      retentionHook: 'a concrete proof-like detail that rewards attention',
    })
  }

  return {
    copySessionId: createSessionId('cp'),
    format: brief.format,
    goal: brief.goal,
    title: idea.title,
    caption: `${idea.title}\n\n${idea.whyItCanPerform}\n\n${idea.researchSummary.join(' ')}`,
    cta: 'Salve este post para revisar depois.',
    slides,
    designNotes: {
      overallMood: 'clean, smart and high-trust',
      textDensity: 'low',
      readingPace: 'fast',
      visualSystem: 'strong headlines, concise support text and premium spacing',
      visualTheme: `premium editorial storytelling about ${brief.niche}`,
    },
  }
}

export function resolveStyleLock(brandStyle?: string): StyleLock {
  const style = (brandStyle || '').toLowerCase()
  if (style.includes('dark')) {
    return {
      palette: ['#020617', '#38BDF8', '#E2E8F0'],
      artDirection: 'dark editorial tech',
      typographyStyle: 'bold sans headline with crisp small caps support',
      recurringElements: ['deep navy backgrounds', 'cyan highlights', 'glass overlays', 'grid accents'],
    }
  }

  if (style.includes('warm') || style.includes('laranja')) {
    return {
      palette: ['#1C1917', '#F97316', '#FFF7ED'],
      artDirection: 'warm minimal conversion design',
      typographyStyle: 'bold rounded sans with soft support copy',
      recurringElements: ['soft orange glows', 'rounded cards', 'clean gradients', 'high contrast'],
    }
  }

  return DEFAULT_STYLE_LOCK
}

function wrapSvgText(text: string, maxCharsPerLine: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxCharsPerLine) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines.slice(0, 5)
}

function escapeXml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function getSlideRoleDirection(slide: CopySlide) {
  if (slide.role === 'cover') {
    return 'Hook slide. Create the strongest focal point, premium contrast, immediate emotional impact, and lots of negative space for the headline.'
  }

  if (slide.role === 'cta') {
    return 'Closing slide. The composition must feel conclusive, premium, persuasive, and conversion-oriented with a clear visual path to action.'
  }

  return 'Content slide. Balance information design with cinematic imagery, using clear hierarchy and a professional editorial feel.'
}

function getTextDensityDirection(copy: CopyOutput) {
  if (copy.designNotes.textDensity === 'high') {
    return 'Support denser information design with clean grouping, panels, bullet rhythm, and excellent readability.'
  }

  if (copy.designNotes.textDensity === 'medium') {
    return 'Balance image impact with information blocks, keeping the layout editorial and scannable.'
  }

  return 'Prefer cleaner, more visual compositions with restrained copy blocks and strong breathing room.'
}

function getPacingDirection(copy: CopyOutput) {
  if (copy.designNotes.readingPace === 'slow') {
    return 'Design for deliberate reading with stronger panels, more stable composition, and calm hierarchy.'
  }

  if (copy.designNotes.readingPace === 'medium') {
    return 'Keep the composition clear and editorial, with a strong visual anchor plus readable layered text.'
  }

  return 'Design for fast-feed retention with immediate focal hierarchy, punchy framing, and high-scroll-stopping contrast.'
}

function getSlideVisualSubject(slide: CopySlide, brief: CreativeBrief) {
  const rolePrefix =
    slide.role === 'cover'
      ? 'Hero visual'
      : slide.role === 'cta'
        ? 'Closing conversion visual'
        : 'Editorial support visual'

  const concreteSubject = slide.visualSubject?.trim() || slide.visualIntent
  const supporting = slide.supportingVisuals?.length
    ? `Supporting elements: ${slide.supportingVisuals.join(', ')}.`
    : ''

  return `${rolePrefix} inspired by: ${concreteSubject}. Visual intent: ${slide.visualIntent}. ${supporting} Niche: ${brief.niche}. Avoid generic abstract backgrounds unless they support the main story.`
}

function describeHexColor(hex: string) {
  const normalized = hex.toUpperCase()

  switch (normalized) {
    case '#0F172A':
    case '#020617':
      return 'deep midnight navy'
    case '#2563EB':
      return 'electric royal blue'
    case '#38BDF8':
      return 'bright cyan blue'
    case '#F8FAFC':
    case '#E2E8F0':
    case '#FFF7ED':
      return 'soft near-white'
    case '#1C1917':
      return 'charcoal espresso'
    case '#F97316':
      return 'vivid burnt orange'
    default:
      return `color inspired by ${normalized}`
  }
}

function getPalettePromptText(styleLock: StyleLock) {
  return styleLock.palette.map(describeHexColor).join(', ')
}

function buildCarouselVisualDna(copy: CopyOutput, styleLock: StyleLock, brief: CreativeBrief) {
  const palettePromptText = getPalettePromptText(styleLock)
  const recurringVisualLanguage = [
    `Shared campaign world: ${copy.title}`,
    `Core mood: ${copy.designNotes.overallMood}`,
    `Visual system: ${copy.designNotes.visualSystem}`,
    `Shared visual theme: ${copy.designNotes.visualTheme || copy.designNotes.visualSystem}`,
    `Brand style: ${brief.brandStyle || 'premium minimalist tech'}`,
    `Color family locked to: ${palettePromptText}`,
    `Art direction locked to: ${styleLock.artDirection}`,
    `Typography locked to: ${styleLock.typographyStyle}`,
    `Recurring details locked to: ${styleLock.recurringElements.join(', ')}`,
    'All slides must feel like they belong to the exact same campaign, same designer, same visual universe, same color logic, same finishing style, same lighting philosophy, and same typography system.',
    'Do not reinvent the art direction from slide to slide. Vary the composition, but preserve the campaign identity.',
  ]

  return recurringVisualLanguage.join('\n')
}

function buildDesignerPrompt(
  slide: CopySlide,
  copy: CopyOutput,
  styleLock: StyleLock,
  brief: CreativeBrief
): DesignerPromptPayload {
  const ctaText = copy.cta?.trim() || 'Salve este conteúdo'
  const carouselVisualDna = buildCarouselVisualDna(copy, styleLock, brief)
  const palettePromptText = getPalettePromptText(styleLock)
  const slideContext = [
    `Carousel title: ${copy.title}`,
    `Slide ${slide.slideNumber} of ${brief.format === 'post' ? 1 : brief.slideCount}`,
    `Role: ${slide.role}`,
    `Goal: ${brief.goal}`,
    `Audience: ${brief.audience}`,
    `Tone: ${brief.tone}`,
    `Visual concept: ${slide.visualIntent}`,
    `Overall mood: ${copy.designNotes.overallMood}`,
    `Visual system: ${copy.designNotes.visualSystem}`,
    `Brand style: ${brief.brandStyle || 'Premium Minimalist Tech'}`,
    `Art direction: ${styleLock.artDirection}`,
    `Palette direction: ${palettePromptText}`,
    `Recurring elements: ${styleLock.recurringElements.join(', ')}`,
    `Text density direction: ${getTextDensityDirection(copy)}`,
    `Reading pace direction: ${getPacingDirection(copy)}`,
    `Primary visual subject: ${getSlideVisualSubject(slide, brief)}`,
    `Concrete visual subject: ${slide.visualSubject || slide.visualIntent}`,
    `Supporting visuals: ${slide.supportingVisuals?.join(', ') || 'none specified'}`,
    `Composition notes: ${slide.compositionNotes || 'not specified'}`,
    `Retention hook: ${slide.retentionHook || 'not specified'}`,
    getSlideRoleDirection(slide),
  ].join('\n')

  const textSpec = [
    'TEXT SPECIFICATIONS: This is an Instagram carousel slide, not a textless poster. Render the following text EXACTLY as written with perfect spelling and professional optical kerning.',
    `Headline: "${slide.headline}"`,
    `Subtext: "${slide.subtext || ' '}"`,
    `CTA: "${ctaText}"`,
    `Support body text if composition allows: "${slide.body || ' '}"`,
    'Mandatory rule: the Headline must always be visibly present in large mobile-readable typography.',
    'Mandatory rule: the Subtext should also remain clearly readable whenever it exists.',
    'If there is too much copy, do not shrink text to a tiny size. Instead, prioritize Headline first, Subtext second, CTA third, and only include body text if it can remain readable.',
    'Never omit the Headline. Never turn the slide into a beautiful image with little or no written text.',
  ].join('\n')

  const prompt = `
ultra-high resolution, premium poster-grade Instagram ${brief.format === 'post' ? 'post' : 'carousel'} design, polished commercial social media artwork, premium ad-quality image.

FORMAT & QUALITY:
1080x${brief.format === 'post' ? '1080' : '1350'} vertical composition. Premium social campaign quality. Real depth, premium lighting, refined materials, sophisticated post-processing, visually striking but commercially elegant.

SCENE CONTEXT:
${slideContext}

CAROUSEL VISUAL DNA:
${carouselVisualDna}

SCENE CONCEPT:
Create a high-end Instagram ${brief.format === 'post' ? 'post' : 'carousel slide'} for this exact slide. Use a strong, literal visual subject tied to the narrative of the slide instead of a generic gradient or empty abstract background. The composition should feel like a finished campaign creative from a top-tier social design studio.

Make the slide feel content-rich, specific, and intentional. The viewer should immediately understand what the slide is about from the scene itself, not only from the text overlay.

Mandatory scene anchors for this slide:
- Primary subject: ${slide.visualSubject || slide.visualIntent}
- Supporting details: ${slide.supportingVisuals?.join(', ') || 'use premium contextual elements tied to the niche'}
- Composition cue: ${slide.compositionNotes || 'build a strong editorial composition with hierarchy and depth'}
- Scroll-stopping cue: ${slide.retentionHook || 'use one elegant high-attention detail tied to the concept'}

Use image-led storytelling with:
- one dominant focal point
- layered foreground/background depth
- cinematic atmosphere
- premium texture and contrast
- supporting visual details that reward attention
- subtle interface/editorial overlays only when they improve clarity
- proof-like details, contextual cues, or symbolic objects that make the topic feel concrete

COMPOSITION & SAFE AREA:
Keep all essential text and the main focal point inside a centered safe area with comfortable margins. This is a 4:5 Instagram carousel logic, mobile-first, where text readability is critical. Headline is dominant, subtext is secondary, CTA is small and tertiary. Use premium panels, dark gradients, soft glow, glass overlay, or contrast plates behind text when needed. The slide must feel scroll-stopping in-feed and still easy to read on mobile.

INSTAGRAM CAROUSEL TEXT RULES:
- The slide must clearly look like an Instagram carousel slide with on-image copy.
- The headline should be large and immediately readable on a phone screen.
- Do not place all text too low, too small, too wide, or too close to edges.
- Do not hide the text inside the artwork or reduce it to decorative microcopy.
- If needed, use fewer visible body lines rather than shrinking everything.
- Prefer one strong text block with clear hierarchy over many tiny text fragments.

${textSpec}

TYPOGRAPHY & TEXT RENDERING:
${styleLock.typographyStyle}. Render the text exactly as written, with perfect spelling, premium kerning, clean line breaks, and professional hierarchy. Avoid ugly text rendering, warped letters, or clutter. Make the headline visually commanding and obviously readable at mobile size. Make the subtext crisp and readable. Keep the CTA elegant, small, and intentional. If body text is present, keep it short, grouped, and readable instead of dense or tiny.

STYLE LOCK:
Use this palette exactly as the main color family: ${palettePromptText}.
Art direction: ${styleLock.artDirection}.
Recurring elements to echo across the carousel: ${styleLock.recurringElements.join(', ')}.
The slide should feel cohesive with the same carousel system, but not repetitive or templated.
The color notes are creative direction only. Do not render color codes, palette labels, or production notes as visible text inside the image.

DESIGN INTENT:
The final image must look premium, dramatic, strategic, and publish-ready. It should feel more like a real high-performing Instagram creative than a simple template, mockup, or AI poster. The art should not feel empty, decorative-only, or disconnected from the topic.

NEGATIVE CONSTRAINTS:
Avoid the following: low quality, cheap template, ugly typography, misspelled text, translated text, cropped headline, missing headline, missing text block, tiny unreadable text, decorative microcopy, visible hex color codes, palette labels, production notes rendered as text, cropped focal subject, blurry details, flat layout, watermark, brand logo, duplicate elements, text overflow, visual clutter, generic stock poster, meme style, empty background, weak focal point, flat infographic, boring composition, plain Canva look, bad mobile readability, washed colors, oversaturated amateur design, unbalanced margins.
`.trim()

  const negativePrompt = [
    'low quality',
    'cheap template',
    'ugly typography',
    'misspelled text',
    'translated text',
    'cropped headline',
    'cropped focal subject',
    'blurry',
    'flat layout',
    'watermark',
    'brand logo',
    'extra fingers',
    'distorted anatomy',
    'duplicate elements',
    'text overflow',
    'too many paragraphs',
    'visual clutter',
    'generic stock poster',
    'meme style',
    'empty background',
    'weak focal point',
    'flat infographic',
    'boring composition',
    'plain Canva look',
    'bad mobile readability',
    'washed colors',
    'oversaturated amateur design',
    'unbalanced margins',
  ].join(', ')

  return { prompt, negativePrompt }
}

function buildSceneVisual(slide: CopySlide, accent: string, text: string, width: number, height: number) {
  const variant =
    slide.role === 'cover'
      ? 'hero'
      : slide.role === 'cta'
        ? 'cta'
        : ['dashboard', 'poster', 'insight'][slide.slideNumber % 3]

  if (variant === 'hero') {
    return `
      <g transform="translate(620 170)">
        <rect x="0" y="0" width="320" height="760" rx="34" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.3"/>
        <rect x="28" y="36" width="264" height="150" rx="24" fill="${accent}" fill-opacity="0.28"/>
        <circle cx="228" cy="112" r="50" fill="#FFFFFF" fill-opacity="0.18"/>
        <rect x="28" y="224" width="264" height="170" rx="24" fill="#FFFFFF" fill-opacity="0.14"/>
        <rect x="48" y="252" width="122" height="16" rx="8" fill="${text}" fill-opacity="0.85"/>
        <rect x="48" y="282" width="184" height="12" rx="6" fill="${text}" fill-opacity="0.35"/>
        <rect x="48" y="308" width="162" height="12" rx="6" fill="${text}" fill-opacity="0.22"/>
        <rect x="48" y="348" width="84" height="84" rx="18" fill="${accent}" fill-opacity="0.18"/>
        <rect x="150" y="348" width="102" height="16" rx="8" fill="${text}" fill-opacity="0.75"/>
        <rect x="150" y="376" width="88" height="12" rx="6" fill="${text}" fill-opacity="0.28"/>
        <rect x="48" y="470" width="264" height="220" rx="28" fill="#0F172A" fill-opacity="0.18"/>
        <path d="M84 610C122 560 144 540 178 520C214 498 238 494 280 478" stroke="#FFFFFF" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
        <circle cx="84" cy="610" r="12" fill="#FFFFFF"/>
        <circle cx="178" cy="520" r="12" fill="#FFFFFF"/>
        <circle cx="280" cy="478" r="12" fill="#FFFFFF"/>
      </g>
      <g opacity="0.9">
        <rect x="720" y="130" width="220" height="92" rx="24" fill="#FFFFFF" fill-opacity="0.12" transform="rotate(8 720 130)"/>
        <rect x="666" y="880" width="240" height="110" rx="28" fill="#FFFFFF" fill-opacity="0.1" transform="rotate(-7 666 880)"/>
      </g>
    `
  }

  if (variant === 'cta') {
    return `
      <g transform="translate(640 210)">
        <rect x="0" y="0" width="300" height="300" rx="42" fill="${accent}" fill-opacity="0.26"/>
        <rect x="24" y="24" width="252" height="252" rx="34" fill="#FFFFFF" fill-opacity="0.14" stroke="#FFFFFF" stroke-opacity="0.26"/>
        <path d="M78 150H194" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
        <path d="M158 108L218 150L158 192" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(640 600)">
        <rect x="0" y="0" width="300" height="230" rx="34" fill="#FFFFFF" fill-opacity="0.12"/>
        <rect x="30" y="34" width="180" height="18" rx="9" fill="${text}" fill-opacity="0.82"/>
        <rect x="30" y="70" width="220" height="12" rx="6" fill="${text}" fill-opacity="0.28"/>
        <rect x="30" y="96" width="196" height="12" rx="6" fill="${text}" fill-opacity="0.18"/>
        <rect x="30" y="142" width="132" height="44" rx="22" fill="${accent}" fill-opacity="0.92"/>
      </g>
    `
  }

  if (variant === 'dashboard') {
    return `
      <g transform="translate(640 180)">
        <rect x="0" y="0" width="300" height="520" rx="32" fill="#FFFFFF" fill-opacity="0.11" stroke="#FFFFFF" stroke-opacity="0.22"/>
        <rect x="24" y="26" width="252" height="130" rx="24" fill="#FFFFFF" fill-opacity="0.12"/>
        <rect x="44" y="50" width="100" height="14" rx="7" fill="${text}" fill-opacity="0.76"/>
        <rect x="44" y="78" width="180" height="10" rx="5" fill="${text}" fill-opacity="0.22"/>
        <rect x="44" y="110" width="32" height="22" rx="11" fill="${accent}" fill-opacity="0.9"/>
        <rect x="90" y="110" width="44" height="22" rx="11" fill="#FFFFFF" fill-opacity="0.16"/>
        <rect x="24" y="182" width="118" height="136" rx="24" fill="${accent}" fill-opacity="0.2"/>
        <rect x="158" y="182" width="118" height="136" rx="24" fill="#FFFFFF" fill-opacity="0.12"/>
        <rect x="24" y="344" width="252" height="148" rx="24" fill="#0F172A" fill-opacity="0.18"/>
        <rect x="52" y="454" width="26" height="22" rx="8" fill="#FFFFFF" fill-opacity="0.8"/>
        <rect x="88" y="420" width="26" height="56" rx="8" fill="#FFFFFF" fill-opacity="0.75"/>
        <rect x="124" y="390" width="26" height="86" rx="8" fill="${accent}" fill-opacity="0.95"/>
        <rect x="160" y="434" width="26" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.74"/>
        <rect x="196" y="404" width="26" height="72" rx="8" fill="#FFFFFF" fill-opacity="0.7"/>
      </g>
    `
  }

  if (variant === 'poster') {
    return `
      <g transform="translate(640 180)">
        <rect x="0" y="0" width="300" height="580" rx="36" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.24"/>
        <rect x="24" y="24" width="252" height="220" rx="28" fill="${accent}" fill-opacity="0.24"/>
        <circle cx="96" cy="100" r="58" fill="#FFFFFF" fill-opacity="0.14"/>
        <path d="M54 206L110 140L146 178L192 122L246 206" fill="none" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="24" y="272" width="252" height="128" rx="28" fill="#FFFFFF" fill-opacity="0.12"/>
        <rect x="48" y="300" width="140" height="16" rx="8" fill="${text}" fill-opacity="0.78"/>
        <rect x="48" y="330" width="176" height="10" rx="5" fill="${text}" fill-opacity="0.22"/>
        <rect x="48" y="356" width="146" height="10" rx="5" fill="${text}" fill-opacity="0.14"/>
        <rect x="24" y="428" width="252" height="128" rx="28" fill="#0F172A" fill-opacity="0.16"/>
        <rect x="54" y="468" width="196" height="18" rx="9" fill="#FFFFFF" fill-opacity="0.82"/>
        <rect x="54" y="506" width="136" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.28"/>
      </g>
    `
  }

  return `
    <g transform="translate(640 180)">
      <rect x="0" y="0" width="300" height="520" rx="34" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.24"/>
      <rect x="24" y="24" width="252" height="160" rx="26" fill="${accent}" fill-opacity="0.2"/>
      <circle cx="82" cy="90" r="26" fill="#FFFFFF" fill-opacity="0.2"/>
      <rect x="124" y="66" width="92" height="18" rx="9" fill="${text}" fill-opacity="0.76"/>
      <rect x="124" y="98" width="112" height="12" rx="6" fill="${text}" fill-opacity="0.24"/>
      <rect x="24" y="208" width="252" height="128" rx="24" fill="#FFFFFF" fill-opacity="0.12"/>
      <path d="M54 300C102 262 134 244 162 236C198 226 220 228 250 238" stroke="#FFFFFF" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"/>
      <circle cx="54" cy="300" r="11" fill="#FFFFFF"/>
      <circle cx="162" cy="236" r="11" fill="${accent}" fill-opacity="0.95"/>
      <circle cx="250" cy="238" r="11" fill="#FFFFFF"/>
      <rect x="24" y="360" width="118" height="132" rx="24" fill="${accent}" fill-opacity="0.18"/>
      <rect x="158" y="360" width="118" height="132" rx="24" fill="#FFFFFF" fill-opacity="0.11"/>
    </g>
  `
}

function buildSvgSlide(slide: CopySlide, styleLock: StyleLock, brief: CreativeBrief) {
  const width = 1080
  const height = brief.format === 'post' ? 1080 : 1350
  const [bg, accent, text] = styleLock.palette
  const headlineLines = wrapSvgText(slide.headline, slide.role === 'cover' ? 22 : 20)
  const subtextLines = wrapSvgText(slide.subtext, 32)
  const bodyLines = wrapSvgText(slide.body, 32)
  const label = slide.role === 'cover' ? 'CAPA' : slide.role === 'cta' ? 'CTA' : `SLIDE ${slide.slideNumber}`
  const accentOpacity = slide.role === 'cover' ? '0.28' : slide.role === 'cta' ? '0.2' : '0.16'
  const textPanelWidth = slide.role === 'cover' ? 500 : 470
  const textPanelX = 72
  const textPanelY = 86
  const textPanelHeight = height - 172
  const headlineStartY = 270
  const subtextStartY = headlineStartY + headlineLines.length * 68 + 18
  const bodyStartY = subtextStartY + Math.max(subtextLines.length, 1) * 34 + 44
  const recurringTag = styleLock.recurringElements.slice(0, 2).join(' • ')

  const headlineSvg = headlineLines
    .map(
      (line, index) =>
        `<tspan x="${textPanelX + 36}" dy="${index === 0 ? 0 : 68}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const subtextSvg = subtextLines
    .map(
      (line, index) =>
        `<tspan x="${textPanelX + 36}" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const bodySvg = bodyLines
    .map(
      (line, index) =>
        `<tspan x="${textPanelX + 36}" dy="${index === 0 ? 0 : 30}">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="58%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.92" />
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="14%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="${accentOpacity}" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="meshA" cx="24%" cy="0%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="meshB" cx="100%" cy="100%" r="56%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.08" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#020617" flood-opacity="0.16" />
    </filter>
    <filter id="panelShadow" x="-20%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="30" stdDeviation="30" flood-color="#020617" flood-opacity="0.14" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <rect width="${width}" height="${height}" fill="url(#meshA)" />
  <rect width="${width}" height="${height}" fill="url(#meshB)" />
  <g opacity="0.08">
    <path d="M0 1040L1080 380" stroke="#FFFFFF" stroke-width="2" />
    <path d="M0 1180L1080 520" stroke="#FFFFFF" stroke-width="2" />
    <path d="M260 0L1080 740" stroke="#FFFFFF" stroke-width="2" />
  </g>
  <circle cx="${width - 110}" cy="120" r="96" fill="#FFFFFF" fill-opacity="0.08" />
  <rect x="${textPanelX}" y="${textPanelY}" width="${textPanelWidth}" height="${textPanelHeight}" rx="42" fill="url(#panelGrad)" stroke="#FFFFFF" stroke-opacity="0.16" filter="url(#panelShadow)" />
  <rect x="${textPanelX + 28}" y="${textPanelY + 26}" width="170" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.16" />
  <text x="${textPanelX + 113}" y="${textPanelY + 54}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${text}" fill-opacity="0.92" letter-spacing="3">${escapeXml(label)}</text>
  <text x="${textPanelX + 36}" y="${headlineStartY}" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="${text}" letter-spacing="-1.5">${headlineSvg}</text>
  ${slide.subtext ? `<text x="${textPanelX + 36}" y="${subtextStartY}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="${text}" fill-opacity="0.92">${subtextSvg}</text>` : ''}
  ${slide.body ? `<text x="${textPanelX + 36}" y="${bodyStartY}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="${text}" fill-opacity="0.8">${bodySvg}</text>` : ''}
  <rect x="${textPanelX + 36}" y="${height - 230}" width="${textPanelWidth - 72}" height="112" rx="26" fill="#0F172A" fill-opacity="0.18" />
  <text x="${textPanelX + 64}" y="${height - 184}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="${text}" fill-opacity="0.88">STYLE LOCK</text>
  <text x="${textPanelX + 64}" y="${height - 148}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500" fill="${text}" fill-opacity="0.7">${escapeXml(recurringTag)}</text>
  ${buildSceneVisual(slide, accent, text, width, height)}
  <rect x="640" y="${height - 132}" width="300" height="52" rx="26" fill="#FFFFFF" fill-opacity="0.14" />
  <text x="668" y="${height - 99}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" fill="${text}" fill-opacity="0.88">${escapeXml(styleLock.artDirection)}</text>
  <text x="${width - 100}" y="${height - 96}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${text}" fill-opacity="0.72">${slide.slideNumber}/${brief.format === 'post' ? 1 : brief.slideCount}</text>
</svg>
`.trim()
}

export function renderSlidesLocally(copy: CopyOutput, brief: CreativeBrief) {
  const styleLock = resolveStyleLock(brief.brandStyle)
  const renderedSlides: RenderedSlide[] = copy.slides.map((slide) => {
    const svg = buildSvgSlide(slide, styleLock, brief)
    const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    const designerPrompt = buildDesignerPrompt(slide, copy, styleLock, brief)
    return {
      slideNumber: slide.slideNumber,
      status: 'fallback',
      imageUrl,
      width: 1080,
      height: brief.format === 'post' ? 1080 : 1350,
      generationPrompt: designerPrompt.prompt,
      negativePrompt: designerPrompt.negativePrompt,
      generationModel: 'local-svg-fallback',
      imageMimeType: 'image/svg+xml',
      downloadExtension: 'svg',
      warning: 'Preview local usado porque a geração real de imagem não retornou asset.',
    }
  })

  const output: RenderOutput = {
    creativeSessionId: createSessionId('cr'),
    styleLockApplied: styleLock,
    slides: renderedSlides,
  }
  return output
}

export function buildDesignerPrompts(copy: CopyOutput, brief: CreativeBrief, styleLock = resolveStyleLock(brief.brandStyle)) {
  return copy.slides.map((slide) => ({
    slideNumber: slide.slideNumber,
    role: slide.role,
    ...buildDesignerPrompt(slide, copy, styleLock, brief),
  }))
}
