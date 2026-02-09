import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            endDate: true
          }
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}
