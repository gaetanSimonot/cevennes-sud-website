import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json()

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 })
    }

    // Call OpenAI to clean and structure the events
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en structuration d'événements culturels.

RÈGLES ABSOLUES:
1. TITLE: Nettoie et garde le titre exact
2. DATE: Convertis en format YYYY-MM-DD (ex: "9 octobre 2025" → "2025-10-09")
3. TIME: Extrais l'heure si présente, sinon "14:00"
4. LOCATION: Extrais la VRAIE ville/adresse (Florac, Chanac, Le Vigan, Ganges, etc.). Ne pas inventer.
5. ADDRESS: Adresse complète avec code postal si possible
6. CATEGORY: Choisis parmi festival, marche, culture, sport, atelier, theatre
   - Marché = "marche"
   - Concert/Expo/Cinéma = "culture"
   - Rando/Sport = "sport"
   - Atelier = "atelier"
   - Théâtre = "theatre"
7. DESCRIPTION: Résume en 1-2 phrases
8. PRICE, ORGANIZER, CONTACT, WEBSITE: Extrais si présent, sinon laisser vide
9. IMAGE: Garde l'URL de l'image

IMPORTANT: Si ${events.length} événements en entrée, retourne ${events.length} événements. N'en oublie AUCUN.

Retourne UNIQUEMENT un JSON array valide: [{"title":"...","category":"...","description":"...","date":"YYYY-MM-DD","time":"HH:MM","location":"ville","address":"...","price":"...","organizer":"...","contact":"...","website":"...","image":"..."}]`
        },
        {
          role: 'user',
          content: `Nettoie et structure ces ${events.length} événements. Trouve les VRAIES villes et catégories:\n\n${JSON.stringify(events, null, 2)}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const aiContent = openaiResponse.data.choices[0].message.content.trim()

    // Extract JSON from response
    const jsonMatch = aiContent.match(/\[\s*\{[\s\S]*\}\s*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
    }

    const cleanedEvents = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      events: cleanedEvents,
      count: cleanedEvents.length
    })

  } catch (error: any) {
    console.error('Error cleaning scraped events:', error)
    return NextResponse.json({
      error: error.message || 'Failed to clean events',
      details: error.response?.data || error
    }, { status: 500 })
  }
}
