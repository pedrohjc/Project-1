import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  const decoded = verifyToken(token)
  return decoded?.userId || null
}

