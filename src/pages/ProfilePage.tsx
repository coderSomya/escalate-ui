import { ActionRow, Input, SectionCard } from '../components/ui'
import type { Card, User } from '../types/escalate'

type Status = 'idle' | 'loading' | 'done'

type ProfilePageProps = {
  bio: string
  bioError: string | null
  depositAmount: string
  depositError: string | null
  buyAmount: string
  buyError: string | null
  myProfile: User | null
  myCards: Card[]
  users: User[]
  onBioChange: (value: string) => void
  onDepositChange: (value: string) => void
  onBuyChange: (value: string) => void
  onRegister: () => void
  onDeposit: () => void
  onBuy: () => void
  status: {
    register: Status
    deposit: Status
    buy: Status
  }
  shorten: (value: unknown) => string
}

export function ProfilePage({
  bio,
  bioError,
  depositAmount,
  depositError,
  buyAmount,
  buyError,
  myProfile,
  myCards,
  users,
  onBioChange,
  onDepositChange,
  onBuyChange,
  onRegister,
  onDeposit,
  onBuy,
  status,
  shorten,
}: ProfilePageProps) {
  return (
    <section className="grid" id="profile">
      <SectionCard title="Profile" subtitle="Register, fund, and view your cards">
        <ActionRow
          label="Register"
          action={
            <button className="primary-btn" disabled={status.register === 'loading'} onClick={onRegister}>
              {status.register === 'loading' ? 'Registering...' : 'Register'}
            </button>
          }
        >
          <Input
            label="Bio"
            value={bio}
            placeholder="Tell players who you are"
            onChange={onBioChange}
            error={bioError}
          />
        </ActionRow>

        <ActionRow
          label="Deposit"
          action={
            <button className="primary-btn" disabled={status.deposit === 'loading'} onClick={onDeposit}>
              {status.deposit === 'loading' ? 'Depositing...' : 'Deposit'}
            </button>
          }
        >
          <Input
            label="Amount"
            type="number"
            value={depositAmount}
            placeholder="10.5"
            onChange={onDepositChange}
            error={depositError}
          />
        </ActionRow>

        <ActionRow
          label="Buy cards"
          action={
            <button className="primary-btn" disabled={status.buy === 'loading'} onClick={onBuy}>
              {status.buy === 'loading' ? 'Buying...' : 'Buy cards'}
            </button>
          }
        >
          <Input
            label="Amount"
            type="number"
            value={buyAmount}
            placeholder="3"
            onChange={onBuyChange}
            error={buyError}
          />
        </ActionRow>

        <div className="info-row">
          <div>
            <p className="eyebrow">My profile</p>
            <p className="headline">{myProfile?.user_id ?? 'No profile yet'}</p>
            <p className="muted">{myProfile?.bio ?? 'Register to get started'}</p>
          </div>
          <div className="stat">
            <p className="stat__label">Balance</p>
            <p className="stat__value">{myProfile ? myProfile.balance.toFixed(2) : '0.00'}</p>
          </div>
          <div className="stat">
            <p className="stat__label">Cards</p>
            <p className="stat__value">{myCards.length}</p>
          </div>
        </div>

        <div className="card-collection">
          {myCards.length ? (
            myCards.map((card) => (
              <span key={card} className="badge badge--solid">
                {card}
              </span>
            ))
          ) : (
            <p className="muted">No cards yet. Buy to get random cards.</p>
          )}
        </div>

        <div className="list">
          <p className="eyebrow">All players</p>
          <div className="list__grid">
            {users.map((user) => (
              <div key={user.user_id} className="list__item">
                <p className="headline">{shorten(user.user_id)}</p>
                <p className="muted">{user.bio}</p>
                <p className="helper">Balance: {user.balance.toFixed(2)}</p>
                <p className="helper">Cards: {user.cards.length}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </section>
  )
}


