import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('scraping_configs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ configs: data || [] })

  } catch (error: any) {
    console.error('Error fetching scraping configs:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, frequency } = body

    if (!name || !url || !frequency) {
      return NextResponse.json(
        { error: 'Name, URL and frequency are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Calculate next_run_at based on frequency
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

    const { data, error } = await supabase
      .from('scraping_configs')
      .insert([{
        name,
        url,
        frequency,
        active: true,
        next_run_at: nextRunAt.toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, config: data })

  } catch (error: any) {
    console.error('Error creating scraping config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
