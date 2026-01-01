import { ActionRow, CardPills, Input, SectionCard } from '../components/ui'
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
  checkError,
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
      <SectionCard title="Arena" subtitle="Start hands, stake, and check outcomes">
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
          <p className="eyebrow">Active hands</p>
          <div className="list__grid">
            {Array.isArray(hands) && hands.length > 0 ? (
              hands.map((hand) => (
                <div key={hand.hand_id} className="list__item">
                  <p className="headline">{hand.hand_id}</p>
                  <p className="muted">Creator: {shorten(hand.creator)}</p>
                  <p className="helper">Claimed: {hand.claimed_card}</p>
                  <p className={`status status--${hand.is_resolved ? 'good' : 'warn'}`}>
                    {hand.is_resolved ? 'Resolved' : 'Open'}
                  </p>
                  
                  {/* Show all stakes with their cards */}
                  {Array.isArray(hand.stakes) && hand.stakes.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <p className="helper" style={{ marginBottom: '8px' }}><strong>Stakes:</strong></p>
                      {hand.stakes.map((stake) => (
                        <div key={stake.user_id} style={{ marginBottom: '8px' }}>
                          <p className="helper">{shorten(stake.user_id)}:</p>
                          <div className="badge-row" style={{ marginTop: '4px' }}>
                            {Array.isArray(stake.cards) && stake.cards.map((card, idx) => (
                              <span key={`${card}-${idx}`} className="badge badge--solid">
                                {card}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {!hand.is_resolved && (
                      <button 
                        className="ghost-btn" 
                        style={{ flex: 1 }}
                        disabled={status.stake === 'loading'}
                        onClick={() => handleStakeClick(hand.hand_id)}
                      >
                        Stake
                      </button>
                    )}
                    <button 
                      className="ghost-btn" 
                      style={{ flex: 1 }}
                      disabled={status.check === 'loading'}
                      onClick={() => handleCheckClick(hand.hand_id)}
                    >
                      {status.check === 'loading' && checkHandId === hand.hand_id ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">No hands yet.</p>
            )}
          </div>
        </div>
      </SectionCard>
    </section>
  )
}


