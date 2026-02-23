import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        type: 'reset',
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
      return NextResponse.json(
        { error: 'Código incorreto' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
    ])

    return NextResponse.json({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    )
  }
}
