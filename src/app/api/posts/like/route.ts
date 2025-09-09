import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { postId, action } = await request.json()

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the post to check token availability
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check user's wallet balance
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          address: `1Bitch@${Date.now()}`, // Generate a unique address
          balance: 0.01, // Give new users some starting balance
        },
      })
    }

    // Get user's preferred currency and exchange rate
    const userCurrency = wallet.currency || 'BSV'
    const exchangeRate = wallet.exchangeRate || 1
    const usdCost = post.likeCost // Cost in USD cents

    // Convert USD cost to user's currency
    const tokenCost = userCurrency === 'BSV' ? usdCost * 0.02 : usdCost / exchangeRate

    if (action === 'like') {
      // Check if user has enough balance
      if (wallet.balance < tokenCost) {
        return NextResponse.json(
          { error: `Insufficient funds. You need at least ${tokenCost.toFixed(6)} ${userCurrency} to like this post.` },
          { status: 402 }
        )
      }

      // Check if tokens are available
      if (post.availableTokens < 1) {
        return NextResponse.json(
          { error: 'No tokens available for this post.' },
          { status: 400 }
        )
      }

      // Create like record
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      })

      // Deduct from wallet
      await prisma.wallet.update({
        where: { userId: session.user.id },
        data: { balance: wallet.balance - tokenCost },
      })

      // Award 1 token to user
      await prisma.token.create({
        data: {
          postId: postId,
          ownerId: session.user.id,
          amount: 1,
          purchasePrice: tokenCost,
          acquiredVia: 'like',
        },
      })

      // Update post token availability
      await prisma.post.update({
        where: { id: postId },
        data: { availableTokens: post.availableTokens - 1 },
      })

    } else if (action === 'unlike') {
      // Remove like and refund token
      const like = await prisma.like.findFirst({
        where: {
          userId: session.user.id,
          postId: postId,
        },
      })

      if (like) {
        await prisma.like.delete({
          where: { id: like.id },
        })

        // Refund wallet
        await prisma.wallet.update({
          where: { userId: session.user.id },
          data: { balance: wallet.balance + tokenCost },
        })

        // Remove token ownership
        await prisma.token.deleteMany({
          where: {
            postId: postId,
            ownerId: session.user.id,
            acquiredVia: 'like',
          },
        })

        // Return token to available pool
        await prisma.post.update({
          where: { id: postId },
          data: { availableTokens: post.availableTokens + 1 },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'like'
        ? `Post liked and 1 token purchased for ${tokenCost.toFixed(6)} ${userCurrency}!`
        : `Post unliked and 1 token refunded (${tokenCost.toFixed(6)} ${userCurrency})!`,
      tokenCost: tokenCost,
      currency: userCurrency,
      tokensPurchased: action === 'like' ? 1 : 0,
    })

  } catch (error) {
    console.error('Like action failed:', error)
    return NextResponse.json(
      { error: 'Failed to process like action' },
      { status: 500 }
    )
  }
}
