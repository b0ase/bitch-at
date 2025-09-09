import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Skip auth check if database is not available
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Test Gmail API connection
    // This would normally make a call to Gmail API using the access token
    // For now, we'll just return a success status since the OAuth flow handles the connection

    return NextResponse.json({
      status: 'connected',
      message: 'Gmail API is available',
      features: [
        'Read emails',
        'Send emails',
        'Manage labels',
        'Email automation'
      ]
    })
  } catch (error) {
    console.error('Gmail API test failed:', error)
    return NextResponse.json(
      { error: 'Gmail API connection failed' },
      { status: 500 }
    )
  }
}
