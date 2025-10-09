import axios from 'axios'
import * as cheerio from 'cheerio'
import { NextRequest, NextResponse } from 'next/server'

interface ScrapedEvent {
  title: string
  date: string
  location: string
  description: string
  imageUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch la page avec headers pour éviter les blocages
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(data)
    const events: ScrapedEvent[] = []

    // Stratégie de scraping multi-sélecteurs pour détecter différentes structures
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

        // Extraire le titre
        const title = $elem.find('h1, h2, h3, h4, .title, [class*="title"], [itemprop="name"]')
          .first()
          .text()
          .trim()

        // Extraire la date
        const date = $elem.find('time, .date, [class*="date"], [itemprop="startDate"]')
          .first()
          .text()
          .trim() ||
          $elem.find('[datetime]').first().attr('datetime') || ''

        // Extraire le lieu
        const location = $elem.find('.location, .lieu, .place, [class*="lieu"], [class*="location"], [itemprop="location"]')
          .first()
          .text()
          .trim()

        // Extraire la description
        const description = $elem.find('.description, .excerpt, .summary, p, [itemprop="description"]')
          .first()
          .text()
          .trim()

        // Extraire l'image
        const imageUrl = $elem.find('img')
          .first()
          .attr('src') || ''

        // Ajouter uniquement si on a au moins un titre
        if (title && title.length > 3) {
          // Éviter les doublons
          const exists = events.some(e => e.title === title && e.date === date)
          if (!exists) {
            events.push({
              title,
              date,
              location,
              description: description.substring(0, 500), // Limiter la longueur
              imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined
            })
          }
        }
      })
    })

    // Si aucun événement trouvé avec les sélecteurs spécifiques, essayer une approche plus générique
    if (events.length === 0) {
      $('div, section').each((i, elem) => {
        const $elem = $(elem)
        const text = $elem.text()

        // Heuristique : chercher des blocs contenant des mots-clés d'événement
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
                imageUrl: $elem.find('img').first().attr('src')
              })
            }
          }
        }
      })
    }

    return NextResponse.json({
      events: events.slice(0, 50), // Limiter à 50 événements max
      count: events.length,
      url
    })

  } catch (error: any) {
    console.error('Scraping error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to scrape events',
      details: error.code
    }, { status: 500 })
  }
}
