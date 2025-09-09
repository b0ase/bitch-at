import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's token holdings
    const tokens = await prisma.token.findMany({
      where: { ownerId: session.user.id },
      include: {
        post: {
          select: {
            id: true,
            content: true,
            tokenPrice: true,
            user: {
              select: {
                name: true,
                username: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: {
        amount: 'desc',
      },
    })

    // Calculate portfolio statistics
    const portfolioStats = tokens.reduce((stats, token) => {
      const currentValue = token.amount * token.post.tokenPrice
      const purchaseValue = token.amount * token.purchasePrice
      const profit = currentValue - purchaseValue

      return {
        totalTokens: stats.totalTokens + token.amount,
        totalValue: stats.totalValue + currentValue,
        totalInvested: stats.totalInvested + purchaseValue,
        totalProfit: stats.totalProfit + profit,
        positions: stats.positions + 1,
      }
    }, {
      totalTokens: 0,
      totalValue: 0,
      totalInvested: 0,
      totalProfit: 0,
      positions: 0,
    })

    // Format holdings for response
    const holdings = tokens.map(token => ({
      id: token.id,
      postId: token.postId,
      amount: token.amount,
      purchasePrice: token.purchasePrice,
      currentPrice: token.post.tokenPrice,
      currentValue: token.amount * token.post.tokenPrice,
      profit: (token.amount * token.post.tokenPrice) - (token.amount * token.purchasePrice),
      profitPercentage: ((token.post.tokenPrice - token.purchasePrice) / token.purchasePrice) * 100,
      acquiredVia: token.acquiredVia,
      post: {
        content: token.post.content,
        user: token.post.user,
        engagement: {
          likes: token.post._count.likes,
          comments: token.post._count.comments,
        },
      },
    }))

    return NextResponse.json({
      portfolio: {
        stats: portfolioStats,
        holdings,
      },
    })
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}