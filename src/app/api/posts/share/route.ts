import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const usdCost = post.shareCost // Cost in USD cents

    // Convert USD cost to user's currency
    const tokenCost = userCurrency === 'BSV' ? usdCost * 0.02 : usdCost / exchangeRate

    if (action === 'share') {
      // Check if user has enough balance
      if (wallet.balance < tokenCost) {
        return NextResponse.json(
          { error: `Insufficient funds. You need at least ${tokenCost.toFixed(6)} ${userCurrency} to share this post.` },
          { status: 402 }
        )
      }

      // Check if tokens are available
      if (post.availableTokens < 10) {
        return NextResponse.json(
          { error: 'Not enough tokens available for this post.' },
          { status: 400 }
        )
      }

      // Create share record (we'll use likes table for now, could create separate shares table later)
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

      // Award 10 tokens to user
      await prisma.token.create({
        data: {
          postId: postId,
          ownerId: session.user.id,
          amount: 10,
          purchasePrice: tokenCost / 10, // Price per token
          acquiredVia: 'share',
        },
      })

      // Update post token availability
      await prisma.post.update({
        where: { id: postId },
        data: { availableTokens: post.availableTokens - 10 },
      })

    } else if (action === 'unshare') {
      // Remove share and refund tokens
      const share = await prisma.like.findFirst({
        where: {
          userId: session.user.id,
          postId: postId,
        },
      })

      if (share) {
        await prisma.like.delete({
          where: { id: share.id },
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
            acquiredVia: 'share',
          },
        })

        // Return tokens to available pool
        await prisma.post.update({
          where: { id: postId },
          data: { availableTokens: post.availableTokens + 10 },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'share'
        ? `Post shared and 10 tokens purchased for ${tokenCost.toFixed(6)} ${userCurrency}!`
        : `Post unshared and 10 tokens refunded (${tokenCost.toFixed(6)} ${userCurrency})!`,
      tokenCost: tokenCost,
      currency: userCurrency,
      tokensPurchased: action === 'share' ? 10 : 0,
    })

  } catch (error) {
    console.error('Share action failed:', error)
    return NextResponse.json(
      { error: 'Failed to process share action' },
      { status: 500 }
    )
  }
}
