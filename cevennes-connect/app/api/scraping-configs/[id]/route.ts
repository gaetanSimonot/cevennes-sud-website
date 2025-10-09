import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const id = params.id

    const { data, error } = await supabase
      .from('scraping_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Scraping config not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ config: data })

  } catch (error: any) {
    console.error('Error fetching scraping config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, url, frequency, active } = body
    const supabase = getSupabaseAdmin()
    const id = params.id

    // Build update object with only provided fields
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (url !== undefined) updates.url = url
    if (frequency !== undefined) updates.frequency = frequency
    if (active !== undefined) updates.active = active

    // If frequency changed, recalculate next_run_at
    if (frequency !== undefined) {
      const now = new Date()
      const nextRunAt = new Date(now)

      switch (frequency) {
        case 'hourly':
          nextRunAt.setHours(nextRunAt.getHours() + 1)
          break
        case 'daily':
          nextRunAt.setDate(nextRunAt.getDate() + 1)
          break
        case 'weekly':
          nextRunAt.setDate(nextRunAt.getDate() + 7)
          break
        default:
          nextRunAt.setDate(nextRunAt.getDate() + 1)
      }

      updates.next_run_at = nextRunAt.toISOString()
    }

    const { data, error } = await supabase
      .from('scraping_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Scraping config not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, config: data })

  } catch (error: any) {
    console.error('Error updating scraping config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const id = params.id

    const { error } = await supabase
      .from('scraping_configs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting scraping config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
