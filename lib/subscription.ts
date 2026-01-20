import { prisma } from './prisma'

export async function checkUserSubscription(userId: string): Promise<{
  hasActiveSubscription: boolean
  subscription: any | null
}> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription) {
      return { hasActiveSubscription: false, subscription: null }
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

    const hasActiveSubscription = status === 'active'

    return {
      hasActiveSubscription,
      subscription: hasActiveSubscription ? subscription : null
    }
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
    return { hasActiveSubscription: false, subscription: null }
  }
}
