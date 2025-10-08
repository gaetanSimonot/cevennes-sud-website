import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyBe9S2a8Afc67NtS9UmvEwOoLt3BFne0eI'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { location, radius, keyword } = body

    if (!location || !radius) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Call Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${keyword}&key=${GOOGLE_PLACES_API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Google Places API request failed')
    }

    const data = await response.json()

    // Get place details for each result to get more info
    const detailedResults = await Promise.all(
      (data.results || []).slice(0, 20).map(async (place: any) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,geometry,rating,formatted_phone_number,website,types&key=${GOOGLE_PLACES_API_KEY}`
          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()
          return detailsData.result || place
        } catch (error) {
          return place
        }
      })
    )

    return NextResponse.json({ results: detailedResults })

  } catch (error: any) {
    console.error('Google Places API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
