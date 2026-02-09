export type TokenPlan = 'free' | 'monthly' | 'yearly'

const TOKEN_LIMITS: Record<TokenPlan, number> = {
  free: 0,
  monthly: 50000,
  yearly: 300000,
}

export function getTokenLimit(plan: string): number {
  return TOKEN_LIMITS[(plan as TokenPlan) || 'free'] ?? 0
}

export function estimateTokensFromText(text: string): number {
  if (!text) return 0
  // Heurística: ~4 caracteres por token (aprox.)
  return Math.ceil(text.length / 4)
}

export function estimateTokensFromFiles(files: File[]): number {
  if (!files || files.length === 0) return 0
  const totalBytes = files.reduce((sum, file) => sum + (file?.size || 0), 0)
  return Math.ceil(totalBytes / 4)
}

export function getTokenPeriod(date: Date = new Date()): {
  periodStart: Date
  periodEnd: Date
  resetLabel: string
} {
  const periodStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  const resetLabel = periodEnd.toLocaleDateString('pt-BR')
  return { periodStart, periodEnd, resetLabel }
}
