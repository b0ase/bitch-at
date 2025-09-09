'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NFTToken {
  id: string
  postId: string
  ownerId: string
  amount: number
  price: number
  post: {
    id: string
    content: string
    user: {
      name: string
      username: string
    }
  }
}

export default function MarketplacePage() {
  const [tokens, setTokens] = useState<NFTToken[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'my-tokens', 'for-sale'

  useEffect(() => {
    fetchTokens()
  }, [filter])

  const fetchTokens = async () => {
    try {
      setLoading(true)
      // TODO: Implement marketplace API
      // For now, show mock data
      const mockTokens: NFTToken[] = [
        {
          id: '1',
          postId: 'post1',
          ownerId: 'user1',
          amount: 1000000,
          price: 0.001,
          post: {
            id: 'post1',
            content: 'This is a premium post about Bitcoin SV being the real Bitcoin! 🚀 #BSV #RealBitcoin',
            user: {
              name: 'BitcoinMaxi',
              username: 'bitcoinmaxi',
            },
          },
        },
        {
          id: '2',
          postId: 'post2',
          ownerId: 'user2',
          amount: 500000,
          price: 0.002,
          post: {
            id: 'post2',
            content: 'Just minted my first NFT post on Bitch@! Time to troll Jack Dorsey and his shitty lightning network. 💎',
            user: {
              name: 'SatoshiFan',
              username: 'satoshifan',
            },
          },
        },
      ]
      setTokens(mockTokens)
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">NFT Marketplace</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="all">All Tokens</option>
              <option value="my-tokens">My Tokens</option>
              <option value="for-sale">For Sale</option>
            </select>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Total Volume</h3>
            <div className="text-2xl font-bold text-bitchat-purple">2,450 BSV</div>
            <div className="text-gray-400">≈ $122,500 USD</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Active NFTs</h3>
            <div className="text-2xl font-bold text-bitchat-pink">1,247</div>
            <div className="text-gray-400">Posts minted as NFTs</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Floor Price</h3>
            <div className="text-2xl font-bold text-green-400">0.001 BSV</div>
            <div className="text-gray-400">Cheapest token</div>
          </div>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <div key={token.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
              {/* Post Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">
                      {token.post.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {token.post.user.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      @{token.post.user.username}
                    </div>
                  </div>
                </div>

                <p className="text-white text-sm mb-4 line-clamp-3">
                  {token.post.content}
                </p>

                <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-3 mb-4">
                  <div className="text-white text-xs font-medium mb-1">NFT Token</div>
                  <div className="text-bitchat-purple font-mono text-sm">
                    #{token.post.id.slice(0, 8)}
                  </div>
                </div>
              </div>

              {/* Token Info & Actions */}
              <div className="px-6 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-gray-400 text-xs">Price per token</div>
                    <div className="text-white font-bold">{token.price} BSV</div>
                    <div className="text-gray-400 text-xs">
                      ≈ ${(token.price * 50).toFixed(3)} USD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">Available</div>
                    <div className="text-white font-bold">
                      {token.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button className="w-full bg-twitter-blue hover:bg-twitter-dark-hover text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                  Buy Tokens
                </button>
              </div>
            </div>
          ))}
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">No tokens available</h3>
            <p className="text-gray-400 mb-6">
              Be the first to mint an NFT post and create tradable tokens!
            </p>
            <Link
              href="/"
              className="bg-twitter-blue hover:bg-twitter-dark-hover text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Your First NFT Post
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
