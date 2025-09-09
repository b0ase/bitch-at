export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Claim dividends for a user
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; distributionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { distributionId } = params

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the dividend claim
    const claim = await prisma.dividendClaim.findUnique({
      where: {
        distributionId_tokenHolderId: {
          distributionId: distributionId,
          tokenHolderId: user.id
        }
      },
      include: {
        distribution: true
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'No dividend claim found for this user' },
        { status: 404 }
      )
    }

    if (claim.status === 'claimed') {
      return NextResponse.json(
        { error: 'Dividends already claimed' },
        { status: 400 }
      )
    }

    if (claim.status === 'expired') {
      return NextResponse.json(
        { error: 'Dividend claim has expired' },
        { status: 400 }
      )
    }

    // Check if distribution is still valid (within 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (claim.distribution.distributionDate < thirtyDaysAgo) {
      await prisma.dividendClaim.update({
        where: { id: claim.id },
        data: { status: 'expired' }
      })
      return NextResponse.json(
        { error: 'Dividend claim has expired' },
        { status: 400 }
      )
    }

    // Mark as claimed
    const updatedClaim = await prisma.dividendClaim.update({
      where: { id: claim.id },
      data: {
        status: 'claimed',
        claimedAt: new Date()
      }
    })

    return NextResponse.json({
      claim: updatedClaim,
      message: `Successfully claimed ${claim.amount} BSV in dividends!`
    })

  } catch (error) {
    console.error('Failed to claim dividends:', error)
    return NextResponse.json(
      { error: 'Failed to claim dividends' },
      { status: 500 }
    )
  }
}

// Get user's dividend claims for a distribution
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string; distributionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { distributionId } = params

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's dividend claim
    const claim = await prisma.dividendClaim.findUnique({
      where: {
        distributionId_tokenHolderId: {
          distributionId: distributionId,
          tokenHolderId: user.id
        }
      },
      include: {
        distribution: true
      }
    })

    if (!claim) {
      return NextResponse.json({ claim: null })
    }

    return NextResponse.json({ claim })

  } catch (error) {
    console.error('Failed to fetch dividend claim:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dividend claim' },
      { status: 500 }
    )
  }
}
