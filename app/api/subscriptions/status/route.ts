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

    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      })
    }

    // Verificar se a assinatura expirou
    let status = subscription.status
    if (subscription.status === 'active' && subscription.endDate) {
      const now = new Date()
      const endDate = new Date(subscription.endDate)
      if (now > endDate) {
        status = 'expired'
        // Atualizar no banco
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'expired' }
        })
      }
    }

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        cancelledAt: subscription.cancelledAt,
      }
    })
  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar status da assinatura' },
      { status: 500 }
    )
  }
}
