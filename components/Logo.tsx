import React from 'react'
import Image from 'next/image'

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
    <Image
      src="/balance-logo.png"
      alt="Balance"
      width={currentSize.width}
      height={currentSize.height}
      style={{
        objectFit: 'contain',
        height: 'auto'
      }}
      priority
    />
  )
}

export default Logo
