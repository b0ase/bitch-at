'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface DividendDistribution {
  id: string
  totalAmount: number
  amountPerToken: number
  distributionDate: string
  status: string
  transactionId?: string
  claims: Array<{
    id: string
    amount: number
    tokensHeld: number
    status: string
    claimedAt?: string
    tokenHolder: {
      id: string
      name: string
      username: string
    }
  }>
}

interface DividendPanelProps {
  postId: string
}

const DividendPanel: React.FC<DividendPanelProps> = ({ postId }) => {
  const { data: session } = useSession()
  const [distributions, setDistributions] = useState<DividendDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    fetchDistributions()
  }, [postId])

  const fetchDistributions = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/dividends`)
      if (response.ok) {
        const data = await response.json()
        setDistributions(data.distributions)
      }
    } catch (error) {
      console.error('Failed to fetch distributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimDividend = async (distributionId: string) => {
    setClaiming(distributionId)
    try {
      const response = await fetch(`/api/posts/${postId}/dividends/${distributionId}/claim`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchDistributions()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to claim dividend')
      }
    } catch (error) {
      console.error('Failed to claim dividend:', error)
      alert('Failed to claim dividend')
    } finally {
      setClaiming(null)
    }
  }

  const getUserClaim = (distribution: DividendDistribution) => {
    if (!session?.user?.email) return null

    // Find user's claim in this distribution
    return distribution.claims.find(claim =>
      claim.tokenHolder.name === session.user?.name
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
      <h2 className="text-2xl font-bold text-white mb-6">Dividend Distributions</h2>

      {distributions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No dividend distributions yet</p>
          <p className="text-sm text-gray-500">
            When the post creator distributes revenue, you'll see your share here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {distributions.map((distribution) => {
            const userClaim = getUserClaim(distribution)

            return (
              <div key={distribution.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Distribution #{distribution.id.slice(-8)}
                    </h3>
                    <div className="text-sm text-gray-400 mb-2">
                      {new Date(distribution.distributionDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-300">
                      Total: {distribution.totalAmount} BSV
                    </div>
                    <div className="text-sm text-gray-300">
                      Per Token: {distribution.amountPerToken.toFixed(8)} BSV
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded text-sm ${
                    distribution.status === 'completed'
                      ? 'bg-green-600 text-white'
                      : distribution.status === 'distributing'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {distribution.status}
                  </div>
                </div>

                {userClaim && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">
                          Your Share: {userClaim.amount.toFixed(8)} BSV
                        </div>
                        <div className="text-sm text-gray-400">
                          Based on {userClaim.tokensHeld} tokens held
                        </div>
                        {userClaim.claimedAt && (
                          <div className="text-sm text-green-400 mt-1">
                            Claimed on {new Date(userClaim.claimedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {userClaim.status === 'pending' && (
                        <button
                          onClick={() => claimDividend(distribution.id)}
                          disabled={claiming === distribution.id}
                          className="bg-twitter-blue hover:bg-twitter-dark-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {claiming === distribution.id ? 'Claiming...' : 'Claim Dividend'}
                        </button>
                      )}

                      {userClaim.status === 'claimed' && (
                        <div className="text-green-400 font-medium">
                          ✅ Claimed
                        </div>
                      )}

                      {userClaim.status === 'expired' && (
                        <div className="text-red-400 font-medium">
                          ⏰ Expired
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Distribution Stats */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Total Recipients</div>
                      <div className="text-white font-medium">{distribution.claims.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Claims Made</div>
                      <div className="text-white font-medium">
                        {distribution.claims.filter(c => c.status === 'claimed').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Paid</div>
                      <div className="text-white font-medium">
                        {distribution.claims
                          .filter(c => c.status === 'claimed')
                          .reduce((sum, c) => sum + c.amount, 0)
                          .toFixed(8)} BSV
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DividendPanel
