import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/middleware'
import OpenAI from 'openai'

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada. Configure OPENAI_API_KEY no arquivo .env' },
        { status: 500 }
      )
    }

    const { productId, message, conversation } = await request.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Definir prompt do sistema baseado no produto
    let systemPrompt = 'Você é um assistente de IA inteligente e prestativo da Balance Solutions. Você ajuda os usuários com suas tarefas, respondendo perguntas, analisando documentos e textos, e fornecendo insights úteis. Seja claro, conciso e profissional.'

    if (productId === 'tradutor-juridiques') {
      systemPrompt = `Você é o Balance Tradutor Juridiquês, um assistente especializado da Balance Solutions em traduzir textos jurídicos complexos para linguagem simples e acessível.

Sua função é:
- Traduzir termos jurídicos técnicos para linguagem clara e compreensível
- Manter o significado original do texto
- Explicar conceitos jurídicos de forma didática
- Usar exemplos práticos quando necessário
- Manter a estrutura e organização do texto original quando possível

Sempre responda de forma clara, objetiva e em português brasileiro. Se o texto já estiver em linguagem simples, apenas confirme ou faça pequenos ajustes para melhorar a clareza.`
    }

    // Construir histórico de mensagens para contexto
    const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]

    // Adicionar histórico da conversa (últimas 10 mensagens para manter contexto)
    if (conversation && Array.isArray(conversation)) {
      const recentHistory = conversation.slice(-10)
      recentHistory.forEach((msg: { role: string, content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      })
    }

    // Adicionar a nova mensagem do usuário
    messages.push({
      role: 'user',
      content: message.trim()
    })

    // Chamar a API da OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.'

    return NextResponse.json({ 
      response,
      usage: completion.usage 
    })
  } catch (error: any) {
    console.error('Erro ao processar com OpenAI:', error)
    
    // Tratar erros específicos da OpenAI
    if (error?.status || error?.message) {
      return NextResponse.json(
        { error: `Erro da API OpenAI: ${error.message || 'Erro desconhecido'}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Erro ao processar solicitação. Verifique sua API key e tente novamente.' },
      { status: 500 }
    )
  }
}

