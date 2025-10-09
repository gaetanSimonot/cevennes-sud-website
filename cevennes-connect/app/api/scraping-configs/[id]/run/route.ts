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

    // Fetch the HTML content directly
    const baseUrl = request.url.split('/api/')[0]
    const htmlResponse = await axios.get(config.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    })

    const htmlContent = htmlResponse.data

    // Use OpenAI to extract events directly from HTML
    console.log('Calling OpenAI to extract events from HTML...')
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en extraction d'événements depuis du HTML.

RÈGLES ABSOLUES:
1. TITLE: Extrait le titre exact de l'événement
2. DATE: Format "9 octobre 2025" ou "Du 9 au 12 octobre" ou "Jeudi 9 octobre à 14h00"
3. LOCATION: Cherche la VRAIE ville/adresse dans le HTML (Florac, Chanac, Le Pompidou, Saint-Étienne-Vallée-Française, Massegros, etc.). NE JAMAIS inventer. Si pas trouvé, laisser vide.
4. CATEGORY: Analyse le type et choisis: festival, marche, culture, sport, atelier, theatre
   - Marché, marché de producteurs = "marche"
   - Concert, cinéma, exposition, conférence = "culture"
   - Randonnée, pétanque = "sport"
   - Atelier = "atelier"
   - Théâtre = "theatre"
5. DESCRIPTION: Résume brièvement (1 phrase)
6. IMAGE: URL complète de l'image

IMPORTANT: N'extrais QUE les vrais événements. Ignore les éléments de navigation, menus, etc.

Retourne UNIQUEMENT un JSON array: [{"title":"...","date":"...","location":"ville","category":"...","description":"...","imageUrl":"..."}]`
        },
        {
          role: 'user',
          content: `Extrais TOUS les événements de ce HTML. Pour chaque événement, trouve la VRAIE ville/commune mentionnée dans le HTML (cherche bien!):\n\n${htmlContent.substring(0, 50000)}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    let cleanedEvents = []
    try {
      const aiContent = openaiResponse.data.choices[0].message.content
      const jsonMatch = aiContent.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        cleanedEvents = JSON.parse(jsonMatch[0])
        console.log(`OpenAI extracted ${cleanedEvents.length} events from HTML`)
      }
    } catch (aiError) {
      console.error('OpenAI parsing error:', aiError)
      return NextResponse.json({
        error: 'Failed to extract events with AI',
        details: aiError
      }, { status: 500 })
    }

    if (cleanedEvents.length === 0) {
      return NextResponse.json({
        success: true,
        eventsScraped: 0,
        eventsInserted: 0,
        duplicatesFound: 0,
        summary: 'No events found by AI'
      })
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

      // Valider la catégorie
      const validCategories = ['festival', 'marche', 'culture', 'sport', 'atelier', 'theatre']
      const category = validCategories.includes(event.category) ? event.category : 'culture'

      eventsToInsert.push({
        scraping_config_id: parseInt(id),
        title: event.title || '',
        category: category,
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
