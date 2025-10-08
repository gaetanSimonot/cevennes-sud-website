import { NextRequest, NextResponse } from 'next/server'
import { eventsDB } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await eventsDB.getOne(parseInt(params.id))

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

    // Update in Supabase
    const updatedEvent = await eventsDB.update(parseInt(params.id), updates)

    return NextResponse.json({ success: true, event: updatedEvent })

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
    await eventsDB.delete(parseInt(params.id))

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
