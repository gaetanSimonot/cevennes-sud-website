import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'actors-data.json')

// GET single actor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    const data = JSON.parse(fileContent)

    // Find actor across all categories
    for (const category of Object.keys(data)) {
      const actorIndex = data[category].findIndex((a: any, index: number) => {
        const actorId = a.id || `${category}-${index}`
        return actorId === params.id
      })

      if (actorIndex !== -1) {
        return NextResponse.json({
          actor: {
            ...data[category][actorIndex],
            id: params.id,
            category
          }
        })
      }
    }

    return NextResponse.json(
      { error: 'Actor not found' },
      { status: 404 }
    )

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
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    const data = JSON.parse(fileContent)

    // Find and update actor
    let found = false
    let oldCategory = ''
    let actorIndex = -1

    for (const category of Object.keys(data)) {
      actorIndex = data[category].findIndex((a: any, index: number) => {
        const actorId = a.id || `${category}-${index}`
        return actorId === params.id
      })

      if (actorIndex !== -1) {
        oldCategory = category
        found = true
        break
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: 'Actor not found' },
        { status: 404 }
      )
    }

    // If category changed, move actor
    const newCategory = updates.category || oldCategory
    const actorData = { ...data[oldCategory][actorIndex], ...updates }

    if (newCategory !== oldCategory) {
      // Remove from old category
      data[oldCategory].splice(actorIndex, 1)
      // Add to new category
      if (!data[newCategory]) {
        data[newCategory] = []
      }
      data[newCategory].push(actorData)
    } else {
      // Update in same category
      data[oldCategory][actorIndex] = actorData
    }

    // Save
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true, actor: actorData })

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
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
    const data = JSON.parse(fileContent)

    // Find and delete actor
    let found = false

    for (const category of Object.keys(data)) {
      const actorIndex = data[category].findIndex((a: any, index: number) => {
        const actorId = a.id || `${category}-${index}`
        return actorId === params.id
      })

      if (actorIndex !== -1) {
        data[category].splice(actorIndex, 1)
        found = true
        break
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: 'Actor not found' },
        { status: 404 }
      )
    }

    // Save
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting actor:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
