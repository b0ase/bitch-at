'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface PostToken {
  id: string
  content: string
  image?: string
  user: {
    name: string
    username: string
    image?: string
  }
  totalTokenSupply: number
  availableTokens: number
  tokenPrice: number
  likeCost: number
  shareCost: number
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
  userTokens?: number
}

export default function ExchangePage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<PostToken[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'newest'>('volume')
  const [selectedPost, setSelectedPost] = useState<PostToken | null>(null)
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  useEffect(() => {
    fetchPostsWithTokens()
  }, [sortBy])

  const fetchPostsWithTokens = async () => {
    try {
      const response = await fetch(`/api/exchange?sort=${sortBy}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async () => {
    if (!selectedPost || !tradeAmount) return

    try {
      const response = await fetch('/api/exchange/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPost.id,
          type: tradeType,
          amount: parseInt(tradeAmount),
        }),
      })

      if (response.ok) {
        fetchPostsWithTokens()
        setSelectedPost(null)
        setTradeAmount('')
      }
    } catch (error) {
      console.error('Trade failed:', error)
    }
  }

  const calculateTotalCost = () => {
    if (!selectedPost || !tradeAmount) return '0.00'
    const amount = parseInt(tradeAmount) || 0
    const price = selectedPost.tokenPrice || 0.0001
    const cost = amount * price
    return cost.toFixed(4)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Token Exchange</h1>
        <p className="text-gray-400">Trade post tokens - Every post has 1M tokens available</p>
      </div>

      {/* Sort Options */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSortBy('volume')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            sortBy === 'volume'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Most Active
        </button>
        <button
          onClick={() => setSortBy('price')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            sortBy === 'price'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Highest Price
        </button>
        <button
          onClick={() => setSortBy('newest')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            sortBy === 'newest'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Newest
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <p className="text-gray-400">No posts with tokens available yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`bg-gray-900 rounded-lg p-6 cursor-pointer transition-all hover:bg-gray-800 ${
                  selectedPost?.id === post.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-4">
                  {post.user.image ? (
                    <img
                      src={post.user.image}
                      alt={post.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xl">{post.user.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{post.user.name}</span>
                      <span className="text-gray-500">@{post.user.username}</span>
                    </div>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                  </div>
                </div>

                {/* Token Info */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-gray-500 text-sm">Token Price</p>
                    <p className="text-white font-bold">${(post.tokenPrice || 0.0001).toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Available</p>
                    <p className="text-white font-bold">{formatNumber(post.availableTokens || 990000)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Engagement</p>
                    <p className="text-white font-bold">
                      {post._count.likes} ❤️ {post._count.comments} 💬
                    </p>
                  </div>
                </div>

                {/* Mini Price Chart */}
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">24h Change</span>
                    <span className="text-xs text-green-400">+{(Math.random() * 20).toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-16 bg-gray-800 rounded flex items-end justify-around p-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* User Holdings */}
                {post.userTokens && post.userTokens > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <p className="text-sm text-purple-400">
                      You own {formatNumber(post.userTokens)} tokens
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Trading Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold text-white mb-4">Trade Tokens</h2>
            
            {selectedPost ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Selected Post</p>
                  <p className="text-white">{selectedPost.content.substring(0, 50)}...</p>
                </div>

                {/* Trade Type */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      tradeType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      tradeType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">
                    Amount of Tokens
                  </label>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max={tradeType === 'buy' ? selectedPost.availableTokens : selectedPost.userTokens || 0}
                  />
                </div>

                {/* Cost Display */}
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Cost</p>
                  <p className="text-white text-xl font-bold">${calculateTotalCost()}</p>
                </div>

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  disabled={!session || !tradeAmount}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    session && tradeAmount
                      ? tradeType === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!session ? 'Sign in to Trade' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Tokens`}
                </button>

                {/* Token Info */}
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Price:</span>
                    <span className="text-white">${(selectedPost.tokenPrice || 0.0001).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white">{formatNumber(selectedPost.availableTokens || 990000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Supply:</span>
                    <span className="text-white">{formatNumber(selectedPost.totalTokenSupply || 1000000)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Select a post to start trading</p>
              </div>
            )}
          </div>

          {/* Portfolio Summary */}
          {session && (
            <div className="bg-gray-900 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Portfolio</h3>
              <Link
                href="/wallet"
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                View Full Portfolio →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}