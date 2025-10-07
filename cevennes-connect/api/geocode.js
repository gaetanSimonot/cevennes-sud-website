// Vercel Serverless Function - Proxy Google Geocoding API
// Protège la clé API Google Maps côté serveur

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer la clé API depuis les variables d'environnement Vercel
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: 'Google Maps API key not configured on server. Please add GOOGLE_MAPS_API_KEY in Vercel Environment Variables.'
      });
    }

    // Récupérer l'adresse depuis les paramètres
    const address = req.method === 'GET' ? req.query.address : req.body.address;

    if (!address) {
      return res.status(400).json({ error: 'Missing address parameter' });
    }

    // Appeler l'API Google Geocoding
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    const geocodeResponse = await fetch(geocodeUrl);
    const data = await geocodeResponse.json();

    // Retourner la réponse
    return res.status(200).json(data);

  } catch (error) {
    console.error('Geocoding Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
