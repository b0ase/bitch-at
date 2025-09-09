'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Wallet {
  id: string
  walletType: string
  address: string
  balance: number
  currency: string
}

interface WalletConnectorProps {
  onWalletConnected?: (wallet: Wallet) => void
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletConnected }) => {
  const { data: session } = useSession()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchWallets()
    }
  }, [session])

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallet/connect')
      if (response.ok) {
        const data = await response.json()
        setWallets(data.wallets)
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async (walletType: string) => {
    setConnecting(walletType)

    try {
      let address: string
      let signature: string | undefined
      let message: string | undefined

      switch (walletType) {
        case 'handcash':
          // HandCash integration
          address = await connectHandCash()
          break

        case 'yours':
          // Yours.org integration
          address = await connectYours()
          break

        case 'bsv':
          // Direct BSV wallet connection
          const result = await connectBSVWallet()
          address = result.address
          signature = result.signature
          message = result.message
          break

        case 'metamask':
          // MetaMask for ETH/BTC
          address = await connectMetaMask()
          break

        default:
          throw new Error(`Unsupported wallet type: ${walletType}`)
      }

      // Connect wallet to account
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletType,
          address,
          signature,
          message,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setWallets([...wallets, data.wallet])
        onWalletConnected?.(data.wallet)
        fetchWallets()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to connect wallet')
      }

    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setConnecting(null)
    }
  }

  const connectHandCash = async (): Promise<string> => {
    // HandCash integration
    return new Promise((resolve, reject) => {
      // Check if HandCash is available
      if (typeof window !== 'undefined' && (window as any).HandCash) {
        const handCash = (window as any).HandCash

        // Generate a message to sign
        const message = `Connect to Bitch@ platform\nTimestamp: ${Date.now()}`

        handCash.sign(message)
          .then((result: any) => {
            resolve(result.address)
          })
          .catch((error: any) => {
            reject(new Error('HandCash connection failed'))
          })
      } else {
        reject(new Error('HandCash not found. Please install HandCash extension.'))
      }
    })
  }

  const connectYours = async (): Promise<string> => {
    // Yours.org integration
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).YoursWallet) {
        const yoursWallet = (window as any).YoursWallet

        yoursWallet.connect()
          .then((result: any) => {
            resolve(result.address)
          })
          .catch((error: any) => {
            reject(new Error('Yours.org connection failed'))
          })
      } else {
        reject(new Error('Yours.org wallet not found. Please install Yours.org extension.'))
      }
    })
  }

  const connectBSVWallet = async (): Promise<{ address: string; signature: string; message: string }> => {
    // Direct BSV wallet connection (like MoneyButton, etc.)
    return new Promise((resolve, reject) => {
      // This would integrate with various BSV wallet providers
      // For now, we'll simulate with a prompt
      const address = prompt('Enter your BSV address:')
      if (address) {
        resolve({
          address,
          signature: 'simulated_signature',
          message: 'Connect to Bitch@ platform'
        })
      } else {
        reject(new Error('Address required'))
      }
    })
  }

  const connectMetaMask = async (): Promise<string> => {
    // MetaMask integration for ETH/BTC
    return new Promise(async (resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
          resolve(accounts[0])
        } catch (error) {
          reject(new Error('MetaMask connection failed'))
        }
      } else {
        reject(new Error('MetaMask not found. Please install MetaMask.'))
      }
    })
  }

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'handcash': return '🤝'
      case 'yours': return '🎯'
      case 'bsv': return '₿'
      case 'metamask': return '🦊'
      default: return '👛'
    }
  }

  const getWalletName = (walletType: string) => {
    switch (walletType) {
      case 'handcash': return 'HandCash'
      case 'yours': return 'Yours.org'
      case 'bsv': return 'BSV Wallet'
      case 'metamask': return 'MetaMask'
      default: return walletType
    }
  }

  if (!session) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <p className="text-gray-400">Please sign in to connect your wallet</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-blue mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h2>

      {/* Connected Wallets */}
      {wallets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Connected Wallets</h3>
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getWalletIcon(wallet.walletType)}</span>
                  <div>
                    <div className="text-white font-medium">
                      {getWalletName(wallet.walletType)}
                    </div>
                    <div className="text-gray-400 text-sm font-mono">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {wallet.balance} {wallet.currency}
                  </div>
                  <div className="text-green-400 text-sm">Connected</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Wallet Types */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Available Wallets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { type: 'handcash', description: 'Popular BSV wallet' },
            { type: 'yours', description: 'Twetch rebranded wallet' },
            { type: 'bsv', description: 'Direct BSV wallet' },
            { type: 'metamask', description: 'ETH & BTC wallet' }
          ].map((wallet) => {
            const isConnected = wallets.some(w => w.walletType === wallet.type)
            const isConnecting = connecting === wallet.type

            return (
              <div
                key={wallet.type}
                className={`bg-gray-800 rounded-lg p-4 border-2 transition-colors ${
                  isConnected
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-gray-700 hover:border-twitter-blue'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getWalletIcon(wallet.type)}</span>
                    <div>
                      <div className="text-white font-medium">
                        {getWalletName(wallet.type)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {wallet.description}
                      </div>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="text-green-400 text-sm font-medium">
                      ✓ Connected
                    </div>
                  )}
                </div>

                {!isConnected && (
                  <button
                    onClick={() => connectWallet(wallet.type)}
                    disabled={isConnecting}
                    className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-900 rounded-lg">
        <h4 className="text-blue-200 font-medium mb-2">Why Connect Your Wallet?</h4>
        <ul className="text-sm text-blue-100 space-y-1">
          <li>• Buy and trade tokens for posts you love</li>
          <li>• Receive dividends from platform revenue</li>
          <li>• Vote on post governance decisions</li>
          <li>• Participate in shareholder meetings</li>
        </ul>
      </div>
    </div>
  )
}

export default WalletConnector
