import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/middleware'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Suportar tanto params síncrono quanto assíncrono (Next.js 14+)
    const params = await Promise.resolve(context.params)
    const conversationId = params.id

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    // Deletar a conversa (as mensagens serão deletadas automaticamente devido ao onDelete: Cascade)
    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Conversa excluída com sucesso' 
    })
  } catch (error: any) {
    console.error('Erro ao excluir conversa:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao excluir conversa' },
      { status: 500 }
    )
  }
}
