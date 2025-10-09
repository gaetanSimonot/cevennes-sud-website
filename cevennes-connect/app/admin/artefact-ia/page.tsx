'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'

// Default AI prompt
const DEFAULT_PROMPT = `RÈGLE ABSOLUE : Extrait TOUS les événements du texte. Si tu vois 15 événements, retourne 15 événements. N'en oublie AUCUN.

Tu es un assistant spécialisé dans l'extraction d'informations d'événements depuis des copier-coller brouillons, des images ou du texte mal formaté.

**TA MISSION : EXTRAIRE LE MAXIMUM D'ÉVÉNEMENTS**

🎯 OBJECTIF : Extraire TOUS les événements détectés, même avec peu d'infos
⚠️ NE FILTRE PAS : Si tu vois 11 événements, retourne 11 événements JSON

Tu vas recevoir des données parfois sales (copier-coller, caractères bizarres, formatage cassé, infos mélangées). Ton job est d'isoler les infos essentielles et créer un événement JSON pour CHAQUE événement détecté.

**RÈGLES STRICTES** :

1. **GESTION DES COPIER-COLLER SALES** :
   - Ignore les caractères spéciaux bizarres (emojis cassés, unicode étrange, etc.)
   - Nettoie les espaces multiples, sauts de ligne inutiles
   - Extrait SEULEMENT les infos utiles, ignore le bruit
   - Si le texte est incompréhensible, fais de ton mieux avec ce qui est lisible
   - FORMAT SPÉCIAL : Si tu vois "Ville (Code postal)" à la fin → c'est l'adresse complète
   - Exemple : "Valflaunès (34270)" → address: "34270 Valflaunès"

2. **CARACTÈRES DANGEREUX POUR JSON** :
   - Échappe TOUJOURS les guillemets doubles dans les textes
   - Remplace les guillemets typographiques par des guillemets simples (')
   - Retire les retours chariots dans les textes (une seule ligne)
   - Supprime les backslashes orphelins
   - Pas de caractères de contrôle (TAB, NULL, etc.)

3. **UNE IMAGE = UN SEUL ÉVÉNEMENT** : Même si l'affiche mentionne plusieurs dates, c'est UN événement

4. **CRÉE UN ÉVÉNEMENT POUR CHAQUE INFO DÉTECTÉE** :
   - ⚠️ NE FUSIONNE JAMAIS plusieurs événements en un seul
   - ⚠️ NE FILTRE PAS : retourne TOUS les événements détectés
   - Un événement par date, par lieu, par activité mentionnée
   - Même avec peu d'infos, crée l'événement

5. **PRIORITÉ AUX INFOS MINIMALES** :
   - **OBLIGATOIRE** : title (minimum)
   - **IMPORTANT** : date, time, ville dans address
   - **OPTIONNEL** : tout le reste
   - Si tu n'es pas sûr → mets une valeur par défaut plutôt que de supprimer l'événement

6. **EN CAS DE DOUTE** :
   - Date floue ? → Essaye d'estimer, sinon mets ""
   - Heure floue ? → Mets "14:00" par défaut
   - Lieu vague ? → Mets "Cévennes Sud" dans address
   - Prix inconnu ? → Mets "Non renseigné"
   - Ville inconnue ? → Cherche dans le texte, sinon mets "30120 Le Vigan" par défaut

Pour chaque événement, extrais :

- **title** (OBLIGATOIRE) : Titre de l'événement
- **category** : "festival", "marche", "culture", "sport", "atelier", "theatre"
- **description** : 1-2 phrases MAX, propres, sans caractères bizarres
- **date** : YYYY-MM-DD (OBLIGATOIRE)
- **time** : HH:MM (24h)
- **location** : Nom du lieu
- **address** : Ville + code postal minimum (ex: "30120 Le Vigan")
- **price** : Ex: "Gratuit", "10€"
- **organizer** : Nom de l'organisateur
- **contact** : Email ou tel
- **website** : URL complète

**IMPORTANT - FORMAT DE SORTIE** :
- ⚠️ RETOURNE UNIQUEMENT DU JSON VALIDE, RIEN D'AUTRE
- ❌ PAS de texte explicatif avant ou après le JSON
- ❌ PAS de "Voici les événements" ou "Je suis prêt"
- ❌ PAS de markdown, commentaires ou explications
- ✅ Commence directement par [ et termine par ]
- Chaque string doit être échappée correctement
- Pas d'images base64, toujours "image": ""
- Si aucun événement valide détecté → retourne []

Format attendu :
[
  {
    "title": "Marché de Valflaunès",
    "category": "marche",
    "description": "Marché artisanal local tous les dimanches matin",
    "date": "2025-10-12",
    "time": "09:00",
    "location": "Place Gabriel Calmels",
    "address": "34270 Valflaunès",
    "price": "Gratuit",
    "organizer": "",
    "contact": "",
    "website": "",
    "image": ""
  }
]`

