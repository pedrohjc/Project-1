import { NextRequest, NextResponse } from 'next/server'
import { EditMode, GoogleGenAI, StyleReferenceImage } from '@google/genai'
import OpenAI from 'openai'
import {
  buildDesignerPrompts,
  copyOutputSchema,
  creativeBriefSchema,
  renderSlidesLocally,
  resolveStyleLock,
} from '@/lib/instagramCreative'
import { getUserIdFromRequest } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

type ImageProvider = 'gemini' | 'openai'

const DEFAULT_IMAGE_MODEL = 'imagen-4.0-ultra-generate-001'
const RETRY_IMAGE_MODELS = ['imagen-4.0-ultra-generate-001', 'imagen-4.0-generate-001']
const DEFAULT_OPENAI_IMAGE_MODEL = 'gpt-image-1'

function buildStyleAnchoredPrompt(prompt: string) {
  return [
    'Use the provided reference image as the master style anchor for this carousel.',
    'Preserve the same campaign identity, same visual language, same finishing, same lighting logic, same palette behavior, and same premium design system.',
    'Change only the scene composition and the slide-specific subject needed for this new slide.',
    prompt,
  ].join('\n\n')
}

function buildOpenAiTextSafePrompt(
  prompt: string,
  slide: { headline: string; subtext?: string; role: string },
  ctaText: string
) {
  const visibleTextLines = [
    `1. Headline: "${slide.headline}"`,
    slide.subtext?.trim() ? `2. Subtext: "${slide.subtext.trim()}"` : null,
    slide.role === 'cta' ? `3. CTA: "${ctaText}"` : null,
  ].filter(Boolean)

  return [
    'OPENAI TEXT SAFETY MODE:',
    'This image is an Instagram carousel slide in Portuguese with visible on-image copy.',
    'Render the visible text with exact spelling.',
    'Do not paraphrase, translate, duplicate letters, merge words, or invent extra text.',
    'Do not render body paragraphs, tiny supporting text, or microcopy unless they can be perfectly readable.',
    'If there is any conflict between visual complexity and text accuracy, prioritize fewer visible text blocks with exact spelling.',
    'Use large bold sans-serif typography, high contrast, short line breaks, clean spacing, and strong mobile readability.',
    'Visible text blocks allowed in the image:',
    ...visibleTextLines,
    'Do not add any other written text besides the allowed text blocks above.',
    prompt,
  ].join('\n\n')
}

function buildGeminiTextSafePrompt(
  prompt: string,
  slide: { headline: string; subtext?: string; body?: string; role: string },
  ctaText: string
) {
  const cleanHeadline = slide.headline?.trim() || ''
  const cleanSubtext = slide.subtext?.trim() || ''
  const cleanBody = slide.body?.trim() || ''
  const supportLine =
    cleanSubtext.length > 0
      ? cleanSubtext
      : cleanBody.length > 0 && cleanBody.length <= 55
        ? cleanBody
        : ''

  const visibleTextLines = [
    `1. Headline obrigatório: "${cleanHeadline}"`,
    supportLine ? `2. Linha secundária opcional: "${supportLine}"` : null,
    slide.role === 'cta' ? `3. CTA opcional: "${ctaText}"` : null,
  ].filter(Boolean)

  return [
    prompt,
    'GEMINI CAROUSEL TEXT OVERRIDE:',
    'Este slide precisa parecer um carrossel de Instagram com texto visível na arte.',
    'O headline deve aparecer obrigatoriamente, grande e legível no celular.',
    'Se não couber tudo com qualidade, mantenha apenas headline primeiro, depois linha secundária, depois CTA.',
    'Nao crie microcopy pequena. Nao deixe o slide sem texto. Nao traduza o texto para ingles.',
    'Texto visível permitido neste slide:',
    ...visibleTextLines,
    'Nao adicione nenhum outro texto além dos blocos permitidos acima.',
  ].join('\n\n')
}

function getAspectRatio(brief: ReturnType<typeof creativeBriefSchema.parse>) {
  return brief.format === 'post' ? '1:1' : '3:4'
}

function getOpenAiSize(brief: ReturnType<typeof creativeBriefSchema.parse>) {
  return brief.format === 'post' ? '1024x1024' : '1024x1536'
}

