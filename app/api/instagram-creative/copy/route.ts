import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  buildCopyPrompt,
  buildFallbackCopy,
  copyOutputSchema,
  creativeBriefSchema,
  extractJsonBlock,
  researchIdeaSchema,
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
      ...body.brief,
      slideCount: Number(body?.brief?.slideCount),
    })
    const idea = researchIdeaSchema.parse(body.idea)

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(buildFallbackCopy(brief, idea))
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
      const result = await model.generateContent(buildCopyPrompt(brief, idea))
      const response = await result.response
      const parsed = JSON.parse(extractJsonBlock(response.text()))
      const output = copyOutputSchema.parse(parsed)
      return NextResponse.json(output)
    } catch (modelError) {
      console.warn('Fallback local acionado no copy engine:', modelError)
      return NextResponse.json(buildFallbackCopy(brief, idea))
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao gerar a copy' },
      { status: 400 }
    )
  }
}
