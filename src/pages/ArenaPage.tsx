import { useState } from 'react'
import { ActionRow, CardPills, Input, SectionCard } from '../components/ui'
import { CardBadge } from '../components/CardIcon'
import { CARD_OPTIONS, type Card, type Hand } from '../types/escalate'

type Status = 'idle' | 'loading' | 'done'

type ArenaPageProps = {
  claimCard: Card
  handCards: Card[]
  handError: string | null
  stakeHandId: string
  stakeCards: Card[]
  stakeError: string | null
  checkHandId: string
  checkError: string | null
  myCards: Card[]
  hands: Hand[]
  status: {
    start_hand: Status
    stake: Status
    check: Status
  }
  onChangeClaimCard: (value: Card) => void
  onToggleHandCard: (card: Card) => void
  onToggleStakeCard: (card: Card) => void
  onChangeStakeHandId: (value: string) => void
  onChangeCheckHandId: (value: string) => void
  onStartHand: () => void
  onStake: () => void
  onCheck: () => void
  onStakeHandError: (value: string | null) => void
  shorten: (value: unknown) => string
}

export function ArenaPage({
  claimCard,
  handCards,
  handError,
  stakeHandId,
  stakeCards,
  stakeError,
  checkHandId,
  checkError: _checkError,
  myCards,
  hands,
  status,
  onChangeClaimCard,
  onToggleHandCard,
  onToggleStakeCard,
  onChangeStakeHandId,
  onChangeCheckHandId,
  onStartHand,
  onStake,
  onCheck,
  onStakeHandError,
  shorten,
}: ArenaPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [modalHand, setModalHand] = useState<Hand | null>(null)

  const filteredHands = Array.isArray(hands)
    ? hands.filter(hand => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          hand.hand_id.toLowerCase().includes(query) ||
          hand.creator.toLowerCase().includes(query) ||
          hand.claimed_card.toLowerCase().includes(query) ||
          hand.stakes.some(stake => stake.user_id.toLowerCase().includes(query))
        )
      })
    : []

  const handleStakeClick = (handId: string) => {
    onChangeStakeHandId(handId)
    // Scroll to stake section or expand it
    const stakeSection = document.getElementById('stake-section')
    stakeSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const handleCheckClick = (handId: string) => {
    onChangeCheckHandId(handId)
    onCheck()
  }

  return (
    <section className="grid" id="arena">
      <SectionCard title="Arena">
        <ActionRow
          label="Start hand"
          action={
            <button className="primary-btn" disabled={status.start_hand === 'loading'} onClick={onStartHand}>
              {status.start_hand === 'loading' ? 'Starting...' : 'Start hand'}
            </button>
          }
        >
          <div className="field-group">
            <label className="field">
              <span className="field__label">Claimed card</span>
              <div className="select-row">
                <select value={claimCard} onChange={(e) => onChangeClaimCard(e.target.value as Card)}>
                  {CARD_OPTIONS.map((card) => (
                    <option key={card} value={card}>
                      {card}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="field">
              <span className="field__label">Cards to stake in the hand</span>
              <CardPills selected={handCards} available={myCards} onToggle={onToggleHandCard} />
              {handError ? <span className="field__error">{handError}</span> : null}
            </label>
          </div>
        </ActionRow>

        <ActionRow
          label="Stake cards"
          action={
            <button 
              className="primary-btn" 
              disabled={status.stake === 'loading' || !stakeHandId || stakeCards.length === 0} 
              onClick={onStake}
            >
              {status.stake === 'loading' ? 'Staking...' : 'Stake'}
            </button>
          }
        >
          <div id="stake-section">
            {stakeHandId ? (
              <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <p className="helper" style={{ marginBottom: '8px' }}>
                  <strong>Staking on Hand: {stakeHandId}</strong>
                </p>
                {Array.isArray(hands) && hands.find(h => h.hand_id === stakeHandId) && (() => {
                  const hand = hands.find(h => h.hand_id === stakeHandId)!
                  return (
                    <>
                      <p className="helper">Creator: {shorten(hand.creator)}</p>
                      <p className="helper">Claimed Card: {hand.claimed_card}</p>
                      <p className="helper">Status: {hand.is_resolved ? 'Resolved' : 'Open'}</p>
                    </>
                  )
                })()}
                <button 
                  className="ghost-btn" 
                  style={{ marginTop: '8px' }}
                  onClick={() => {
                    onChangeStakeHandId('')
                    onStakeHandError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="helper" style={{ marginBottom: '12px' }}>
                Click "Stake" on any hand below to select cards and stake
              </p>
            )}
            <CardPills selected={stakeCards} available={myCards} onToggle={onToggleStakeCard} />
            {stakeError ? <span className="field__error">{stakeError}</span> : null}
          </div>
        </ActionRow>

        <div className="list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="eyebrow">Active hands</p>
            <Input
              label=""
              value={searchQuery}
              placeholder="Search by hand ID, creator, or card..."
              onChange={setSearchQuery}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {filteredHands.length > 0 ? (
              filteredHands.map((hand) => (
                <div 
                  key={hand.hand_id} 
                  style={{ 
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <p className="headline" style={{ fontSize: '14px', marginBottom: '0' }}>{hand.hand_id}</p>
                  <p className="muted" style={{ fontSize: '11px', marginBottom: '0' }}>Creator: {shorten(hand.creator)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <p className="helper" style={{ fontSize: '11px', margin: 0 }}>Claimed:</p>
                    <CardBadge card={hand.claimed_card} />
                  </div>
                  <p className={`status status--${hand.is_resolved ? 'good' : 'warn'}`} style={{ fontSize: '11px' }}>
                    {hand.is_resolved ? 'Resolved' : 'Open'}
                  </p>
                  
                  {/* Stakes summary button */}
                  {Array.isArray(hand.stakes) && hand.stakes.length > 0 && (
                    <button
                      className="ghost-btn"
                      style={{ fontSize: '11px', padding: '6px 8px' }}
                      onClick={() => setModalHand(hand)}
                    >
                      👥 {hand.stakes.length} staker{hand.stakes.length !== 1 ? 's' : ''}
                    </button>
                  )}
                  
                  {/* Action buttons */}
                  {!hand.is_resolved && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button 
                        className="ghost-btn" 
                        style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                        disabled={status.stake === 'loading'}
                        onClick={() => handleStakeClick(hand.hand_id)}
                      >
                        Stake
                      </button>
                      <button 
                        className="ghost-btn" 
                        style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                        disabled={status.check === 'loading'}
                        onClick={() => handleCheckClick(hand.hand_id)}
                      >
                        {status.check === 'loading' && checkHandId === hand.hand_id ? '...' : 'Check'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">{searchQuery ? 'No hands match your search.' : 'No hands yet.'}</p>
            )}
          </div>
        </div>

        {/* Stakes Modal */}
        {modalHand && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setModalHand(null)}
          >
            <div 
              style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Stakes for {modalHand.hand_id}</h3>
                <button 
                  onClick={() => setModalHand(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '30px',
                    height: '30px'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <p className="helper" style={{ marginBottom: '4px' }}>Creator: {shorten(modalHand.creator)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <p className="helper">Claimed Card:</p>
                  <CardBadge card={modalHand.claimed_card} />
                </div>
                <p className={`status status--${modalHand.is_resolved ? 'good' : 'warn'}`} style={{ marginTop: '8px' }}>
                  {modalHand.is_resolved ? 'Resolved' : 'Open'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modalHand.stakes.map((stake) => (
                  <div 
                    key={stake.user_id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <p className="headline" style={{ fontSize: '14px', marginBottom: '8px' }}>
                      {shorten(stake.user_id)}
                    </p>
                    <p className="helper" style={{ marginBottom: '8px' }}>
                      <strong>{stake.cards?.length ?? 0} card{stake.cards?.length !== 1 ? 's' : ''}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Array.isArray(stake.cards) && stake.cards.map((card, idx) => (
                        <CardBadge key={`${card}-${idx}`} card={card} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </section>
  )
}


