import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getUserFromRequest(request: NextRequest): {
  userId: string
  role?: string
} | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded?.userId) return null
  return {
    userId: decoded.userId,
    role: decoded.role
  }
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  return getUserFromRequest(request)?.userId || null
}

