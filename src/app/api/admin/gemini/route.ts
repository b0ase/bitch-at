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
      message: 'Gemini AI API is available',
      features: [
        'Content generation',
        'Text analysis',
        'Code generation',
        'Image understanding',
        'Conversational AI'
      ]
    })
  } catch (error) {
    console.error('Gemini API test failed:', error)
    return NextResponse.json(
      { error: 'Gemini AI API connection failed' },
      { status: 500 }
    )
  }
}
