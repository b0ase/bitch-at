import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isPremium: true,
          },
        },
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, image, isPremium, mintAsNFT } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Content too long' },
        { status: 400 }
      )
    }

    // Check if user is premium or can afford posting
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If not premium, check wallet balance for posting cost
    if (!user.isPremium) {
      const postingCost = 0.001 // BSV cost for posting
      if (!user.wallet || user.wallet.balance < postingCost) {
        return NextResponse.json(
          { error: 'Insufficient funds for posting' },
          { status: 402 }
        )
      }

      // Deduct posting cost
      await prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: user.wallet.balance - postingCost },
      })
    }

    // Generate NFT ID if minting as NFT (premium feature)
    let nftId: string | undefined
    if (mintAsNFT && user.isPremium) {
      nftId = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        image,
        userId: user.id,
        isPremium: user.isPremium,
        nftId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isPremium: true,
          },
        },
        likes: true,
        comments: true,
      },
    })

    // If NFT was minted, create initial tokens
    if (nftId) {
      await prisma.token.create({
        data: {
          postId: post.id,
          ownerId: user.id,
          amount: 1000000, // 1M tokens
        },
      })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
