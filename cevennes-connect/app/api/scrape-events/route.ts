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

// Fonction pour scraper une page de détail d'événement avec OpenAI
async function scrapeEventDetail(url: string): Promise<ScrapedEvent | null> {
  try {
    const { data: htmlContent } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    // Utiliser OpenAI pour extraire l'événement intelligemment
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en extraction d'événements depuis du HTML.

RÈGLES ABSOLUES:
1. IGNORE les menus, navigation, footer, sidebar
2. CONCENTRE-TOI uniquement sur le contenu principal de l'événement
3. TITLE: Titre exact de l'événement
4. DATE: Format "9 octobre 2025" ou "Du 9 au 12 octobre"
5. LOCATION: NOM EXACT de la ville/commune (Florac, Ganges, Le Vigan, etc.)
   - Si pas de ville précise, laisse VIDE ""
   - Ne JAMAIS mettre "Cévennes", "Gard", "France"
6. DESCRIPTION: Description complète de l'événement (max 500 caractères)
7. IMAGE: URL de l'image principale

Si c'est une page de menu/navigation/liste sans événement unique, retourne: {"valid": false}

Retourne UNIQUEMENT un JSON valide:
{"valid": true, "title": "...", "date": "...", "location": "ville_exacte_ou_vide", "description": "...", "imageUrl": "..."}`
        },
        {
          role: 'user',
          content: `Extrais l'événement de cette page HTML. Ignore les menus et navigation:\n\n${htmlContent.substring(0, 30000)}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const aiContent = openaiResponse.data.choices[0].message.content.trim()
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0])

      if (extracted.valid === false) {
        console.log(`Skipped (not an event page): ${url}`)
        return null
      }

      if (extracted.title && isValidTitle(extracted.title)) {
        return {
          title: extracted.title,
          date: extracted.date || '',
          location: extracted.location || '',
          description: extracted.description || '',
          imageUrl: extracted.imageUrl || undefined,
          sourceUrl: url
        }
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

      // Collecter tous les HTMLs d'abord (sans appeler OpenAI)
      const htmlPages: { url: string; html: string }[] = []
      for (const link of eventLinks) {
        try {
          const { data: htmlContent } = await axios.get(link, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
          })
          htmlPages.push({ url: link, html: htmlContent.substring(0, 15000) })
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.error(`Failed to fetch ${link}`)
        }
      }

      // Un seul appel OpenAI pour tous les événements (batch)
      if (htmlPages.length > 0) {
        console.log(`🤖 Extraction batch de ${htmlPages.length} pages avec OpenAI...`)

        try {
          const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4-turbo',
            temperature: 0,
            messages: [
              {
                role: 'system',
                content: `Tu es un expert en extraction d'événements depuis du HTML.

RÈGLES:
1. IGNORE menus, navigation, footer, sidebar
2. Pour CHAQUE page HTML, extrais l'événement principal
3. TITLE: Titre exact de l'événement
4. DATE: Format "9 octobre 2025" ou "Du 9 au 12 octobre"
5. LOCATION: NOM EXACT de la ville (Florac, Ganges, Le Vigan, etc.) OU vide ""
6. DESCRIPTION: Description complète (max 500 caractères)

Retourne un JSON array avec UN événement par page:
[{"title":"...","date":"...","location":"...","description":"...","imageUrl":"..."}]

Si une page n'est pas un événement, omets-la du résultat.`
              },
              {
                role: 'user',
                content: `Extrais les événements de ces ${htmlPages.length} pages HTML:\n\n${htmlPages.map((p, i) => `PAGE ${i + 1} (${p.url}):\n${p.html}\n\n---\n\n`).join('')}`
              }
            ]
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          })

          const aiContent = openaiResponse.data.choices[0].message.content.trim()
          const jsonMatch = aiContent.match(/\[\s*\{[\s\S]*\}\s*\]/)

          if (jsonMatch) {
            const extracted = JSON.parse(jsonMatch[0])
            extracted.forEach((event: any, index: number) => {
              if (event.title && isValidTitle(event.title)) {
                events.push({
                  title: event.title,
                  date: event.date || '',
                  location: event.location || '',
                  description: event.description || '',
                  imageUrl: event.imageUrl || undefined,
                  sourceUrl: htmlPages[index]?.url || url
                })
              }
            })
            console.log(`✅ ${events.length} événements extraits en batch`)
          }
        } catch (error) {
          console.error('OpenAI batch error:', error)
        }
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
