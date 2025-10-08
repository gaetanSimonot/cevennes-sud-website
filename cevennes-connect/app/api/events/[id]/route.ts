import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'events-data.json')

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    const events = JSON.parse(fileContent)

    const event = events.find((e: any) => e.id === parseInt(params.id))

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })

  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    const events = JSON.parse(fileContent)

    const eventIndex = events.findIndex((e: any) => e.id === parseInt(params.id))

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Update event
    events[eventIndex] = { ...events[eventIndex], ...updates }

    // Save
    fs.writeFileSync(DATA_PATH, JSON.stringify(events, null, 2))

    return NextResponse.json({ success: true, event: events[eventIndex] })

  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    let events = JSON.parse(fileContent)

    const eventIndex = events.findIndex((e: any) => e.id === parseInt(params.id))

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Remove event
    events.splice(eventIndex, 1)

    // Save
    fs.writeFileSync(DATA_PATH, JSON.stringify(events, null, 2))

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
