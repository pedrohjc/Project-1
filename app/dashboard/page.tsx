'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Image from 'next/image'
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
  group: 'Pesquisa' | 'Redação'
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
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<'Todos' | 'Pesquisa' | 'Redação'>('Todos')
  const [recentProducts, setRecentProducts] = useState<Array<{
    product: Product
    lastConversationTitle: string
  }>>([])
  const [pendingReviewCount, setPendingReviewCount] = useState(0)
  const [tokensUsed, setTokensUsed] = useState(15) // Valor de teste - remover depois
  const monthlyTokenLimit = 50
  const tokensResetLabel = 'hoje'

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

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

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
      // Preencher formulário de perfil com dados do usuário
      setProfileForm({
        name: data.user.name || '',
        email: data.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenProfile = async () => {
    setShowProfileModal(true)
    setProfileError('')
    setProfileSuccess('')
    setShowUserMenu(false)
    
    // Buscar dados atualizados do perfil
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileForm({
          name: data.user.name || '',
          email: data.user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }

  const handleCloseProfile = () => {
    setShowProfileModal(false)
    setProfileError('')
    setProfileSuccess('')
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      // Validar senha se fornecida
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileError('As senhas não coincidem')
        setProfileLoading(false)
        return
      }

      if (profileForm.newPassword && profileForm.newPassword.length < 6) {
        setProfileError('A nova senha deve ter pelo menos 6 caracteres')
        setProfileLoading(false)
        return
      }

      // Preparar dados para envio
      const updateData: any = {}
      
      if (profileForm.name.trim() !== user?.name) {
        updateData.name = profileForm.name.trim()
      }
      
      if (profileForm.email.trim() !== user?.email) {
        updateData.email = profileForm.email.trim()
      }

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword
        updateData.newPassword = profileForm.newPassword
      }

      // Se não houver nada para atualizar
      if (Object.keys(updateData).length === 0) {
        setProfileError('Nenhuma alteração detectada')
        setProfileLoading(false)
        return
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileError(data.error || 'Erro ao atualizar perfil')
        setProfileLoading(false)
        return
      }

      // Atualizar estado do usuário
      setUser(data.user)
      setProfileSuccess('Perfil atualizado com sucesso!')
      
      // Limpar campos de senha
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleCloseProfile()
      }, 2000)
    } catch (err) {
      setProfileError('Erro ao atualizar perfil. Tente novamente.')
      console.error('Erro ao atualizar perfil:', err)
    } finally {
      setProfileLoading(false)
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
    // TODO: REATIVAR EM PRODUÇÃO - Verificação de assinatura desabilitada para desenvolvimento
    // Verificar assinatura antes de selecionar produto
    // try {
    //   const response = await fetch('/api/subscriptions/status')
    //   if (response.ok) {
    //     const data = await response.json()
    //     if (!data.hasSubscription || data.subscription?.status !== 'active') {
    //       if (confirm('Você precisa de uma assinatura ativa para usar os produtos.\n\nDeseja ir para a página de assinaturas?')) {
    //         router.push('/subscription')
    //       }
    //       return
    //     }
    //   }
    // } catch (err) {
    //   console.error('Erro ao verificar assinatura:', err)
    // }

    setSelectedProduct(product)
    setActiveConversationId(null)
    setInput('')
    setSelectedFiles([])
    // Carregar conversas do produto selecionado
    await loadConversations()
    // Atualizar lista de produtos recentes
    await loadRecentProducts()
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        console.error('Erro ao excluir conversa:', data)
        alert(`Erro ao excluir conversa: ${data.error || 'Tente novamente'}`)
      }
    } catch (err: any) {
      console.error('Erro ao excluir conversa:', err)
      alert(`Erro ao excluir conversa: ${err?.message || 'Tente novamente'}`)
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

    // Verificar limite de tokens
    if (tokensUsed >= monthlyTokenLimit) {
      alert('Você atingiu o limite de créditos de IA deste mês. Aguarde o reset ou entre em contato para obter mais créditos.')
      return
    }

    // Verificar limite de conversas antes de criar uma nova
    if (!activeConversationId) {
      const currentProductConversations = conversations.filter(c => c.productId === selectedProduct.id)
      if (currentProductConversations.length >= 5) {
        alert('Você já possui o máximo de 5 conversas para este produto. Por favor, exclua uma conversa antes de criar uma nova.')
        return
      }
    }

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
        // Incrementar contador de tokens (1 token por mensagem enviada)
        setTokensUsed(prev => prev + 1)
        // Limpar arquivos após envio bem-sucedido
        setSelectedFiles([])
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        // TODO: REATIVAR EM PRODUÇÃO - Verificação de assinatura desabilitada para desenvolvimento
        // Verificar se é erro de assinatura
        // if (data.requiresSubscription) {
        //   if (confirm(`${data.message || 'Você precisa de uma assinatura ativa para usar os produtos.'}\n\nDeseja ir para a página de assinaturas?`)) {
        //     router.push('/subscription')
        //   }
        // } else {
        //   Mostrar mensagem de erro mais amigável
        const errorMessage = data.error || 'Erro ao processar. Tente novamente.'
        alert(errorMessage)
        // }
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
      icon: <TradutorJuridiquesIcon />,
      group: 'Redação'
    },
    {
      id: 'checklist-tributario',
      title: 'Balance Checklist Tributário',
      subtitle: 'Checklists completos para serviços tributários',
      description: 'Gere checklists claros e completos de documentos fiscais e contábeis. Agilize a coleta documental e fortaleça a percepção de valor.',
      icon: <ChecklistTributarioIcon />,
      group: 'Pesquisa'
    },
    {
      id: 'criador-conteudo',
      title: 'Balance Criador de Conteúdo Jurídico Ético',
      subtitle: 'Crie conteúdo ético para redes sociais',
      description: 'Gere ideias criativas, roteiros e legendas para posts jurídicos em redes sociais. Conteúdo ético, educativo e engajador.',
      icon: <CriadorConteudoIcon />,
      group: 'Redação'
    },
    {
      id: 'quebra-objecoes',
      title: 'Balance Comercial Quebra de Objeções com PNL',
      subtitle: 'Quebre objeções e feche mais contratos',
      description: 'Aprenda a responder objeções comerciais com técnicas de PNL e persuasão. Transforme resistências em oportunidades de fechamento.',
      icon: <QuebraObjecoesIcon />,
      group: 'Redação'
    },
    {
      id: 'organizador-propostas',
      title: 'Balance Organizador – Propostas e Honorários',
      subtitle: 'Crie propostas claras e atrativas',
      description: 'Estruture propostas de honorários éticas e atrativas. Destaque o valor do serviço, organize fases do processo e quebre objeções.',
      icon: <OrganizadorPropostasIcon />,
      group: 'Redação'
    }
  ]

  // Função para carregar produtos recentes
  const loadRecentProducts = async () => {
    try {
      // Buscar todas as conversas para identificar produtos usados
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        const allConversations = data.conversations || []
        
        // Extrair productIds únicos ordenados por data de uso mais recente
        const productUsageMap = new Map<string, { updatedAt: string; title: string | null }>()
        allConversations.forEach((conv: Conversation) => {
          if (!productUsageMap.has(conv.productId) || 
              new Date(conv.updatedAt) > new Date(productUsageMap.get(conv.productId)!.updatedAt)) {
            productUsageMap.set(conv.productId, {
              updatedAt: conv.updatedAt,
              title: conv.title
            })
          }
        })
        
        // Ordenar por data mais recente
        const sortedProductIds = Array.from(productUsageMap.entries())
          .sort((a, b) => new Date(b[1].updatedAt).getTime() - new Date(a[1].updatedAt).getTime())
          .map(([productId, info]) => ({ productId, info }))
          .slice(0, 5) // Limitar a 5 produtos mais recentes
        
        // Mapear para objetos Product (products está definido abaixo)
        const recentProductsList = sortedProductIds
          .map(({ productId, info }) => {
            const product = products.find(p => p.id === productId)
            if (!product) return null
            return {
              product,
              lastConversationTitle: info.title || 'Última conversa'
            }
          })
          .filter((p): p is { product: Product; lastConversationTitle: string } => p !== null)
        
        setRecentProducts(recentProductsList)

        const pendingCount = allConversations.filter((conv: Conversation) => {
          if (!conv.messages || conv.messages.length === 0) return false
          const lastMessage = conv.messages[conv.messages.length - 1]
          return lastMessage.role === 'assistant'
        }).length
        setPendingReviewCount(pendingCount)
      }
    } catch (err) {
      console.error('Erro ao carregar produtos recentes:', err)
    }
  }

  // Carregar produtos recentes quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadRecentProducts()
    }
  }, [user])

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

  const renderRecentProductsSidebar = () => {
    const recentItems = recentProducts.filter(({ product }) => product.id !== selectedProduct?.id)

    const usagePercentage = Math.round((tokensUsed / monthlyTokenLimit) * 100)
    
    return (
      <div style={{
        width: '280px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        borderRight: '1px solid var(--balance-border)',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 100
      }}>
        {/* Logo no topo */}
        <div style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid var(--balance-border)',
          flexShrink: 0
        }}>
          <Image
            src="/balance-logo.png"
            alt="Balance"
            width={150}
            height={50}
            style={{ objectFit: 'contain', height: 'auto' }}
            priority
          />
        </div>
        
        {/* Área scrollável - Produtos Recentes */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--balance-text)',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--balance-border)'
          }}>
            Produtos Recentes
          </h3>
          {recentItems.length === 0 ? (
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--balance-text-light)',
              lineHeight: '1.5'
            }}>
              Nenhum produto recente ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentItems.map(({ product, lastConversationTitle }) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--balance-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'var(--balance-bg-light)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--balance-primary)'
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--balance-border)'
                    e.currentTarget.style.background = 'var(--balance-bg-light)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getProductIcon(product.id)}
                    </div>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--balance-text)',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      {product.title}
                    </h4>
                  </div>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--balance-text-light)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {lastConversationTitle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Token Counter - Fixo no final */}
        <div style={{
          padding: '16px 20px 20px 20px',
          borderTop: '1px solid var(--balance-border)',
          flexShrink: 0
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid var(--balance-border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🎯</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--balance-text)'
              }}>
                Créditos de IA
              </span>
            </div>
            
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--balance-text-light)',
              marginBottom: '8px'
            }}>
              <span style={{ fontWeight: '600', color: 'var(--balance-text)' }}>
                {tokensUsed.toLocaleString()}
              </span>
              {' / '}
              <span>{monthlyTokenLimit.toLocaleString()}</span>
              {' usados este mês'}
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '10px',
              background: '#e2e8f0',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${usagePercentage}%`,
                minWidth: usagePercentage > 0 ? '8px' : '0px',
                height: '100%',
                background: usagePercentage > 80 
                  ? '#ef4444'
                  : usagePercentage > 50 
                    ? '#f59e0b'
                    : '#32c8a7',
                borderRadius: '5px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--balance-text-light)'
            }}>
              <span>{usagePercentage}% utilizado</span>
              <span>Reset: {tokensResetLabel}</span>
            </div>
          </div>
          
          {/* User Profile */}
          <div 
            data-user-menu
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              marginTop: '16px',
              background: 'var(--balance-primary)',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  marginBottom: '2px'
                }}>
                  {user?.name || 'Usuário'}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem'
                }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                background: 'white',
                border: '1px solid var(--balance-border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                zIndex: 200
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu(false)
                    handleOpenProfile()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    color: 'var(--balance-text)',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    fontSize: '0.9rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--balance-bg-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  👤 Meu Perfil
                </button>
                <Link
                  href="/subscription"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    color: 'var(--balance-text)',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--balance-bg-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  💳 Minha Assinatura
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    fontSize: '0.9rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
            <Logo size="medium" />
          </div>
          <p style={{ color: 'var(--balance-text-light)', fontSize: '1rem' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--balance-bg-light)', display: 'flex', flexDirection: 'column' }}>
      {/* Header - só aparece quando um produto está selecionado */}
      {selectedProduct && (
        <header style={{ 
          background: 'white',
          borderBottom: '1px solid var(--balance-border)',
          padding: '16px 24px',
          marginLeft: '280px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(28, 43, 58, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleBackToProducts}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--balance-primary)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--balance-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--balance-primary)'}
            >
              ←
            </button>
            <span style={{ 
              color: 'var(--balance-text)', 
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {selectedProduct.title}
            </span>
          </div>
        </header>
      )}

      {!selectedProduct ? (
        // Tela de seleção de produtos
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {renderRecentProductsSidebar()}
          <div style={{ flex: 1, padding: '40px 24px', overflow: 'auto', background: 'var(--balance-bg)', position: 'relative', marginLeft: '280px' }}>
            <div className="container">
              <div style={{
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--balance-border)'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  color: 'var(--balance-text)',
                  fontWeight: '700',
                  letterSpacing: '-0.01em'
                }}>
                  Bem-vindo de volta{user?.name ? `, ${user.name}.` : '.'}
                </h2>
                <p style={{
                  color: 'var(--balance-text-light)',
                  fontSize: '1rem'
                }}>
                  Você tem <span style={{ fontWeight: 700 }}>{pendingReviewCount} conversa{pendingReviewCount === 1 ? '' : 's'}</span> respondida{pendingReviewCount === 1 ? '' : 's'} aguardando revisão.
                </p>
              </div>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '0.5rem', 
                color: 'var(--balance-primary)',
                fontWeight: '700',
                letterSpacing: '-0.01em'
              }}>
                Catálogo de Produtos
              </h2>
              <p style={{ 
                color: 'var(--balance-text-light)', 
                fontSize: '1.1rem',
                fontWeight: '400',
                marginBottom: '1rem'
              }}>
                Escolha um produto para começar a usar
              </p>
            </div>

            {/* Campo de pesquisa */}
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto 1.5rem',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    border: '2px solid var(--balance-border)',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    background: 'white',
                    color: 'var(--balance-text)',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--balance-primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--balance-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  color: 'var(--balance-text-light)',
                  fontSize: '1.2rem',
                  pointerEvents: 'none'
                }}>
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '48px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--balance-text-light)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--balance-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--balance-text-light)'
                    }}
                    title="Limpar pesquisa"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px', 
                margin: '0 auto 24px',
                maxWidth: '800px',
                flexWrap: 'wrap'
              }}>
                {(['Todos', 'Pesquisa', 'Redação'] as const).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: selectedGroup === group ? '1px solid #d7e3f6' : '1px solid var(--balance-border)',
                      background: selectedGroup === group ? 'white' : 'var(--balance-bg-light)',
                      color: selectedGroup === group ? 'var(--balance-text)' : 'var(--balance-text-light)',
                      fontWeight: selectedGroup === group ? '600' : '500',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {group}
                  </button>
                ))}
              </div>

            {/* Filtrar produtos baseado na pesquisa */}
            {(() => {
              const filteredProducts = products.filter(product => {
                if (!searchTerm.trim()) return true
                const search = searchTerm.toLowerCase()
                return (
                  product.title.toLowerCase().includes(search) ||
                  product.subtitle.toLowerCase().includes(search) ||
                  product.description.toLowerCase().includes(search)
                )
              }).filter(product => {
                if (selectedGroup === 'Todos') return true
                return product.group === selectedGroup
              })

              if (filteredProducts.length === 0) {
                return (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: 'var(--balance-text-light)'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      marginBottom: '0.5rem',
                      color: 'var(--balance-text)'
                    }}>
                      Nenhum produto encontrado
                    </h3>
                    <p style={{ fontSize: '1rem' }}>
                      Tente pesquisar com outros termos ou{' '}
                      <button
                        onClick={() => setSearchTerm('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--balance-primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                      >
                        limpe a pesquisa
                      </button>
                    </p>
                  </div>
                )
              }

              return (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                  gap: '24px',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}>
                  {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    border: '1px solid #e6eef9',
                    borderRadius: '16px',
                    padding: '24px',
                    background: 'white',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                    onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.35)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 23, 42, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e6eef9'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.12), rgba(0, 102, 255, 0.04))',
                      border: '1px solid rgba(0, 102, 255, 0.12)'
                    }}>
                      {product.icon}
                    </div>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      marginBottom: '6px',
                      color: 'var(--balance-text)',
                      fontWeight: '700',
                      letterSpacing: '-0.01em'
                    }}>
                      {product.title}
                    </h3>
                    <p style={{
                      fontSize: '0.95rem',
                      marginBottom: '8px',
                      color: 'var(--balance-text-light)',
                      fontWeight: '500'
                    }}>
                      {product.subtitle}
                    </p>
                    <p style={{
                      color: 'var(--balance-text-light)',
                      fontSize: '0.92rem',
                      lineHeight: '1.6',
                      marginBottom: '16px'
                    }}>
                      {product.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{
                      marginTop: 'auto',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: '1px solid #d7e3f6',
                      background: 'white',
                      color: 'var(--balance-text)',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.4)'
                      e.currentTarget.style.color = 'var(--balance-primary)'
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(15, 23, 42, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d7e3f6'
                      e.currentTarget.style.color = 'var(--balance-text)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Iniciar Ferramenta <span>→</span>
                  </button>
                </div>
                  ))}
                </div>
              )
            })()}
            </div>

            {/* Botão flutuante do WhatsApp */}
            <div
              style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 1000,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onClick={() => {
                // Por enquanto apenas mostra um alerta, depois será substituído pelo link do WhatsApp
                alert('Em breve você poderá entrar em contato conosco pelo WhatsApp!')
              }}
              title="Fale conosco pelo WhatsApp"
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                outline: 'none'
              }}>
                {/* Ícone do WhatsApp */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Interface do produto com abas
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {renderRecentProductsSidebar()}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: '280px' }}>
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
                background: !activeConversationId ? 'var(--balance-primary)' : 'var(--balance-bg-light)',
                color: !activeConversationId ? 'white' : 'var(--balance-primary)',
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
                  background: activeConversationId === conv.id ? 'var(--balance-primary)' : 'var(--balance-bg-light)',
                  color: activeConversationId === conv.id ? 'white' : 'var(--balance-primary)',
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

          {/* Área principal com sidebar */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--balance-bg)' }}>
            {/* Conteúdo principal */}
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
                            background: 'var(--balance-primary)',
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
                              color: 'var(--balance-primary)', 
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
                                      borderLeft: '4px solid var(--balance-primary)',
                                      background: 'var(--balance-bg-light)',
                                      borderRadius: '4px',
                                      fontStyle: 'italic',
                                      color: 'var(--balance-text)'
                                    }} {...props} />
                                  ),
                                  code: ({node, inline, className, children, ...props}: any) => {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return inline ? (
                                      <code style={{
                                        background: 'var(--balance-bg-light)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.9em',
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--balance-primary)',
                                        fontWeight: '500'
                                      }} {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <code className={className} style={{
                                        display: 'block',
                                        background: 'var(--balance-bg-light)',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        fontSize: '0.9em',
                                        fontFamily: 'var(--font-mono)',
                                        overflowX: 'auto',
                                        margin: '12px 0',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: 'var(--balance-primary)'
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
                                        color: 'var(--balance-primary)',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid var(--balance-primary)'
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
                                      background: 'var(--balance-bg-light)',
                                      border: '1px solid var(--balance-border)',
                                      textAlign: 'left',
                                      fontWeight: '600',
                                      color: 'var(--balance-primary)'
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
                          background: 'var(--balance-primary)',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }}></span>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--balance-primary)',
                          animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                        }}></span>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--balance-primary)',
                          animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                        }}></span>
                        <span style={{ 
                          marginLeft: '8px', 
                          color: 'var(--balance-text-light)', 
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
                        color: 'var(--balance-text-light)', 
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
                            color: 'var(--balance-primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '4px 8px',
                            fontWeight: '600',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--balance-primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--balance-primary)'}
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
                            background: 'var(--balance-bg-light)',
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
                            color: 'var(--balance-text)'
                          }}>
                            {file.name}
                          </span>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--balance-text-light)', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--balance-text-light)',
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
                      background: 'var(--balance-bg-light)',
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
                        e.currentTarget.style.borderColor = 'var(--balance-primary)'
                        e.currentTarget.style.background = 'var(--balance-primary)'
                        e.currentTarget.style.opacity = '0.9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--balance-border)'
                      e.currentTarget.style.background = 'var(--balance-bg-light)'
                      e.currentTarget.style.opacity = fileProcessing || processing ? '0.5' : '1'
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
                        background: 'var(--balance-bg-light)',
                        resize: 'none',
                        minHeight: '48px',
                        maxHeight: isExpanded ? '400px' : '200px',
                        height: `${textareaHeight}px`,
                        lineHeight: '1.5',
                        overflowY: 'auto',
                        transition: 'height 0.2s ease',
                        color: 'var(--balance-text)'
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
                          background: 'var(--balance-bg-light)',
                          border: '1px solid var(--balance-border)',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--balance-text-light)',
                          fontSize: '0.9rem',
                          padding: 0,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--balance-primary)'
                          e.currentTarget.style.color = 'white'
                          e.currentTarget.style.borderColor = 'var(--balance-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--balance-bg-light)'
                          e.currentTarget.style.color = 'var(--balance-text-light)'
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
                        ? '#ccc' 
                        : 'var(--balance-primary)',
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
                  color: 'var(--balance-text-light)', 
                  marginTop: '8px', 
                  textAlign: 'center'
                }}>
                  Ctrl/Cmd + Enter para enviar • Formatos: PDF, DOC, DOCX, TXT, Imagens • Múltiplos arquivos suportados
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      )}

      {/* Modal de Perfil */}
      {showProfileModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseProfile()
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div className="card" style={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--balance-text)',
                margin: 0
              }}>
                Meu Perfil
              </h2>
              <button
                onClick={handleCloseProfile}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--balance-text-light)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--balance-bg-light)'
                  e.currentTarget.style.color = 'var(--balance-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.color = 'var(--balance-text-light)'
                }}
              >
                ×
              </button>
            </div>

            {profileError && (
              <div style={{
                padding: '12px',
                background: '#fee',
                color: '#c33',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}>
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div style={{
                padding: '12px',
                background: '#efe',
                color: '#3c3',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}>
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="profile-name">Nome</label>
                <input
                  type="text"
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email</label>
                <input
                  type="email"
                  id="profile-email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div style={{
                marginTop: '32px',
                marginBottom: '24px',
                borderTop: '1px solid var(--balance-border)',
                paddingTop: '24px'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'var(--balance-text)',
                  marginBottom: '16px'
                }}>
                  Alterar Senha (opcional)
                </h3>

                <div className="form-group">
                  <label htmlFor="current-password">Senha Atual</label>
                  <input
                    type="password"
                    id="current-password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">Nova Senha</label>
                  <input
                    type="password"
                    id="new-password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Digite a nova senha novamente"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseProfile}
                  className="btn btn-secondary"
                  style={{ padding: '12px 24px' }}
                  disabled={profileLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px' }}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
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
