export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get dividend distributions for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    const distributions = await prisma.dividendDistribution.findMany({
      where: { postId: postId },
      include: {
        claims: {
          include: {
            tokenHolder: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        distributionDate: 'desc'
      }
    })

    return NextResponse.json({ distributions })
  } catch (error) {
    console.error('Failed to fetch dividend distributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dividend distributions' },
      { status: 500 }
    )
  }
}

// Create a dividend distribution (only post creator can do this)
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
    const { totalAmount, transactionId } = await request.json()

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid total amount is required' },
        { status: 400 }
      )
    }

    // Verify user is the post creator
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Only the post creator can distribute dividends' },
        { status: 403 }
      )
    }

    // Get all token holders for this post
    const tokenHolders = await prisma.token.groupBy({
      by: ['ownerId'],
      where: { postId: postId },
      _sum: {
        amount: true
      }
    })

    if (tokenHolders.length === 0) {
      return NextResponse.json(
        { error: 'No token holders found for this post' },
        { status: 400 }
      )
    }

    // Calculate total tokens
    const totalTokens = tokenHolders.reduce((sum, holder) => sum + (holder._sum.amount || 0), 0)

    // Calculate amount per token
    const amountPerToken = totalAmount / totalTokens

    // Create dividend distribution
    const distribution = await prisma.dividendDistribution.create({
      data: {
        postId: postId,
        totalAmount: totalAmount,
        amountPerToken: amountPerToken,
        transactionId: transactionId,
        status: 'distributing'
      }
    })

    // Create dividend claims for all token holders
    const claims = []
    for (const holder of tokenHolders) {
      const claim = await prisma.dividendClaim.create({
        data: {
          distributionId: distribution.id,
          tokenHolderId: holder.ownerId,
          amount: amountPerToken * (holder._sum.amount || 0),
          tokensHeld: holder._sum.amount || 0
        }
      })
      claims.push(claim)
    }

    // Update distribution status to completed
    await prisma.dividendDistribution.update({
      where: { id: distribution.id },
      data: { status: 'completed' }
    })

    return NextResponse.json({
      distribution,
      claims,
      totalTokens,
      amountPerToken
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create dividend distribution:', error)
    return NextResponse.json(
      { error: 'Failed to create dividend distribution' },
      { status: 500 }
    )
  }
}
