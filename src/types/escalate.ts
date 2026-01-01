export type Card =
  | 'ACE'
  | 'TWO'
  | 'THREE'
  | 'FOUR'
  | 'FIVE'
  | 'SIX'
  | 'SEVEN'
  | 'EIGHT'
  | 'NINE'
  | 'TEN'
  | 'JACK'
  | 'QUEEN'
  | 'KING'
  | 'JOKER'

export interface User {
  user_id: string
  bio: string
  balance: number
  cards: Card[]
}

export interface Stake {
  user_id: string
  cards: Card[]
}

export interface Hand {
  hand_id: string
  creator: string
  claimed_card: Card
  is_resolved: boolean
  stakes: Stake[]
}

export interface Offer {
  creator_id: string
  cards: Card[]
  initial_price: number
  current_bid?: number | null
  current_bidder_id?: string | null
  is_resolved: boolean
}

export interface EscalateApi {
  registerUser: (bio: string) => Promise<User>
  getUsers: () => Promise<User[]>
  getUser: (id: string) => Promise<User | null>
  getMyCards: () => Promise<Card[]>
  startHand: (claim: Card, cards: Card[]) => Promise<Hand>
  getHands: () => Promise<Hand[]>
  getHand: (id: string) => Promise<Hand | null>
  buyCards: (amount: number) => Promise<Card[]>
  stake: (handId: string, cards: Card[]) => Promise<Hand>
  checkHand: (handId: string) => Promise<boolean>
  offer: (cards: Card[], amount: number) => Promise<Offer>
  getOffers: () => Promise<Offer[]>
  bid: (offerId: string, bidAmount: number) => Promise<void>
  resolve: (offerId: string) => Promise<void>
  withdrawBid: (offerId: string) => Promise<void>
  deposit: (amount: number) => Promise<void>
}

export const CARD_OPTIONS: Card[] = [
  'ACE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'JACK',
  'QUEEN',
  'KING',
  'JOKER',
]

