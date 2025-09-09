import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Connect a wallet to user account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { walletType, address, signature, message } = await request.json()

    if (!walletType || !address) {
      return NextResponse.json(
        { error: 'Wallet type and address are required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { address: address }
    })

    if (existingWallet) {
      if (existingWallet.userId === user.id) {
        return NextResponse.json({ message: 'Wallet already connected' })
      } else {
        return NextResponse.json(
          { error: 'Wallet address already connected to another account' },
          { status: 400 }
        )
      }
    }

    // Verify wallet signature if provided
    if (signature && message) {
      // TODO: Implement wallet signature verification
      // This would verify that the signature matches the message and address
      const isValidSignature = await verifyWalletSignature(address, message, signature, walletType)

      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid wallet signature' },
          { status: 400 }
        )
      }
    }

    // Create wallet connection
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        walletType: walletType,
        address: address,
        balance: 0,
        currency: walletType === 'bsv' ? 'BSV' : 'BTC'
      }
    })

    return NextResponse.json({
      wallet,
      message: `${walletType.toUpperCase()} wallet connected successfully!`
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to connect wallet:', error)
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    )
  }
}

// Get user's connected wallets
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wallet: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ wallets: user.wallet })

  } catch (error) {
    console.error('Failed to fetch wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

// Placeholder for wallet signature verification
async function verifyWalletSignature(
  address: string,
  message: string,
  signature: string,
  walletType: string
): Promise<boolean> {
  // TODO: Implement actual signature verification for different wallet types
  // This would involve:
  // 1. HandCash signature verification
  // 2. Yours.org signature verification
  // 3. BSV signature verification
  // 4. General crypto signature verification

  console.log(`Verifying ${walletType} signature for address ${address}`)

  // For now, return true for development
  // In production, implement proper verification
  return true
}
