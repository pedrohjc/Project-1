import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || ''

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 min
const MAX_SENDS_PER_WINDOW = 3

async function callN8nWebhook(payload: { email: string; code: string; type: string }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    // Prefer POST (more standard for webhooks)
    const postRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (postRes.ok) return

    const postBody = await postRes.text().catch(() => '')

    // Some n8n webhooks are configured for GET-only; fallback to GET
    if (
      postRes.status === 404 &&
      postBody.toLowerCase().includes('not registered for post requests')
    ) {
      const url = new URL(N8N_WEBHOOK_URL)
      url.searchParams.set('email', payload.email)
      url.searchParams.set('code', payload.code)
      url.searchParams.set('type', payload.type)

      const getRes = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
      })

      if (getRes.ok) return

      const getBody = await getRes.text().catch(() => '')
      throw new Error(`N8N webhook GET failed: ${getRes.status} ${getBody}`)
    }

    throw new Error(`N8N webhook POST failed: ${postRes.status} ${postBody}`)
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['register', 'reset'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (type === 'register' && existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    if (type === 'reset' && !existingUser) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 400 }
      )
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
    const recentCodes = await prisma.verificationCode.count({
      where: {
        email,
        type,
        createdAt: { gte: windowStart },
      },
    })

    if (recentCodes >= MAX_SENDS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 15 minutos.' },
        { status: 429 }
      )
    }

    await prisma.verificationCode.updateMany({
      where: { email, type, used: false },
      data: { used: true },
    })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    const created = await prisma.verificationCode.create({
      data: { email, code, type, expiresAt },
    })

    if (N8N_WEBHOOK_URL) {
      try {
        await callN8nWebhook({ email, code, type })
      } catch (webhookError) {
        console.error('Erro ao chamar N8N webhook:', webhookError)
        await prisma.verificationCode.delete({ where: { id: created.id } })
        return NextResponse.json(
          { error: 'Falha ao enviar email. Tente novamente.' },
          { status: 502 }
        )
      }
    } else {
      console.warn('N8N_WEBHOOK_URL não configurada. Código:', code)
    }

    return NextResponse.json({ message: 'Código enviado para seu email' })
  } catch (error) {
    console.error('Erro ao enviar código:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar código' },
      { status: 500 }
    )
  }
}
