import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import axios from 'axios'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const id = params.id

    // Get the scraping config
    const { data: config, error: configError } = await supabase
      .from('scraping_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (configError) throw configError

    if (!config) {
      return NextResponse.json(
        { error: 'Scraping config not found' },
        { status: 404 }
      )
    }

    // Call the scrape-events API
    const baseUrl = request.url.split('/api/')[0]
    const scrapeResponse = await axios.post(`${baseUrl}/api/scrape-events`, {
      url: config.url
    })

    const scrapedEvents = scrapeResponse.data.events || []

    // Store results in scraped_events_pending table
    const eventsToInsert = scrapedEvents.map((event: any) => ({
      scraping_config_id: parseInt(id),
      title: event.title || '',
      date: event.date || null,
      location: event.location || '',
      description: event.description || '',
      image: event.imageUrl || null,
      source_url: event.sourceUrl || config.url,
      validated: false,
      rejected: false,
      is_duplicate: event.isDuplicate || false,
      duplicate_of: event.duplicateOf || null
    }))

    // Insert events if any were scraped
    let insertedCount = 0
    if (eventsToInsert.length > 0) {
      const { data: insertedEvents, error: insertError } = await supabase
        .from('scraped_events_pending')
        .insert(eventsToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting scraped events:', insertError)
        // Continue anyway to update the config
      } else {
        insertedCount = insertedEvents?.length || 0
      }
    }

    // Update scraping config with last_run_at and next_run_at
    const now = new Date()
    const nextRunAt = new Date(now)

    switch (config.frequency) {
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

    await supabase
      .from('scraping_configs')
      .update({
        last_run_at: now.toISOString(),
        next_run_at: nextRunAt.toISOString()
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      eventsScraped: scrapedEvents.length,
      eventsInserted: insertedCount,
      duplicatesFound: scrapedEvents.filter((e: any) => e.isDuplicate).length,
      summary: `${scrapedEvents.length} events scraped, ${insertedCount} stored in pending table`
    })

  } catch (error: any) {
    console.error('Error running scraping:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
