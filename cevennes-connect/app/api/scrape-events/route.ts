import axios from 'axios'
import * as cheerio from 'cheerio'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ScrapedEvent {
  title: string
  date: string
  location: string
  description: string
  imageUrl?: string
  sourceUrl: string
  isDuplicate?: boolean
  duplicateOf?: number
}

async function scrapeURL(url: string): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(data)

    const selectors = [
      'article',
      '.event',
      '.event-item',
      '[class*="event"]',
      '[itemtype*="Event"]',
      '.agenda-item',
      '[class*="agenda"]'
    ]

    selectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const $elem = $(elem)

        const title = $elem.find('h1, h2, h3, h4, .title, [class*="title"], [itemprop="name"]')
          .first()
          .text()
          .trim()

        const date = $elem.find('time, .date, [class*="date"], [itemprop="startDate"]')
          .first()
          .text()
          .trim() ||
          $elem.find('[datetime]').first().attr('datetime') || ''

        const location = $elem.find('.location, .lieu, .place, [class*="lieu"], [class*="location"], [itemprop="location"]')
          .first()
          .text()
          .trim()

        const description = $elem.find('.description, .excerpt, .summary, p, [itemprop="description"]')
          .first()
          .text()
          .trim()

        const imageUrl = $elem.find('img')
          .first()
          .attr('src') || ''

        if (title && title.length > 3) {
          const exists = events.some(e => e.title === title && e.date === date)
          if (!exists) {
            events.push({
              title,
              date,
              location,
              description: description.substring(0, 500),
              imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
              sourceUrl: url
            })
          }
        }
      })
    })

    // Fallback pour sites sans structure événementielle
    if (events.length === 0) {
      $('div, section').each((i, elem) => {
        const $elem = $(elem)
        const text = $elem.text()

        if (text.match(/(concert|festival|exposition|spectacle|atelier|conférence|marché)/i)) {
          const title = $elem.find('h1, h2, h3, h4').first().text().trim()
          if (title && title.length > 3 && title.length < 200) {
            const exists = events.some(e => e.title === title)
            if (!exists) {
              events.push({
                title,
                date: '',
                location: '',
                description: text.substring(0, 300).trim(),
                imageUrl: $elem.find('img').first().attr('src'),
                sourceUrl: url
              })
            }
          }
        }
      })
    }
  } catch (error: any) {
    console.error(`Error scraping ${url}:`, error.message)
  }

  return events.slice(0, 50)
}

interface ExistingEvent {
  id: number
  title: string
  date: string
  location: string | null
  address: string | null
}

async function checkDuplicates(events: ScrapedEvent[]): Promise<ScrapedEvent[]> {
  try {
    // Récupérer tous les événements existants depuis Supabase
    const { data: existingEvents } = await supabase
      .from('events')
      .select('id, title, date, location, address')

    if (!existingEvents) return events

    // Marquer les doublons
    return events.map(event => {
      const duplicate = existingEvents.find((existing: ExistingEvent) => {
        const titleMatch = existing.title.toLowerCase().trim() === event.title.toLowerCase().trim()
        const dateMatch = existing.date === event.date
        const locationMatch =
          existing.location?.toLowerCase().includes(event.location.toLowerCase()) ||
          existing.address?.toLowerCase().includes(event.location.toLowerCase())

        return titleMatch && (dateMatch || locationMatch)
      })

      if (duplicate) {
        return {
          ...event,
          isDuplicate: true,
          duplicateOf: duplicate.id
        }
      }

      return event
    })
  } catch (error) {
    console.error('Error checking duplicates:', error)
    return events
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, urls } = await request.json()

    // Support pour une seule URL ou plusieurs URLs
    const urlsToScrape = urls || (url ? [url] : [])

    if (urlsToScrape.length === 0) {
      return NextResponse.json({ error: 'At least one URL is required' }, { status: 400 })
    }

    console.log(`Scraping ${urlsToScrape.length} URL(s)...`)

    // Scraper toutes les URLs en parallèle
    const scrapePromises = urlsToScrape.map((u: string) => scrapeURL(u))
    const results = await Promise.all(scrapePromises)

    // Fusionner tous les événements
    let allEvents = results.flat()

    // Éliminer les doublons internes (entre URLs scrapées)
    const seen = new Set<string>()
    allEvents = allEvents.filter(event => {
      const key = `${event.title}-${event.date}-${event.location}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Vérifier les doublons avec la base de données
    allEvents = await checkDuplicates(allEvents)

    const duplicatesCount = allEvents.filter(e => e.isDuplicate).length
    const newEventsCount = allEvents.filter(e => !e.isDuplicate).length

    return NextResponse.json({
      events: allEvents,
      count: allEvents.length,
      urls: urlsToScrape,
      duplicatesCount,
      newEventsCount,
      summary: `${allEvents.length} événements détectés (${newEventsCount} nouveaux, ${duplicatesCount} doublons)`
    })

  } catch (error: any) {
    console.error('Scraping error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to scrape events',
      details: error.code
    }, { status: 500 })
  }
}
