import { NextRequest, NextResponse } from 'next/server'
import { actorsDB } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Use Supabase with all filters
    const result = await actorsDB.getAll({
      category,
      search,
      page,
      limit
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error fetching actors:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await request.json()

    // Create actor in Supabase
    const createdActor = await actorsDB.create(actor)

    return NextResponse.json({ success: true, actor: createdActor })

  } catch (error: any) {
    console.error('Error creating actor:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
