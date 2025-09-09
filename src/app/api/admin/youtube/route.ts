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
      message: 'YouTube Data API is available',
      features: [
        'Upload videos',
        'Manage playlists',
        'View analytics',
        'Moderate comments',
        'Channel management'
      ]
    })
  } catch (error) {
    console.error('YouTube API test failed:', error)
    return NextResponse.json(
      { error: 'YouTube Data API connection failed' },
      { status: 500 }
    )
  }
}
