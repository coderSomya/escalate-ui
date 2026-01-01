import { useState } from 'react'
import { ActionRow, Input, SectionCard } from '../components/ui'
import { CardBadge } from '../components/CardIcon'
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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = Array.isArray(users)
    ? users.filter(user => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          user.user_id.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query)
        )
      })
    : []

  return (
    <section className="grid" id="profile">
      <SectionCard title="Profile">
        {/* My Profile Section - Now at the top */}
        <div className="info-row">
          <div>
            <p className="eyebrow">My profile</p>
            <p className="headline">{myProfile?.user_id ?? 'No profile yet'}</p>
            <p className="muted">{myProfile?.bio ?? 'Register to get started'}</p>
          </div>
          <div className="stat">
            <p className="stat__label">Balance</p>
            <p className="stat__value">{myProfile?.balance != null ? myProfile.balance.toFixed(2) : '0.00'}</p>
          </div>
          <div className="stat">
            <p className="stat__label">Cards</p>
            <p className="stat__value">{myCards.length}</p>
          </div>
        </div>

        <div className="card-collection">
          {myCards.length ? (
            myCards.map((card, idx) => (
              <CardBadge key={`${card}-${idx}`} card={card} />
            ))
          ) : (
            <p className="muted">No cards yet. Buy to get random cards.</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />

        {/* Action Sections - Now below profile */}
        {!myProfile && (
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
        )}

        {/* Deposit and Buy Cards side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Deposit Card */}
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>💰 Deposit</p>
            <Input
              label="Amount"
              type="number"
              value={depositAmount}
              placeholder="10.5"
              onChange={onDepositChange}
              error={depositError}
            />
            <button 
              className="primary-btn" 
              disabled={status.deposit === 'loading'} 
              onClick={onDeposit}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {status.deposit === 'loading' ? 'Depositing...' : 'Deposit'}
            </button>
          </div>

          {/* Buy Cards Card */}
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>💳 Buy Cards</p>
            <Input
              label="Amount"
              type="number"
              value={buyAmount}
              placeholder="3"
              onChange={onBuyChange}
              error={buyError}
            />
            <button 
              className="primary-btn" 
              disabled={status.buy === 'loading'} 
              onClick={onBuy}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {status.buy === 'loading' ? 'Buying...' : 'Buy cards'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />

        <div className="list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="eyebrow">All players</p>
            <Input
              label=""
              value={searchQuery}
              placeholder="Search by player ID or bio..."
              onChange={setSearchQuery}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div 
                  key={user.user_id} 
                  style={{ 
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <p className="headline" style={{ fontSize: '14px', marginBottom: '4px' }}>{shorten(user.user_id)}</p>
                  <p className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>{user.bio}</p>
                  <p className="helper" style={{ fontSize: '11px' }}>💰 {user.balance != null ? user.balance.toFixed(2) : '0.00'}</p>
                  <p className="helper" style={{ fontSize: '11px' }}>🎴 {user.cards?.length ?? 0} cards</p>
                </div>
              ))
            ) : (
              <p className="muted">{searchQuery ? 'No players match your search.' : 'No players yet.'}</p>
            )}
          </div>
        </div>
      </SectionCard>
    </section>
  )
}


