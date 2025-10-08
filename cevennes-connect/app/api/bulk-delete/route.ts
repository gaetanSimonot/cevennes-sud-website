import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
      const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'actors-data.json')
      const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
      const data = JSON.parse(fileContent)

      let deletedCount = 0

      // Delete each actor
      for (const id of ids) {
        for (const category of Object.keys(data)) {
          const actorIndex = data[category].findIndex((a: any, index: number) => {
            const actorId = a.id || `${category}-${index}`
            return actorId === id
          })

          if (actorIndex !== -1) {
            data[category].splice(actorIndex, 1)
            deletedCount++
            break
          }
        }
      }

      // Save
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))

      return NextResponse.json({
        success: true,
        deletedCount
      })

    } else if (type === 'events') {
      const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'events-data.json')
      const fileContent = fs.readFileSync(DATA_PATH, 'utf-8')
      let events = JSON.parse(fileContent)

      const idsToDelete = ids.map((id: any) => parseInt(id))
      const initialLength = events.length
      events = events.filter((e: any) => !idsToDelete.includes(e.id))
      const deletedCount = initialLength - events.length

      // Save
      fs.writeFileSync(DATA_PATH, JSON.stringify(events, null, 2))

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
