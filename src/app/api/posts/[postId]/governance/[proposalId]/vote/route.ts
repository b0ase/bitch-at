export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Vote on a governance proposal
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; proposalId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { proposalId } = params
    const { vote } = await request.json() // "yes", "no", or "abstain"

    if (!vote || !['yes', 'no', 'abstain'].includes(vote)) {
      return NextResponse.json(
        { error: 'Vote must be "yes", "no", or "abstain"' },
        { status: 400 }
      )
    }

    // Get the proposal
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (proposal.status !== 'active') {
      return NextResponse.json(
        { error: 'Proposal is no longer active' },
        { status: 400 }
      )
    }

    if (new Date() > proposal.votingEndsAt) {
      return NextResponse.json(
        { error: 'Voting period has ended' },
        { status: 400 }
      )
    }

    // Get user's voting power
    const userTokens = await prisma.token.findMany({
      where: {
        postId: proposal.postId,
        owner: {
          email: session.user.email
        }
      }
    })

    const votingPower = userTokens.reduce((sum, token) => sum + token.amount, 0)

    if (votingPower === 0) {
      return NextResponse.json(
        { error: 'You need tokens in this post to vote' },
        { status: 403 }
      )
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already voted
    const existingVote = await prisma.governanceVote.findUnique({
      where: {
        proposalId_voterId: {
          proposalId: proposalId,
          voterId: user.id
        }
      }
    })

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.governanceVote.update({
        where: { id: existingVote.id },
        data: {
          vote: vote,
          votingPower: votingPower
        }
      })
      return NextResponse.json(updatedVote)
    } else {
      // Create new vote
      const newVote = await prisma.governanceVote.create({
        data: {
          proposalId: proposalId,
          voterId: user.id,
          vote: vote,
          votingPower: votingPower
        }
      })
      return NextResponse.json(newVote, { status: 201 })
    }

  } catch (error) {
    console.error('Failed to vote on proposal:', error)
    return NextResponse.json(
      { error: 'Failed to vote on proposal' },
      { status: 500 }
    )
  }
}

// Get voting results for a proposal
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string; proposalId: string } }
) {
  try {
    const { proposalId } = params

    const votes = await prisma.governanceVote.findMany({
      where: { proposalId: proposalId },
      include: {
        voter: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        votingPower: 'desc'
      }
    })

    // Calculate vote totals
    const totals = votes.reduce(
      (acc, vote) => {
        const voteType = vote.vote as 'yes' | 'no' | 'abstain'
        acc[voteType] = (acc[voteType] || 0) + vote.votingPower
        acc.total += vote.votingPower
        return acc
      },
      { yes: 0, no: 0, abstain: 0, total: 0 }
    )

    return NextResponse.json({
      votes,
      totals,
      voterCount: votes.length
    })
  } catch (error) {
    console.error('Failed to fetch voting results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting results' },
      { status: 500 }
    )
  }
}
