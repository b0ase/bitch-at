import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { postId, type, amount } = await request.json()

    if (!postId || !type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid trade parameters' },
        { status: 400 }
      )
    }

    // Get post details
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        tokens: {
          where: { ownerId: session.user.id },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const userTokens = post.tokens.reduce((sum, token) => sum + token.amount, 0)

    if (type === 'buy') {
      // Check if enough tokens are available
      if (amount > post.availableTokens) {
        return NextResponse.json(
          { error: 'Not enough tokens available' },
          { status: 400 }
        )
      }

      // Calculate cost
      const cost = amount * post.tokenPrice

      // TODO: Check user wallet balance
      // For now, we'll assume the transaction succeeds

      // Create or update token ownership
      const existingToken = await prisma.token.findFirst({
        where: {
          postId,
          ownerId: session.user.id,
        },
      })

      if (existingToken) {
        await prisma.token.update({
          where: { id: existingToken.id },
          data: {
            amount: existingToken.amount + amount,
          },
        })
      } else {
        await prisma.token.create({
          data: {
            postId,
            ownerId: session.user.id,
            amount,
            purchasePrice: post.tokenPrice,
            acquiredVia: 'purchase',
          },
        })
      }

      // Update available tokens
      await prisma.post.update({
        where: { id: postId },
        data: {
          availableTokens: post.availableTokens - amount,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Bought ${amount} tokens for $${cost.toFixed(4)}`,
        transaction: {
          type: 'buy',
          amount,
          price: post.tokenPrice,
          totalCost: cost,
        },
      })
    } else if (type === 'sell') {
      // Check if user has enough tokens
      if (amount > userTokens) {
        return NextResponse.json(
          { error: 'Insufficient tokens to sell' },
          { status: 400 }
        )
      }

      // Calculate proceeds
      const proceeds = amount * post.tokenPrice

      // Update token ownership
      const userToken = post.tokens[0]
      if (userToken.amount === amount) {
        // Delete token record if selling all
        await prisma.token.delete({
          where: { id: userToken.id },
        })
      } else {
        // Update token amount
        await prisma.token.update({
          where: { id: userToken.id },
          data: {
            amount: userToken.amount - amount,
          },
        })
      }

      // Update available tokens
      await prisma.post.update({
        where: { id: postId },
        data: {
          availableTokens: post.availableTokens + amount,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Sold ${amount} tokens for $${proceeds.toFixed(4)}`,
        transaction: {
          type: 'sell',
          amount,
          price: post.tokenPrice,
          totalProceeds: proceeds,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid trade type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Trade failed:', error)
    return NextResponse.json(
      { error: 'Trade failed' },
      { status: 500 }
    )
  }
}