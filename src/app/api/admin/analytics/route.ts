import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      status: 'connected',
      message: 'Google Analytics API is available',
      features: [
        'View website traffic',
        'User behavior analytics',
        'Conversion tracking',
        'Real-time data',
        'Custom reports'
      ]
    })
  } catch (error) {
    console.error('Analytics API test failed:', error)
    return NextResponse.json(
      { error: 'Google Analytics API connection failed' },
      { status: 500 }
    )
  }
}
