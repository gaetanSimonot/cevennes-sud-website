import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
    console.log('🗺️ [Geocode GET] GOOGLE_MAPS_API_KEY present:', !!GOOGLE_MAPS_API_KEY)

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured on server' },
        { status: 500 }
      )
    }

    const address = req.nextUrl.searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      )
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const geocodeResponse = await fetch(geocodeUrl)
    const data = await geocodeResponse.json()

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Geocoding Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
    console.log('🗺️ [Geocode POST] GOOGLE_MAPS_API_KEY present:', !!GOOGLE_MAPS_API_KEY)

    const body = await req.json()
    console.log('📦 Body reçu:', body)

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured on server' },
        { status: 500 }
      )
    }

    const { address } = body

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      )
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const geocodeResponse = await fetch(geocodeUrl)
    const data = await geocodeResponse.json()

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Geocoding Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
