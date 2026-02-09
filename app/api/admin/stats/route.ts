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

    // Datas
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Contagens básicas
    const [
      totalUsers,
      usersLast30d,
      usersLast7d,
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      totalConversations,
      conversationsLast7d,
      totalMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'cancelled' } }),
      prisma.conversation.count(),
      prisma.conversation.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.message.count(),
    ])

    // Assinaturas por plano
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      where: { status: 'active' },
      _count: { plan: true },
    })

    // Usuários por provedor de auth
    const usersByProvider = await prisma.user.groupBy({
      by: ['provider'],
      _count: { provider: true },
    })

    // Últimos 10 usuários cadastrados
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true } },
      },
    })

    // Últimas 10 assinaturas
    const recentSubscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        usersLast30d,
        usersLast7d,
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        pendingSubscriptions: totalSubscriptions - activeSubscriptions - cancelledSubscriptions,
        totalConversations,
        conversationsLast7d,
        totalMessages,
      },
      subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
        plan: s.plan,
        count: s._count.plan,
      })),
      usersByProvider: usersByProvider.map((u) => ({
        provider: u.provider || 'email',
        count: u._count.provider,
      })),
      recentUsers,
      recentSubscriptions,
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
