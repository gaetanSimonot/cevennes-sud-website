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

    // Get optional rejection reason from request body
    const body = await request.json().catch(() => ({}))
    const rejectionReason = body.reason || null

    // Mark the pending event as rejected
    const { error: updateError } = await supabase
      .from('scraped_events_pending')
      .update({
        rejected: true,
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Event rejected successfully'
    })

  } catch (error: any) {
    console.error('Error rejecting event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
