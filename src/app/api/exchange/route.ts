import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'volume'
    
    let orderBy: any = {}
    
    switch (sort) {
      case 'price':
        orderBy = { tokenPrice: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'volume':
      default:
        orderBy = [
          { likes: { _count: 'desc' } },
          { comments: { _count: 'desc' } }
        ]
        break
    }

    const posts = await prisma.post.findMany({
      take: 50,
      orderBy,
      include: {
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
        tokens: session?.user?.id ? {
          where: {
            ownerId: session.user.id,
          },
          select: {
            amount: true,
          },
        } : false,
      },
    })

    // Calculate user token holdings if signed in
    const postsWithUserTokens = posts.map(post => {
      const userTokens = session?.user?.id && post.tokens
        ? post.tokens.reduce((sum, token) => sum + token.amount, 0)
        : 0

      return {
        ...post,
        userTokens,
        tokens: undefined, // Remove raw tokens data from response
      }
    })

    return NextResponse.json({ posts: postsWithUserTokens })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}