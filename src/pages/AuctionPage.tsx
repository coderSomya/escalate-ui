import { useState } from 'react'
import { ActionRow, CardPills, Input, SectionCard } from '../components/ui'
import { CardBadge } from '../components/CardIcon'
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
  userAddress: string | null
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
  bidOfferId: _bidOfferId,
  bidAmount: _bidAmount,
  bidError: _bidError,
  resolveOfferId: _resolveOfferId,
  withdrawOfferId: _withdrawOfferId,
  myCards,
  offers,
  userAddress,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [biddingOnOffer, setBiddingOnOffer] = useState<string | null>(null)
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({})

  const filteredOffers = Array.isArray(offers) 
    ? offers.filter(offer => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          offer.creator_id.toLowerCase().includes(query) ||
          (offer.current_bidder_id?.toLowerCase().includes(query)) ||
          offer.cards.some(card => card.toLowerCase().includes(query))
        )
      })
    : []

  const handleBidClick = (offerId: string, creatorId: string) => {
    // Check if this is the user's own offer
    if (userAddress && creatorId.toLowerCase() === userAddress.toLowerCase()) {
      // Set for resolving
      onChangeResolveOfferId(offerId)
      onResolve()
    } else {
      setBiddingOnOffer(offerId)
    }
  }

  const handleSubmitBid = (offerId: string) => {
    const amount = bidAmounts[offerId]
    if (!amount) return
    
    onChangeBidOfferId(offerId)
    onChangeBidAmount(amount)
    onBid()
    setBiddingOnOffer(null)
    setBidAmounts(prev => ({ ...prev, [offerId]: '' }))
  }

  const handleWithdrawClick = (offerId: string) => {
    onChangeWithdrawOfferId(offerId)
    onWithdraw()
  }

  return (
    <section className="grid" id="auction">
      <SectionCard title="Auction">
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

        <div className="list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="eyebrow">Live offers</p>
            <Input
              label=""
              value={searchQuery}
              placeholder="Search by creator, bidder, or card..."
              onChange={setSearchQuery}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer, index) => {
                const isMyOffer = userAddress && offer.creator_id.toLowerCase() === userAddress.toLowerCase()
                const isMyBid = userAddress && offer.current_bidder_id?.toLowerCase() === userAddress.toLowerCase()
                const isBiddingOn = biddingOnOffer === `${offer.creator_id}-${index}`
                
                return (
                  <div 
                    key={`${offer.creator_id}-${index}`} 
                    style={{ 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <p className="headline">From {shorten(offer.creator_id)}</p>
                    <p className="helper">Start: {offer.initial_price ?? 0}</p>
                    <p className="helper">
                      Current: {offer.current_bid ?? '—'}{' '}
                      {offer.current_bidder_id ? `by ${shorten(offer.current_bidder_id)}` : ''}
                    </p>
                    <p className={`status status--${offer.is_resolved ? 'good' : 'warn'}`}>
                      {offer.is_resolved ? 'Resolved' : 'Open'}
                    </p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {Array.isArray(offer.cards) && offer.cards.map((card, idx) => (
                        <CardBadge key={`${card}-${idx}`} card={card} />
                      ))}
                    </div>
                    
                    {/* Bid/Resolve/Withdraw actions */}
                    {!offer.is_resolved && (
                      <div style={{ marginTop: '12px' }}>
                        {isBiddingOn ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Input
                              label="Bid Amount"
                              type="number"
                              value={bidAmounts[`${offer.creator_id}-${index}`] || ''}
                              placeholder={`More than ${offer.current_bid ?? offer.initial_price}`}
                              onChange={(value) => setBidAmounts(prev => ({ ...prev, [`${offer.creator_id}-${index}`]: value }))}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="primary-btn"
                                style={{ flex: 1 }}
                                disabled={status.bid === 'loading'}
                                onClick={() => handleSubmitBid(`${offer.creator_id}-${index}`)}
                              >
                                {status.bid === 'loading' ? 'Bidding...' : 'Submit Bid'}
                              </button>
                              <button
                                className="ghost-btn"
                                style={{ flex: 1 }}
                                onClick={() => setBiddingOnOffer(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {isMyOffer ? (
                              <button
                                className="primary-btn"
                                style={{ flex: 1 }}
                                disabled={status.resolve === 'loading'}
                                onClick={() => {
                                  onChangeResolveOfferId(`${offer.creator_id}-${index}`)
                                  onResolve()
                                }}
                              >
                                {status.resolve === 'loading' ? 'Resolving...' : 'Resolve'}
                              </button>
                            ) : (
                              <button
                                className="ghost-btn"
                                style={{ flex: 1 }}
                                disabled={status.bid === 'loading'}
                                onClick={() => handleBidClick(`${offer.creator_id}-${index}`, offer.creator_id)}
                              >
                                Place Bid
                              </button>
                            )}
                            {isMyBid && (
                              <button
                                className="ghost-btn"
                                style={{ flex: 1 }}
                                disabled={status.withdraw === 'loading'}
                                onClick={() => handleWithdrawClick(`${offer.creator_id}-${index}`)}
                              >
                                {status.withdraw === 'loading' ? 'Withdrawing...' : 'Withdraw'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="muted">{searchQuery ? 'No offers match your search.' : 'No offers yet.'}</p>
            )}
          </div>
        </div>
      </SectionCard>
    </section>
  )
}


