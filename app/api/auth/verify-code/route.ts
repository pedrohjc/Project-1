import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code, type } = await request.json()

    if (!email || !code || !type) {
      return NextResponse.json(
        { error: 'Email, código e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        type,
        used: false,
        expiresAt: { gte: new Date() },
        attempts: { lt: 5 },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Código expirado ou inválido. Solicite um novo.' },
        { status: 400 }
      )
    }

    if (verificationCode.code !== code) {
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { attempts: { increment: 1 } },
      })

      const remaining = 4 - verificationCode.attempts
      return NextResponse.json(
        { error: `Código incorreto. ${remaining > 0 ? `${remaining} tentativa(s) restante(s).` : 'Solicite um novo código.'}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    )
  }
}
