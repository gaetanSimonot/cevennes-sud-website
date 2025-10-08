'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'

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

export default function ArtefactIAPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent] = useState('')
  const [uploadedImages, setUploadedImages] = useState<{ data: string; name: string }[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[] | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([
    { message: '🤖 Prêt à analyser vos événements avec OpenAI GPT-4 Vision', type: 'info' },
    { message: '📸 Vous pouvez ajouter des images d\'affiches', type: 'info' },
    { message: '📝 Ou coller du texte / liens', type: 'info' },
    { message: '⚠️ L\'analyse peut prendre 10-30 secondes', type: 'warning' },
  ])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logConsoleRef = useRef<HTMLDivElement>(null)

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

      // Prepare OpenAI prompt
      const prompt = `Tu es un assistant spécialisé dans l'extraction d'informations d'événements depuis des copier-coller brouillons, des images ou du texte mal formaté.

**TA MISSION : ÊTRE ROBUSTE ET EFFICACE**

Tu vas recevoir des données parfois sales (copier-coller, caractères bizarres, formatage cassé, infos mélangées). Ton job est d'isoler SEULEMENT les infos essentielles et créer des événements valides.

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

4. **PRIORITÉ AUX INFOS MINIMALES** :
   - **OBLIGATOIRE** : title + date + ville (dans address ou location)
   - **IMPORTANT** : time, category
   - **OPTIONNEL** : tout le reste
   - Si tu n'es pas sûr d'une info → laisse vide "" plutôt que de risquer une erreur

5. **EN CAS DE DOUTE** :
   - Date floue ? → Mets la première date mentionnée ou laisse vide
   - Heure floue ? → Mets "14:00" par défaut ou laisse vide
   - Lieu vague ? → Mets au moins le nom de la ville dans address
   - Prix inconnu ? → Mets "Non renseigné"

6. **VILLE OBLIGATOIRE** : L'adresse DOIT contenir une ville des Cévennes (Le Vigan, Ganges, Saint-Hippolyte-du-Fort, Sumène, Valleraugue, etc.). Sans ville, pas de carte !

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

${inputText ? `\n**Données brutes fournies :**\n${inputText}` : ''}

**IMPORTANT** :
- Retourne UNIQUEMENT du JSON valide, propre, sans texte avant/après
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
      addLog('⏳ Appel à OpenAI GPT-4 Vision...', 'info')
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          max_tokens: 4000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Erreur API OpenAI')
      }

      const data = await response.json()
      addLog('✅ Réponse reçue de OpenAI', 'success')

      // Parse JSON response
      let jsonText = data.choices[0].message.content.trim()
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let eventsArray: ExtractedEvent[] = JSON.parse(jsonText)

      if (!Array.isArray(eventsArray)) {
        eventsArray = [eventsArray]
      }

      if (eventsArray.length === 0) {
        addLog('⚠️ Aucun événement valide détecté', 'warning')
        setIsAnalyzing(false)
        return
      }

      addLog(`✅ ${eventsArray.length} événement(s) détecté(s) !`, 'success')

      // Geocode addresses
      addLog('🗺️ Géocodage des adresses en cours...', 'info')

      const geocodePromises = eventsArray.map(async (eventData, index) => {
        eventData.id = Date.now() + index

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

    if (!confirm(`Êtes-vous sûr de vouloir committer ${count} événement(s) sur GitHub ?`)) {
      return
    }

    addLog('📤 Chargement des événements existants...', 'info')

    try {
      // Load existing events
      let existingEvents: ExtractedEvent[] = []
      try {
        const response = await fetch('/data/events-data.json')
        if (response.ok) {
          existingEvents = await response.json()
          addLog(`✓ ${existingEvents.length} événements existants chargés`, 'success')
        }
      } catch (error) {
        addLog('⚠ Aucun événement existant, création du fichier', 'warning')
      }

      // Deduplication
      addLog('🔍 Vérification des doublons...', 'info')
      let duplicates = 0
      let added = 0
      const mergedEvents = [...existingEvents]

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
          mergedEvents.push(newEvent)
          added++
          addLog(`  + Ajouté: ${newEvent.title} (${newEvent.date})`, 'success')
        }
      }

      addLog(`\n📊 Résumé:`, 'info')
      addLog(`  • ${duplicates} doublons évités`, 'warning')
      addLog(`  • ${added} nouveaux événements ajoutés`, 'success')
      addLog(`  • ${mergedEvents.length} événements au total`, 'info')

      // Commit to GitHub
      addLog('📤 Envoi vers GitHub...', 'info')

      const response = await fetch('/api/github-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: 'cevennes-connect/data/events-data.json',
          content: JSON.stringify(mergedEvents, null, 2),
          commitMessage: `🎉 Artefact IA - Ajout de ${count} événement(s)

${extractedEvents.map((e, i) => `${i + 1}. ${e.title} - ${e.date} à ${e.location}`).join('\n')}

🤖 Generated via Artefact IA`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur inconnue')
      }

      const result = await response.json()
      addLog('✅ Commit réussi sur GitHub !', 'success')
      addLog(`   Commit SHA: ${result.commit.sha.substring(0, 7)}`, 'info')

      alert(`✅ Événement(s) committé(s) sur GitHub !\n\n📊 ${count} événement(s) traité(s)\n${duplicates} doublons évités\n${added} nouveaux ajoutés\n📂 Total: ${mergedEvents.length} événements\n\n🎉 Les données sont en ligne !`)

      // Reset
      setExtractedEvents(null)
      setTextContent('')
      setUrlContent('')
      setUploadedImages([])

    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error')
      alert(`❌ Erreur lors du commit:\n\n${error.message}`)
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">← Retour Admin</Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
              ✨ Artefact IA - Extraction d&apos;Événements
            </h1>
            <p className="text-center text-gray-600">
              Glissez un screenshot, collez du texte ou un lien - L&apos;IA extrait et reformule automatiquement !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📥 Sources d&apos;Information
              </h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
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

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                variant="primary"
                className="w-full"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '⏳ Analyse en cours...' : '🧠 Analyser avec l\'IA'}
              </Button>
            </div>

            {/* Right Column - Output */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🤖 Traitement IA
              </h2>

              {/* Log Console */}
              <div
                ref={logConsoleRef}
                className="bg-gray-900 text-green-400 p-6 rounded-xl h-80 overflow-y-auto mb-6 font-mono text-sm"
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
                  <div className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto mb-4 max-h-96">
                    <pre className="text-sm">{JSON.stringify(extractedEvents, null, 2)}</pre>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCopyJSON} variant="secondary" className="flex-1">
                      📋 Copier
                    </Button>
                    <Button onClick={handleDownloadJSON} variant="secondary" className="flex-1">
                      💾 Télécharger
                    </Button>
                    <Button onClick={handleCommitToGitHub} variant="primary" className="flex-1">
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
