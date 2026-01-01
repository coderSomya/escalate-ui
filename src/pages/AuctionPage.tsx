import { ActionRow, CardPills, Input, SectionCard } from '../components/ui'
import type { Card, Offer } from '../types/escalate'

type Status = 'idle' | 'loading' | 'done'

type AuctionPageProps = {
  offerCards: Card[]
  offerAmount: string
  offerError: string | null
  bidOfferId: string
  bidAmount: string
  bidError: string | null
  resolveOfferId: string
  withdrawOfferId: string
  myCards: Card[]
  offers: Offer[]
  status: {
    offer: Status
    bid: Status
    resolve: Status
    withdraw: Status
  }
  onToggleOfferCard: (card: Card) => void
  onChangeOfferAmount: (value: string) => void
  onCreateOffer: () => void
  onChangeBidOfferId: (value: string) => void
  onChangeBidAmount: (value: string) => void
  onBid: () => void
  onChangeResolveOfferId: (value: string) => void
  onChangeWithdrawOfferId: (value: string) => void
  onResolve: () => void
  onWithdraw: () => void
  shorten: (value: unknown) => string
}

export function AuctionPage({
  offerCards,
  offerAmount,
  offerError,
  bidOfferId,
  bidAmount,
  bidError,
  resolveOfferId,
  withdrawOfferId,
  myCards,
  offers,
  status,
  onToggleOfferCard,
  onChangeOfferAmount,
  onCreateOffer,
  onChangeBidOfferId,
  onChangeBidAmount,
  onBid,
  onChangeResolveOfferId,
  onChangeWithdrawOfferId,
  onResolve,
  onWithdraw,
  shorten,
}: AuctionPageProps) {
  return (
    <section className="grid" id="auction">
      <SectionCard title="Auction" subtitle="Offer, bid, resolve, and withdraw">
        <ActionRow
          label="Create offer"
          action={
            <button className="primary-btn" disabled={status.offer === 'loading'} onClick={onCreateOffer}>
              {status.offer === 'loading' ? 'Creating...' : 'Offer cards'}
            </button>
          }
        >
          <Input
            label="Starting price"
            type="number"
            value={offerAmount}
            placeholder="25"
            onChange={onChangeOfferAmount}
            error={offerError}
          />
          <CardPills selected={offerCards} available={myCards} onToggle={onToggleOfferCard} />
        </ActionRow>

        <ActionRow
          label="Bid"
          action={
            <button className="primary-btn" disabled={status.bid === 'loading'} onClick={onBid}>
              {status.bid === 'loading' ? 'Bidding...' : 'Place bid'}
            </button>
          }
        >
          <Input
            label="Offer id"
            value={bidOfferId}
            placeholder="offer-1"
            onChange={onChangeBidOfferId}
            error={bidError}
          />
          <Input
            label="Bid amount"
            type="number"
            value={bidAmount}
            placeholder="30"
            onChange={onChangeBidAmount}
            error={bidError}
          />
        </ActionRow>

        <ActionRow
          label="Resolve / Withdraw"
          action={
            <div className="action-row__stack">
              <button className="ghost-btn" disabled={status.resolve === 'loading'} onClick={onResolve}>
                {status.resolve === 'loading' ? 'Resolving...' : 'Resolve'}
              </button>
              <button className="ghost-btn" disabled={status.withdraw === 'loading'} onClick={onWithdraw}>
                {status.withdraw === 'loading' ? 'Withdrawing...' : 'Withdraw bid'}
              </button>
            </div>
          }
        >
          <div className="field-group">
            <Input
              label="Resolve offer id"
              value={resolveOfferId}
              placeholder="offer-1"
              onChange={onChangeResolveOfferId}
            />
            <Input
              label="Withdraw offer id"
              value={withdrawOfferId}
              placeholder="offer-1"
              onChange={onChangeWithdrawOfferId}
            />
          </div>
        </ActionRow>

        <div className="list">
          <p className="eyebrow">Live offers</p>
          <div className="list__grid">
            {offers.map((offer, index) => (
              <div key={`${offer.creator_id}-${index}`} className="list__item">
                <p className="headline">From {shorten(offer.creator_id)}</p>
                <p className="helper">Start: {offer.initial_price}</p>
                <p className="helper">
                  Current: {offer.current_bid ?? '—'}{' '}
                  {offer.current_bidder_id ? `by ${shorten(offer.current_bidder_id)}` : ''}
                </p>
                <p className={`status status--${offer.is_resolved ? 'good' : 'warn'}`}>
                  {offer.is_resolved ? 'Resolved' : 'Open'}
                </p>
                <div className="badge-row">
                  {offer.cards.map((card) => (
                    <span key={card} className="badge badge--solid">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!offers.length ? <p className="muted">No offers yet.</p> : null}
          </div>
        </div>
      </SectionCard>
    </section>
  )
}


