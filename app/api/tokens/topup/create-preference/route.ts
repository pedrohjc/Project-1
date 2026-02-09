import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { checkUserSubscription } from '@/lib/subscription'
import { getTokenPack } from '@/lib/tokenPacks'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'token-topup'
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

    const { hasActiveSubscription } = await checkUserSubscription(userId)
    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: 'Assinatura necessária',
          message: 'Você precisa de uma assinatura ativa para comprar tokens.',
          requiresSubscription: true
        },
        { status: 403 }
      )
    }

    const { packId } = await request.json()
    const pack = getTokenPack(packId)
    if (!pack) {
      return NextResponse.json(
        { error: 'Pacote inválido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const topUp = await prisma.tokenTopUp.create({
      data: {
        userId,
        tokens: pack.tokens,
        amount: pack.price,
        status: 'pending'
      }
    })

    const preferenceData = {
      items: [
        {
          id: `token-pack-${pack.id}-${userId}`,
          title: `Balance Studios - ${pack.name}`,
          description: `${pack.tokens.toLocaleString('pt-BR')} tokens adicionais`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: pack.price,
        }
      ],
      payer: {
        name: user.name,
        email: user.email,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tokens/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tokens/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tokens/pending`,
      },
      auto_return: 'approved',
      external_reference: topUp.id,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions/webhook`,
      metadata: {
        type: 'token_topup',
        userId,
        topUpId: topUp.id,
        tokens: pack.tokens,
      }
    }

    const preferenceResponse = await preference.create({ body: preferenceData })

    await prisma.tokenTopUp.update({
      where: { id: topUp.id },
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
    console.error('Erro ao criar preferência de tokens:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar preferência de tokens' },
      { status: 500 }
    )
  }
}
