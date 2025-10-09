import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const configId = searchParams.get('configId')

    const supabase = getSupabaseAdmin()

    // Build query - only get events that are not validated and not rejected
    let query = supabase
      .from('scraped_events_pending')
      .select('*, scraping_configs(name, url)', { count: 'exact' })
      .eq('validated', false)
      .eq('rejected', false)

    // Filter by config ID if provided
    if (configId) {
      query = query.eq('scraping_config_id', parseInt(configId))
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      events: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error: any) {
    console.error('Error fetching pending events:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
