import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(
        new URL('/login?error=linkedin_cancelled', request.url)
      )
    }

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

    if (!tokenRes.ok) {
      return NextResponse.redirect(
        new URL('/login?error=linkedin_token_failed', request.url)
      )
    }

    const tokenData = await tokenRes.json()

    // Get user info from LinkedIn
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(
        new URL('/login?error=linkedin_profile_failed', request.url)
      )
    }

    const userData = await userRes.json()

    if (!userData.email) {
      return NextResponse.redirect(
        new URL('/login?error=linkedin_no_email', request.url)
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: userData.email } })

    if (user) {
      if (!user.provider) {
        user = await prisma.user.update({
          where: { email: userData.email },
          data: {
            provider: 'linkedin',
            providerId: userData.sub,
            avatarUrl: userData.picture,
          },
        })
      }
    } else {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          provider: 'linkedin',
          providerId: userData.sub,
          avatarUrl: userData.picture,
          password: '',
          role: 'user',
        },
      })
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id, user.role)

    // Redirect to dashboard with cookie set
    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Erro no callback do LinkedIn:', error)
    return NextResponse.redirect(
      new URL('/login?error=linkedin_error', request.url)
    )
  }
}
