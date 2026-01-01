import type { Card } from '../types/escalate'

type CardIconProps = {
  card: Card
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const getCardDisplay = (card: Card): { value: string; suit: string; color: string } => {
  // Map card names to display values and suits
  const cardMap: Record<Card, { value: string; suit: string; color: string }> = {
    ACE: { value: 'A', suit: '♠', color: '#000' },
    TWO: { value: '2', suit: '♥', color: '#e53e3e' },
    THREE: { value: '3', suit: '♦', color: '#e53e3e' },
    FOUR: { value: '4', suit: '♣', color: '#000' },
    FIVE: { value: '5', suit: '♠', color: '#000' },
    SIX: { value: '6', suit: '♥', color: '#e53e3e' },
    SEVEN: { value: '7', suit: '♦', color: '#e53e3e' },
    EIGHT: { value: '8', suit: '♣', color: '#000' },
    NINE: { value: '9', suit: '♠', color: '#000' },
    TEN: { value: '10', suit: '♥', color: '#e53e3e' },
    JACK: { value: 'J', suit: '♦', color: '#e53e3e' },
    QUEEN: { value: 'Q', suit: '♣', color: '#000' },
    KING: { value: 'K', suit: '♠', color: '#000' },
    JOKER: { value: '🃏', suit: '', color: '#9f7aea' },
  }

  return cardMap[card] || { value: card, suit: '?', color: '#666' }
}

const sizeMap = {
  small: { width: '32px', height: '44px', fontSize: '14px', suitSize: '12px' },
  medium: { width: '48px', height: '64px', fontSize: '20px', suitSize: '16px' },
  large: { width: '64px', height: '88px', fontSize: '28px', suitSize: '20px' },
}

export function CardIcon({ card, size = 'small', className = '' }: CardIconProps) {
  const { value, suit, color } = getCardDisplay(card)
  const dimensions = sizeMap[size]

  return (
    <div
      className={`card-icon ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: '#fff',
        borderRadius: '4px',
        border: '1px solid #ddd',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        position: 'relative',
        fontWeight: 'bold',
        color: color,
        fontFamily: 'Arial, sans-serif',
      }}
      title={card}
    >
      <div
        style={{
          fontSize: dimensions.fontSize,
          lineHeight: 1,
          marginBottom: '2px',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: dimensions.suitSize,
          lineHeight: 1,
        }}
      >
        {suit}
      </div>
    </div>
  )
}

type CardBadgeProps = {
  card: Card
  className?: string
}

export function CardBadge({ card, className = '' }: CardBadgeProps) {
  const { value, suit, color } = getCardDisplay(card)

  return (
    <span
      className={`card-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: '#fff',
        color: color,
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
      }}
      title={card}
    >
      <span>{value}</span>
      <span style={{ fontSize: '16px' }}>{suit}</span>
    </span>
  )
}

