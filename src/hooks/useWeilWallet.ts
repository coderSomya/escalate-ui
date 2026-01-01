import { useCallback, useEffect, useMemo, useState } from 'react'
import { WeilWalletConnection } from '@weilliptic/weil-sdk'

type WeilWalletProvider = WeilWalletConnection['config']['walletProvider']

type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error'

const extractAccountId = (value: unknown) => {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value) {
    // handle common shapes: { address }, { addr }, { id }
    const maybeAddress =
      (value as Record<string, unknown>).address ??
      (value as Record<string, unknown>).addr ??
      (value as Record<string, unknown>).id
    if (typeof maybeAddress === 'string') return maybeAddress
  }
  if (typeof value === 'number') return String(value)
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
      const primaryRaw = Array.isArray(accounts) ? accounts[0] : accounts
      const primary = extractAccountId(primaryRaw)
      setAccount(primary ?? null)
      return primary
    } catch {
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
      await provider.request({ method: 'wallet_open' }).catch(() => undefined)
      const accounts = await provider.request({ method: 'weil_requestAccounts' })
      const primaryRaw = Array.isArray(accounts) ? accounts[0] : accounts
      const primary = extractAccountId(primaryRaw)
      setAccount(primary ?? null)
      setWallet(new WeilWalletConnection({ walletProvider: provider }))
      setStatus('connected')
    } catch (err: any) {
      setStatus('error')
      setError(err?.message ?? 'Unable to connect to Weil Wallet.')
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
    provider.on?.('accountsChanged', (accounts: string[]) => {
      if (!mounted) return
      const primaryRaw = Array.isArray(accounts) ? accounts[0] : accounts
      const primary = extractAccountId(primaryRaw)
      setAccount(primary ?? null)
    })
    ;(async () => {
      if (provider?.isConnected?.()) {
        await hydrateAccounts()
        setWallet(new WeilWalletConnection({ walletProvider: provider }))
        setStatus('connected')
      }
    })()
    return () => {
      mounted = false
      provider.off?.('accountsChanged', () => undefined)
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

