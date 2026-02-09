import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'
import { checkUserSubscription } from '@/lib/subscription'
import { getTokenLimit, getTokenPeriod } from '@/lib/tokens'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { periodStart, periodEnd, resetLabel } = getTokenPeriod(new Date())
    const { hasActiveSubscription, subscription } = await checkUserSubscription(userId)

    const plan = subscription?.plan || 'free'
    const tokenLimit = hasActiveSubscription ? getTokenLimit(plan) : 0

    const [usage, user] = await Promise.all([
      prisma.tokenUsage.findUnique({
        where: {
          userId_periodStart: {
            userId,
            periodStart
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { extraTokens: true }
      })
    ])
    const extraTokens = user?.extraTokens || 0
    const totalAvailable = tokenLimit + extraTokens

    return NextResponse.json({
      plan,
      tokensUsed: usage?.usedTokens || 0,
      tokenLimit,
      extraTokens,
      totalAvailable,
      resetAt: periodEnd.toISOString(),
      resetLabel,
      status: subscription?.status || 'inactive'
    })
  } catch (error) {
    console.error('Erro ao buscar tokens:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tokens' },
      { status: 500 }
    )
  }
}
