import { NextRequest, NextResponse } from 'next/server'
import { actorsDB } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET single actor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await actorsDB.getOne(params.id)

    if (!actor) {
      return NextResponse.json(
        { error: 'Actor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ actor })

  } catch (error: any) {
    console.error('Error fetching actor:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update actor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    // Update in Supabase
    const updatedActor = await actorsDB.update(params.id, updates)

    return NextResponse.json({ success: true, actor: updatedActor })

  } catch (error: any) {
    console.error('Error updating actor:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE actor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await actorsDB.delete(params.id)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting actor:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
