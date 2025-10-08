import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET single actor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch from GitHub raw file
    const response = await fetch('https://raw.githubusercontent.com/gaetanSimonot/cevennes-sud-website/main/cevennes-connect/public/data/actors-data.json')
    const data = await response.json()

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

    // Fetch current data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/gaetanSimonot/cevennes-sud-website/main/cevennes-connect/public/data/actors-data.json')
    const data = await response.json()

    // Find and update actor
    let found = false
    let oldCategory = ''
    let actorIndex = -1
    let oldActor: any = null

    for (const category of Object.keys(data)) {
      actorIndex = data[category].findIndex((a: any, index: number) => {
        const actorId = a.id || `${category}-${index}`
        return actorId === params.id
      })

      if (actorIndex !== -1) {
        oldCategory = category
        oldActor = data[category][actorIndex]
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
    const actorData = { ...oldActor, ...updates }

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

    // Commit to GitHub
    const commitResponse = await fetch(`${request.nextUrl.origin}/api/github-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: 'cevennes-connect/public/data/actors-data.json',
        content: JSON.stringify(data, null, 2),
        commitMessage: `✏️ Modification acteur: ${actorData.name}

📂 Catégorie: ${newCategory}${oldCategory !== newCategory ? ` (ancienne: ${oldCategory})` : ''}
Modifications:
${Object.keys(updates).map(key => `- ${key}: "${oldActor[key]}" → "${updates[key]}"`).join('\n')}

🤖 Generated with [Claude Code](https://claude.com/claude-code)`
      })
    })

    if (!commitResponse.ok) {
      const error = await commitResponse.json()
      throw new Error(error.error || 'GitHub commit failed')
    }

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
    // Fetch current data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/gaetanSimonot/cevennes-sud-website/main/cevennes-connect/public/data/actors-data.json')
    const data = await response.json()

    // Find and delete actor
    let found = false
    let deletedActor: any = null
    let deletedCategory = ''

    for (const category of Object.keys(data)) {
      const actorIndex = data[category].findIndex((a: any, index: number) => {
        const actorId = a.id || `${category}-${index}`
        return actorId === params.id
      })

      if (actorIndex !== -1) {
        deletedActor = data[category][actorIndex]
        deletedCategory = category
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

    // Commit to GitHub
    const commitResponse = await fetch(`${request.nextUrl.origin}/api/github-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: 'cevennes-connect/public/data/actors-data.json',
        content: JSON.stringify(data, null, 2),
        commitMessage: `🗑️ Suppression acteur: ${deletedActor.name}

📂 Catégorie: ${deletedCategory}
📍 Adresse: ${deletedActor.address}

🤖 Generated with [Claude Code](https://claude.com/claude-code)`
      })
    })

    if (!commitResponse.ok) {
      const error = await commitResponse.json()
      throw new Error(error.error || 'GitHub commit failed')
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting actor:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
