import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    console.log('🤖 [OpenAI] OPENAI_API_KEY present:', !!OPENAI_API_KEY)

    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server. Please add OPENAI_API_KEY in environment variables.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    console.log('📦 Body reçu:', {
      hasMessages: !!body.messages,
      messagesIsArray: Array.isArray(body.messages),
      messagesLength: body.messages?.length,
      model: body.model
    })

    const { messages, model = 'gpt-4o', max_tokens = 1000, temperature = 0.7 } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      return NextResponse.json(
        { error: errorData.error?.message || 'OpenAI API error', details: errorData },
        { status: openaiResponse.status }
      )
    }

    const data = await openaiResponse.json()

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
