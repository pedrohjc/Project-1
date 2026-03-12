import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'

type TrialPlan = 'free' | 'monthly_10k' | 'monthly' | 'yearly' | 'custom'
const ALLOWED_PLANS: TrialPlan[] = ['free', 'monthly_10k', 'monthly', 'yearly', 'custom']

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = getUserIdFromRequest(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const plan = String(body.plan || '').trim() as TrialPlan
    const days = Number(body.days)

    if (!ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    if (!Number.isFinite(days) || days <= 0 || days > 365) {
      return NextResponse.json({ error: 'Duração inválida (dias)' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)

    const subscription = await prisma.subscription.upsert({
      where: { userId: params.id },
      create: {
        userId: params.id,
        plan,
        status: 'active',
        startDate,
        endDate,
        mercadoPagoId: null,
        paymentId: null,
        cancelledAt: null,
      },
      update: {
        plan,
        status: 'active',
        startDate,
        endDate,
        mercadoPagoId: null,
        paymentId: null,
        cancelledAt: null,
      },
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Erro ao conceder trial:', error)
    return NextResponse.json({ error: 'Erro ao conceder trial' }, { status: 500 })
  }
}

