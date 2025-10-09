// Popup script
console.log('🎯 Popup script loaded')

const statusDiv = document.getElementById('status')
const extractBtn = document.getElementById('extractBtn')
const publishBtn = document.getElementById('publishBtn')
const openAdminBtn = document.getElementById('openAdminBtn')
const serverUrlInput = document.getElementById('serverUrl')
const eventPreviewDiv = document.getElementById('eventPreview')

// Charger l'URL du serveur depuis le storage
chrome.storage.sync.get(['serverUrl'], (result) => {
  if (result.serverUrl) {
    serverUrlInput.value = result.serverUrl
  } else {
    serverUrlInput.value = 'https://cevennes-sud-website.vercel.app'
  }
})

// Sauvegarder l'URL du serveur quand elle change
serverUrlInput.addEventListener('change', () => {
  chrome.storage.sync.set({ serverUrl: serverUrlInput.value })
  updateStatus('✅ URL sauvegardée', 'success')
})

function updateStatus(message, type = 'info') {
  statusDiv.textContent = message
  statusDiv.className = `status ${type}`
}

function showEventPreview(event) {
  eventPreviewDiv.style.display = 'block'
  eventPreviewDiv.innerHTML = `
    <h3>${event.title || 'Sans titre'}</h3>
    <p>📅 ${event.date || 'Date non trouvée'}</p>
    <p>📍 ${event.location || 'Lieu non trouvé'}</p>
    <p>📝 ${event.description ? event.description.substring(0, 100) + '...' : 'Pas de description'}</p>
  `
}

// Bouton extraire
extractBtn.addEventListener('click', async () => {
  try {
    updateStatus('⏳ Extraction en cours...', 'info')
    extractBtn.disabled = true
    extractBtn.innerHTML = '<span class="loader"></span> Extraction...'

    // 1. Obtenir l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.url.includes('facebook.com/events/')) {
      updateStatus('❌ Veuillez ouvrir une page d\'événement Facebook', 'error')
      extractBtn.disabled = false
      extractBtn.innerHTML = '📥 Extraire cet événement'
      return
    }

    // 2. Envoyer un message au content script pour extraire le HTML
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractEvent' })

    if (!response.success) {
      throw new Error(response.error || 'Erreur extraction')
    }

    updateStatus('✅ HTML extrait, envoi à l\'API...', 'info')

    const { html, url } = response.data

    // 3. Envoyer à l'API extract-facebook-event
    const serverUrl = serverUrlInput.value || 'http://localhost:3004'
    const apiResponse = await fetch(`${serverUrl}/api/extract-facebook-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, url })
    })

    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.status}`)
    }

    const { event } = await apiResponse.json()

    // 4. Géocoder si possible
    if (event.address || event.location) {
      updateStatus('🌍 Géocodage...', 'info')
      const addressToGeocode = event.address || `${event.location}, Cévennes, France`
      try {
        const geocodeResponse = await fetch(
          `${serverUrl}/api/geocode?address=${encodeURIComponent(addressToGeocode)}`
        )
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          if (geocodeData.lat && geocodeData.lng) {
            event.lat = geocodeData.lat
            event.lng = geocodeData.lng
          }
        }
      } catch (error) {
        console.warn('Géocodage échoué:', error)
      }
    }

    // 5. Sauvegarder l'événement dans le storage
    chrome.storage.local.set({ extractedEvent: event, timestamp: Date.now() })

    // 6. Proposer publication directe
    updateStatus('✅ Événement extrait ! Publier maintenant ?', 'success')
    showEventPreview(event)

    extractBtn.innerHTML = '✅ Événement extrait !'
    extractBtn.disabled = true

    // Afficher bouton "Publier"
    const publishBtn = document.getElementById('publishBtn')
    publishBtn.style.display = 'block'
    publishBtn.disabled = false

  } catch (error) {
    console.error('❌ Erreur:', error)
    updateStatus(`❌ Erreur: ${error.message}`, 'error')
    extractBtn.disabled = false
    extractBtn.innerHTML = '📥 Extraire cet événement'
  }
})

// Bouton publier
publishBtn.addEventListener('click', async () => {
  try {
    publishBtn.disabled = true
    publishBtn.innerHTML = '<span class="loader"></span> Publication...'
    updateStatus('📤 Publication en cours...', 'info')

    // Récupérer l'événement du storage
    const storage = await chrome.storage.local.get(['extractedEvent'])
    if (!storage.extractedEvent) {
      throw new Error('Aucun événement à publier')
    }

    const event = storage.extractedEvent
    const serverUrl = serverUrlInput.value || 'https://cevennes-sud-website.vercel.app'

    // Envoyer à l'API
    const response = await fetch(`${serverUrl}/api/chrome-extension/import-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || 'Erreur publication')
    }

    const result = await response.json()
    updateStatus('🎉 Événement publié avec succès !', 'success')

    publishBtn.innerHTML = '🎉 Publié !'
    setTimeout(() => {
      // Réinitialiser
      publishBtn.style.display = 'none'
      extractBtn.disabled = false
      extractBtn.innerHTML = '📥 Extraire cet événement'
      eventPreviewDiv.style.display = 'none'
      updateStatus('Prêt à extraire l\'événement', 'info')
    }, 3000)

  } catch (error) {
    console.error('❌ Erreur publication:', error)
    updateStatus(`❌ Erreur: ${error.message}`, 'error')
    publishBtn.disabled = false
    publishBtn.innerHTML = '✅ Publier directement sur le site'
  }
})

// Bouton ouvrir admin
openAdminBtn.addEventListener('click', () => {
  const serverUrl = serverUrlInput.value || 'https://cevennes-sud-website.vercel.app'
  chrome.tabs.create({ url: `${serverUrl}/admin/artefact-ia` })
})

// Vérifier si on est sur une page Facebook Events
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url) {
    if (tabs[0].url.includes('facebook.com/events/')) {
      updateStatus('✅ Page d\'événement détectée', 'success')
    } else {
      updateStatus('⚠️ Ouvrez une page d\'événement Facebook', 'info')
      extractBtn.disabled = true
    }
  }
})
