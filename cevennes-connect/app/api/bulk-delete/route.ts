import { NextRequest, NextResponse } from 'next/server'
import { actorsDB, eventsDB } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { type, ids } = await request.json()

    if (!type || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      )
    }

    if (type === 'actors') {
      const deletedCount = await actorsDB.bulkDelete(ids)

      return NextResponse.json({
        success: true,
        deletedCount
      })

    } else if (type === 'events') {
      const idsToDelete = ids.map((id: any) => parseInt(id))
      const deletedCount = await eventsDB.bulkDelete(idsToDelete)

      return NextResponse.json({
        success: true,
        deletedCount
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Error bulk delete:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
