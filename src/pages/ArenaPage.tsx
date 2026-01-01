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
            <button className="primary-btn" disabled={status.stake === 'loading'} onClick={onStake}>
              {status.stake === 'loading' ? 'Staking...' : 'Stake'}
            </button>
          }
        >
          <Input
            label="Hand id"
            value={stakeHandId}
            placeholder="hand-123"
            onChange={(value) => {
              onChangeStakeHandId(value)
              onStakeHandError(value && stakeCards.length ? null : 'Hand id and cards required')
            }}
            error={stakeError}
          />
          <CardPills selected={stakeCards} available={myCards} onToggle={onToggleStakeCard} />
        </ActionRow>

        <ActionRow
          label="Check hand"
          action={
            <button className="primary-btn" disabled={status.check === 'loading'} onClick={onCheck}>
              {status.check === 'loading' ? 'Checking...' : 'Check'}
            </button>
          }
        >
          <Input
            label="Hand id"
            value={checkHandId}
            placeholder="hand-123"
            onChange={onChangeCheckHandId}
            error={checkError}
          />
        </ActionRow>

        <div className="list">
          <p className="eyebrow">Active hands</p>
          <div className="list__grid">
            {hands.map((hand) => (
              <div key={hand.hand_id} className="list__item">
                <p className="headline">{hand.hand_id}</p>
                <p className="muted">Creator: {shorten(hand.creator)}</p>
                <p className="helper">Claimed: {hand.claimed_card}</p>
                <p className={`status status--${hand.is_resolved ? 'good' : 'warn'}`}>
                  {hand.is_resolved ? 'Resolved' : 'Open'}
                </p>
                <div className="badge-row">
                  {hand.stakes.map((stake) => (
                    <span key={stake.user_id} className="badge">
                      {shorten(stake.user_id)} — {stake.cards.length} cards
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!hands.length ? <p className="muted">No hands yet.</p> : null}
          </div>
        </div>
      </SectionCard>
    </section>
  )
}


