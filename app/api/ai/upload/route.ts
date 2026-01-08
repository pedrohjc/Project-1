import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/middleware'
import mammoth from 'mammoth'

// Forçar uso do runtime Node.js para ter acesso completo ao Buffer
export const runtime = 'nodejs'

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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Verificar tamanho do arquivo (máx 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      )
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const arrayBuffer = await file.arrayBuffer()
    
    // Criar Uint8Array e Buffer do Node.js corretamente
    const uint8Array = new Uint8Array(arrayBuffer)
    const buffer = Buffer.from(uint8Array)

    let extractedText = ''

    try {
      // Processar PDF - usar pdf-parse
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        try {
          // Importar pdf-parse dinamicamente
          const pdfParseModule = await import('pdf-parse')
          const pdfParse = pdfParseModule.default || pdfParseModule
          
          // Criar Buffer do Node.js usando a forma moderna (sem new Buffer)
          // Converter ArrayBuffer -> Uint8Array -> Buffer
          const pdfBuffer = Buffer.from(uint8Array)
          
          // Processar PDF com timeout para evitar travamentos
          const pdfData = await Promise.race([
            pdfParse(pdfBuffer, {
              max: 0, // Processar todas as páginas
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout ao processar PDF')), 30000)
            )
          ]) as any
          
          extractedText = pdfData.text || ''
          
          if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json(
              { error: 'O PDF não contém texto extraível. Pode ser um PDF escaneado (imagem). Por favor, converta o PDF para imagens (PNG/JPG) e faça upload das imagens.' },
              { status: 400 }
            )
          }
        } catch (pdfError: any) {
          console.error('Erro ao processar PDF:', {
            message: pdfError.message,
            name: pdfError.name,
            code: pdfError.code,
            stack: pdfError.stack?.substring(0, 300)
          })
          
          // Erro mais específico baseado no tipo
          let errorMessage = 'Não foi possível extrair texto do PDF.'
          
          if (pdfError.message?.includes('Timeout')) {
            errorMessage = 'O PDF é muito grande ou complexo para processar. Por favor, tente com um PDF menor ou converta para DOCX/TXT.'
          } else if (pdfError.message?.includes('Buffer') || pdfError.message?.includes('undefined')) {
            errorMessage = 'Erro ao processar PDF no servidor. Por favor, converta o PDF para DOCX, TXT ou faça upload como imagem (PNG/JPG).'
          } else if (pdfError.message?.includes('protected') || pdfError.message?.includes('encrypted')) {
            errorMessage = 'O PDF está protegido por senha ou criptografado. Por favor, remova a proteção ou converta para DOCX/TXT.'
          }
          
          return NextResponse.json(
            { 
              error: `${errorMessage} O arquivo pode estar corrompido ou ser uma imagem escaneada. Alternativas: DOCX, TXT ou imagens (PNG/JPG).` 
            },
            { status: 400 }
          )
        }
      }
      // Processar DOCX
      else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer })
        extractedText = result.value
      }
      // Processar DOC (formato antigo - limitado)
      else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
        return NextResponse.json(
          { error: 'Formato .doc não suportado. Por favor, converta para .docx ou PDF' },
          { status: 400 }
        )
      }
      // Processar TXT
      else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        extractedText = buffer.toString('utf-8')
      }
      // Processar imagens (PNG, JPG, JPEG, GIF)
      else if (fileType.startsWith('image/')) {
        // Para imagens, vamos usar a API da OpenAI com vision
        // Converter imagem para base64
        const base64Image = buffer.toString('base64')
        const imageDataUrl = `data:${fileType};base64,${base64Image}`

        // Usar OpenAI para extrair texto da imagem (OCR)
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })

        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json(
            { error: 'OpenAI API key não configurada para processar imagens' },
            { status: 500 }
          )
        }

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em extrair texto de imagens. Extraia TODO o texto visível na imagem, mantendo a formatação e estrutura quando possível. Se a imagem contém texto jurídico, preserve-o completamente.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extraia todo o texto visível nesta imagem. Se for texto jurídico, mantenha-o completo e exato.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
        })

        extractedText = completion.choices[0]?.message?.content || 'Não foi possível extrair texto da imagem.'
      }
      else {
        return NextResponse.json(
          { error: `Formato de arquivo não suportado: ${fileType}. Formatos suportados: PDF, DOCX, TXT, PNG, JPG, JPEG, GIF` },
          { status: 400 }
        )
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { error: 'Não foi possível extrair texto do arquivo. O arquivo pode estar vazio ou corrompido.' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        text: extractedText,
        fileName: file.name,
        fileSize: file.size,
        fileType: fileType
      })
    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error)
      return NextResponse.json(
        { error: `Erro ao processar arquivo: ${error.message || 'Erro desconhecido'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro ao processar upload' },
      { status: 500 }
    )
  }
}

