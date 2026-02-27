import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { isHttpsRequest } from '@/lib/request'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, code } = await request.json()

    if (!name || !email || !password || !code) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        type: 'register',
        used: false,
        expiresAt: { gte: new Date() },
        attempts: { lt: 5 },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!verificationCode || verificationCode.code !== code) {
      return NextResponse.json(
        { error: 'Código de verificação inválido ou expirado' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const role = isAdminEmail(email) ? 'admin' : 'user'

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    })

    // Gerar token
    const token = generateToken(user.id, user.role)

    // Criar resposta com cookie
    const response = NextResponse.json({
      message: 'Conta criada com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isHttpsRequest(request),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return response
  } catch (error) {
    console.error('Erro ao registrar:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}

