// Vercel Serverless Function - GitHub API Proxy
// Permet de commiter des fichiers sur GitHub de manière sécurisée

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer les variables d'environnement
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO || 'gaetanSimonot/cevennes-sud-website';

    if (!GITHUB_TOKEN) {
      return res.status(500).json({
        error: 'GitHub token not configured on server. Please add GITHUB_TOKEN in Vercel Environment Variables.'
      });
    }

    // Récupérer les paramètres de la requête
    const { filePath, content, commitMessage } = req.body;

    if (!filePath || !content || !commitMessage) {
      return res.status(400).json({
        error: 'Missing required parameters: filePath, content, or commitMessage'
      });
    }

    // Étape 1 : Récupérer le SHA du fichier existant
    const getFileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

    let fileSha = null;
    try {
      const getResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cevennes-Connect-App'
        }
      });

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        fileSha = fileData.sha;
      }
    } catch (error) {
      console.log('File does not exist yet, will create new file');
    }

    // Étape 2 : Encoder le contenu en base64
    const contentBase64 = Buffer.from(content).toString('base64');

    // Étape 3 : Créer ou mettre à jour le fichier
    const commitPayload = {
      message: commitMessage,
      content: contentBase64,
      branch: 'main'
    };

    // Si le fichier existe, ajouter le SHA pour le mettre à jour
    if (fileSha) {
      commitPayload.sha = fileSha;
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
    });

    const commitData = await commitResponse.json();

    if (!commitResponse.ok) {
      console.error('GitHub API Error:', commitData);
      return res.status(commitResponse.status).json({
        error: 'GitHub API error',
        details: commitData.message || 'Unknown error',
        data: commitData
      });
    }

    // Succès !
    return res.status(200).json({
      success: true,
      message: 'File committed successfully',
      commit: {
        sha: commitData.commit.sha,
        url: commitData.commit.html_url
      }
    });

  } catch (error) {
    console.error('GitHub Commit Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
