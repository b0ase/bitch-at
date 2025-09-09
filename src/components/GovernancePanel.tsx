'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Proposal {
  id: string
  title: string
  description: string
  type: string
  status: string
  votingEndsAt: string
  proposer: {
    id: string
    name: string
    username: string
    image?: string
  }
  _count: {
    votes: number
  }
}

interface GovernancePanelProps {
  postId: string
}

const GovernancePanel: React.FC<GovernancePanelProps> = ({ postId }) => {
  const { data: session } = useSession()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [userVotingPower, setUserVotingPower] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'content_moderation'
  })

  useEffect(() => {
    fetchProposals()
  }, [postId])

  const fetchProposals = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/governance`)
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals)
        setUserVotingPower(data.userVotingPower)
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProposal = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/governance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProposal),
      })

      if (response.ok) {
        setNewProposal({ title: '', description: '', type: 'content_moderation' })
        setShowCreateForm(false)
        fetchProposals()
      }
    } catch (error) {
      console.error('Failed to create proposal:', error)
    }
  }

  const voteOnProposal = async (proposalId: string, vote: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/governance/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
      })

      if (response.ok) {
        fetchProposals()
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case 'content_moderation': return 'bg-red-500'
      case 'revenue_sharing': return 'bg-green-500'
      case 'feature_unlock': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getProposalTypeLabel = (type: string) => {
    switch (type) {
      case 'content_moderation': return 'Content Moderation'
      case 'revenue_sharing': return 'Revenue Sharing'
      case 'feature_unlock': return 'Feature Unlock'
      default: return type
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Shareholder Governance</h2>
          <p className="text-gray-400">Token holders vote on post decisions</p>
        </div>
        {session && userVotingPower >= 100 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-twitter-blue hover:bg-twitter-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create Proposal'}
          </button>
        )}
      </div>

      {/* User's Voting Power */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Your Voting Power:</span>
          <span className="text-twitter-blue font-bold">{userVotingPower} tokens</span>
        </div>
        {userVotingPower < 100 && (
          <p className="text-yellow-400 text-sm mt-2">
            Need 100+ tokens to create proposals
          </p>
        )}
      </div>

      {/* Create Proposal Form */}
      {showCreateForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Create Proposal</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Proposal Title"
              value={newProposal.title}
              onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-twitter-blue"
            />
            <textarea
              placeholder="Proposal Description"
              value={newProposal.description}
              onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
              rows={4}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-twitter-blue"
            />
            <select
              value={newProposal.type}
              onChange={(e) => setNewProposal({...newProposal, type: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-twitter-blue"
            >
              <option value="content_moderation">Content Moderation</option>
              <option value="revenue_sharing">Revenue Sharing</option>
              <option value="feature_unlock">Feature Unlock</option>
            </select>
            <button
              onClick={createProposal}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
            >
              Create Proposal
            </button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No active proposals</p>
            <p className="text-sm text-gray-500">
              Token holders can create proposals to vote on post decisions
            </p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs text-white ${getProposalTypeColor(proposal.type)}`}>
                      {getProposalTypeLabel(proposal.type)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      by {proposal.proposer.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{proposal.title}</h3>
                  <p className="text-gray-300 mb-3">{proposal.description}</p>
                  <div className="text-sm text-gray-400">
                    Voting ends: {new Date(proposal.votingEndsAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Voting Actions */}
              {session && userVotingPower > 0 && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => voteOnProposal(proposal.id, 'yes')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    ✅ Yes ({userVotingPower})
                  </button>
                  <button
                    onClick={() => voteOnProposal(proposal.id, 'no')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    ❌ No ({userVotingPower})
                  </button>
                  <button
                    onClick={() => voteOnProposal(proposal.id, 'abstain')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    🤔 Abstain ({userVotingPower})
                  </button>
                </div>
              )}

              <div className="text-sm text-gray-400 mt-3">
                {proposal._count.votes} votes cast
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GovernancePanel
