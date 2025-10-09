// Content script qui s'exécute sur les pages Facebook Events
console.log('🎯 Cévennes Connect - Content script loaded on Facebook Event page')

// Fonction pour extraire le HTML de la page (limité pour éviter erreur 413)
function extractEventHTML() {
  const html = document.documentElement.outerHTML
  const url = window.location.href

  // Limiter à 100KB pour éviter payload too large
  const maxSize = 100000
  const truncatedHtml = html.substring(0, maxSize)

  console.log('📄 HTML extrait:', html.length, 'caractères (tronqué à', truncatedHtml.length, ')')

  return {
    html: truncatedHtml,
    url,
    title: document.title,
    timestamp: new Date().toISOString()
  }
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message reçu:', request)

  if (request.action === 'extractEvent') {
    try {
      const eventData = extractEventHTML()
      sendResponse({ success: true, data: eventData })
    } catch (error) {
      console.error('❌ Erreur extraction:', error)
      sendResponse({ success: false, error: error.message })
    }
  }

  return true // Garde le canal de message ouvert pour sendResponse async
})

// Ajouter un badge visuel pour indiquer que l'extension est active
function addVisualBadge() {
  const badge = document.createElement('div')
  badge.id = 'cevennes-connect-badge'
  badge.innerHTML = '🏔️ Cévennes Connect actif'
  badge.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    cursor: pointer;
    transition: transform 0.2s;
  `

  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'scale(1.05)'
  })

  badge.addEventListener('mouseleave', () => {
    badge.style.transform = 'scale(1)'
  })

  badge.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' })
  })

  document.body.appendChild(badge)

  // Faire disparaître le badge après 3 secondes
  setTimeout(() => {
    badge.style.transition = 'opacity 0.5s'
    badge.style.opacity = '0'
    setTimeout(() => badge.remove(), 500)
  }, 3000)
}

// Ajouter le badge si on est sur une page d'événement
if (window.location.href.includes('/events/')) {
  addVisualBadge()
}
