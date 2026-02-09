export interface TokenPack {
  id: string
  name: string
  tokens: number
  price: number
  highlight?: string
}

export const TOKEN_PACKS: TokenPack[] = [
  { id: 'pack-10k', name: 'Pacote 10k', tokens: 10000, price: 19.90 },
  { id: 'pack-50k', name: 'Pacote 50k', tokens: 50000, price: 79.90, highlight: 'Mais popular' },
  { id: 'pack-200k', name: 'Pacote 200k', tokens: 200000, price: 249.90, highlight: 'Melhor custo' },
]

export function getTokenPack(packId: string): TokenPack | undefined {
  return TOKEN_PACKS.find((pack) => pack.id === packId)
}
