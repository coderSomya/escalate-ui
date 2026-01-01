import { useMemo, type ReactNode } from 'react'
import { CARD_OPTIONS, type Card } from '../types/escalate'
import { CardBadge } from './CardIcon'

export const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) => (
  <div className="panel">
    <div className="panel__header">
      <h3>{title}</h3>
      {subtitle ? <p className="panel__subtitle">{subtitle}</p> : null}
    </div>
    {children}
  </div>
)

export const CardPills = ({
  selected,
  available,
  onToggle,
}: {
  selected: Card[]
  available: Card[]
  onToggle: (card: Card) => void
}) => {
  const counts = useMemo(() => {
    const map = new Map<Card, number>()
    available.forEach((card) => map.set(card, (map.get(card) ?? 0) + 1))
    return map
  }, [available])

  const selectedCounts = useMemo(() => {
    const map = new Map<Card, number>()
    selected.forEach((card) => map.set(card, (map.get(card) ?? 0) + 1))
    return map
  }, [selected])

  const uniqueCards = Array.from(counts.keys()).sort(
    (a, b) => CARD_OPTIONS.indexOf(a) - CARD_OPTIONS.indexOf(b),
  )

  return (
    <div className="pill-row">
      {uniqueCards.length ? (
        uniqueCards.map((card) => {
          const total = counts.get(card) ?? 0
          const picked = selectedCounts.get(card) ?? 0
          const fullyUsed = picked >= total
          return (
            <button
              key={card}
              type="button"
              className={`pill ${picked > 0 ? 'pill--active' : ''} ${fullyUsed ? 'pill--max' : ''}`}
              onClick={() => onToggle(card)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
              }}
            >
              <CardBadge card={card} />
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {picked}/{total}
              </span>
            </button>
          )
        })
      ) : (
        <p className="muted">No cards available.</p>
      )}
    </div>
  )
}

export const Input = ({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  error,
}: {
  label: string
  type?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  error?: string | null
}) => (
  <label className="field">
    <span className="field__label">{label}</span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
    {error ? <span className="field__error">{error}</span> : null}
  </label>
)

export const ActionRow = ({
  label,
  action,
  children,
}: {
  label: string
  action: ReactNode
  children: ReactNode
}) => (
  <div className="action-row">
    <div>
      <p className="eyebrow">{label}</p>
      {children}
    </div>
    <div className="action-row__cta">{action}</div>
  </div>
)


