'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function WalletPage() {
  const { data: session } = useSession()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchWallet()
    }
  }, [session])

  const fetchWallet = async () => {
    try {
      // TODO: Implement wallet API
      setWallet({
        address: '1BitcoinEaterAddressDontSendf59kuE',
        balance: 0.042,
        transactions: [],
      })
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your BSV Wallet</h1>

        {/* Wallet Balance Card */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Balance</h2>
          <div className="text-3xl font-mono font-bold text-bitchat-purple mb-2">
            {wallet?.balance?.toFixed(8)} BSV
          </div>
          <div className="text-gray-400">
            ≈ ${(wallet?.balance * 50).toFixed(2)} USD
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Wallet Address</h2>
          <div className="bg-black rounded p-4 font-mono text-sm break-all">
            {wallet?.address}
          </div>
          <button className="mt-4 bg-twitter-blue hover:bg-twitter-dark-hover text-white px-4 py-2 rounded-lg transition-colors">
            Copy Address
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors">
              Receive BSV
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
              Send BSV
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {wallet?.transactions?.length > 0 ? (
            <div className="space-y-4">
              {wallet.transactions.map((tx: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-800 rounded">
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-sm text-gray-400">{tx.date}</div>
                  </div>
                  <div className={`font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} BSV
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No transactions yet</p>
              <p className="text-sm text-gray-500">
                Your transaction history will appear here once you start using your wallet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
