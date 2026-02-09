import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

interface GooglePayload {
  sub: string
  email: string
  name: string
  picture?: string
  email_verified?: boolean
}

interface FacebookPayload {
  id: string
  email: string
  name: string
  picture?: { data?: { url?: string } }
}

interface LinkedInPayload {
  sub: string
  email: string
  name: string
  picture?: string
}

async function verifyGoogleToken(token: string): Promise<GooglePayload | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    if (!res.ok) return null
    const data = await res.json()
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (clientId && data.aud !== clientId) return null
    return {
      sub: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
      email_verified: data.email_verified === 'true' || data.email_verified === true,
    }
  } catch {
    return null
  }
}

async function verifyFacebookToken(token: string): Promise<FacebookPayload | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function verifyLinkedInToken(code: string): Promise<LinkedInPayload | null> {
  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      }),
    })
    if (!tokenRes.ok) return null
    const tokenData = await tokenRes.json()

    // Get user info
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (!userRes.ok) return null
    return await userRes.json()
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, token } = await request.json()

    if (!provider || !token) {
      return NextResponse.json(
        { error: 'Provedor e token são obrigatórios' },
        { status: 400 }
      )
    }

    let email: string | undefined
    let name: string | undefined
    let providerId: string | undefined
    let avatarUrl: string | undefined

    switch (provider) {
      case 'google': {
        const payload = await verifyGoogleToken(token)
        if (!payload) {
          return NextResponse.json({ error: 'Token do Google inválido' }, { status: 401 })
        }
        email = payload.email
        name = payload.name
        providerId = payload.sub
        avatarUrl = payload.picture
        break
      }
      case 'facebook': {
        const payload = await verifyFacebookToken(token)
        if (!payload || !payload.email) {
          return NextResponse.json({ error: 'Token do Facebook inválido' }, { status: 401 })
        }
        email = payload.email
        name = payload.name
        providerId = payload.id
        avatarUrl = payload.picture?.data?.url
        break
      }
      case 'linkedin': {
        const payload = await verifyLinkedInToken(token)
        if (!payload || !payload.email) {
          return NextResponse.json({ error: 'Token do LinkedIn inválido' }, { status: 401 })
        }
        email = payload.email
        name = payload.name
        providerId = payload.sub
        avatarUrl = payload.picture
        break
      }
      default:
        return NextResponse.json({ error: 'Provedor não suportado' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Não foi possível obter o e-mail da conta social' },
        { status: 400 }
      )
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Atualizar dados sociais se necessário
      if (!user.provider) {
        user = await prisma.user.update({
          where: { email },
          data: { provider, providerId, avatarUrl },
        })
      }
    } else {
      // Criar novo usuário social
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          provider,
          providerId,
          avatarUrl,
          password: '', // social users don't have a password
          role: 'user',
        },
      })
    }

    // Gerar token JWT
    const jwtToken = generateToken(user.id, user.role)

    const response = NextResponse.json({
      message: 'Login social realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })

    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Erro no login social:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login social' },
      { status: 500 }
    )
  }
}
