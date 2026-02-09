import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (plan) where.plan = plan

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            provider: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error)
    return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 })
  }
}
