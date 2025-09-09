import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isPremium: true,
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if subscription is active
    const isSubscriptionActive = user.subscription?.status === 'active' &&
                                user.subscription.currentPeriodEnd > new Date()

    return NextResponse.json({
      isPremium: user.isPremium || isSubscriptionActive,
      subscriptionStatus: user.subscription?.status || null,
      subscriptionEnd: user.subscription?.currentPeriodEnd || null,
    })
  } catch (error) {
    console.error('Failed to check premium status:', error)
    return NextResponse.json(
      { error: 'Failed to check premium status' },
      { status: 500 }
    )
  }
}
