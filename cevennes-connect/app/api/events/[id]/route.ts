import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch from GitHub raw file (always up to date)
    const response = await fetch('https://raw.githubusercontent.com/gaetanSimonot/cevennes-sud-website/main/cevennes-connect/public/data/events-data.json')
    const events = await response.json()

    const event = events.find((e: any) => e.id === parseInt(params.id))

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })

  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    // Fetch current data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/gaetanSimonot/cevennes-sud-website/main/cevennes-connect/public/data/events-data.json')
    const events = await response.json()

    const eventIndex = events.findIndex((e: any) => e.id === parseInt(params.id))

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const oldEvent = events[eventIndex]

    // Update event
    events[eventIndex] = { ...events[eventIndex], ...updates }
    const updatedEvent = events[eventIndex]

    // Commit to GitHub
    const commitResponse = await fetch(`${request.nextUrl.origin}/api/github-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: 'cevennes-connect/public/data/events-data.json',
        content: JSON.stringify(events, null, 2),
        commitMessage: `✏️ Modification événement: ${updatedEvent.title}

Modifications:
${Object.keys(updates).map(key => `- ${key}: "${oldEvent[key]}" → "${updates[key]}"`).join('\n')}

🤖 Generated with [Claude Code](https://claude.com/claude-code)`
      })
    })

    if (!commitResponse.ok) {
      const error = await commitResponse.json()
      throw new Error(error.error || 'GitHub commit failed')
    }

    return NextResponse.json({ success: true, event: updatedEvent })

  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch current data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/gaetanSimonot/cevennes-sud-website/main/cevennes-connect/public/data/events-data.json')
    let events = await response.json()

    const eventIndex = events.findIndex((e: any) => e.id === parseInt(params.id))

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const deletedEvent = events[eventIndex]

    // Remove event
    events.splice(eventIndex, 1)

    // Commit to GitHub
    const commitResponse = await fetch(`${request.nextUrl.origin}/api/github-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: 'cevennes-connect/public/data/events-data.json',
        content: JSON.stringify(events, null, 2),
        commitMessage: `🗑️ Suppression événement: ${deletedEvent.title}

📅 Date: ${deletedEvent.date}
📍 Lieu: ${deletedEvent.location || deletedEvent.address}

🤖 Generated with [Claude Code](https://claude.com/claude-code)`
      })
    })

    if (!commitResponse.ok) {
      const error = await commitResponse.json()
      throw new Error(error.error || 'GitHub commit failed')
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
