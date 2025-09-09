'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import WalletConnector from '@/components/WalletConnector'
import DividendPanel from '@/components/DividendPanel'

interface Wallet {
  id: string
  walletType: string
  address: string
  balance: number
  currency: string
}

export default function WalletPage() {
  const { data: session } = useSession()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'connect' | 'dividends'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
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

  const handleWalletConnected = (wallet: Wallet) => {
    setWallets([...wallets, wallet])
    setActiveTab('overview')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please sign in to access your wallet.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Shareholder Dashboard</h1>
          <p className="text-gray-400">
            Manage your wallets, tokens, and shareholder rights
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'connect', label: 'Connect Wallet', icon: '🔗' },
            { id: 'dividends', label: 'Dividends', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-twitter-blue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-2xl font-bold text-twitter-blue mb-2">
                  {wallets.length}
                </div>
                <div className="text-gray-400">Connected Wallets</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-2xl font-bold text-green-500 mb-2">
                  0
                </div>
                <div className="text-gray-400">Tokens Held</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-2xl font-bold text-purple-500 mb-2">
                  0.0000
                </div>
                <div className="text-gray-400">Total Dividends</div>
              </div>
            </div>

            {/* Connected Wallets */}
            {wallets.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Your Wallets</h2>
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {wallet.walletType === 'handcash' ? '🤝' :
                           wallet.walletType === 'yours' ? '🎯' :
                           wallet.walletType === 'bsv' ? '₿' : '👛'}
                        </div>
                        <div>
                          <div className="text-white font-medium capitalize">
                            {wallet.walletType} Wallet
                          </div>
                          <div className="text-gray-400 text-sm font-mono">
                            {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {wallet.balance} {wallet.currency}
                        </div>
                        <button className="text-twitter-blue hover:text-twitter-dark-hover text-sm mt-1">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shareholder Rights Info */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Your Shareholder Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-white mb-2">💼 Governance Rights</h3>
                  <p className="text-purple-200 text-sm">
                    Vote on post content, revenue sharing, and platform decisions
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">💰 Dividend Rights</h3>
                  <p className="text-purple-200 text-sm">
                    Receive automatic dividends from platform revenue
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">📈 Trading Rights</h3>
                  <p className="text-purple-200 text-sm">
                    Buy and sell tokens on the open market
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">🏢 Meeting Rights</h3>
                  <p className="text-purple-200 text-sm">
                    Participate in shareholder meetings and decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connect' && (
          <WalletConnector onWalletConnected={handleWalletConnected} />
        )}

        {activeTab === 'dividends' && (
          <div className="space-y-6">
            <DividendPanel postId="all" />
          </div>
        )}
      </div>
    </div>
  )
}
