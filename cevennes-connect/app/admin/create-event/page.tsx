'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Event, EventCategory } from '@/lib/types'

const GOOGLE_MAPS_API_KEY = 'AIzaSyCSJRp7NCeKSPiKnezVyJiJFg5dqhbWnyw'

export default function CreateEventPage() {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'culture',
    description: '',
    date: '',
    time: '',
    location: '',
    address: '',
    price: '',
    organizer: '',
    contact: '',
    website: '',
    image: '',
    lat: 43.9339,
    lng: 3.7086,
    premium_level: 'standard'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        setMapLoaded(true)
        initMap()
      }
    } else {
      setMapLoaded(true)
      initMap()
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || !window.google) return

    const ganges = { lat: 43.9339, lng: 3.7086 }

    const map = new google.maps.Map(mapRef.current, {
      center: ganges,
      zoom: 14
    })

    const marker = new google.maps.Marker({
      position: ganges,
      map: map,
      draggable: true
    })

    googleMapRef.current = map
    markerRef.current = marker

    // Autocomplete for address
    const addressInput = document.getElementById('address') as HTMLInputElement
    if (addressInput) {
      const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: 'fr' },
        fields: ['geometry', 'formatted_address']
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry) {
          const location = place.geometry.location
          if (location) {
            updateLocation(location.lat(), location.lng())
            map.setCenter(location)
            marker.setPosition(location)
          }
        }
      })

      autocompleteRef.current = autocomplete
    }

    // Drag marker
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      if (position) {
        updateLocation(position.lat(), position.lng())
      }
    })
  }

  const updateLocation = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      alert('❌ Veuillez remplir au moins le titre, la date et le lieu.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Load existing events
      const response = await fetch('/data/events-data.json')
      if (!response.ok) {
        throw new Error('Impossible de charger events-data.json')
      }

      const existingEvents: Event[] = await response.json()

      // 2. Check duplicates
      const isDuplicate = existingEvents.some(existing =>
        existing.date === formData.date &&
        (existing.location?.toLowerCase() === formData.location?.toLowerCase() ||
         existing.address?.toLowerCase() === formData.address?.toLowerCase() ||
         existing.title?.toLowerCase() === formData.title?.toLowerCase())
      )

      if (isDuplicate) {
        if (!confirm('⚠️ Un événement similaire existe déjà (même date et lieu/titre/adresse).\n\nVoulez-vous quand même l\'ajouter ?')) {
          setIsSubmitting(false)
          return
        }
      }

      // 3. Create new event
      const categoryImages: Record<string, string> = {
        'festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'marche': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'culture': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'sport': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'atelier': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'theatre': 'https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }

      const newEvent: Event = {
        id: Date.now(),
        title: formData.title!,
        category: formData.category as EventCategory,
        description: formData.description!,
        date: formData.date!,
        time: formData.time || '',
        location: formData.location!,
        address: formData.address || '',
        price: formData.price || 'Non renseigné',
        organizer: formData.organizer || '',
        contact: formData.contact || '',
        website: formData.website || '',
        lat: formData.lat!,
        lng: formData.lng!,
        premium_level: 'standard',
        image: formData.image || categoryImages[formData.category!] || categoryImages['culture']
      }

      // 4. Add to existing events
      existingEvents.push(newEvent)

      // 5. Commit to GitHub
      const commitResponse = await fetch('/api/github-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: 'cevennes-connect/data/events-data.json',
          content: JSON.stringify(existingEvents, null, 2),
          commitMessage: `✨ Ajout événement: ${newEvent.title}

📅 ${newEvent.date} à ${newEvent.time}
📍 ${newEvent.location}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`
        })
      })

      if (!commitResponse.ok) {
        const errorData = await commitResponse.json()
        throw new Error(errorData.error || 'Erreur lors du commit')
      }

      alert(`✅ Événement "${newEvent.title}" ajouté et committé sur GitHub !`)

      // Reset form
      setFormData({
        title: '',
        category: 'culture',
        description: '',
        date: '',
        time: '',
        location: '',
        address: '',
        price: '',
        organizer: '',
        contact: '',
        website: '',
        image: '',
        lat: 43.9339,
        lng: 3.7086,
        premium_level: 'standard'
      })

      // Reset map
      if (googleMapRef.current && markerRef.current) {
        const ganges = { lat: 43.9339, lng: 3.7086 }
        googleMapRef.current.setCenter(ganges)
        markerRef.current.setPosition(ganges)
      }

    } catch (error: any) {
      console.error('Erreur:', error)
      alert(`❌ Erreur lors de la sauvegarde :\n\n${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories: { key: EventCategory; label: string }[] = [
    { key: 'marche', label: '🛍️ Marché' },
    { key: 'culture', label: '🎭 Culture' },
    { key: 'sport', label: '⚽ Sport' },
    { key: 'festival', label: '🎪 Festival' },
    { key: 'atelier', label: '🎨 Atelier' },
    { key: 'theatre', label: '🎬 Théâtre' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">← Retour Admin</Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
              ➕ Créer un Événement
            </h1>
            <p className="text-center text-gray-600">
              Remplissez le formulaire pour ajouter un événement manuellement
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Title */}
            <Input
              label="Titre de l'événement *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Festival de Musique des Cévennes"
              required
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <TextArea
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez l'événement..."
              required
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date *"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <Input
                label="Heure *"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            {/* Location */}
            <Input
              label="Lieu *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Place du village de Ganges"
              required
            />

            {/* Address with Google Autocomplete */}
            <div>
              <Input
                label="Adresse complète *"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="34190 Ganges"
                required
              />
              {/* Map */}
              <div ref={mapRef} className="mt-3 h-64 rounded-xl overflow-hidden"></div>
              <p className="mt-2 text-sm text-gray-600">
                Coordonnées: {formData.lat?.toFixed(6)}, {formData.lng?.toFixed(6)}
              </p>
            </div>

            {/* Price */}
            <Input
              label="Prix"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ex: Gratuit, 10€, 5-15€"
            />

            {/* Organizer */}
            <Input
              label="Organisateur"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="Ex: Association Cévennes Culture"
            />

            {/* Contact */}
            <Input
              label="Contact (téléphone ou email)"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="04 67 73 XX XX ou email@exemple.fr"
            />

            {/* Website */}
            <Input
              label="Site web ou lien"
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.exemple.fr"
            />

            {/* Image URL */}
            <Input
              label="URL de l'image/affiche"
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
            />

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Sauvegarde...' : '📤 Publier sur GitHub'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                🔄 Réinitialiser
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
