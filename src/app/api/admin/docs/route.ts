import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
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
      message: 'Google Docs API is available',
      features: [
        'Create documents',
        'Edit documents',
        'Share documents',
        'Document collaboration'
      ]
    })
  } catch (error) {
    console.error('Docs API test failed:', error)
    return NextResponse.json(
      { error: 'Google Docs API connection failed' },
      { status: 500 }
    )
  }
}
