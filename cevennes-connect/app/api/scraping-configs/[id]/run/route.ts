import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import axios from 'axios'

export const dynamic = 'force-dynamic'

// Fonction pour convertir date texte en format standardisé
function parseDate(dateStr: string): string {
  if (!dateStr) return ''

  // Nettoyer les espaces
  let cleaned = dateStr.replace(/\s+/g, ' ').trim()

  // Mapping des mois français
  const mois: Record<string, string> = {
    'janvier': '01', 'jan': '01',
    'février': '02', 'fév': '02', 'fevrier': '02', 'fev': '02',
    'mars': '03', 'mar': '03',
    'avril': '04', 'avr': '04',
    'mai': '05',
    'juin': '06',
    'juillet': '07', 'juil': '07',
    'août': '08', 'aout': '08',
    'septembre': '09', 'sept': '09', 'sep': '09',
    'octobre': '10', 'oct': '10',
    'novembre': '11', 'nov': '11',
    'décembre': '12', 'déc': '12', 'dec': '12'
  }

  // Essayer d'extraire jour, mois, année
  const regex = /(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|fév|mar|avr|mai|juin|juil|août|sep|oct|nov|déc|fevrier|aout|dec)\.?\s*(\d{4})?/i
  const match = cleaned.match(regex)

  if (match) {
    const jour = match[1].padStart(2, '0')
    const moisNom = match[2].toLowerCase().replace('.', '')
    const moisNum = mois[moisNom] || '01'
    const annee = match[3] || '2025'

    return `${annee}-${moisNum}-${jour}`
  }

  // Si pas de match, retourner la date nettoyée
  return cleaned
}

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

    if (scrapedEvents.length === 0) {
      return NextResponse.json({
        success: true,
        eventsScraped: 0,
        eventsInserted: 0,
        duplicatesFound: 0,
        summary: 'No events found to scrape'
      })
    }

    // Use OpenAI to clean and structure the scraped data
    console.log('Calling OpenAI to structure scraped events...')
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant qui structure des données d'événements scrapés.
Ton job: extraire proprement le titre, la date, le lieu/adresse, et la description.
IMPORTANT: Pour chaque événement, trouve l'adresse ou la ville la plus précise possible (cherche les noms de ville, adresses, lieux dans le texte brut).
Si tu vois "Le Vigan", "Ganges", "Saint-Hippolyte", etc., utilise-le comme location.
Retourne UNIQUEMENT un JSON array valide, AUCUN texte avant ou après.`
        },
        {
          role: 'user',
          content: `Voici ${scrapedEvents.length} événements scrapés bruts. Nettoie et structure chaque événement en JSON avec les champs: title, date, location (ville ou adresse précise), description.\n\n${JSON.stringify(scrapedEvents, null, 2)}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    let cleanedEvents = scrapedEvents
    try {
      const aiContent = openaiResponse.data.choices[0].message.content
      const jsonMatch = aiContent.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        cleanedEvents = JSON.parse(jsonMatch[0])
        console.log(`OpenAI cleaned ${cleanedEvents.length} events`)
      }
    } catch (aiError) {
      console.error('OpenAI parsing error, using raw scraped data:', aiError)
      // Continue with original scraped data
    }

    // Geocode locations and prepare events for insertion
    const eventsToInsert = []
    for (const event of cleanedEvents) {
      let lat = null
      let lng = null
      let address = event.location || '30120 Le Vigan'

      // Try to geocode if location exists
      if (event.location && event.location.trim()) {
        try {
          const geocodeUrl = `${baseUrl}/api/geocode?address=${encodeURIComponent(event.location + ', Cévennes, France')}`
          const geoResponse = await axios.get(geocodeUrl)

          if (geoResponse.data.lat && geoResponse.data.lng) {
            lat = geoResponse.data.lat
            lng = geoResponse.data.lng
            address = geoResponse.data.formatted_address || event.location
          }
        } catch (geoError) {
          console.error('Geocoding error:', geoError)
          // Default to Ganges coordinates
          lat = 43.9339
          lng = 3.7086
        }
      } else {
        // No location, use default Ganges coordinates
        lat = 43.9339
        lng = 3.7086
      }

      // Parse date et time
      const parsedDate = parseDate(event.date || '')
      const timeMatch = event.date?.match(/(\d{1,2}):(\d{2})/)
      const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '14:00'

      eventsToInsert.push({
        scraping_config_id: parseInt(id),
        title: event.title || '',
        date: parsedDate || null,
        time: time,
        location: event.location || '',
        address: address,
        description: event.description || '',
        image: event.imageUrl || null,
        lat: lat,
        lng: lng,
        validated: false,
        rejected: false,
        is_duplicate: event.isDuplicate || false,
        duplicate_of: event.duplicateOf || null
      })
    }

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
