'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Actor, ActorCategory } from '@/lib/types'

interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  formatted_phone_number?: string
  website?: string
  types: string[]
}

interface ProcessedActor extends Actor {
  selected: boolean
  isDuplicate?: boolean
}

interface LogEntry {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

const GOOGLE_PLACES_API_KEY = 'AIzaSyBe9S2a8Afc67NtS9UmvEwOoLt3BFne0eI'

export default function ImportGooglePage() {
  const [activeCategory, setActiveCategory] = useState<ActorCategory>('commerce')
  const [radius, setRadius] = useState(15)
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [places, setPlaces] = useState<ProcessedActor[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([
    { message: '🔍 Prêt à importer des acteurs depuis Google Places', type: 'info' },
    { message: '📍 Recherche centrée sur Ganges, Cévennes', type: 'info' },
    { message: '🤖 Les descriptions seront reformulées par OpenAI', type: 'info' },
  ])
  const logConsoleRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { message, type }])
    setTimeout(() => {
      if (logConsoleRef.current) {
        logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight
      }
    }, 100)
  }

  const categories: { key: ActorCategory; label: string; icon: string; searchKeyword: string }[] = [
    { key: 'commerce', label: 'Commerces', icon: '🏪', searchKeyword: 'store|shop|boutique' },
    { key: 'restaurant', label: 'Restaurants', icon: '🍽️', searchKeyword: 'restaurant|cafe|bar' },
    { key: 'artisan', label: 'Artisans', icon: '🔨', searchKeyword: 'artisan|craftsman|handmade' },
    { key: 'therapeute', label: 'Thérapeutes', icon: '💆', searchKeyword: 'therapist|wellness|spa|massage' },
    { key: 'service', label: 'Services', icon: '💼', searchKeyword: 'service|professional' },
    { key: 'association', label: 'Associations', icon: '👥', searchKeyword: 'association|organization' },
  ]

  const handleSearch = async () => {
    setIsSearching(true)
    setPlaces([])
    addLog('\n🚀 Démarrage de la recherche Google Places...', 'info')

    const categoryInfo = categories.find(c => c.key === activeCategory)
    addLog(`📂 Catégorie: ${categoryInfo?.label}`, 'info')
    addLog(`📍 Rayon: ${radius} km autour de Ganges`, 'info')

    try {
      // Search Google Places
      const center = { lat: 43.9339, lng: 3.7086 } // Ganges
      const searchQuery = categoryInfo?.searchKeyword || activeCategory

      addLog(`🔎 Recherche: "${searchQuery}" dans la région...`, 'info')

      // Use Google Places Nearby Search
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=${radius * 1000}&keyword=${searchQuery}&key=${GOOGLE_PLACES_API_KEY}`

      // Since we can't call Google API directly from browser (CORS), we'll use our API route
      const response = await fetch('/api/google-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: `${center.lat},${center.lng}`,
          radius: radius * 1000,
          keyword: searchQuery
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche Google Places')
      }

      const data = await response.json()
      const results: GooglePlace[] = data.results || []

      addLog(`✅ ${results.length} résultat(s) trouvé(s)`, results.length > 0 ? 'success' : 'warning')

      if (results.length === 0) {
        setIsSearching(false)
        return
      }

      // Process each place
      addLog('🤖 Reformulation des descriptions par OpenAI...', 'info')

      const processedActors: ProcessedActor[] = []

      for (const place of results) {
        try {
          // Generate description with OpenAI
          const descriptionResponse = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [{
                role: 'user',
                content: `Tu es un rédacteur spécialisé en descriptions marketing locales pour les Cévennes.

Crée une description attrayante et professionnelle de 1-2 phrases pour ce commerce/professionnel :

**Nom**: ${place.name}
**Adresse**: ${place.formatted_address}
**Type**: ${place.types.join(', ')}
**Note Google**: ${place.rating || 'Non noté'}

**RÈGLES STRICTES** :
- 1-2 phrases MAX
- Style chaleureux et accueillant
- Mets en valeur le côté local/artisanal si pertinent
- Pas de ponctuation excessive
- Pas de guillemets
- Commence directement par la description (pas de "Voici..." ou "Description:")

Exemple bon: "Boulangerie artisanale proposant pains bio et pâtisseries maison. Une adresse incontournable au cœur des Cévennes."

Retourne UNIQUEMENT la description, rien d'autre.`
              }],
              max_tokens: 150,
              temperature: 0.7
            })
          })

          let description = 'Commerce local situé dans les Cévennes'
          if (descriptionResponse.ok) {
            const descData = await descriptionResponse.json()
            description = descData.choices[0].message.content.trim()
          }

          const actor: ProcessedActor = {
            name: place.name,
            category: activeCategory,
            description,
            address: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            phone: place.formatted_phone_number || '',
            website: place.website || '',
            email: '',
            hours: '',
            image: '',
            premium_level: 'standard',
            selected: true,
            isDuplicate: false
          }

          processedActors.push(actor)
          addLog(`  ✓ ${place.name}`, 'success')

        } catch (error) {
          addLog(`  ✗ Erreur pour ${place.name}`, 'error')
        }
      }

      // Check for duplicates
      addLog('🔍 Vérification des doublons...', 'info')

      try {
        const existingResponse = await fetch('/data/actors-data.json')
        if (existingResponse.ok) {
          const existingData = await existingResponse.json()
          const allExisting: Actor[] = [
            ...(existingData.commerce || []),
            ...(existingData.restaurant || []),
            ...(existingData.artisan || []),
            ...(existingData.therapeute || []),
            ...(existingData.service || []),
            ...(existingData.association || [])
          ]

          processedActors.forEach(actor => {
            const isDuplicate = allExisting.some(existing =>
              existing.name.toLowerCase() === actor.name.toLowerCase() ||
              (existing.address && actor.address &&
               existing.address.toLowerCase().includes(actor.address.toLowerCase().substring(0, 20)))
            )
            if (isDuplicate) {
              actor.isDuplicate = true
              actor.selected = false
              addLog(`  ⊘ Doublon: ${actor.name}`, 'warning')
            }
          })

          const duplicateCount = processedActors.filter(a => a.isDuplicate).length
          const newCount = processedActors.filter(a => !a.isDuplicate).length

          addLog(`📊 ${newCount} nouveaux acteurs`, 'success')
          addLog(`📊 ${duplicateCount} doublons détectés`, duplicateCount > 0 ? 'warning' : 'info')
        }
      } catch (error) {
        addLog('⚠ Impossible de vérifier les doublons', 'warning')
      }

      setPlaces(processedActors)
      addLog('✅ Recherche terminée !', 'success')

    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error')
      console.error('Erreur complète:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const toggleSelection = (index: number) => {
    setPlaces(prev => prev.map((place, i) =>
      i === index ? { ...place, selected: !place.selected } : place
    ))
  }

  const selectAll = () => {
    setPlaces(prev => prev.map(place => ({ ...place, selected: !place.isDuplicate })))
  }

  const deselectAll = () => {
    setPlaces(prev => prev.map(place => ({ ...place, selected: false })))
  }

  const handleCommit = async () => {
    const selectedPlaces = places.filter(p => p.selected)

    if (selectedPlaces.length === 0) {
      addLog('❌ Aucun acteur sélectionné', 'error')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir ajouter ${selectedPlaces.length} acteur(s) à Supabase ?`)) {
      return
    }

    setIsProcessing(true)
    addLog('\n📤 Création des acteurs dans Supabase...', 'info')

    try {
      let added = 0

      // Create actors in Supabase via API
      for (const actor of selectedPlaces) {
        // Remove processing fields and set category
        const { selected, isDuplicate, ...cleanActor } = actor
        const actorData = {
          ...cleanActor,
          category: activeCategory
        }

        const response = await fetch('/api/actors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actorData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors de la création')
        }

        added++
        addLog(`  ✓ Créé: ${actor.name}`, 'success')
      }

      addLog(`✅ ${added} acteur(s) ajouté(s) avec succès !`, 'success')

      alert(`✅ ${added} acteur(s) ajouté(s) à Supabase !\n\n🎉 Les données sont instantanément disponibles en ligne !`)

      // Reset
      setPlaces([])

    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error')
      alert(`❌ Erreur lors de l'ajout:\n\n${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedCount = places.filter(p => p.selected).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600">
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
              🔄 Import Google Places
            </h1>
            <p className="text-center text-gray-600">
              Importez automatiquement des acteurs locaux depuis Google Maps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Search */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔍 Paramètres de Recherche
              </h2>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <Button
                      key={cat.key}
                      variant={activeCategory === cat.key ? 'primary' : 'secondary'}
                      onClick={() => setActiveCategory(cat.key)}
                      className="justify-start"
                    >
                      {cat.icon} {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Radius Slider */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rayon de recherche: {radius} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 km</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                variant="primary"
                className="w-full mb-6"
                disabled={isSearching}
              >
                {isSearching ? '⏳ Recherche en cours...' : '🔎 Lancer la recherche'}
              </Button>

              {/* Log Console */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  📋 Console de logs
                </h3>
                <div
                  ref={logConsoleRef}
                  className="bg-gray-900 text-green-400 p-6 rounded-xl h-80 overflow-y-auto font-mono text-sm"
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
              </div>
            </div>

            {/* Right Column - Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  📊 Résultats ({places.length})
                </h2>
                {places.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      ✓ Tout
                    </Button>
                    <Button variant="ghost" size="sm" onClick={deselectAll}>
                      ✗ Rien
                    </Button>
                  </div>
                )}
              </div>

              {places.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <p>Aucun résultat pour l&apos;instant</p>
                  <p className="text-sm mt-2">Lancez une recherche pour voir les résultats</p>
                </div>
              ) : (
                <>
                  {/* Results List */}
                  <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto">
                    {places.map((place, index) => (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                          place.isDuplicate
                            ? 'border-orange-300 bg-orange-50 opacity-60'
                            : place.selected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => !place.isDuplicate && toggleSelection(index)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={place.selected}
                            disabled={place.isDuplicate}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{place.name}</h3>
                              {place.isDuplicate && (
                                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                                  Doublon
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{place.description}</p>
                            <p className="text-xs text-gray-500">📍 {place.address}</p>
                            {place.phone && (
                              <p className="text-xs text-gray-500">📞 {place.phone}</p>
                            )}
                            {place.website && (
                              <p className="text-xs text-gray-500 truncate">🌐 {place.website}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Commit Button */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedCount} acteur(s) sélectionné(s)
                      </span>
                    </div>
                    <Button
                      onClick={handleCommit}
                      variant="primary"
                      className="w-full"
                      disabled={selectedCount === 0 || isProcessing}
                    >
                      {isProcessing ? '⏳ Publication...' : '📤 Publier sur GitHub'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
