import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

const preference = new Preference(client)

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { plan } = await request.json()

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido. Use "monthly" ou "yearly"' },
        { status: 400 }
      )
    }

    // Valores dos planos (em reais)
    const planPrices: Record<string, number> = {
      monthly: 29.90,
      yearly: 299.90
    }

    const planNames: Record<string, string> = {
      monthly: 'Mensal',
      yearly: 'Anual'
    }

    const price = planPrices[plan]
    const planName = planNames[plan]

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar ou atualizar assinatura pendente
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: 'pending',
      },
      update: {
        plan,
        status: 'pending',
      }
    })

    // Criar preferência de pagamento no MercadoPago
    const preferenceData = {
      items: [
        {
          id: `subscription-${plan}-${userId}`,
          title: `Balance Studios - Plano ${planName}`,
          description: `Assinatura ${planName} da Balance Studios`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: price,
        }
      ],
      payer: {
        name: user.name,
        email: user.email,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/pending`,
      },
      auto_return: 'approved',
      external_reference: subscription.id,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions/webhook`,
      metadata: {
        userId,
        subscriptionId: subscription.id,
        plan,
      }
    }

    const preferenceResponse = await preference.create({ body: preferenceData })

    // Atualizar assinatura com ID do MercadoPago
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        mercadoPagoId: preferenceResponse.id,
      }
    })

    return NextResponse.json({
      preferenceId: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
    })
  } catch (error: any) {
    console.error('Erro ao criar preferência:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar preferência de pagamento' },
      { status: 500 }
    )
  }
}