function buildSuccessSlide(
  promptItem: { slideNumber: number; prompt: string; negativePrompt: string },
  brief: ReturnType<typeof creativeBriefSchema.parse>,
  imageUrl: string,
  generationModel: string,
  width: number,
  height: number
) {
  return {
    slideNumber: promptItem.slideNumber,
    status: 'success' as const,
    imageUrl,
    width,
    height,
    generationPrompt: promptItem.prompt,
    negativePrompt: promptItem.negativePrompt,
    generationModel,
    imageMimeType: 'image/png' as const,
    downloadExtension: 'png' as const,
  }
}

function base64ToPngFile(base64: string, filename: string) {
  const bytes = Buffer.from(base64, 'base64')
  return new File([bytes], filename, { type: 'image/png' })
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const brief = creativeBriefSchema.parse({
      ...body.brief,
      slideCount: Number(body?.brief?.slideCount),
    })
    const copy = copyOutputSchema.parse(body.copy)
    const styleLock = resolveStyleLock(brief.brandStyle)
    const promptPack = buildDesignerPrompts(copy, brief, styleLock)
    const fallbackOutput = renderSlidesLocally(copy, brief)
    const ctaText = copy.cta?.trim() || 'Salve este conteúdo'
    const imageProvider: ImageProvider = body.imageProvider === 'openai' ? 'openai' : 'gemini'
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
    const openAiApiKey = process.env.OPENAI_API_KEY?.trim()

    if (imageProvider === 'gemini' && !geminiApiKey) {
      return NextResponse.json(fallbackOutput)
    }

    if (imageProvider === 'openai' && !openAiApiKey) {
      return NextResponse.json(fallbackOutput)
    }

    const gemini = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null
    const openai = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null
    const slides = []
    let styleAnchorBytes: string | null = null

    for (const promptItem of promptPack) {
      const fallbackSlide = fallbackOutput.slides.find((slide) => slide.slideNumber === promptItem.slideNumber)
      const slideMeta = copy.slides.find((slide) => slide.slideNumber === promptItem.slideNumber)
      const preferredModel =
        imageProvider === 'openai'
          ? process.env.INSTAGRAM_CREATIVE_OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_IMAGE_MODEL
          : process.env.INSTAGRAM_CREATIVE_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL
      const candidateModels = Array.from(
        new Set(
          imageProvider === 'openai'
            ? [preferredModel]
            : [preferredModel, ...RETRY_IMAGE_MODELS]
        )
      )
      let lastError: unknown = null
      let resolvedSlide = null
      const geminiPrompt = buildGeminiTextSafePrompt(
        buildStyleAnchoredPrompt(promptItem.prompt),
        slideMeta || { headline: '', subtext: '', body: '', role: 'content' },
        ctaText
      )

      for (const model of candidateModels) {
        try {
          if (imageProvider === 'openai') {
            if (!openai) {
              throw new Error('OpenAI não configurado.')
            }

            let openAiBase64: string | undefined
            let generationModelLabel = `openai • ${model}`
            const size = getOpenAiSize(brief)
            const openAiPrompt = buildOpenAiTextSafePrompt(
              buildStyleAnchoredPrompt(promptItem.prompt),
              slideMeta || { headline: '', subtext: '', role: 'content' },
              ctaText
            )

            if (styleAnchorBytes && promptItem.slideNumber > 1) {
              const anchorFile = base64ToPngFile(styleAnchorBytes, `instagram-style-anchor-${promptItem.slideNumber}.png`)
              const editResponse = await openai.images.edit({
                model,
                image: anchorFile as any,
                prompt: openAiPrompt,
                size: size as any,
                quality: 'high' as any,
              } as any)

              openAiBase64 = editResponse.data?.[0]?.b64_json
              generationModelLabel = `openai • ${model} • style-edit`
            } else {
              const response = await openai.images.generate({
                model,
                prompt: openAiPrompt,
                size: size as any,
                quality: 'high' as any,
              } as any)

              openAiBase64 = response.data?.[0]?.b64_json
            }

            if (!openAiBase64) {
              throw new Error(`A OpenAI não retornou imagem usando o modelo ${model}.`)
            }

            if (!styleAnchorBytes) {
              styleAnchorBytes = openAiBase64
            }

            const dimensions = brief.format === 'post' ? { width: 1024, height: 1024 } : { width: 1024, height: 1536 }
            resolvedSlide = buildSuccessSlide(
              promptItem,
              brief,
              `data:image/png;base64,${openAiBase64}`,
              generationModelLabel,
              dimensions.width,
              dimensions.height
            )
          } else {
            if (!gemini) {
              throw new Error('Gemini não configurado.')
            }

            let bytes: string | undefined
            let generationModelLabel = `gemini • ${model}`

            if (styleAnchorBytes && promptItem.slideNumber > 1) {
              const styleReference = new StyleReferenceImage()
              styleReference.referenceImage = {
                imageBytes: styleAnchorBytes,
                mimeType: 'image/png',
              }
              styleReference.config = {
                styleDescription:
                  'Use this reference as the master visual identity for the carousel. Match the same premium campaign style, palette behavior, lighting, texture, and finishing.',
              }

              const editResponse = await gemini.models.editImage({
                model,
                prompt: geminiPrompt,
                referenceImages: [styleReference],
                config: {
                  editMode: EditMode.EDIT_MODE_STYLE,
                  numberOfImages: 1,
                  aspectRatio: getAspectRatio(brief),
                  outputMimeType: 'image/png',
                  includeRaiReason: true,
                },
              })

              bytes = editResponse.generatedImages?.[0]?.image?.imageBytes
              generationModelLabel = `gemini • ${model} • style-edit`
            } else {
              const response = await gemini.models.generateImages({
                model,
                prompt: geminiPrompt,
                config: {
                  numberOfImages: 1,
                  aspectRatio: getAspectRatio(brief),
                  outputMimeType: 'image/png',
                  includeRaiReason: true,
                },
              })

              bytes = response.generatedImages?.[0]?.image?.imageBytes
            }

            if (!bytes) {
              throw new Error(`A API de imagem não retornou bytes usando o modelo ${model}.`)
            }

            if (!styleAnchorBytes) {
              styleAnchorBytes = bytes
            }

            resolvedSlide = buildSuccessSlide(
              promptItem,
              brief,
              `data:image/png;base64,${bytes}`,
              generationModelLabel,
              1080,
              brief.format === 'post' ? 1080 : 1350
            )
          }

          break
        } catch (error: any) {
          lastError = error

          if (imageProvider === 'gemini' && styleAnchorBytes && promptItem.slideNumber > 1 && gemini) {
            try {
              const fallbackResponse = await gemini.models.generateImages({
                model,
                prompt: geminiPrompt,
                config: {
                  numberOfImages: 1,
                  aspectRatio: getAspectRatio(brief),
                  outputMimeType: 'image/png',
                  includeRaiReason: true,
                },
              })

              const fallbackBytes = fallbackResponse.generatedImages?.[0]?.image?.imageBytes
              if (!fallbackBytes) {
                throw new Error(`A API de imagem não retornou bytes usando o modelo ${model}.`)
              }

              resolvedSlide = buildSuccessSlide(
                promptItem,
                brief,
                `data:image/png;base64,${fallbackBytes}`,
                `gemini • ${model} • style-prompt`,
                1080,
                brief.format === 'post' ? 1080 : 1350
              )
              break
            } catch (secondaryError: any) {
              lastError = secondaryError
            }
          }
        }
      }

      if (!resolvedSlide) {
        if (!fallbackSlide) {
          throw lastError
        }

        console.warn('[instagram-creative/render] falling back to local preview', {
          slideNumber: promptItem.slideNumber,
          imageProvider,
          preferredModel,
          error: (lastError as any)?.message || String(lastError),
        })

        resolvedSlide = {
          ...fallbackSlide,
          generationPrompt: promptItem.prompt,
          negativePrompt: promptItem.negativePrompt,
          warning:
            (lastError as any)?.message ||
            'Falha ao gerar imagem real após tentar os modelos disponíveis; usando preview local.',
        }
      }

      slides.push(resolvedSlide)
    }

    return NextResponse.json({
      creativeSessionId: fallbackOutput.creativeSessionId,
      styleLockApplied: styleLock,
      slides,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao renderizar os slides' },
      { status: 400 }
    )
  }
}
