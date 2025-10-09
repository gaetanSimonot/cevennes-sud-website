// Service worker (background script)
console.log('🎯 Cévennes Connect - Background script loaded')

// Écouter les messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request)

  if (request.action === 'openPopup') {
    chrome.action.openPopup()
  }

  return true
})

// Mettre à jour le badge quand on est sur une page Facebook Events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('facebook.com/events/')) {
      chrome.action.setBadgeText({ text: '✓', tabId })
      chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId })
    } else {
      chrome.action.setBadgeText({ text: '', tabId })
    }
  }
})

// Installer des listeners au démarrage
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ Extension installée avec succès')

  // Définir l'URL par défaut du serveur
  chrome.storage.sync.set({
    serverUrl: 'https://cevennes-sud-website.vercel.app'
  })
})
