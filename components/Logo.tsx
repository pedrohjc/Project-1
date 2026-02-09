import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
}

// Componente do logo Balance usando imagem PNG
export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium'
}) => {
  const sizeMap = {
    small: { width: 120, height: 40 },
    medium: { width: 180, height: 60 },
    large: { width: 240, height: 80 }
  }

  const currentSize = sizeMap[size]

  return (
    <Link href="/" aria-label="Ir para a página inicial">
      <Image
        src="/balance-marca.svg"
        alt="Balance"
        width={currentSize.width}
        height={currentSize.height}
        style={{
          objectFit: 'contain',
          height: 'auto'
        }}
        priority
      />
    </Link>
  )
}

export default Logo
