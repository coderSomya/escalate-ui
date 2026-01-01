import { WeilWalletConnection } from '@weilliptic/weil-sdk'
import type { Card, EscalateApi, Hand, Offer, User } from '../types/escalate'
import { CARD_OPTIONS } from '../types/escalate'

const assertAddress = (address: string) => {
  if (!address) {
    throw new Error('Add the contract address to continue.')
  }
}

const normalizeCards = (cards: Card[]) =>
  cards.map((card) => {
    if (!CARD_OPTIONS.includes(card)) {
      throw new Error(`Unsupported card value: ${card}`)
    }
    return card
  })

export const buildEscalateApi = (
  wallet: WeilWalletConnection,
  contractAddress: string,
): EscalateApi => {
  const exec = async <T>(method: string, params?: Record<string, unknown>): Promise<T> => {
    assertAddress(contractAddress)
    const result = await (wallet.contracts.execute as any)(contractAddress, method, params ?? {})
    
    console.log(`Contract call ${method}:`, result)
    
    // Handle Result<T, Error> response from contract (Weil Wallet response format)
    if (result && typeof result === 'object') {
      let resultData = result
      
      // Check if txn_result exists (Weil Wallet response format)
      if ('txn_result' in result && typeof result.txn_result === 'string') {
        try {
          resultData = JSON.parse(result.txn_result)
        } catch (e) {
          console.error('Failed to parse txn_result:', e)
          return result as T
        }
      }
      
      // Handle Ok/Err wrapper
      if ('Ok' in resultData) {
        // Parse the JSON string inside Ok if it's a string
        const okData = typeof resultData.Ok === 'string' 
          ? JSON.parse(resultData.Ok) 
          : resultData.Ok
        return okData as T
      }
      
      // Handle Err case
      if ('Err' in resultData) {
        throw new Error(typeof resultData.Err === 'string' ? resultData.Err : JSON.stringify(resultData.Err))
      }
      
      // Direct data (fallback)
      return resultData as T
    }
    
    return result as T
  }

  return {
    registerUser: (bio: string) => exec<User>('register_user', { bio }),
    getUsers: () => exec<User[]>('get_users'),
    getUser: (id: string) => exec<User | null>('get_user', { id }),
    getMyCards: () => exec<Card[]>('get_my_cards'),
    startHand: (claim: Card, cards: Card[]) =>
      exec<Hand>('start_hand', { claim, cards: normalizeCards(cards) }),
    getHands: () => exec<Hand[]>('get_hands'),
    getHand: (id: string) => exec<Hand | null>('get_hand', { id }),
    buyCards: (amount: number) => exec<Card[]>('buy_cards', { amount }),
    stake: (handId: string, cards: Card[]) =>
      exec<Hand>('stake', { hand_id: handId, cards: normalizeCards(cards) }),
    checkHand: (handId: string) => exec<boolean>('check', { hand_id: handId }),
    offer: (cards: Card[], amount: number) =>
      exec<Offer>('offer', { cards: normalizeCards(cards), amount }),
    getOffers: () => exec<Offer[]>('get_offers'),
    bid: (offerId: string, bidAmount: number) =>
      exec<void>('bid', { offer_id: offerId, bid_amout: bidAmount }),
    resolve: (offerId: string) => exec<void>('resolve', { offer_id: offerId }),
    withdrawBid: (offerId: string) => exec<void>('withdraw_bid', { offer_id: offerId }),
    deposit: (amount: number) => exec<void>('deposit', { amount }),
  }
}

