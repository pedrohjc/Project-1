import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  buildFallbackResearch,
  buildResearchPrompt,
  creativeBriefSchema,
  extractJsonBlock,
  researchOutputSchema,
} from '@/lib/instagramCreative'
import { getUserIdFromRequest } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const brief = creativeBriefSchema.parse({
      ...body,
      slideCount: Number(body.slideCount),
    })

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(buildFallbackResearch(brief))
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
      const result = await model.generateContent(buildResearchPrompt(brief))
      const response = await result.response
      const parsed = JSON.parse(extractJsonBlock(response.text()))
      const output = researchOutputSchema.parse(parsed)
      return NextResponse.json(output)
    } catch (modelError) {
      console.warn('Fallback local acionado no research engine:', modelError)
      return NextResponse.json(buildFallbackResearch(brief))
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao gerar ideias' },
      { status: 400 }
    )
  }
}
