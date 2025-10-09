import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const id = params.id

    // Get the pending event
    const { data: pendingEvent, error: fetchError } = await supabase
      .from('scraped_events_pending')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!pendingEvent) {
      return NextResponse.json(
        { error: 'Pending event not found' },
        { status: 404 }
      )
    }

    // Check if already validated or rejected
    if (pendingEvent.validated) {
      return NextResponse.json(
        { error: 'Event already validated' },
        { status: 400 }
      )
    }

    if (pendingEvent.rejected) {
      return NextResponse.json(
        { error: 'Event already rejected' },
        { status: 400 }
      )
    }

    // Parse additional data from request body if provided (for edits)
    const body = await request.json().catch(() => ({}))

    // Create event in events table
    const eventData = {
      title: body.title || pendingEvent.title,
      category: body.category || 'culture', // Default category
      description: body.description || pendingEvent.description,
      date: body.date || pendingEvent.date || new Date().toISOString().split('T')[0],
      time: body.time || '00:00',
      location: body.location || pendingEvent.location,
      address: body.address || pendingEvent.location,
      price: body.price || 'Gratuit',
      organizer: body.organizer || '',
      contact: body.contact || '',
      website: body.website || pendingEvent.source_url || '',
      image: body.image || pendingEvent.image || '/images/default-event.jpg',
      lat: body.lat || 44.1,
      lng: body.lng || 3.9,
      premium_level: body.premium_level || 'standard'
    }

    const { data: createdEvent, error: createError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (createError) throw createError

    // Mark the pending event as validated
    const { error: updateError } = await supabase
      .from('scraped_events_pending')
      .update({
        validated: true,
        validated_at: new Date().toISOString(),
        validated_event_id: createdEvent.id
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      event: createdEvent,
      message: 'Event validated and published successfully'
    })

  } catch (error: any) {
    console.error('Error validating event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
