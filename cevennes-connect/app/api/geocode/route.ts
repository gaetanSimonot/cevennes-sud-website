import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET method - query params
// Fonction pour calculer la distance entre deux coordonnées GPS (formule de Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(req: NextRequest) {
  try {
    // Récupérer la clé API depuis les variables d'environnement
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured on server. Please add GOOGLE_MAPS_API_KEY in Vercel Environment Variables.' },
        { status: 500 }
      )
    }

    // Récupérer l'adresse depuis les query params
    const address = req.nextUrl.searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      )
    }

    // Centre de référence: Ganges
    const GANGES_LAT = 43.9339
    const GANGES_LNG = 3.7086
    const MAX_DISTANCE_KM = 50

    // Appeler l'API Google Geocoding avec bias vers les Cévennes
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=fr&bounds=43.7,3.5|44.2,4.0&key=${GOOGLE_MAPS_API_KEY}`

    const geocodeResponse = await fetch(geocodeUrl)
    const data = await geocodeResponse.json()

    console.log(`Geocoding: ${address}`)

    // Si succès, extraire lat/lng du premier résultat et vérifier la distance
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      const formattedAddress = data.results[0].formatted_address

      // Calculer la distance depuis Ganges
      const distance = calculateDistance(GANGES_LAT, GANGES_LNG, location.lat, location.lng)

      if (distance > MAX_DISTANCE_KM) {
        console.log(`⚠️ Lieu trop éloigné: ${address} → ${distance.toFixed(1)}km de Ganges (max ${MAX_DISTANCE_KM}km)`)
        // Retourner Ganges par défaut
        return NextResponse.json({
          lat: GANGES_LAT,
          lng: GANGES_LNG,
          formatted_address: 'Ganges, France (lieu trop éloigné)',
          status: 'OUT_OF_RANGE',
          distance: distance
        }, { status: 200 })
      }

      console.log(`✅ Geocoded: ${address} → ${location.lat}, ${location.lng} (${distance.toFixed(1)}km de Ganges)`)

      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: formattedAddress,
        status: 'OK',
        distance: distance
      }, { status: 200 })
    }

    console.log(`❌ Geocoding failed for: ${address} - Status: ${data.status}`)

    // Retourner Ganges par défaut
    return NextResponse.json({
      lat: GANGES_LAT,
      lng: GANGES_LNG,
      formatted_address: 'Ganges, France (géocodage échoué)',
      status: data.status
    }, { status: 200 })

  } catch (error: any) {
    console.error('Geocoding Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// POST method - body
export async function POST(req: NextRequest) {
  try {
    // Récupérer la clé API depuis les variables d'environnement
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured on server. Please add GOOGLE_MAPS_API_KEY in Vercel Environment Variables.' },
        { status: 500 }
      )
    }

    // Récupérer l'adresse depuis le body
    const body = await req.json()
    const address = body.address

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      )
    }

    // Centre de référence: Ganges
    const GANGES_LAT = 43.9339
    const GANGES_LNG = 3.7086
    const MAX_DISTANCE_KM = 50

    // Appeler l'API Google Geocoding avec bias vers les Cévennes
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=fr&bounds=43.7,3.5|44.2,4.0&key=${GOOGLE_MAPS_API_KEY}`

    const geocodeResponse = await fetch(geocodeUrl)
    const data = await geocodeResponse.json()

    console.log(`Geocoding (POST): ${address}`)

    // Si succès, extraire lat/lng du premier résultat et vérifier la distance
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      const formattedAddress = data.results[0].formatted_address

      // Calculer la distance depuis Ganges
      const distance = calculateDistance(GANGES_LAT, GANGES_LNG, location.lat, location.lng)

      if (distance > MAX_DISTANCE_KM) {
        console.log(`⚠️ Lieu trop éloigné: ${address} → ${distance.toFixed(1)}km de Ganges (max ${MAX_DISTANCE_KM}km)`)
        // Retourner Ganges par défaut
        return NextResponse.json({
          lat: GANGES_LAT,
          lng: GANGES_LNG,
          formatted_address: 'Ganges, France (lieu trop éloigné)',
          status: 'OUT_OF_RANGE',
          distance: distance
        }, { status: 200 })
      }

      console.log(`✅ Geocoded: ${address} → ${location.lat}, ${location.lng} (${distance.toFixed(1)}km de Ganges)`)

      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: formattedAddress,
        status: 'OK',
        distance: distance
      }, { status: 200 })
    }

    console.log(`❌ Geocoding failed for: ${address} - Status: ${data.status}`)

    // Retourner Ganges par défaut
    return NextResponse.json({
      lat: GANGES_LAT,
      lng: GANGES_LNG,
      formatted_address: 'Ganges, France (géocodage échoué)',
      status: data.status
    }, { status: 200 })

  } catch (error: any) {
    console.error('Geocoding Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