interface ExtractedEvent {
  id?: number
  title: string
  category: string
  description: string
  date: string
  time: string
  location: string
  address: string
  price: string
  organizer: string
  contact: string
  website: string
  image: string
  lat?: number
  lng?: number
  premium_level?: string
}

interface LogEntry {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

interface ScrapedEvent {
  title: string
  date: string
  location: string
  description: string
  imageUrl?: string
  sourceUrl: string
  isDuplicate?: boolean
  duplicateOf?: number
  selected?: boolean
}

export default function ArtefactIAPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image' | 'scraper' | 'settings'>('text')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent] = useState('')
  const [scraperUrl, setScraperUrl] = useState('')
  const [uploadedImages, setUploadedImages] = useState<{ data: string; name: string }[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [deepScraping, setDeepScraping] = useState(false)
  const [scrapedEvents, setScrapedEvents] = useState<ScrapedEvent[]>([])
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[] | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([
    { message: '🤖 Prêt à analyser vos événements avec OpenAI GPT-4 Vision', type: 'info' },
    { message: '📸 Vous pouvez ajouter des images d\'affiches', type: 'info' },
    { message: '📝 Ou coller du texte / liens', type: 'info' },
    { message: '⚠️ L\'analyse peut prendre 10-30 secondes', type: 'warning' },
  ])
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logConsoleRef = useRef<HTMLDivElement>(null)

  // Load custom prompt from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('artefact-ai-prompt')
    if (saved) {
      setCustomPrompt(saved)
    }
  }, [])

  // Save prompt to localStorage
  const savePrompt = () => {
    localStorage.setItem('artefact-ai-prompt', customPrompt)
    addLog('✅ Consignes IA sauvegardées', 'success')
    setEditingPrompt(false)
  }

  // Reset to default prompt
  const resetPrompt = () => {
    if (confirm('Réinitialiser les consignes IA par défaut ?')) {
      setCustomPrompt(DEFAULT_PROMPT)
      localStorage.setItem('artefact-ai-prompt', DEFAULT_PROMPT)
      addLog('🔄 Consignes IA réinitialisées', 'info')
    }
  }

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { message, type }])
    setTimeout(() => {
      if (logConsoleRef.current) {
        logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight
      }
    }, 100)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImages(prev => [...prev, {
              data: event.target!.result as string,
              name: file.name
            }])
            addLog(`✓ Image ajoutée: ${file.name}`, 'success')
          }
        }
        reader.readAsDataURL(file)
      } else {
        addLog(`✗ Fichier non supporté: ${file.name}`, 'error')
      }
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    addLog('✓ Image supprimée', 'info')
  }

  const handleScrapeAgenda = async () => {
    if (!scraperUrl.trim()) {
      addLog('❌ Veuillez entrer au moins une URL', 'error')
      return
    }

    // Parser les URLs (une par ligne)
    const urls = scraperUrl
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0 && u.startsWith('http'))

    if (urls.length === 0) {
      addLog('❌ Aucune URL valide détectée', 'error')
      return
    }

    setIsScraping(true)
    addLog('\n🌐 Démarrage du scraping...', 'info')
    addLog(`🔗 ${urls.length} URL(s) à scraper ${deepScraping ? '🔍 (Mode profond activé)' : '(Mode surface)'}`, 'info')
    if (deepScraping) {
      addLog('⏱️ Le mode profond prend plus de temps mais collecte plus d\'informations', 'info')
    }
    urls.forEach((u, i) => addLog(`  ${i + 1}. ${u}`, 'info'))

    try {
      const response = await fetch('/api/scrape-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, deep: deepScraping })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du scraping')
      }

      if (data.events && data.events.length > 0) {
        // Marquer tous comme sélectionnés par défaut (sauf les doublons)
        const eventsWithSelection = data.events.map((e: ScrapedEvent) => ({
          ...e,
          selected: !e.isDuplicate // Ne pas sélectionner les doublons par défaut
        }))
        setScrapedEvents(eventsWithSelection)

        addLog(`\n✅ ${data.summary}`, 'success')
        if (data.duplicatesCount > 0) {
          addLog(`⚠️ ${data.duplicatesCount} doublon(s) détecté(s) (désélectionnés)`, 'warning')
        }
        addLog('📋 Vérifiez et ajustez la sélection', 'info')
      } else {
        addLog('⚠️ Aucun événement détecté', 'warning')
        setScrapedEvents([])
      }
    } catch (error: any) {
      addLog(`❌ Erreur de scraping: ${error.message}`, 'error')
      alert(`❌ Erreur:\n\n${error.message}\n\nVérifiez que les URLs sont accessibles.`)
    } finally {
      setIsScraping(false)
    }
  }

  const toggleScrapedEvent = (index: number) => {
    setScrapedEvents(prev => prev.map((e, i) =>
      i === index ? { ...e, selected: !e.selected } : e
    ))
  }

  const handleImportScrapedEvents = async () => {
    const selectedEvents = scrapedEvents.filter(e => e.selected)

    if (selectedEvents.length === 0) {
      addLog('❌ Aucun événement sélectionné', 'error')
      return
    }

    addLog(`\n🤖 Envoi à OpenAI pour nettoyage et enrichissement...`, 'info')

    try {
      // Appeler l'API route pour nettoyer avec OpenAI
      const response = await fetch('/api/clean-scraped-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: selectedEvents
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur OpenAI')
      }

      const data = await response.json()
      addLog('✅ Réponse reçue de OpenAI', 'success')

      const convertedEvents: ExtractedEvent[] = data.events
      addLog(`✅ ${convertedEvents.length} événement(s) nettoyés par IA !`, 'success')

      // Afficher les rejets si présents
      if (data.rejected > 0 && data.rejectedEvents) {
        addLog(`⚠️ ${data.rejected} événement(s) rejeté(s) (pas de ville valide):`, 'warning')
        data.rejectedEvents.forEach((rejected: any) => {
          addLog(`  • "${rejected.title}" - ${rejected.reason}: "${rejected.location}"`, 'warning')
        })
      }

      if (convertedEvents.length === 0) {
        addLog('❌ Aucun événement valide retourné par OpenAI', 'error')
        addLog('💡 Astuce: Essayez le mode "Deep Scraping" pour obtenir plus d\'infos', 'info')
        return
      }

      // Ajouter les sourceUrl dans le champ website
      addLog('🔗 Ajout des liens sources...', 'info')
      convertedEvents.forEach((event, index) => {
        if (selectedEvents[index] && selectedEvents[index].sourceUrl) {
          // Si pas de website déjà défini, utiliser le sourceUrl
          if (!event.website || event.website === '') {
            event.website = selectedEvents[index].sourceUrl
            addLog(`  ✓ Lien ajouté: ${event.title}`, 'success')
          }
        }
      })

      // Géocoder les adresses
      addLog('🗺️ Géocodage des adresses en cours...', 'info')
      for (const event of convertedEvents) {
        if (event.address) {
          try {
            const geocodeResponse = await fetch(
              `/api/geocode?address=${encodeURIComponent(event.address + ', Cévennes, France')}`
            )
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json()
              if (geocodeData.lat && geocodeData.lng) {
                event.lat = geocodeData.lat
                event.lng = geocodeData.lng
                addLog(`  ✓ Géocodé: ${event.title} → ${event.address}`, 'success')
              }
            }
          } catch (error) {
            addLog(`  ⚠ Géocodage échoué pour: ${event.title}`, 'warning')
          }
        }
      }

      // Afficher les événements extraits
      setExtractedEvents(convertedEvents)
      setScrapedEvents([])
      setScraperUrl('')
      addLog('✅ Import terminé ! Vérifiez les événements ci-dessous', 'success')
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error')
      console.error('Error in handleImportScrapedEvents:', error)
    }
  }

  const handleAnalyze = async () => {
    let inputText = textContent

    if (activeTab === 'text' && !inputText.trim() && uploadedImages.length === 0) {
      addLog('❌ Veuillez ajouter du texte ou une image', 'error')
      return
    }

    if (activeTab === 'url' && !urlContent.trim()) {
      addLog('❌ Veuillez entrer une URL', 'error')
      return
    }

    if (activeTab === 'image' && uploadedImages.length === 0) {
      addLog('❌ Veuillez ajouter une image', 'error')
      return
    }

    setIsAnalyzing(true)
    addLog('\n🚀 Démarrage de l\'analyse avec OpenAI GPT-4 Vision...', 'info')

    try {
      // Fetch URL content if URL tab is active
      if (activeTab === 'url' && urlContent.trim()) {
        addLog('🔗 Récupération du contenu de l\'URL...', 'info')
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlContent)}`
          const response = await fetch(proxyUrl)
          const data = await response.json()

          if (data.contents) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(data.contents, 'text/html')
            const pageText = doc.body.innerText || doc.body.textContent || ''
            inputText = pageText.substring(0, 3000)
            addLog(`✓ Contenu récupéré (${pageText.length} caractères)`, 'success')
          }
        } catch (error) {
          addLog('⚠ Impossible de récupérer le contenu de l\'URL', 'warning')
        }
      }

      // Prepare OpenAI prompt - use custom prompt with optional input text
      const prompt = inputText
        ? `${customPrompt}\n\n**Données brutes fournies :**\n${inputText}`
        : customPrompt

      // Prepare messages
      const messages: any[] = [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }]
        }
      ]

      // Add images for image tab
      if (activeTab === 'image' && uploadedImages.length > 0) {
        addLog(`📸 Envoi de ${uploadedImages.length} image(s) à OpenAI...`, 'info')
        uploadedImages.forEach(img => {
          messages[0].content.push({
            type: 'image_url',
            image_url: { url: img.data }
          })
        })
      }

      // Call OpenAI API
      addLog('⏳ Appel à OpenAI GPT-4 Turbo...', 'info')
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages,
          max_tokens: 4000,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Erreur API OpenAI')
      }

      const data = await response.json()
      addLog('✅ Réponse reçue de OpenAI', 'success')

      // Parse JSON response - extraire le JSON même s'il y a du texte autour
      let jsonText = data.choices[0].message.content.trim()

      // Nettoyer les code fences markdown
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      // Essayer d'extraire le JSON si c'est mélangé avec du texte
      const jsonMatch = jsonText.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      } else {
        // Sinon chercher un objet unique
        const singleObjectMatch = jsonText.match(/\{\s*"[\s\S]*\}/)
        if (singleObjectMatch) {
          jsonText = singleObjectMatch[0]
        }
      }

      addLog('🔍 JSON détecté, parsing...', 'info')

      let eventsArray: ExtractedEvent[]
      try {
        eventsArray = JSON.parse(jsonText)
      } catch (parseError: any) {
        addLog('❌ Erreur de parsing JSON', 'error')
        addLog(`📄 Réponse brute: ${data.choices[0].message.content.substring(0, 200)}...`, 'warning')
        throw new Error(`Parsing JSON échoué: ${parseError.message}. L'IA n'a pas retourné du JSON valide.`)
      }

      if (!Array.isArray(eventsArray)) {
        eventsArray = [eventsArray]
      }

      console.log(`Événements extraits : ${eventsArray.length}`)
      addLog(`✅ ${eventsArray.length} événement(s) extrait(s) par l'IA`, 'success')

      if (eventsArray.length === 0) {
        addLog('⚠️ Aucun événement valide détecté', 'warning')
        setIsAnalyzing(false)
        return
      }

      // Geocode addresses
      addLog('🗺️ Géocodage des adresses en cours...', 'info')

      const geocodePromises = eventsArray.map(async (eventData, index) => {
        eventData.id = Date.now() + index

        // Validate and normalize category
        const validCategories = ['festival', 'marche', 'culture', 'sport', 'atelier', 'theatre']
        if (!eventData.category || !validCategories.includes(eventData.category.toLowerCase())) {
          eventData.category = 'culture' // Default fallback
        } else {
          eventData.category = eventData.category.toLowerCase()
        }

        // Category images
        const categoryImages: Record<string, string> = {
          'festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'marche': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'culture': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'sport': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'atelier': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'theatre': 'https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
        eventData.image = categoryImages[eventData.category] || categoryImages['culture']
        eventData.premium_level = 'standard'

        // Geocode
        if (eventData.address && eventData.address.trim() !== '') {
          try {
            const searchAddress = `${eventData.address}, Cévennes, France`
            const geoResponse = await fetch('/api/geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: searchAddress })
            })
            const geoData = await geoResponse.json()

            if (geoData.results && geoData.results.length > 0) {
              eventData.lat = geoData.results[0].geometry.location.lat
              eventData.lng = geoData.results[0].geometry.location.lng
              const foundLocation = geoData.results[0].formatted_address
              addLog(`✓ ${eventData.title}`, 'success')
              addLog(`  → ${foundLocation}`, 'info')
            } else {
              eventData.lat = 43.9339
              eventData.lng = 3.7086
              addLog(`⚠ ${eventData.title} : adresse non trouvée (coordonnées Ganges par défaut)`, 'warning')
            }
          } catch (error) {
            eventData.lat = 43.9339
            eventData.lng = 3.7086
            addLog(`⚠ ${eventData.title} : erreur géocodage`, 'warning')
          }
        } else {
          eventData.lat = 43.9339
          eventData.lng = 3.7086
          addLog(`⚠ ${eventData.title} : aucune adresse fournie`, 'warning')
        }
      })

      await Promise.all(geocodePromises)

      setExtractedEvents(eventsArray)
      addLog('✅ Événements générés avec succès !', 'success')

    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error')
      console.error('Erreur complète:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCommitToGitHub = async () => {
    if (!extractedEvents) return

    const count = extractedEvents.length

    if (!confirm(`Êtes-vous sûr d'ajouter ${count} événement(s) à Supabase ?`)) {
      return
    }

    addLog('📤 Chargement des événements existants depuis Supabase...', 'info')

    try {
      // Load existing events from Supabase API
      let existingEvents: ExtractedEvent[] = []
      try {
        const response = await fetch('/api/events?limit=10000')
        if (response.ok) {
          const data = await response.json()
          existingEvents = data.events || []
          addLog(`✓ ${existingEvents.length} événements existants chargés`, 'success')
        }
      } catch (error) {
        addLog('⚠ Erreur de chargement, les événements seront tout de même créés', 'warning')
      }

      // Deduplication
      addLog('🔍 Vérification des doublons...', 'info')
      let duplicates = 0
      let added = 0
      const eventsToAdd: ExtractedEvent[] = []

      for (const newEvent of extractedEvents) {
        const isDuplicate = existingEvents.some(existing =>
          existing.date === newEvent.date &&
          (existing.location.toLowerCase() === newEvent.location.toLowerCase() ||
           existing.address.toLowerCase() === newEvent.address.toLowerCase() ||
           existing.title.toLowerCase() === newEvent.title.toLowerCase())
        )

        if (isDuplicate) {
          duplicates++
          addLog(`  ⊘ Doublon ignoré: ${newEvent.title} (${newEvent.date})`, 'warning')
        } else {
          eventsToAdd.push(newEvent)
          addLog(`  + À ajouter: ${newEvent.title} (${newEvent.date})`, 'success')
        }
      }

      addLog(`\n📊 Résumé:`, 'info')
      addLog(`  • ${duplicates} doublons évités`, 'warning')
      addLog(`  • ${eventsToAdd.length} nouveaux événements à créer`, 'success')

      // Create events in Supabase via API
      if (eventsToAdd.length > 0) {
        addLog('📤 Envoi vers Supabase...', 'info')

        for (const event of eventsToAdd) {
          const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erreur lors de la création')
          }

          added++
          addLog(`  ✓ Créé: ${event.title}`, 'success')
        }

        addLog('✅ Tous les événements ont été créés dans Supabase !', 'success')
      }

      alert(`✅ Événements ajoutés à Supabase !\n\n📊 ${count} événement(s) traité(s)\n${duplicates} doublons évités\n${added} nouveaux créés\n\n🎉 Les données sont instantanément disponibles en ligne !`)

      // Reset
      setExtractedEvents(null)
      setTextContent('')
      setUrlContent('')
      setUploadedImages([])

    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error')
      alert(`❌ Erreur lors de l'ajout:\n\n${error.message}`)
    }
  }

  const handleCopyJSON = () => {
    if (!extractedEvents) return
    navigator.clipboard.writeText(JSON.stringify(extractedEvents, null, 2))
    addLog('✅ JSON copié dans le presse-papier !', 'success')
  }

  const handleDownloadJSON = () => {
    if (!extractedEvents) return
    const dataStr = JSON.stringify(extractedEvents, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `events-${Date.now()}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    addLog('✅ Fichier JSON téléchargé !', 'success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">← Retour Admin</Button>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-2">
              ✨ Artefact IA - Extraction d&apos;Événements
            </h1>
            <p className="text-center text-sm sm:text-base text-gray-600">
              Glissez un screenshot, collez du texte ou un lien - L&apos;IA extrait et reformule automatiquement !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Input */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                📥 Sources d&apos;Information
              </h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant={activeTab === 'text' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('text')}
                  size="sm"
                >
                  📝 Texte
                </Button>
                <Button
                  variant={activeTab === 'url' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('url')}
                  size="sm"
                >
                  🔗 URL
                </Button>
                <Button
                  variant={activeTab === 'image' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('image')}
                  size="sm"
                >
                  📸 Screenshot
                </Button>
                <Button
                  variant={activeTab === 'scraper' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('scraper')}
                  size="sm"
                >
                  🌐 Scraper Agenda
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('settings')}
                  size="sm"
                >
                  ⚙️ Paramètres
                </Button>
              </div>

              {/* Text Tab */}
              {activeTab === 'text' && (
                <div className="mb-6">
                  <TextArea
                    label="Texte ou Lien"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    placeholder="Collez ici le texte de l'événement, une URL Facebook, un lien vers une affiche..."
                  />
                </div>
              )}

              {/* URL Tab */}
              {activeTab === 'url' && (
                <div className="mb-6">
                  <Input
                    label="URL de la page"
                    value={urlContent}
                    onChange={(e) => setUrlContent(e.target.value)}
                    placeholder="https://facebook.com/events/..."
                  />
                </div>
              )}

              {/* Image Tab */}
              {activeTab === 'image' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload d&apos;images
                  </label>
                  <div
                    className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-6xl mb-4 block">☁️</span>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Glissez une image ici
                    </h3>
                    <p className="text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button variant="primary" size="sm">
                      📁 Parcourir
                    </Button>
                  </div>

                  {/* Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Images ajoutées:
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.data}
                              alt={img.name}
                              className="w-32 h-32 object-cover rounded-xl shadow-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 hover:bg-red-600 transition"
                            >
                              ✕
                            </button>
                            <p className="text-xs text-gray-600 mt-2 text-center truncate w-32">
                              {img.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scraper Tab */}
              {activeTab === 'scraper' && (
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-cyan-900 mb-3 flex items-center gap-2">
                      🌐 Scraper d&apos;Agenda Externe
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-700 mb-4">
                      Entrez l&apos;URL d&apos;un agenda en ligne (eterritoire.fr, Facebook Events, etc.).
                      L&apos;outil va extraire automatiquement les événements détectés.
                    </p>

                    <TextArea
                      label="URLs des agendas (une par ligne)"
                      value={scraperUrl}
                      onChange={(e) => setScraperUrl(e.target.value)}
                      rows={6}
                      placeholder="https://www.eterritoire.fr/agenda/...
https://www.facebook.com/events/...
https://autre-agenda.com/..."
                      disabled={isScraping}
                    />
                    <p className="text-xs text-cyan-600 mt-2">
                      💡 Collez plusieurs URLs (une par ligne) pour scraper en parallèle
                    </p>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg cursor-pointer hover:bg-cyan-100 transition">
                        <input
                          type="checkbox"
                          checked={deepScraping}
                          onChange={(e) => setDeepScraping(e.target.checked)}
                          disabled={isScraping}
                          className="w-5 h-5 text-cyan-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-cyan-900 text-sm">🔍 Scraping en profondeur</p>
                          <p className="text-xs text-cyan-700">
                            Entre dans chaque événement pour collecter plus d&apos;informations (descriptions complètes, horaires, prix, etc.)
                          </p>
                        </div>
                      </label>

                      <Button
                        variant="primary"
                        onClick={handleScrapeAgenda}
                        disabled={isScraping || !scraperUrl.trim()}
                        className="w-full"
                      >
                        {isScraping ? '⏳ Scraping en cours...' : '🚀 Lancer le scraping'}
                      </Button>
                    </div>
                  </div>

                  {/* Scraped Events Preview */}
                  {scrapedEvents.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        📋 Événements détectés ({scrapedEvents.filter(e => e.selected).length}/{scrapedEvents.length} sélectionnés)
                      </h3>

                      <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto mb-4">
                        {scrapedEvents.map((event, index) => (
                          <div
                            key={index}
                            className={`
                              border-2 rounded-xl p-4 transition-all cursor-pointer relative
                              ${event.isDuplicate
                                ? 'border-red-300 bg-red-50 opacity-75'
                                : event.selected
                                  ? 'border-cyan-500 bg-cyan-50'
                                  : 'border-gray-200 bg-gray-50'}
                            `}
                            onClick={() => toggleScrapedEvent(index)}
                          >
                            {/* Badge doublon */}
                            {event.isDuplicate && (
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                  ⚠️ DOUBLON
                                </span>
                              </div>
                            )}

                            <div className="flex items-start gap-2 sm:gap-3">
                              <input
                                type="checkbox"
                                checked={event.selected}
                                onChange={() => toggleScrapedEvent(index)}
                                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-bold mb-1 text-sm sm:text-base ${event.isDuplicate ? 'text-red-700' : 'text-gray-900'}`}>
                                  {event.title}
                                </h4>
                                {event.date && (
                                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                    📅 {event.date}
                                  </p>
                                )}
                                {event.location && (
                                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                    📍 {event.location}
                                  </p>
                                )}
                                {event.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                              {event.imageUrl && (
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Button
                          variant="primary"
                          onClick={handleImportScrapedEvents}
                          disabled={scrapedEvents.filter(e => e.selected).length === 0}
                          className="flex-1 min-w-[120px] text-sm sm:text-base"
                        >
                          ✅ Importer ({scrapedEvents.filter(e => e.selected).length})
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setScrapedEvents([])
                            setScraperUrl('')
                          }}
                          className="text-sm sm:text-base"
                        >
                          🗑️ Effacer
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        💡 Les événements sélectionnés seront convertis en JSON puis géocodés automatiquement
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      ⚙️ Configuration de l&apos;Agent IA
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Modifiez les consignes données à l&apos;IA pour extraire les événements.
                      Les consignes sont sauvegardées localement dans votre navigateur.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant={editingPrompt ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => setEditingPrompt(!editingPrompt)}
                      >
                        {editingPrompt ? '📖 Annuler' : '✏️ Modifier'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={resetPrompt}
                      >
                        🔄 Réinitialiser
                      </Button>
                    </div>
                  </div>

                  {editingPrompt ? (
                    <div>
                      <TextArea
                        label="Consignes pour l'IA"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={20}
                        placeholder="Entrez les consignes pour l'IA..."
                      />
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="primary"
                          onClick={savePrompt}
                          className="flex-1"
                        >
                          💾 Sauvegarder
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingPrompt(false)}
                          className="flex-1"
                        >
                          ❌ Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Aperçu des consignes actuelles:
                      </h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {customPrompt.substring(0, 500)}...
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Analyze Button */}
              {activeTab !== 'settings' && (
                <Button
                  onClick={handleAnalyze}
                  variant="primary"
                  className="w-full text-sm sm:text-base"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? '⏳ Analyse en cours...' : '🧠 Analyser avec l\'IA'}
                </Button>
              )}
            </div>

            {/* Right Column - Output */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                🤖 Traitement IA
              </h2>

              {/* Log Console */}
              <div
                ref={logConsoleRef}
                className="bg-gray-900 text-green-400 p-3 sm:p-4 lg:p-6 rounded-xl h-64 sm:h-80 overflow-y-auto mb-6 font-mono text-xs sm:text-sm"
              >
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}
                  >
                    {log.message}
                  </div>
                ))}
              </div>

              {/* Extracted Data */}
              {extractedEvents && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    ✅ Événement(s) Généré(s)
                  </h3>
                  <div className="bg-gray-900 text-green-400 p-3 sm:p-4 lg:p-6 rounded-xl overflow-x-auto mb-4 max-h-64 sm:max-h-96">
                    <pre className="text-xs sm:text-sm">{JSON.stringify(extractedEvents, null, 2)}</pre>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button onClick={handleCopyJSON} variant="secondary" className="flex-1 min-w-[100px]">
                      📋 Copier
                    </Button>
                    <Button onClick={handleDownloadJSON} variant="secondary" className="flex-1 min-w-[100px]">
                      💾 Télécharger
                    </Button>
                    <Button onClick={handleCommitToGitHub} variant="primary" className="flex-1 min-w-[100px]">
                      📤 GitHub
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
