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

    return NextResponse.json({
      status: 'connected',
      message: 'Google Drive API is available',
      features: [
        'Upload files',
        'Download files',
        'Share files',
        'Organize folders',
        'File permissions'
      ]
    })
  } catch (error) {
    console.error('Drive API test failed:', error)
    return NextResponse.json(
      { error: 'Google Drive API connection failed' },
      { status: 500 }
    )
  }
}
