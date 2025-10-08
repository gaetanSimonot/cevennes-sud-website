import { NextRequest, NextResponse } from 'next/server'
import { eventsDB } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const time = (searchParams.get('time') || 'all') as 'all' | 'past' | 'future'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Use Supabase with all filters
    const result = await eventsDB.getAll({
      category,
      search,
      time,
      page,
      limit
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Create event in Supabase
    const createdEvent = await eventsDB.create(event)

    return NextResponse.json({ success: true, event: createdEvent })

  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
