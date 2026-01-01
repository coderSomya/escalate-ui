import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { useWeilWallet } from './hooks/useWeilWallet'
import { buildEscalateApi } from './services/escalate'
import type { Card, Hand, Offer, User } from './types/escalate'
import { Input, SectionCard } from './components/ui'
import { ProfilePage } from './pages/ProfilePage'
import { ArenaPage } from './pages/ArenaPage'
import { AuctionPage } from './pages/AuctionPage'
import { HowToPage } from './pages/HowToPage'

type ActionKey =
  | 'register'
  | 'deposit'
  | 'buy'
  | 'start_hand'
  | 'stake'
  | 'check'
  | 'offer'
  | 'bid'
  | 'resolve'
  | 'withdraw'

type Page = 'home' | 'profile' | 'arena' | 'auction' | 'howto'

const shorten = (value: unknown) => {
  if (typeof value === 'string' && value.length >= 10) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`
  }
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    const maybe =
      (value as Record<string, unknown>).address ??
      (value as Record<string, unknown>).addr ??
      (value as Record<string, unknown>).id
    if (typeof maybe === 'string') return shorten(maybe)
  }
  return 'Not connected'
}

function App() {
  const { providerAvailable, wallet, status, account, error: walletError, connect, disconnect } =
    useWeilWallet()

  const [activePage, setActivePage] = useState<Page>('home')

  const [contractAddress, setContractAddress] = useState(
    import.meta.env.VITE_ESCALATE_CONTRACT ?? '',
  )

  const [bio, setBio] = useState('')
  const [bioError, setBioError] = useState<string | null>(null)

  const [depositAmount, setDepositAmount] = useState('')
  const [depositError, setDepositError] = useState<string | null>(null)

  const [buyAmount, setBuyAmount] = useState('')
  const [buyError, setBuyError] = useState<string | null>(null)

  const [claimCard, setClaimCard] = useState<Card>('ACE')
  const [handCards, setHandCards] = useState<Card[]>([])
  const [handError, setHandError] = useState<string | null>(null)

  const [stakeHandId, setStakeHandId] = useState('')
  const [stakeCards, setStakeCards] = useState<Card[]>([])
  const [stakeError, setStakeError] = useState<string | null>(null)

  const [checkHandId, setCheckHandId] = useState('')
  const [checkError, setCheckError] = useState<string | null>(null)

  const [offerCards, setOfferCards] = useState<Card[]>([])
  const [offerAmount, setOfferAmount] = useState('')
  const [offerError, setOfferError] = useState<string | null>(null)

  const [bidOfferId, setBidOfferId] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState<string | null>(null)

  const [resolveOfferId, setResolveOfferId] = useState('')
  const [withdrawOfferId, setWithdrawOfferId] = useState('')

  const [myProfile, setMyProfile] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [hands, setHands] = useState<Hand[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [myCards, setMyCards] = useState<Card[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const [actionState, setActionState] = useState<Record<ActionKey, 'idle' | 'loading' | 'done'>>({
    register: 'idle',
    deposit: 'idle',
    buy: 'idle',
    start_hand: 'idle',
    stake: 'idle',
    check: 'idle',
    offer: 'idle',
    bid: 'idle',
    resolve: 'idle',
    withdraw: 'idle',
  })

  const escalateApi = useMemo(
    () => (wallet && contractAddress ? buildEscalateApi(wallet, contractAddress) : null),
    [wallet, contractAddress],
  )

  const setAction = (key: ActionKey, value: 'idle' | 'loading' | 'done') =>
    setActionState((prev) => ({ ...prev, [key]: value }))

  const validatePositive = (value: string, label: string) => {
    if (!value) return `${label} is required`
    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed <= 0) return `${label} must be greater than 0`
    return null
  }

  const refreshData = useCallback(async () => {
    if (!escalateApi) return
    try {
      const [allUsers, allHands, allOffers, myCardsResult, myUser] = await Promise.all([
        escalateApi.getUsers(),
        escalateApi.getHands(),
        escalateApi.getOffers(),
        escalateApi.getMyCards(),
        account ? escalateApi.getUser(account) : Promise.resolve(null),
      ])
      setUsers(allUsers ?? [])
      setHands(allHands ?? [])
      setOffers(allOffers ?? [])
      setMyCards(myCardsResult ?? [])
      setMyProfile(myUser ?? null)
    } catch (err: any) {
      setNotice(err?.message ?? 'Unable to refresh data right now.')
    }
  }, [escalateApi, account])

  useEffect(() => {
    if (escalateApi) {
      refreshData()
    }
  }, [escalateApi, refreshData])

  const handleToggleCard = (
    card: Card,
    available: Card[],
    list: Card[],
    setter: (cards: Card[]) => void,
    setError?: (value: string | null) => void,
    emptyMessage = 'Select at least one card',
  ) => {
    const selectedCount = list.filter((c) => c === card).length
    const availableCount = available.filter((c) => c === card).length
    let next: Card[] = list
    if (selectedCount >= availableCount) {
      // reset selection for this card if already at max
      next = list.filter((c) => c !== card)
    } else {
      next = [...list, card]
    }
    setter(next)
    if (setError) {
      setError(next.length ? null : emptyMessage)
    }
  }

  const runAction = async (key: ActionKey, task: () => Promise<void>) => {
    if (!escalateApi) {
      setNotice('Connect your Weil Wallet and set the contract address first.')
      return
    }
    setAction(key, 'loading')
    setNotice(null)
    try {
      await task()
      setAction(key, 'done')
      await refreshData()
    } catch (err: any) {
      setAction(key, 'idle')
      setNotice(err?.message ?? 'Something went wrong.')
    }
  }

  const WAUTH_INSTALL_URL = 'https://chromewebstore.google.com/detail/wauth/nmdlcegenjnehamofkaaifhgjibdpdag'

  const connectLabel = () => {
    if (!providerAvailable) return 'Install Weil Wallet'
    if (status === 'connecting') return 'Connecting...'
    if (status === 'connected') return 'Connected'
    if (status === 'error') return 'Retry connection'
    return 'Connect Weil Wallet'
  }

  const handleConnectClick = () => {
    if (!providerAvailable) {
      window.open(WAUTH_INSTALL_URL, '_blank')
      return
    }
    if (status === 'connected') {
      disconnect()
    } else {
      connect()
    }
  }

  const handleBioChange = (value: string) => {
    setBio(value)
    setBioError(value.trim() ? null : 'Bio is required')
  }

  const handleRegister = () =>
    runAction('register', async () => {
      const nextError = bio.trim() ? null : 'Bio is required'
      setBioError(nextError)
      if (nextError) return
      await escalateApi!.registerUser(bio.trim())
      setBio('')
    })

  const handleDepositChange = (value: string) => {
    setDepositAmount(value)
    setDepositError(validatePositive(value, 'Deposit'))
  }

  const handleDeposit = () =>
    runAction('deposit', async () => {
      const validation = validatePositive(depositAmount, 'Deposit')
      setDepositError(validation)
      if (validation) return
      await escalateApi!.deposit(Number(depositAmount))
      setDepositAmount('')
    })

  const handleBuyChange = (value: string) => {
    setBuyAmount(value)
    setBuyError(validatePositive(value, 'Amount'))
  }

  const handleBuy = () =>
    runAction('buy', async () => {
      const validation = validatePositive(buyAmount, 'Amount')
      setBuyError(validation)
      if (validation) return
      await escalateApi!.buyCards(Number(buyAmount))
      setBuyAmount('')
    })

  const handleToggleHandCard = (card: Card) =>
    handleToggleCard(card, myCards, handCards, setHandCards, setHandError)

  const handleToggleStakeCard = (card: Card) =>
    handleToggleCard(card, myCards, stakeCards, setStakeCards, setStakeError, 'Pick cards')

  const handleToggleOfferCard = (card: Card) =>
    handleToggleCard(card, myCards, offerCards, setOfferCards, setOfferError, 'Pick cards')

  const handleStartHand = () =>
    runAction('start_hand', async () => {
      const validation = handCards.length ? null : 'Select at least one card'
      setHandError(validation)
      if (validation) return
      await escalateApi!.startHand(claimCard, handCards)
      setHandCards([])
    })

  const handleStake = () =>
    runAction('stake', async () => {
      const validation = stakeHandId && stakeCards.length ? null : 'Hand id and cards required'
      setStakeError(validation)
      if (validation) return
      await escalateApi!.stake(stakeHandId, stakeCards)
      setStakeCards([])
    })

  const handleCheck = () =>
    runAction('check', async () => {
      const validation = checkHandId ? null : 'Hand id is required'
      setCheckError(validation)
      if (validation) return
      await escalateApi!.checkHand(checkHandId)
      setCheckHandId('')
    })

  const handleOfferAmountChange = (value: string) => {
    setOfferAmount(value)
    setOfferError(offerCards.length ? validatePositive(value, 'Amount') : 'Pick cards and set price')
  }

  const handleCreateOffer = () =>
    runAction('offer', async () => {
      const validation =
        offerCards.length && !validatePositive(offerAmount, 'Amount') ? null : 'Pick cards and set price'
      setOfferError(validation)
      if (validation) return
      await escalateApi!.offer(offerCards, Number(offerAmount))
      setOfferCards([])
      setOfferAmount('')
    })

  const handleBidOfferIdChange = (value: string) => {
    setBidOfferId(value)
    setBidError(value ? validatePositive(bidAmount, 'Bid') : 'Offer id is required')
  }

  const handleBidAmountChange = (value: string) => {
    setBidAmount(value)
    setBidError(bidOfferId ? validatePositive(value, 'Bid') : 'Offer id is required')
  }

  const handleBid = () =>
    runAction('bid', async () => {
      const hasId = bidOfferId.trim().length > 0
      const validation = validatePositive(bidAmount, 'Bid')
      setBidError(!hasId ? 'Offer id is required' : validation)
      if (!hasId || validation) return
      await escalateApi!.bid(bidOfferId, Number(bidAmount))
      setBidOfferId('')
      setBidAmount('')
    })

  const handleResolve = () =>
    runAction('resolve', async () => {
      if (!resolveOfferId) {
        setNotice('Offer id is required to resolve.')
        return
      }
      await escalateApi!.resolve(resolveOfferId)
      setResolveOfferId('')
    })

  const handleWithdraw = () =>
    runAction('withdraw', async () => {
      if (!withdrawOfferId) {
        setNotice('Offer id is required to withdraw a bid.')
        return
      }
      await escalateApi!.withdrawBid(withdrawOfferId)
      setWithdrawOfferId('')
    })

  return (
    <div className="page">
      <div className="gradient gradient--one" />
      <div className="gradient gradient--two" />
      <header className="topbar">
        <div className="brand">
          <div className="brand__dot" />
          <div>
            <p className="brand__eyebrow">Bluff Arena</p>
            <p className="brand__title">Escalate DApp</p>
          </div>
        </div>
        <nav className="nav">
          <button
            className={`nav__link ${activePage === 'home' ? 'nav__link--active' : ''}`}
            onClick={() => setActivePage('home')}
            type="button"
          >
            Home
          </button>
          <button
            className={`nav__link ${activePage === 'profile' ? 'nav__link--active' : ''}`}
            onClick={() => setActivePage('profile')}
            type="button"
          >
            Profile
          </button>
          <button
            className={`nav__link ${activePage === 'arena' ? 'nav__link--active' : ''}`}
            onClick={() => setActivePage('arena')}
            type="button"
          >
            Arena
          </button>
          <button
            className={`nav__link ${activePage === 'auction' ? 'nav__link--active' : ''}`}
            onClick={() => setActivePage('auction')}
            type="button"
          >
            Auction
          </button>
          <button
            className={`nav__link ${activePage === 'howto' ? 'nav__link--active' : ''}`}
            onClick={() => setActivePage('howto')}
            type="button"
          >
            How to play
          </button>
        </nav>
        <div className="topbar__cta">
          <button
            className="ghost-btn"
            onClick={handleConnectClick}
          >
            {connectLabel()}
          </button>
        </div>
      </header>

      {notice ? <div className="notice">{notice}</div> : null}

      {activePage === 'home' && (
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Weil-authenticated bluffing</p>
            <h1>
              Fast actions for your <span className="highlight">Escalate</span> universe.
            </h1>
            <p className="lede">
              Connect Weil Wallet, register, fund, start hands, or run auctions—all in a streamlined,
              minimal black layout.
            </p>
            <div className="hero__badges">
              <span className="badge" onClick={() => setActivePage('profile')} style={{ cursor: 'pointer' }}>Profile</span>
              <span className="badge" onClick={() => setActivePage('arena')} style={{ cursor: 'pointer' }}>Arena</span>
              <span className="badge" onClick={() => setActivePage('auction')} style={{ cursor: 'pointer' }}>Auction</span>
              <span className="badge" onClick={() => setActivePage('howto')} style={{ cursor: 'pointer' }}>How to</span>
            </div>
          </div>
          <div className="hero__panel">
            <SectionCard title="Weil Wallet" subtitle="Authenticate to start playing">
              <div className="status-block">
                <p className="status-label">Status</p>
                <p className="status-value">
                  {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting' : 'Idle'}
                </p>
              </div>
              <div className="status-block">
                <p className="status-label">Address</p>
                <p className="status-value">{shorten(account)}</p>
              </div>
              <Input
                label="Contract address"
                value={contractAddress}
                placeholder="Add your Escalate contract address"
                onChange={setContractAddress}
                error={!contractAddress ? 'Required' : null}
              />
              <button
                className="primary-btn"
                onClick={handleConnectClick}
              >
                {connectLabel()}
              </button>
              {walletError ? <p className="helper helper--error">{walletError}</p> : null}
              {!providerAvailable && (
                <p className="helper" style={{ marginTop: '8px' }}>
                  WAuth extension not detected.{' '}
                  <a
                    href={WAUTH_INSTALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#fff', textDecoration: 'underline' }}
                  >
                    Install from Chrome Web Store
                  </a>
                </p>
              )}
            </SectionCard>
          </div>
        </section>
      )}

      {activePage === 'profile' && (
        <ProfilePage
          bio={bio}
          bioError={bioError}
          depositAmount={depositAmount}
          depositError={depositError}
          buyAmount={buyAmount}
          buyError={buyError}
          myProfile={myProfile}
          myCards={myCards}
          users={users}
          onBioChange={handleBioChange}
          onDepositChange={handleDepositChange}
          onBuyChange={handleBuyChange}
          onRegister={handleRegister}
          onDeposit={handleDeposit}
          onBuy={handleBuy}
          status={{
            register: actionState.register,
            deposit: actionState.deposit,
            buy: actionState.buy,
          }}
          shorten={shorten}
        />
      )}

      {activePage === 'arena' && (
        <ArenaPage
          claimCard={claimCard}
          handCards={handCards}
          handError={handError}
          stakeHandId={stakeHandId}
          stakeCards={stakeCards}
          stakeError={stakeError}
          checkHandId={checkHandId}
          checkError={checkError}
          myCards={myCards}
          hands={hands}
          status={{
            start_hand: actionState.start_hand,
            stake: actionState.stake,
            check: actionState.check,
          }}
          onChangeClaimCard={setClaimCard}
          onToggleHandCard={handleToggleHandCard}
          onToggleStakeCard={handleToggleStakeCard}
          onChangeStakeHandId={setStakeHandId}
          onChangeCheckHandId={(value) => {
                setCheckHandId(value)
                setCheckError(value ? null : 'Hand id is required')
              }}
          onStartHand={handleStartHand}
          onStake={handleStake}
          onCheck={handleCheck}
          onStakeHandError={setStakeError}
          shorten={shorten}
        />
      )}

      {activePage === 'auction' && (
        <AuctionPage
          offerCards={offerCards}
          offerAmount={offerAmount}
          offerError={offerError}
          bidOfferId={bidOfferId}
          bidAmount={bidAmount}
          bidError={bidError}
          resolveOfferId={resolveOfferId}
          withdrawOfferId={withdrawOfferId}
          myCards={myCards}
          offers={offers}
          status={{
            offer: actionState.offer,
            bid: actionState.bid,
            resolve: actionState.resolve,
            withdraw: actionState.withdraw,
          }}
          onToggleOfferCard={handleToggleOfferCard}
          onChangeOfferAmount={handleOfferAmountChange}
          onCreateOffer={handleCreateOffer}
          onChangeBidOfferId={handleBidOfferIdChange}
          onChangeBidAmount={handleBidAmountChange}
          onBid={handleBid}
          onChangeResolveOfferId={setResolveOfferId}
          onChangeWithdrawOfferId={setWithdrawOfferId}
          onResolve={handleResolve}
          onWithdraw={handleWithdraw}
          shorten={shorten}
        />
      )}

      {activePage === 'howto' && <HowToPage />}
    </div>
  )
}

export default App
