import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'
import { hashPassword, verifyPassword } from '@/lib/auth'

// GET - Buscar perfil do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Atualizar nome se fornecido
    if (name !== undefined && name.trim() !== '') {
      updateData.name = name.trim()
    }

    // Atualizar email se fornecido
    if (email !== undefined && email.trim() !== '') {
      // Verificar se o novo email já existe (e não é do mesmo usuário)
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim() },
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        )
      }

      updateData.email = email.trim()
    }

    // Atualizar senha se fornecida
    if (newPassword !== undefined && newPassword.trim() !== '') {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Senha atual é obrigatória para alterar a senha' },
          { status: 400 }
        )
      }

      // Verificar senha atual
      const isValidPassword = await verifyPassword(currentPassword, user.password)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 }
        )
      }

      // Validar nova senha
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres' },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(newPassword.trim())
    }

    // Se não houver nada para atualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
