import { NextRequest } from 'next/server'

export function isHttpsRequest(request: NextRequest): boolean {
  const proto =
    request.headers.get('x-forwarded-proto') ||
    request.headers.get('x-forwarded-protocol') ||
    ''

  if (!proto) return false
  return proto.split(',')[0]?.trim().toLowerCase() === 'https'
}

