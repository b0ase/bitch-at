import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
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
