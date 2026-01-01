import { useCallback, useEffect, useMemo, useState } from 'react'
import { WeilWalletConnection } from '@weilliptic/weil-sdk'

type WeilWalletProvider = WeilWalletConnection['config']['walletProvider']

type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error'

const extractAccountId = (value: unknown) => {
  // Handle direct string
  if (typeof value === 'string' && value.length > 0) return value
  
  // Handle number
  if (typeof value === 'number') return String(value)
  
  // Handle object with various property names
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    
    // Check common property names
    const maybeAddress =
      obj.address ??
      obj.addr ??
      obj.id ??
      obj.account ??
      obj.accountId ??
      obj.wallet ??
      obj.walletAddress ??
      obj.publicKey
    
    if (typeof maybeAddress === 'string' && maybeAddress.length > 0) return maybeAddress
    
    // Handle nested account object (e.g., { account: { address: '...' } })
    if (typeof maybeAddress === 'object' && maybeAddress !== null) {
      return extractAccountId(maybeAddress)
    }
    
    // Try toString() as fallback
    if ('toString' in obj && typeof obj.toString === 'function') {
      const str = obj.toString()
      if (str && str !== '[object Object]' && str.length > 0) {
        return str
      }
    }
  }
  
  console.warn('Unable to extract account ID from:', value)
  return null
}

export const useWeilWallet = () => {
  const provider = useMemo<WeilWalletProvider | undefined>(
    () => (typeof window !== 'undefined' ? window.WeilWallet : undefined),
    [],
  )
  const [wallet, setWallet] = useState<WeilWalletConnection | null>(null)
  const [status, setStatus] = useState<WalletStatus>('idle')
  const [account, setAccount] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hydrateAccounts = useCallback(async () => {
    if (!provider) return null
    try {
      const accounts = await provider.request({ method: 'weil_accounts' })
      console.log('Weil Wallet accounts response:', accounts)
      
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        console.warn('No accounts found in wallet')
        setAccount(null)
        return null
      }
      
      const primaryRaw = accounts[0]
      console.log('First account (raw):', primaryRaw, 'Type:', typeof primaryRaw)
      const primary = extractAccountId(primaryRaw)
      console.log('Extracted account ID:', primary)
      setAccount(primary ?? null)
      return primary
    } catch (error) {
      console.error('Error fetching accounts:', error)
      return null
    }
  }, [provider])

  const connect = useCallback(async () => {
    if (!provider) {
      setError('Weil Wallet extension is not detected.')
      setStatus('error')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      // Check if wallet is set up
      if (typeof provider.isSetUp === 'function') {
        const isSetUp = await provider.isSetUp()
        console.log('Wallet isSetUp:', isSetUp)
        if (!isSetUp) {
          throw new Error('WAuth is not set up. Please set up your wallet first.')
        }
      }
      
      // Check if wallet is unlocked
      if (typeof provider.isUnlocked === 'function') {
        const isUnlocked = await provider.isUnlocked()
        console.log('Wallet isUnlocked:', isUnlocked)
        if (!isUnlocked) {
          throw new Error('WAuth is locked. Please unlock your wallet first.')
        }
      }
      
      // Request accounts - this should open the wallet for authorization
      console.log('Requesting accounts from WAuth...')
      const accounts = await provider.request({ method: 'weil_requestAccounts' })
      console.log('WAuth requestAccounts response:', accounts)
      
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in WAuth or approve the connection request.')
      }
      
      const primaryRaw = accounts[0]
      console.log('Primary account (raw):', primaryRaw, 'Type:', typeof primaryRaw)
      const primary = extractAccountId(primaryRaw)
      console.log('Extracted primary account:', primary)
      
      if (!primary || typeof primary !== 'string' || primary.length === 0) {
        console.error('Invalid account format:', primaryRaw)
        throw new Error('Invalid account address format. Unable to extract wallet address.')
      }
      
      setAccount(primary)
      setWallet(new WeilWalletConnection({ walletProvider: provider }))
      setStatus('connected')
      console.log('Successfully connected to WAuth with account:', primary)
    } catch (err: any) {
      console.error('Connection error:', err)
      setStatus('error')
      setError(err?.message ?? 'Unable to connect to WAuth. Please try again.')
    }
  }, [provider])

  const disconnect = useCallback(async () => {
    if (provider) {
      await provider.request({ method: 'wallet_disconnect' }).catch(() => undefined)
    }
    setWallet(null)
    setAccount(null)
    setStatus('idle')
  }, [provider])

  useEffect(() => {
    let mounted = true
    if (!provider) return
    
    const handleAccountsChanged = (accounts: unknown) => {
      if (!mounted) return
      console.log('Accounts changed event:', accounts)
      
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        console.warn('Accounts changed to empty')
        setAccount(null)
        setWallet(null)
        setStatus('idle')
        return
      }
      
      const primaryRaw = accounts[0]
      const primary = extractAccountId(primaryRaw)
      console.log('Updated account:', primary)
      setAccount(primary ?? null)
    }
    
    provider.on?.('accountsChanged', handleAccountsChanged)
    
    ;(async () => {
      if (provider?.isConnected?.()) {
        const accountId = await hydrateAccounts()
        if (accountId) {
          setWallet(new WeilWalletConnection({ walletProvider: provider }))
          setStatus('connected')
        }
      }
    })()
    
    return () => {
      mounted = false
      provider.off?.('accountsChanged', handleAccountsChanged)
    }
  }, [provider, hydrateAccounts])

  return {
    providerAvailable: Boolean(provider),
    wallet,
    status,
    account,
    error,
    connect,
    disconnect,
  }
}

