import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const GITHUB_REPO = process.env.GITHUB_REPO || 'gaetanSimonot/cevennes-sud-website'

    if (!GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN not configured')
      return NextResponse.json(
        { error: 'GitHub token not configured on server. Please set GITHUB_TOKEN in environment variables.' },
        { status: 500 }
      )
    }

    console.log(`🔧 Using GitHub repo: ${GITHUB_REPO}`)

    const { filePath, content, commitMessage } = await req.json()

    if (!filePath || !content || !commitMessage) {
      return NextResponse.json(
        { error: 'Missing required parameters: filePath, content, or commitMessage' },
        { status: 400 }
      )
    }

    // Étape 1: Récupérer le SHA du fichier existant
    const getFileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`
    console.log(`📂 Fetching file: ${filePath}`)

    let fileSha: string | null = null
    try {
      const getResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cevennes-Connect-App'
        }
      })

      if (getResponse.ok) {
        const fileData = await getResponse.json()
        fileSha = fileData.sha
        console.log(`✅ File exists, SHA: ${fileSha}`)
      } else {
        console.log(`⚠️ File does not exist (${getResponse.status}), will create new file`)
      }
    } catch (error) {
      console.log('⚠️ Error fetching file, will create new file:', error)
    }

    // Étape 2: Encoder le contenu en base64
    const contentBase64 = Buffer.from(content).toString('base64')

    // Étape 3: Créer ou mettre à jour le fichier
    const commitPayload: any = {
      message: commitMessage,
      content: contentBase64,
      branch: 'main'
    }

    if (fileSha) {
      commitPayload.sha = fileSha
    }

    const commitResponse = await fetch(getFileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Cevennes-Connect-App'
      },
      body: JSON.stringify(commitPayload)
    })

    const commitData = await commitResponse.json()

    if (!commitResponse.ok) {
      console.error('❌ GitHub API Error:', commitData)
      return NextResponse.json(
        { error: 'GitHub API error', details: commitData.message || 'Unknown error' },
        { status: commitResponse.status }
      )
    }

    console.log(`✅ Commit successful: ${commitData.commit.sha}`)
    return NextResponse.json({
      success: true,
      message: 'File committed successfully',
      commit: {
        sha: commitData.commit.sha,
        url: commitData.commit.html_url
      }
    })

  } catch (error: any) {
    console.error('GitHub Commit Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
