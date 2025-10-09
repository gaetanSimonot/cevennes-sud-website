import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET method - query params
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

    // Appeler l'API Google Geocoding
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const geocodeResponse = await fetch(geocodeUrl)
    const data = await geocodeResponse.json()

    console.log(`Geocoding: ${address}`)

    // Si succès, extraire lat/lng du premier résultat
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      const formattedAddress = data.results[0].formatted_address

      console.log(`✅ Geocoded: ${address} → ${location.lat}, ${location.lng}`)

      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: formattedAddress,
        status: 'OK'
      }, { status: 200 })
    }

    console.log(`❌ Geocoding failed for: ${address} - Status: ${data.status}`)

    // Retourner l'erreur Google
    return NextResponse.json({
      error: `Geocoding failed: ${data.status}`,
      status: data.status
    }, { status: 404 })

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

    // Appeler l'API Google Geocoding
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const geocodeResponse = await fetch(geocodeUrl)
    const data = await geocodeResponse.json()

    console.log(`Geocoding (POST): ${address}`)

    // Si succès, extraire lat/lng du premier résultat
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      const formattedAddress = data.results[0].formatted_address

      console.log(`✅ Geocoded: ${address} → ${location.lat}, ${location.lng}`)

      return NextResponse.json({
        lat: location.lat,
        lng: location.lng,
        formatted_address: formattedAddress,
        status: 'OK'
      }, { status: 200 })
    }

    console.log(`❌ Geocoding failed for: ${address} - Status: ${data.status}`)

    // Retourner l'erreur Google
    return NextResponse.json({
      error: `Geocoding failed: ${data.status}`,
      status: data.status
    }, { status: 404 })

  } catch (error: any) {
    console.error('Geocoding Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
