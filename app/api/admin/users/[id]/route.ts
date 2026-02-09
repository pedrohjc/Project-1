import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        avatarUrl: true,
        extraTokens: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        conversations: {
          orderBy: { updatedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            title: true,
            productId: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { messages: true } },
          },
        },
        tokenUsages: {
          orderBy: { periodStart: 'desc' },
          take: 6,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const allowedFields: Record<string, unknown> = {}

    if (body.role && ['user', 'admin'].includes(body.role)) {
      allowedFields.role = body.role
    }
    if (typeof body.extraTokens === 'number') {
      allowedFields.extraTokens = body.extraTokens
    }
    if (body.name) {
      allowedFields.name = body.name
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: allowedFields,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        extraTokens: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Impedir auto-exclusão
    if (params.id === userId) {
      return NextResponse.json({ error: 'Você não pode excluir sua própria conta' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
