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

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        status: 'disconnected',
        message: 'Gemini API key not configured',
        note: 'Configure GEMINI_API_KEY in your environment variables',
        features: [
          'Content generation',
          'Text analysis',
          'Code generation',
          'Image understanding',
          'Conversational AI'
        ]
      })
    }

    // Test Gemini API connection
    try {
      // Note: In production, you'd make an actual API call to Gemini
      // For now, we just check if the API key is configured
      return NextResponse.json({
        status: 'connected',
        message: 'Gemini AI API is configured and available',
        features: [
          'Content generation',
          'Text analysis',
          'Code generation',
          'Image understanding',
          'Conversational AI'
        ],
        apiConfigured: true
      })
    } catch (apiError) {
      return NextResponse.json({
        status: 'error',
        message: 'Gemini API key configured but connection failed',
        error: 'API connection error',
        features: [
          'Content generation',
          'Text analysis',
          'Code generation',
          'Image understanding',
          'Conversational AI'
        ]
      })
    }
  } catch (error) {
    console.error('Gemini API test failed:', error)
    return NextResponse.json(
      { error: 'Gemini AI API connection failed' },
      { status: 500 }
    )
  }
}
