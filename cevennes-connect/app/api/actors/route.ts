import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'actors-data.json')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    const data = JSON.parse(fileContent)

    // Flatten all actors
    let allActors = [
      ...data.commerce.map((a: any) => ({ ...a, category: 'commerce' })),
      ...data.restaurant.map((a: any) => ({ ...a, category: 'restaurant' })),
      ...data.artisan.map((a: any) => ({ ...a, category: 'artisan' })),
      ...data.therapeute.map((a: any) => ({ ...a, category: 'therapeute' })),
      ...data.service.map((a: any) => ({ ...a, category: 'service' })),
      ...data.association.map((a: any) => ({ ...a, category: 'association' })),
    ]

    // Add unique IDs if not present
    allActors = allActors.map((actor, index) => ({
      ...actor,
      id: actor.id || `${actor.category}-${index}`
    }))

    // Filter by category
    if (category && category !== 'all') {
      allActors = allActors.filter((a: any) => a.category === category)
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      allActors = allActors.filter((a: any) =>
        a.name.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        (a.address && a.address.toLowerCase().includes(searchLower))
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedActors = allActors.slice(startIndex, endIndex)

    return NextResponse.json({
      actors: paginatedActors,
      total: allActors.length,
      page,
      limit,
      totalPages: Math.ceil(allActors.length / limit)
    })

  } catch (error: any) {
    console.error('Error fetching actors:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
