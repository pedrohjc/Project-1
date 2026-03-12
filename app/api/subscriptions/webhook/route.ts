import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MercadoPago envia notificações de diferentes tipos
    if (body.type === 'payment') {
      const paymentId = body.data?.id

      if (!paymentId) {
        return NextResponse.json({ received: true })
      }

      // Buscar informações do pagamento
      const paymentData = await payment.get({ id: paymentId })

      if (!paymentData) {
        return NextResponse.json({ received: true })
      }

      // Buscar assinatura pelo external_reference ou metadata
      const externalReference = paymentData.external_reference
      const metadata = paymentData.metadata as any

      if (metadata?.type === 'token_topup') {
        const topUpId = metadata?.topUpId || externalReference
        if (!topUpId) {
          return NextResponse.json({ received: true })
        }

        const topUp = await prisma.tokenTopUp.findUnique({
          where: { id: topUpId }
        })

        if (!topUp) {
          console.error('Top-up não encontrado para pagamento:', paymentId)
          return NextResponse.json({ received: true })
        }

        const paymentStatus = paymentData.status

        if (paymentStatus === 'approved') {
          await prisma.$transaction([
            prisma.tokenTopUp.update({
              where: { id: topUp.id },
              data: {
                status: 'approved',
                paymentId: paymentId.toString(),
              }
            }),
            prisma.user.update({
              where: { id: topUp.userId },
              data: {
                extraTokens: { increment: topUp.tokens }
              }
            })
          ])
        } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
          await prisma.tokenTopUp.update({
            where: { id: topUp.id },
            data: { status: 'rejected' }
          })
        } else if (paymentStatus === 'pending') {
          await prisma.tokenTopUp.update({
            where: { id: topUp.id },
            data: { status: 'pending' }
          })
        }

        return NextResponse.json({ received: true })
      }

      let subscription

      if (externalReference) {
        subscription = await prisma.subscription.findUnique({
          where: { id: externalReference }
        })
      } else if (metadata?.subscriptionId) {
        subscription = await prisma.subscription.findUnique({
          where: { id: metadata.subscriptionId }
        })
      }

      if (!subscription) {
        console.error('Assinatura não encontrada para pagamento:', paymentId)
        return NextResponse.json({ received: true })
      }

      // Atualizar status da assinatura baseado no status do pagamento
      const paymentStatus = paymentData.status

      if (paymentStatus === 'approved') {
        // Calcular data de término baseado no plano
        const endDate = new Date()
        if (subscription.plan === 'monthly' || subscription.plan === 'custom') {
          endDate.setMonth(endDate.getMonth() + 1)
        } else if (subscription.plan === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        }

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'active',
            paymentId: paymentId.toString(),
            startDate: new Date(),
            endDate,
            cancelledAt: null,
          }
        })
      } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'expired',
          }
        })
      } else if (paymentStatus === 'pending') {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'pending',
          }
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// GET para verificação do webhook (MercadoPago pode fazer GET)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' })
}
