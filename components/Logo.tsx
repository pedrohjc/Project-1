import React from 'react'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
}

// Componente simples do logo - apenas texto "Balance Studios"
export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium'
}) => {
  const sizeMap = {
    small: { fontSize: '1rem' },
    medium: { fontSize: '1.5rem' },
    large: { fontSize: '2.5rem' }
  }

  const currentSize = sizeMap[size]

  return (
    <span 
      style={{ 
        fontFamily: '"Eurostile", "Arial Black", "Arial Bold", sans-serif',
        fontSize: currentSize.fontSize,
        fontWeight: 900,
        color: '#333333',
        letterSpacing: '-0.02em'
      }}
    >
      Balance Studios
    </span>
  )
}

export default Logo
