'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Logo from '../../components/Logo'

interface User {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string | null
  productId: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileProcessing, setFileProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = useState(48) // altura mínima
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      loadConversations()
    } else {
      // Limpar conversas quando não há produto selecionado
      setConversations([])
      setActiveConversationId(null)
    }
  }, [selectedProduct])

  useEffect(() => {
    scrollToBottom()
  }, [conversations, activeConversationId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async () => {
    if (!selectedProduct) return
    
    try {
      const response = await fetch(`/api/conversations?productId=${selectedProduct.id}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Erro ao carregar conversas:', err)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleProductSelect = async (product: Product) => {
    setSelectedProduct(product)
    setActiveConversationId(null)
    setInput('')
    setSelectedFiles([])
    // Carregar conversas do produto selecionado
    await loadConversations()
  }

  const handleBackToProducts = () => {
    setSelectedProduct(null)
    setConversations([])
    setActiveConversationId(null)
    setInput('')
    setSelectedFiles([])
    setTextareaHeight(48)
    setIsExpanded(false)
  }

  const handleNewConversation = () => {
    setActiveConversationId(null)
    setInput('')
    setSelectedFiles([])
    setTextareaHeight(48)
    setIsExpanded(false)
  }

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId)
    setInput('')
    setSelectedFiles([])
    setTextareaHeight(48)
    setIsExpanded(false)
  }

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!confirm('Tem certeza que deseja excluir esta conversa?')) return

    try {
      const response = await fetch(`/api/conversations/${convId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // Remover da lista de conversas
        setConversations(prev => prev.filter(c => c.id !== convId))
        
        // Se a conversa deletada estava ativa, limpar a seleção
        if (activeConversationId === convId) {
          setActiveConversationId(null)
        }
        
        // Recarregar conversas para garantir sincronização
        await loadConversations()
      } else {
        alert(`Erro ao excluir conversa: ${data.error || 'Tente novamente'}`)
      }
    } catch (err) {
      console.error('Erro ao excluir conversa:', err)
      alert('Erro ao excluir conversa. Tente novamente.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Adicionar novos arquivos aos já selecionados
      setSelectedFiles(prev => [...prev, ...files])
      // Limpar o input para permitir selecionar o mesmo arquivo novamente se necessário
      e.target.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveAllFiles = () => {
    setSelectedFiles([])
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSend = async () => {
    // Permitir enviar se tem mensagem OU arquivo(s)
    if ((!input.trim() && selectedFiles.length === 0) || processing || !selectedProduct) return

    const userMessage = input.trim() || (selectedFiles.length > 0 ? `[${selectedFiles.length} arquivo(s) anexado(s)]` : '')
    setInput('')
    setTextareaHeight(48) // Resetar altura ao enviar
    setIsExpanded(false) // Resetar estado expandido
    setProcessing(true)

    try {
      let body: FormData | string
      let headers: Record<string, string> = {}

      // Se tem arquivo(s), enviar como FormData
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        // Adicionar todos os arquivos
        selectedFiles.forEach((file) => {
          formData.append('files', file)
        })
        formData.append('productId', selectedProduct.id)
        formData.append('conversationId', activeConversationId || '')
        formData.append('message', userMessage)
        body = formData
        // Não definir Content-Type - deixar o browser definir com boundary
      } else {
        // Sem arquivo, enviar como JSON
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify({
          productId: selectedProduct.id,
          conversationId: activeConversationId,
          message: userMessage,
        })
      }

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers,
        body,
      })

      const data = await response.json()
      
      if (response.ok && data.conversation) {
        // Atualizar lista de conversas
        setConversations(prev => {
          const existingIndex = prev.findIndex(c => c.id === data.conversation.id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = data.conversation
            return updated
          }
          return [data.conversation, ...prev]
        })
        
        // Definir conversa ativa
        setActiveConversationId(data.conversation.id)
        // Limpar arquivos após envio bem-sucedido
        setSelectedFiles([])
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (err) {
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }

  // Função para ajustar a altura do textarea automaticamente
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // Resetar altura para calcular o scrollHeight correto
      textarea.style.height = '48px'
      
      // Calcular nova altura baseada no conteúdo
      const scrollHeight = textarea.scrollHeight
      const minHeight = 48
      const maxHeight = isExpanded ? 400 : 200
      
      // Definir altura dentro dos limites
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
      setTextareaHeight(newHeight)
    }
  }

  // Função para lidar com mudanças no texto
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Ajustar altura após um pequeno delay para garantir que o valor foi atualizado
    setTimeout(() => {
      adjustTextareaHeight()
    }, 0)
  }

  // Função para expandir/contrair manualmente
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    setTimeout(() => {
      adjustTextareaHeight()
    }, 0)
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId)

  // Logo do Balance Tradutor Juridiquês
  const TradutorJuridiquesIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient)"/>
      <path d="M40 20L30 25V35H25V45H30V55H40L50 55V45H55V35H50V25L40 20Z" fill="white" opacity="0.95"/>
      <line x1="35" y1="30" x2="45" y2="30" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="35" x2="45" y2="35" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="40" x2="42" y2="40" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 50L25 45M20 50L25 55M20 50H60" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M60 50L55 45M60 50L55 55" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="25" cy="65" r="3" fill="white" opacity="0.8"/>
      <circle cx="35" cy="65" r="3" fill="white" opacity="0.8"/>
      <circle cx="45" cy="65" r="3" fill="white" opacity="0.8"/>
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0066ff"/>
          <stop offset="1" stopColor="#7928ca"/>
        </linearGradient>
      </defs>
    </svg>
  )

  const TradutorJuridiquesIconSmall = () => (
    <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-small)"/>
      <path d="M40 20L30 25V35H25V45H30V55H40L50 55V45H55V35H50V25L40 20Z" fill="white" opacity="0.95"/>
      <defs>
        <linearGradient id="gradient-small" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0066ff"/>
          <stop offset="1" stopColor="#7928ca"/>
        </linearGradient>
      </defs>
    </svg>
  )

  // Logo do Balance Checklist Tributário
  const ChecklistTributarioIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-checklist)"/>
      {/* Checklist/Lista com checkmarks */}
      <rect x="20" y="18" width="40" height="4" rx="2" fill="white" opacity="0.95"/>
      <rect x="20" y="28" width="32" height="4" rx="2" fill="white" opacity="0.95"/>
      <rect x="20" y="38" width="36" height="4" rx="2" fill="white" opacity="0.95"/>
      {/* Checkmarks */}
      <path d="M25 22L27 24L31 20" stroke="url(#gradient-checklist)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M25 32L27 34L31 30" stroke="url(#gradient-checklist)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Ícone de calculadora/impostos na parte inferior */}
      <rect x="28" y="48" width="24" height="20" rx="2" fill="white" opacity="0.95"/>
      <line x1="32" y1="52" x2="44" y2="52" stroke="url(#gradient-checklist)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="56" x2="44" y2="56" stroke="url(#gradient-checklist)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="60" x2="40" y2="60" stroke="url(#gradient-checklist)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="64" x2="44" y2="64" stroke="url(#gradient-checklist)" strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="gradient-checklist" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0066ff"/>
          <stop offset="1" stopColor="#00c853"/>
        </linearGradient>
      </defs>
    </svg>
  )

  const ChecklistTributarioIconSmall = () => (
    <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-checklist-small)"/>
      <rect x="20" y="18" width="40" height="4" rx="2" fill="white" opacity="0.95"/>
      <rect x="20" y="28" width="32" height="4" rx="2" fill="white" opacity="0.95"/>
      <path d="M25 22L27 24L31 20" stroke="url(#gradient-checklist-small)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <defs>
        <linearGradient id="gradient-checklist-small" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0066ff"/>
          <stop offset="1" stopColor="#00c853"/>
        </linearGradient>
      </defs>
    </svg>
  )

  // Logo do Balance Criador de Conteúdo Jurídico Ético
  const CriadorConteudoIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-conteudo)"/>
      {/* Celular */}
      <rect x="28" y="18" width="24" height="36" rx="4" fill="white" opacity="0.95"/>
      <rect x="30" y="20" width="20" height="28" rx="2" fill="url(#gradient-conteudo)"/>
      <circle cx="40" cy="52" r="2" fill="white" opacity="0.8"/>
      {/* Ícones de mídia/social */}
      <circle cx="20" cy="35" r="4" fill="white" opacity="0.9"/>
      <circle cx="60" cy="28" r="3" fill="white" opacity="0.9"/>
      <circle cx="62" cy="50" r="3.5" fill="white" opacity="0.9"/>
      {/* Linhas de conexão */}
      <line x1="24" y1="35" x2="30" y2="32" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
      <line x1="56" y1="28" x2="52" y2="26" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
      <line x1="58" y1="50" x2="52" y2="48" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
      {/* Símbolo de câmera/vídeo */}
      <circle cx="40" cy="28" r="3" fill="white" opacity="0.8"/>
      <circle cx="40" cy="28" r="1.5" fill="url(#gradient-conteudo)"/>
      {/* Linha de onda/áudio */}
      <path d="M32 40 L35 37 L38 40 L41 36 L44 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <defs>
        <linearGradient id="gradient-conteudo" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6b6b"/>
          <stop offset="1" stopColor="#4ecdc4"/>
        </linearGradient>
      </defs>
    </svg>
  )

  const CriadorConteudoIconSmall = () => (
    <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-conteudo-small)"/>
      <rect x="28" y="18" width="24" height="36" rx="4" fill="white" opacity="0.95"/>
      <rect x="30" y="20" width="20" height="28" rx="2" fill="url(#gradient-conteudo-small)"/>
      <circle cx="40" cy="52" r="2" fill="white" opacity="0.8"/>
      <circle cx="20" cy="35" r="4" fill="white" opacity="0.9"/>
      <circle cx="60" cy="28" r="3" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="gradient-conteudo-small" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6b6b"/>
          <stop offset="1" stopColor="#4ecdc4"/>
        </linearGradient>
      </defs>
    </svg>
  )

  // Logo do Balance Comercial Quebra de Objeções com PNL
  const QuebraObjecoesIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-comercial)"/>
      {/* Gráfico/Comercial - seta para cima */}
      <path d="M40 20 L30 35 L35 35 L35 50 L45 50 L45 35 L50 35 Z" fill="white" opacity="0.95"/>
      {/* Letra P */}
      <rect x="22" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <rect x="22" y="55" width="8" height="3" fill="white" opacity="0.95"/>
      <rect x="28" y="55" width="3" height="6" fill="white" opacity="0.95"/>
      <rect x="22" y="60" width="6" height="3" fill="white" opacity="0.95"/>
      {/* Letra N */}
      <rect x="33" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <path d="M33 55 L39 67 L42 67 L36 55 Z" fill="white" opacity="0.95"/>
      <rect x="39" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      {/* Letra L */}
      <rect x="45" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <rect x="45" y="64" width="8" height="3" fill="white" opacity="0.95"/>
      {/* Linha de conexão/comunicação */}
      <path d="M20 45 Q40 50, 60 45" stroke="white" strokeWidth="2" opacity="0.7" fill="none" strokeLinecap="round"/>
      {/* Círculos de conexão */}
      <circle cx="25" cy="45" r="2" fill="white" opacity="0.8"/>
      <circle cx="55" cy="45" r="2" fill="white" opacity="0.8"/>
      <defs>
        <linearGradient id="gradient-comercial" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f093fb"/>
          <stop offset="1" stopColor="#f5576c"/>
        </linearGradient>
      </defs>
    </svg>
  )

  const QuebraObjecoesIconSmall = () => (
    <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-comercial-small)"/>
      <path d="M40 20 L30 35 L35 35 L35 50 L45 50 L45 35 L50 35 Z" fill="white" opacity="0.95"/>
      <rect x="22" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <rect x="22" y="55" width="8" height="3" fill="white" opacity="0.95"/>
      <rect x="28" y="55" width="3" height="6" fill="white" opacity="0.95"/>
      <rect x="22" y="60" width="6" height="3" fill="white" opacity="0.95"/>
      <rect x="33" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <path d="M33 55 L39 67 L42 67 L36 55 Z" fill="white" opacity="0.95"/>
      <rect x="39" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <rect x="45" y="55" width="3" height="12" fill="white" opacity="0.95"/>
      <rect x="45" y="64" width="8" height="3" fill="white" opacity="0.95"/>
      <defs>
        <linearGradient id="gradient-comercial-small" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f093fb"/>
          <stop offset="1" stopColor="#f5576c"/>
        </linearGradient>
      </defs>
    </svg>
  )

  // Logo do Balance Organizador – Propostas e Honorários
  const OrganizadorPropostasIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-organizador)"/>
      {/* Relógio */}
      <circle cx="40" cy="35" r="18" fill="white" opacity="0.95"/>
      <circle cx="40" cy="35" r="15" fill="url(#gradient-organizador)"/>
      {/* Ponteiros do relógio */}
      <line x1="40" y1="35" x2="40" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="35" x2="47" y2="35" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Marcadores do relógio */}
      <circle cx="40" cy="20" r="1.5" fill="white"/>
      <circle cx="55" cy="35" r="1.5" fill="white"/>
      <circle cx="40" cy="50" r="1.5" fill="white"/>
      <circle cx="25" cy="35" r="1.5" fill="white"/>
      {/* Dinheiro/Moeda */}
      <circle cx="40" cy="60" r="12" fill="white" opacity="0.95"/>
      <circle cx="40" cy="60" r="9" fill="url(#gradient-organizador)"/>
      {/* Símbolo de cifrão */}
      <path d="M35 58 L35 62 M37 58 L37 62 M43 58 L43 62 M45 58 L45 62" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <rect x="38" y="59" width="4" height="2" fill="white"/>
      <defs>
        <linearGradient id="gradient-organizador" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd700"/>
          <stop offset="1" stopColor="#ff8c00"/>
        </linearGradient>
      </defs>
    </svg>
  )

  const OrganizadorPropostasIconSmall = () => (
    <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#gradient-organizador-small)"/>
      <circle cx="40" cy="35" r="18" fill="white" opacity="0.95"/>
      <circle cx="40" cy="35" r="15" fill="url(#gradient-organizador-small)"/>
      <line x1="40" y1="35" x2="40" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="35" x2="47" y2="35" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="40" cy="60" r="12" fill="white" opacity="0.95"/>
      <circle cx="40" cy="60" r="9" fill="url(#gradient-organizador-small)"/>
      <path d="M35 58 L35 62 M37 58 L37 62 M43 58 L43 62 M45 58 L45 62" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <rect x="38" y="59" width="4" height="2" fill="white"/>
      <defs>
        <linearGradient id="gradient-organizador-small" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd700"/>
          <stop offset="1" stopColor="#ff8c00"/>
        </linearGradient>
      </defs>
    </svg>
  )

  const products: Product[] = [
    {
      id: 'tradutor-juridiques',
      title: 'Balance Tradutor Juridiquês',
      subtitle: 'Traduza juridiquês para linguagem simples',
      description: 'Transforme textos jurídicos complexos em linguagem clara e acessível. Ideal para contratos, documentos legais e termos técnicos.',
      icon: <TradutorJuridiquesIcon />
    },
    {
      id: 'checklist-tributario',
      title: 'Balance Checklist Tributário',
      subtitle: 'Checklists completos para serviços tributários',
      description: 'Gere checklists claros e completos de documentos fiscais e contábeis. Agilize a coleta documental e fortaleça a percepção de valor.',
      icon: <ChecklistTributarioIcon />
    },
    {
      id: 'criador-conteudo',
      title: 'Balance Criador de Conteúdo Jurídico Ético',
      subtitle: 'Crie conteúdo ético para redes sociais',
      description: 'Gere ideias criativas, roteiros e legendas para posts jurídicos em redes sociais. Conteúdo ético, educativo e engajador.',
      icon: <CriadorConteudoIcon />
    },
    {
      id: 'quebra-objecoes',
      title: 'Balance Comercial Quebra de Objeções com PNL',
      subtitle: 'Quebre objeções e feche mais contratos',
      description: 'Aprenda a responder objeções comerciais com técnicas de PNL e persuasão. Transforme resistências em oportunidades de fechamento.',
      icon: <QuebraObjecoesIcon />
    },
    {
      id: 'organizador-propostas',
      title: 'Balance Organizador – Propostas e Honorários',
      subtitle: 'Crie propostas claras e atrativas',
      description: 'Estruture propostas de honorários éticas e atrativas. Destaque o valor do serviço, organize fases do processo e quebre objeções.',
      icon: <OrganizadorPropostasIcon />
    }
  ]

  // Função para obter o ícone do produto baseado no ID
  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'tradutor-juridiques':
        return <TradutorJuridiquesIconSmall />
      case 'checklist-tributario':
        return <ChecklistTributarioIconSmall />
      case 'criador-conteudo':
        return <CriadorConteudoIconSmall />
      case 'quebra-objecoes':
        return <QuebraObjecoesIconSmall />
      case 'organizador-propostas':
        return <OrganizadorPropostasIconSmall />
      default:
        return <TradutorJuridiquesIconSmall />
    }
  }

  // Função para obter o nome do produto baseado no ID
  const getProductName = (productId: string) => {
    switch (productId) {
      case 'tradutor-juridiques':
        return 'Balance Tradutor - Juridiquês'
      case 'checklist-tributario':
        return 'Balance Checklist Tributário'
      case 'criador-conteudo':
        return 'Balance Criador de Conteúdo'
      case 'quebra-objecoes':
        return 'Balance Quebra de Objeções'
      case 'organizador-propostas':
        return 'Balance Organizador de Propostas'
      default:
        return 'Balance Assistant'
    }
  }

  // Função para obter o placeholder baseado no produto
  const getInputPlaceholder = () => {
    if (!selectedProduct) return 'Cole o texto jurídico aqui ou faça upload de um arquivo...'
    switch (selectedProduct.id) {
      case 'tradutor-juridiques':
        return 'Cole o texto jurídico aqui ou faça upload de um arquivo...'
      case 'checklist-tributario':
        return 'Descreva o serviço tributário ou ação judicial...'
      case 'criador-conteudo':
        return 'Descreva a área de atuação e o tema para criar conteúdo...'
      case 'quebra-objecoes':
        return 'Descreva a objeção do cliente e o contexto da conversa...'
      case 'organizador-propostas':
        return 'Descreva o serviço jurídico e o perfil do cliente...'
      default:
        return 'Digite sua mensagem aqui...'
    }
  }

  // Função para obter o texto do botão baseado no produto
  const getButtonText = () => {
    if (!selectedProduct) return 'Traduzir'
    switch (selectedProduct.id) {
      case 'tradutor-juridiques':
        return 'Traduzir'
      case 'checklist-tributario':
        return 'Gerar Checklist'
      case 'criador-conteudo':
        return 'Criar Conteúdo'
      case 'quebra-objecoes':
        return 'Quebrar Objeção'
      case 'organizador-propostas':
        return 'Criar Proposta'
      default:
        return 'Enviar'
    }
  }

  // Função para obter o texto de processamento baseado no produto
  const getProcessingText = () => {
    if (!selectedProduct) return 'Processando...'
    switch (selectedProduct.id) {
      case 'tradutor-juridiques':
        return selectedFiles.length > 0 ? 'Enviando arquivo(s)...' : 'Traduzindo...'
      case 'checklist-tributario':
        return selectedFiles.length > 0 ? 'Enviando arquivo(s)...' : 'Gerando checklist...'
      case 'criador-conteudo':
        return selectedFiles.length > 0 ? 'Enviando arquivo(s)...' : 'Criando conteúdo...'
      case 'quebra-objecoes':
        return selectedFiles.length > 0 ? 'Enviando arquivo(s)...' : 'Analisando objeção...'
      case 'organizador-propostas':
        return selectedFiles.length > 0 ? 'Enviando arquivo(s)...' : 'Criando proposta...'
      default:
        return 'Processando...'
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--balance-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Logo variant="isotipo" size="medium" />
          </div>
          <p style={{ color: 'var(--balance-text-light)', fontSize: '1rem' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--balance-bg-light)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: 'white',
        borderBottom: '1px solid var(--balance-border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(28, 43, 58, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {selectedProduct && (
            <button
              onClick={handleBackToProducts}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--balance-azul-gravidade)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--balance-azul-fluxo)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--balance-azul-gravidade)'}
            >
              ←
            </button>
          )}
          <Logo variant="isotipo" size="medium" />
          {selectedProduct && (
            <span style={{ 
              color: 'var(--balance-cinza-horizonte)', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              / {selectedProduct.title}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ 
            color: 'var(--balance-cinza-horizonte)', 
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {user?.name}
          </span>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {!selectedProduct ? (
        // Tela de seleção de produtos
        <div style={{ flex: 1, padding: '40px 24px', overflow: 'auto', background: 'var(--balance-bg)' }}>
          <div className="container">
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '0.5rem', 
                color: 'var(--balance-azul-gravidade)',
                fontWeight: '700',
                letterSpacing: '-0.01em'
              }}>
                Nossos Produtos
              </h2>
              <p style={{ 
                color: 'var(--balance-cinza-horizonte)', 
                fontSize: '1.1rem',
                fontWeight: '400'
              }}>
                Escolha um produto para começar a usar
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '24px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid var(--balance-border)',
                    padding: '32px',
                  }}
                    onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--balance-azul-fluxo)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(127, 179, 213, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--balance-border)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px var(--balance-shadow)'
                  }}
                >
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    {product.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '0.5rem', 
                    color: 'var(--balance-azul-gravidade)', 
                    fontWeight: '600', 
                    textAlign: 'center',
                    letterSpacing: '-0.01em'
                  }}>
                    {product.title}
                  </h3>
                  <p style={{ 
                    fontSize: '1rem', 
                    marginBottom: '0.75rem', 
                    color: 'var(--balance-azul-fluxo)', 
                    fontWeight: '500', 
                    textAlign: 'center'
                  }}>
                    {product.subtitle}
                  </p>
                  <p style={{ 
                    color: 'var(--balance-cinza-horizonte)', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6', 
                    textAlign: 'center'
                  }}>
                    {product.description}
                  </p>
                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
                    borderTop: '1px solid var(--balance-border)', 
                    textAlign: 'center' 
                  }}>
                    <span style={{ 
                      color: 'var(--balance-azul-fluxo)', 
                      fontWeight: '600', 
                      fontSize: '0.9rem'
                    }}>
                      Clique para usar →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Interface do produto com abas
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Abas de conversas */}
          <div style={{
            background: 'white',
            borderBottom: '1px solid var(--balance-border)',
            padding: '8px 16px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            flexShrink: 0
          }}>
            <button
              onClick={handleNewConversation}
              style={{
                padding: '8px 16px',
                background: !activeConversationId ? 'var(--balance-azul-gravidade)' : 'var(--balance-branco-nevoeiro)',
                color: !activeConversationId ? 'white' : 'var(--balance-azul-gravidade)',
                border: '1px solid var(--balance-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              + Nova conversa
            </button>
            
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                style={{
                  padding: '8px 12px',
                  background: activeConversationId === conv.id ? 'var(--balance-azul-gravidade)' : 'var(--balance-branco-nevoeiro)',
                  color: activeConversationId === conv.id ? 'white' : 'var(--balance-azul-gravidade)',
                  border: '1px solid var(--balance-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {conv.title || 'Nova conversa'}
                </span>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeConversationId === conv.id ? 'rgba(255,255,255,0.7)' : 'var(--balance-text-light)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0 4px',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Área principal */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--balance-bg)' }}>
            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--balance-bg)' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {activeConversation && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((msg, idx) => (
                    <div key={msg.id || idx} style={{ marginBottom: '24px' }}>
                      {msg.role === 'user' ? (
                        // Mensagem do usuário
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div style={{
                            maxWidth: '80%',
                            background: 'var(--balance-azul-gravidade)',
                            color: 'white',
                            padding: '16px 20px',
                            borderRadius: '16px 16px 4px 16px',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            fontWeight: '400'
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        // Resposta do assistente - estilizada
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ flexShrink: 0 }}>
                            {getProductIcon(activeConversation?.productId || selectedProduct?.id || '')}
                          </div>
                          <div style={{
                            flex: 1,
                            background: 'white',
                            border: '1px solid var(--balance-border)',
                            borderRadius: '16px',
                            padding: '20px 24px',
                            boxShadow: '0 2px 8px var(--balance-shadow)'
                          }}>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--balance-azul-fluxo)', 
                              fontWeight: '600', 
                              marginBottom: '12px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {getProductName(activeConversation?.productId || selectedProduct?.id || '')}
                            </div>
                            <div style={{
                              color: 'var(--balance-text)',
                              lineHeight: '1.8',
                              fontSize: '1rem'
                            }}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Estilizar elementos Markdown
                                  p: ({node, ...props}) => <p style={{ margin: '0 0 12px 0', lineHeight: '1.8' }} {...props} />,
                                  h1: ({node, ...props}) => <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 12px 0', color: 'var(--balance-text)' }} {...props} />,
                                  h2: ({node, ...props}) => <h2 style={{ fontSize: '1.3rem', fontWeight: '600', margin: '20px 0 12px 0', color: 'var(--balance-text)' }} {...props} />,
                                  h3: ({node, ...props}) => <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '16px 0 8px 0', color: 'var(--balance-text)' }} {...props} />,
                                  ul: ({node, ...props}) => <ul style={{ margin: '8px 0', paddingLeft: '24px', lineHeight: '1.8' }} {...props} />,
                                  ol: ({node, ...props}) => <ol style={{ margin: '8px 0', paddingLeft: '24px', lineHeight: '1.8' }} {...props} />,
                                  li: ({node, ...props}) => <li style={{ margin: '4px 0', lineHeight: '1.8' }} {...props} />,
                                  blockquote: ({node, ...props}) => (
                                    <blockquote style={{
                                      margin: '12px 0',
                                      padding: '12px 16px',
                                      borderLeft: '4px solid var(--balance-azul-fluxo)',
                                      background: 'var(--balance-branco-nevoeiro)',
                                      borderRadius: '4px',
                                      fontStyle: 'italic',
                                      color: 'var(--balance-cinza-estrutura)'
                                    }} {...props} />
                                  ),
                                  code: ({node, inline, className, children, ...props}: any) => {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return inline ? (
                                      <code style={{
                                        background: 'var(--balance-branco-nevoeiro)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.9em',
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--balance-azul-gravidade)',
                                        fontWeight: '500'
                                      }} {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <code className={className} style={{
                                        display: 'block',
                                        background: 'var(--balance-branco-nevoeiro)',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        fontSize: '0.9em',
                                        fontFamily: 'var(--font-mono)',
                                        overflowX: 'auto',
                                        margin: '12px 0',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: 'var(--balance-azul-gravidade)'
                                      }} {...props}>
                                        {children}
                                      </code>
                                    )
                                  },
                                  pre: ({node, ...props}) => {
                                    // O pre contém o code, então não precisa aplicar estilos aqui
                                    // Os estilos já estão no code não-inline
                                    return <pre style={{ margin: 0, padding: 0 }} {...props} />
                                  },
                                  strong: ({node, ...props}) => <strong style={{ fontWeight: '600', color: 'var(--balance-text)' }} {...props} />,
                                  em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                                  a: ({node, ...props}) => (
                                    <a
                                      style={{
                                        color: 'var(--balance-azul-fluxo)',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid var(--balance-azul-fluxo)'
                                      }}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      {...props}
                                    />
                                  ),
                                  hr: ({node, ...props}) => (
                                    <hr style={{
                                      border: 'none',
                                      borderTop: '1px solid var(--balance-border)',
                                      margin: '16px 0'
                                    }} {...props} />
                                  ),
                                  table: ({node, ...props}) => (
                                    <div style={{ overflowX: 'auto', margin: '12px 0' }}>
                                      <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.95em'
                                      }} {...props} />
                                    </div>
                                  ),
                                  th: ({node, ...props}) => (
                                    <th style={{
                                      padding: '8px 12px',
                                      background: 'var(--balance-branco-nevoeiro)',
                                      border: '1px solid var(--balance-border)',
                                      textAlign: 'left',
                                      fontWeight: '600',
                                      color: 'var(--balance-azul-gravidade)'
                                    }} {...props} />
                                  ),
                                  td: ({node, ...props}) => (
                                    <td style={{
                                      padding: '8px 12px',
                                      border: '1px solid var(--balance-border)'
                                    }} {...props} />
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Estado vazio
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--balance-text-light)' }}>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                      {selectedProduct?.id === 'checklist-tributario' ? <ChecklistTributarioIcon /> : 
                       selectedProduct?.id === 'criador-conteudo' ? <CriadorConteudoIcon /> : 
                       selectedProduct?.id === 'quebra-objecoes' ? <QuebraObjecoesIcon /> :
                       selectedProduct?.id === 'organizador-propostas' ? <OrganizadorPropostasIcon /> :
                       <TradutorJuridiquesIcon />}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--balance-text)' }}>
                      {selectedProduct?.title || 'Balance Assistant'}
                    </h3>
                    <p style={{ fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                      {selectedProduct?.id === 'checklist-tributario' 
                        ? 'Descreva o serviço tributário ou ação judicial para gerar um checklist completo de documentos.'
                        : selectedProduct?.id === 'criador-conteudo'
                        ? 'Descreva sua área de atuação e o tema para criar conteúdo ético para redes sociais.'
                        : selectedProduct?.id === 'quebra-objecoes'
                        ? 'Descreva a objeção do cliente e o contexto da conversa para receber sugestões de resposta com técnicas de PNL.'
                        : selectedProduct?.id === 'organizador-propostas'
                        ? 'Descreva o serviço jurídico e o perfil do cliente para criar uma proposta de honorários clara e atrativa.'
                        : 'Cole um texto jurídico ou faça upload de um documento para traduzir para linguagem simples.'}
                    </p>
                  </div>
                )}
                
                {processing && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ flexShrink: 0 }}>
                      {getProductIcon(selectedProduct?.id || '')}
                    </div>
                    <div style={{
                      background: 'white',
                      border: '1px solid var(--balance-border)',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      boxShadow: '0 2px 8px var(--balance-shadow)'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--balance-azul-fluxo)',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }}></span>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--balance-azul-fluxo)',
                          animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                        }}></span>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--balance-azul-fluxo)',
                          animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                        }}></span>
                        <span style={{ 
                          marginLeft: '8px', 
                          color: 'var(--balance-cinza-horizonte)', 
                          fontSize: '0.9rem' 
                        }}>
                          {getProcessingText()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input área */}
            <div style={{
              borderTop: '1px solid var(--balance-border)',
              padding: '16px 24px',
              background: 'white',
              flexShrink: 0
            }}>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Lista de arquivos selecionados */}
                {selectedFiles.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--balance-cinza-horizonte)', 
                        fontWeight: '500' 
                      }}>
                        {selectedFiles.length} arquivo(s) selecionado(s)
                      </span>
                      {selectedFiles.length > 0 && (
                        <button
                          onClick={handleRemoveAllFiles}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--balance-azul-fluxo)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '4px 8px',
                            fontWeight: '600',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--balance-azul-gravidade)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--balance-azul-fluxo)'}
                        >
                          Remover todos
                        </button>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '12px 16px',
                            background: 'var(--balance-branco-nevoeiro)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>📄</span>
                          <span style={{ 
                            flex: 1, 
                            fontSize: '0.9rem', 
                            wordBreak: 'break-word',
                            color: 'var(--balance-cinza-estrutura)'
                          }}>
                            {file.name}
                          </span>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--balance-cinza-horizonte)', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--balance-cinza-horizonte)',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '0 4px'
                            }}
                            title="Remover arquivo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                    multiple
                    onChange={handleFileSelect}
                    disabled={fileProcessing || processing}
                    style={{ display: 'none' }}
                  />
                    <label
                    htmlFor="file-input"
                    style={{
                      padding: '12px',
                      background: 'var(--balance-branco-nevoeiro)',
                      border: '1px solid var(--balance-border)',
                      borderRadius: '12px',
                      cursor: fileProcessing || processing ? 'not-allowed' : 'pointer',
                      opacity: fileProcessing || processing ? 0.5 : 1,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!fileProcessing && !processing) {
                        e.currentTarget.style.borderColor = 'var(--balance-azul-fluxo)'
                        e.currentTarget.style.background = 'var(--balance-azul-fluxo)'
                        e.currentTarget.style.opacity = '0.9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--balance-border)'
                      e.currentTarget.style.background = 'var(--balance-branco-nevoeiro)'
                      e.currentTarget.style.opacity = fileProcessing || processing ? 0.5 : 1
                    }}
                  >
                    📎
                  </label>
                  
                  <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      onFocus={adjustTextareaHeight}
                      placeholder={getInputPlaceholder()}
                      disabled={processing || fileProcessing}
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px', // Padding direito maior para o botão de expandir
                        border: '1px solid var(--balance-border)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        background: 'var(--balance-branco-nevoeiro)',
                        resize: 'none',
                        minHeight: '48px',
                        maxHeight: isExpanded ? '400px' : '200px',
                        height: `${textareaHeight}px`,
                        lineHeight: '1.5',
                        overflowY: 'auto',
                        transition: 'height 0.2s ease',
                        color: 'var(--balance-cinza-estrutura)'
                      }}
                      rows={1}
                    />
                    {/* Botão para expandir/contrair */}
                    {input.trim() && (
                      <button
                        type="button"
                        onClick={toggleExpand}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          bottom: '8px',
                          background: 'var(--balance-branco-nevoeiro)',
                          border: '1px solid var(--balance-border)',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--balance-cinza-horizonte)',
                          fontSize: '0.9rem',
                          padding: 0,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--balance-azul-gravidade)'
                          e.currentTarget.style.color = 'white'
                          e.currentTarget.style.borderColor = 'var(--balance-azul-gravidade)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--balance-branco-nevoeiro)'
                          e.currentTarget.style.color = 'var(--balance-cinza-horizonte)'
                          e.currentTarget.style.borderColor = 'var(--balance-border)'
                        }}
                        title={isExpanded ? 'Reduzir' : 'Expandir'}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && selectedFiles.length === 0) || processing}
                    style={{
                      padding: '12px 24px',
                      background: (!input.trim() && selectedFiles.length === 0) || processing 
                        ? 'var(--balance-cinza-horizonte)' 
                        : 'var(--balance-azul-gravidade)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (!input.trim() && selectedFiles.length === 0) || processing ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {processing ? (
                      <>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}></span>
                        {getProcessingText()}
                      </>
                    ) : (
                      getButtonText()
                    )}
                  </button>
                </div>
                
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--balance-cinza-horizonte)', 
                  marginTop: '8px', 
                  textAlign: 'center'
                }}>
                  Ctrl/Cmd + Enter para enviar • Formatos: PDF, DOC, DOCX, TXT, Imagens • Múltiplos arquivos suportados
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
