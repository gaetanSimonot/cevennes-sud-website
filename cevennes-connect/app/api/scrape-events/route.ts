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

// Fonction pour nettoyer les textes scrapés
function cleanText(text: string): string {
  if (!text) return ''
  // Remplacer tous les espaces multiples, \n, \t par un seul espace
  let cleaned = text.replace(/\s+/g, ' ').trim()
  // Remplacer les guillemets typographiques par des guillemets simples
  cleaned = cleaned.replace(/[""]/g, "'")
  // Remplacer les guillemets doubles par des guillemets simples pour éviter les erreurs JSON
  cleaned = cleaned.replace(/"/g, "'")
  return cleaned
}

// Fonction pour valider un titre
function isValidTitle(title: string): boolean {
  if (!title || title.length < 4 || title.length > 200) return false

  // Filtrer les titres génériques ou vides
  const invalidTitles = [
    'vous aimerez',
    'voir plus',
    'en savoir plus',
    'cliquez ici',
    'lire la suite'
  ]

  const lowerTitle = title.toLowerCase()
  return !invalidTitles.some(invalid => lowerTitle.includes(invalid))
}

// Fonction pour extraire les liens d'événements depuis une page liste
async function extractEventLinks(url: string): Promise<string[]> {
  const links: string[] = []

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(data)
    const baseUrl = new URL(url)

    // Sélecteurs pour trouver les liens d'événements
    const linkSelectors = [
      'article a',
      '.event a',
      '.event-item a',
      '[class*="event"] a',
      '.agenda-item a',
      'a[href*="event"]',
      'a[href*="agenda"]',
      'a[href*="fiche"]'
    ]

    linkSelectors.forEach(selector => {
      $(selector).each((i, elem) => {
        let href = $(elem).attr('href')
        if (href) {
          // Convertir en URL absolue si nécessaire
          if (href.startsWith('/')) {
            href = `${baseUrl.protocol}//${baseUrl.host}${href}`
          } else if (!href.startsWith('http')) {
            href = `${baseUrl.protocol}//${baseUrl.host}/${href}`
          }

          // Éviter les doublons
          if (!links.includes(href) && href.includes(baseUrl.host)) {
            links.push(href)
          }
        }
      })
    })
  } catch (error) {
    console.error(`Error extracting links from ${url}:`, error)
  }

  return links.slice(0, 20) // Limiter à 20 liens max
}

// Fonction pour scraper une page de détail d'événement
async function scrapeEventDetail(url: string): Promise<ScrapedEvent | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(data)

    // Extraire tout le contenu pertinent
    const title = cleanText($('h1, h2, .event-title, [class*="title"]').first().text())
    const fullDescription = cleanText($('.description, .content, .event-description, [class*="description"], article p').text())
    const date = cleanText($('time, .date, [class*="date"]').first().text())
    const location = cleanText($('.location, .lieu, .address, [class*="lieu"], [class*="location"]').first().text())
    const imageUrl = $('img[class*="event"], .event-image img, article img').first().attr('src') || ''

    if (isValidTitle(title)) {
      return {
        title,
        date,
        location,
        description: fullDescription.substring(0, 1000), // Plus long pour page détail
        imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
        sourceUrl: url
      }
    }
  } catch (error) {
    console.error(`Error scraping detail ${url}:`, error)
  }

  return null
}

async function scrapeURL(url: string, deep: boolean = false): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []

  try {
    // Si deep scraping activé, extraire les liens et scraper chaque page
    if (deep) {
      console.log(`🔍 Deep scraping activé pour: ${url}`)
      const eventLinks = await extractEventLinks(url)
      console.log(`📋 ${eventLinks.length} liens d'événements trouvés`)

      for (const link of eventLinks) {
        const event = await scrapeEventDetail(link)
        if (event) {
          events.push(event)
        }
        // Pause pour éviter de surcharger le serveur
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      return events
    }

    // Sinon, scraping normal (surface)
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

        const title = cleanText($elem.find('h1, h2, h3, h4, .title, [class*="title"], [itemprop="name"]')
          .first()
          .text())

        const date = cleanText($elem.find('time, .date, [class*="date"], [itemprop="startDate"]')
          .first()
          .text() ||
          $elem.find('[datetime]').first().attr('datetime') || '')

        // Essayer de trouver la localisation avec plusieurs sélecteurs
        let location = cleanText($elem.find('.location, .lieu, .place, [class*="lieu"], [class*="location"], [itemprop="location"]')
          .first()
          .text())

        // Si pas trouvé, essayer avec address
        if (!location || location.length < 3) {
          location = cleanText($elem.find('.address, .adresse, [class*="address"], [class*="adresse"], [itemprop="address"]')
            .first()
            .text())
        }

        // Si toujours pas trouvé, chercher dans le texte des patterns de ville
        if (!location || location.length < 3) {
          const fullText = $elem.text()
          const cityMatch = fullText.match(/(Le Vigan|Ganges|Saint-Hippolyte|Sumène|Valleraugue|Lasalle|Saint-André-de-Valborgne|Saint-Jean-du-Gard|Anduze)/i)
          if (cityMatch) {
            location = cityMatch[0]
          }
        }

        const description = cleanText($elem.find('.description, .excerpt, .summary, p, [itemprop="description"]')
          .first()
          .text())

        const imageUrl = $elem.find('img')
          .first()
          .attr('src') || ''

        if (isValidTitle(title)) {
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
          const title = cleanText($elem.find('h1, h2, h3, h4').first().text())
          if (isValidTitle(title)) {
            const exists = events.some(e => e.title === title)
            if (!exists) {
              events.push({
                title,
                date: '',
                location: '',
                description: cleanText(text).substring(0, 300),
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
    const { url, urls, deep = false } = await request.json()

    // Support pour une seule URL ou plusieurs URLs
    const urlsToScrape = urls || (url ? [url] : [])

    if (urlsToScrape.length === 0) {
      return NextResponse.json({ error: 'At least one URL is required' }, { status: 400 })
    }

    console.log(`Scraping ${urlsToScrape.length} URL(s)... ${deep ? '(Deep mode 🔍)' : '(Surface mode)'}`)

    // Scraper toutes les URLs (en série si deep pour éviter surcharge)
    let results: ScrapedEvent[][] = []
    if (deep) {
      for (const u of urlsToScrape) {
        const events = await scrapeURL(u, true)
        results.push(events)
      }
    } else {
      const scrapePromises = urlsToScrape.map((u: string) => scrapeURL(u, false))
      results = await Promise.all(scrapePromises)
    }

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
