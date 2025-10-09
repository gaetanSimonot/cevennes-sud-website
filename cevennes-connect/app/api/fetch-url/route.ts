import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log(`Fetching URL: ${url}`)

    // Fetch the page with headers to mimic a real browser
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000,
      maxRedirects: 5
    })

    return NextResponse.json({
      success: true,
      html: response.data,
      url: response.request?.res?.responseUrl || url
    })

  } catch (error: any) {
    console.error('Error fetching URL:', error.message)
    return NextResponse.json({
      error: 'Failed to fetch URL',
      details: error.message
    }, { status: 500 })
  }
}
