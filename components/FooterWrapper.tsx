'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterWrapper() {
  const pathname = usePathname()

  // Esconde o footer apenas na tela de produto (dashboard)
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return <Footer />
}
