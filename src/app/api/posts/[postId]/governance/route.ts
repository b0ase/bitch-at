import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get governance proposals for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    // Get active proposals for this post
    const proposals = await prisma.governanceProposal.findMany({
      where: {
        postId: postId,
        status: 'active'
      },
      include: {
        proposer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user's voting power for this post
    const userTokens = await prisma.token.findMany({
      where: {
        postId: postId,
        owner: {
          email: session.user.email
        }
      }
    })

    const votingPower = userTokens.reduce((sum, token) => sum + token.amount, 0)

    return NextResponse.json({
      proposals,
      userVotingPower: votingPower
    })
  } catch (error) {
    console.error('Failed to fetch governance proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch governance proposals' },
      { status: 500 }
    )
  }
}

// Create a new governance proposal
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params
    const { title, description, type } = await request.json()

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      )
    }

    // Verify user has tokens in this post (minimum threshold for proposing)
    const userTokens = await prisma.token.findMany({
      where: {
        postId: postId,
        owner: {
          email: session.user.email
        }
      }
    })

    const totalTokensHeld = userTokens.reduce((sum, token) => sum + token.amount, 0)

    if (totalTokensHeld < 100) { // Minimum 100 tokens to propose
      return NextResponse.json(
        { error: 'You need at least 100 tokens to create a proposal' },
        { status: 403 }
      )
    }

    // Get proposer user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create the proposal
    const proposal = await prisma.governanceProposal.create({
      data: {
        postId: postId,
        title,
        description,
        type,
        proposerId: user.id,
        votingEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        proposer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Failed to create governance proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create governance proposal' },
      { status: 500 }
    )
  }
}
