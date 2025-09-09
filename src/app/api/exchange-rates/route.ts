import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock exchange rates - in production, you'd use a real API like CoinGecko
type Currency = 'BSV' | 'BTC' | 'ETH' | 'USD' | 'EUR'

const EXCHANGE_RATES: Record<Currency, Partial<Record<Currency, number>>> = {
  BSV: { USD: 50.0, EUR: 45.0, BTC: 0.0012, ETH: 0.023 },
  BTC: { USD: 42000.0, EUR: 38000.0, BSV: 840, ETH: 19.0 },
  ETH: { USD: 2200.0, EUR: 2000.0, BSV: 44, BTC: 0.052 },
  USD: { BSV: 0.02, BTC: 0.000024, ETH: 0.00045 },
  EUR: { BSV: 0.022, BTC: 0.000026, ETH: 0.0005 },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')?.toUpperCase()
    const to = searchParams.get('to')?.toUpperCase()

    if (from && to && from in EXCHANGE_RATES && to in EXCHANGE_RATES) {
      // Get specific rate
      const rate = EXCHANGE_RATES[from as Currency]?.[to as Currency]
      if (rate) {
        return NextResponse.json({
          from,
          to,
          rate,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Return all rates
    return NextResponse.json({
      rates: EXCHANGE_RATES,
      timestamp: new Date().toISOString(),
      note: "These are mock rates. In production, integrate with CoinGecko or similar API."
    })

  } catch (error) {
    console.error('Exchange rates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}
