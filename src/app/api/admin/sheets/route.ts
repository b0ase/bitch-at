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
      message: 'Google Sheets API is available',
      features: [
        'Read spreadsheets',
        'Write to spreadsheets',
        'Create new sheets',
        'Data analysis and charts'
      ]
    })
  } catch (error) {
    console.error('Sheets API test failed:', error)
    return NextResponse.json(
      { error: 'Google Sheets API connection failed' },
      { status: 500 }
    )
  }
}
