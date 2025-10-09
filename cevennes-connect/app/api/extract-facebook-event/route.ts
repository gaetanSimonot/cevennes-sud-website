import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic'

// Limite de payload pour éviter erreur 413
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { html, url } = await request.json()

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 })
    }

    console.log(`Extracting Facebook event from URL: ${url}`)
    console.log(`HTML size: ${html.length} characters`)

    // Call OpenAI to extract event details
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en extraction d'événements depuis des pages Facebook.

RÈGLES ABSOLUES:
1. TITLE: Titre exact de l'événement
2. DATE: Format YYYY-MM-DD (ex: "9 octobre 2025" → "2025-10-09")
3. TIME: Heure de début au format HH:MM (24h)
4. END_TIME: Heure de fin si mentionnée
5. LOCATION: Nom du lieu OU ville précise (ex: "Salle des fêtes, Ganges" ou "Ganges")
   - Si nom de ville trouvé, l'extraire
   - Si pas de ville, laisser juste le nom du lieu
6. ADDRESS: Adresse complète si disponible
7. DESCRIPTION: Description complète de l'événement (max 800 caractères)
8. ORGANIZER: Nom de l'organisateur/créateur de l'événement
9. PRICE: Prix (ex: "Gratuit", "10€", "À partir de 5€")
10. CATEGORY: Déterminer parmi: festival, marche, culture, sport, atelier, theatre
11. CONTACT: Email ou téléphone si mentionné
12. IMAGE: URL de l'image principale de l'événement

IMPORTANT: Extrais TOUTES les informations disponibles dans le HTML.

Retourne UNIQUEMENT un JSON valide:
{"title":"...","date":"YYYY-MM-DD","time":"HH:MM","endTime":"HH:MM","location":"...","address":"...","description":"...","organizer":"...","price":"...","category":"...","contact":"...","image":"..."}`
        },
        {
          role: 'user',
          content: `Extrais TOUTES les informations de cet événement Facebook:\n\n${html.substring(0, 15000)}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    const aiContent = openaiResponse.data.choices[0].message.content.trim()

    // Extract JSON from response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
    }

    const extractedEvent = JSON.parse(jsonMatch[0])

    // Add source URL
    extractedEvent.website = url
    extractedEvent.sourceUrl = url

    console.log(`✅ Event extracted: ${extractedEvent.title}`)

    return NextResponse.json({
      success: true,
      event: extractedEvent
    })

  } catch (error: any) {
    console.error('Error extracting Facebook event:', error.message)
    return NextResponse.json({
      error: 'Failed to extract event',
      details: error.response?.data || error.message
    }, { status: 500 })
  }
}
