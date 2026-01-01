import { SectionCard } from '../components/ui'

export function HowToPage() {
  return (
    <section className="grid" id="howto">
      <SectionCard title="How to Play" subtitle="Escalate Bluff & Auction guide">
        <div className="rich-block">
          <h4>Overview</h4>
          <ul className="rich-list">
            <li>
              Escalate is a bluffing game: you quietly stake cards behind a claimed rank, other players
              either add more hidden stakes or challenge the claim, and everyone sees only counts—not card
              faces—until a challenge happens.
            </li>
            <li>
              Objective: grow your rewards by making honest claims, slipping in bluffs that survive, or
              catching opponents when they bluff.
            </li>
            <li>
              Cards & currency: you spend balance to buy random cards; staked cards leave your inventory; JOKER
              counts as any rank when checking a claim.
            </li>
          </ul>

          <h4>Setup</h4>
          <ol className="rich-list">
            <li>Connect your wallet and create your profile.</li>
            <li>Add funds to your balance.</li>
            <li>Buy cards: each whole unit of balance gives one random card.</li>
          </ol>

          <h4>Starting a hand</h4>
          <ol className="rich-list">
            <li>
              Choose a rank to claim (e.g., QUEEN) and stake one or more cards from your inventory. Staked
              cards are removed immediately.
            </li>
            <li>The claim and stake count are posted; card identities stay hidden.</li>
          </ol>

          <h4>On your turn</h4>
          <ol className="rich-list">
            <li>Stake: add hidden cards to the same claim to raise the total (your cards leave inventory).</li>
            <li>Challenge (“check”): stop further staking and force a reveal of the latest stake.</li>
          </ol>

          <h4>When a challenge happens</h4>
          <ul className="rich-list">
            <li>
              Reveal the last stake only. A bluff exists if any revealed card does not match the claimed rank
              (JOKER always matches).
            </li>
            <li>
              Outcomes:
              <ul className="rich-sublist">
                <li>
                  Bluff found: the challenger gains points equal to the size of the revealed stake; all earlier
                  stakers gain per-card rewards.
                </li>
                <li>
                  No bluff: the challenger loses points equal to the revealed stake; all stakers gain per-card
                  rewards.
                </li>
              </ul>
            </li>
            <li>The hand resolves immediately after a challenge—no more stakes on it.</li>
            <li>
              Per-card rewards: +1.0 for a card that truly matches the claim; +1.2 for a bluff card that was
              never caught before resolution.
            </li>
          </ul>

          <h4>Auctions</h4>
          <ul className="rich-list">
            <li>Create an offer by selecting cards to sell; they leave your inventory while listed.</li>
            <li>
              Other players place higher bids using their balance. If outbid, their locked funds are released.
            </li>
            <li>
              When the seller resolves: with a current bid, highest bidder gets the cards and seller receives
              the bid; with no bids, cards return to the seller.
            </li>
          </ul>

          <h4>Economy & inventory</h4>
          <ul className="rich-list">
            <li>Deposits must be positive; card purchases round down to whole units of balance.</li>
            <li>
              Staked or auctioned cards leave inventory immediately; only unsold offers return when resolved
              without bids.
            </li>
          </ul>

          <h4>Quick tips</h4>
          <ul className="rich-list">
            <li>Track your balance before staking or bidding.</li>
            <li>Small stakes invite challenges; big stakes can push others to fold or check.</li>
            <li>Use masked hand views (counts and order) to read risk without exposing cards.</li>
          </ul>
        </div>
      </SectionCard>
    </section>
  )
}


