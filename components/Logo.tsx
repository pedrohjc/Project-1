import React from 'react'

interface LogoProps {
  variant?: 'imagotipo' | 'isologo' | 'logotipo' | 'isotipo'
  size?: 'small' | 'medium' | 'large'
  color?: string
  showText?: boolean
}

// Componente do ícone AV (ampulheta) - Isotipo
// O ícone é formado por duas setas (ascendente e descendente) que se encontram no centro formando uma ampulheta minimalista
export const BalanceIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = 32, 
  color = 'currentColor' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Seta ascendente (A) - forma a parte superior da ampulheta com cantos arredondados */}
      <path 
        d="M20 4 L11 14 L14 14 L14 20 L26 20 L26 14 L29 14 Z" 
        fill={color}
        rx="1"
      />
      {/* Seta descendente (V) - forma a parte inferior da ampulheta com cantos arredondados */}
      <path 
        d="M20 36 L11 26 L14 26 L14 20 L26 20 L26 26 L29 26 Z" 
        fill={color}
        rx="1"
      />
    </svg>
  )
}

// Componente completo do logo
export const Logo: React.FC<LogoProps> = ({ 
  variant = 'imagotipo', 
  size = 'medium',
  color,
  showText = true 
}) => {
  const sizeMap = {
    small: { icon: 24, fontSize: '1rem' },
    medium: { icon: 32, fontSize: '1.5rem' },
    large: { icon: 48, fontSize: '2.5rem' }
  }

  const currentSize = sizeMap[size]
  const logoColor = color || 'var(--balance-azul-gravidade, #1c2b3a)'

  if (variant === 'isotipo') {
    return <BalanceIcon size={currentSize.icon} color={logoColor} />
  }

  if (variant === 'logotipo') {
    if (!showText) return null
    return (
      <span 
        style={{ 
          fontFamily: 'var(--font-brand, "Eurostile", sans-serif)',
          fontSize: currentSize.fontSize,
          fontWeight: 900,
          color: logoColor,
          letterSpacing: '-0.02em'
        }}
      >
        Balance
      </span>
    )
  }

  if (variant === 'isologo') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '8px'
      }}>
        <BalanceIcon size={currentSize.icon} color={logoColor} />
        {showText && (
          <span 
            style={{ 
              fontFamily: 'var(--font-brand, "Eurostile", sans-serif)',
              fontSize: currentSize.fontSize,
              fontWeight: 900,
              color: logoColor,
              letterSpacing: '-0.02em',
              textAlign: 'center'
            }}
          >
            Balance
          </span>
        )}
      </div>
    )
  }

  // Imagotipo (horizontal - padrão)
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: '12px'
    }}>
      <BalanceIcon size={currentSize.icon} color={logoColor} />
      {showText && (
        <span 
          style={{ 
            fontFamily: 'var(--font-brand, "Eurostile", sans-serif)',
            fontSize: currentSize.fontSize,
            fontWeight: 900,
            color: logoColor,
            letterSpacing: '-0.02em'
          }}
        >
          Balance
        </span>
      )}
    </div>
  )
}

export default Logo
