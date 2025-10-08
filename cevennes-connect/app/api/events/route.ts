import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'events-data.json')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const timeFilter = searchParams.get('time') // 'past', 'future', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    let events = JSON.parse(fileContent)

    // Filter by category
    if (category && category !== 'all') {
      events = events.filter((e: any) => e.category === category)
    }

    // Filter by time
    const now = new Date()
    if (timeFilter === 'past') {
      events = events.filter((e: any) => new Date(e.date) < now)
    } else if (timeFilter === 'future') {
      events = events.filter((e: any) => new Date(e.date) >= now)
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      events = events.filter((e: any) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        (e.location && e.location.toLowerCase().includes(searchLower))
      )
    }

    // Sort by date (newest first)
    events.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEvents = events.slice(startIndex, endIndex)

    return NextResponse.json({
      events: paginatedEvents,
      total: events.length,
      page,
      limit,
      totalPages: Math.ceil(events.length / limit)
    })

  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
