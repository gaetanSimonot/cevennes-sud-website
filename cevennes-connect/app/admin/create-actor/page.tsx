'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Actor, ActorCategory, ActorsData } from '@/lib/types'

const GOOGLE_MAPS_API_KEY = 'AIzaSyCSJRp7NCeKSPiKnezVyJiJFg5dqhbWnyw'

export default function CreateActorPage() {
  const [formData, setFormData] = useState<Partial<Actor>>({
    name: '',
    category: 'commerce',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
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
    if (!formData.name || !formData.description || !formData.address) {
      alert('❌ Veuillez remplir au moins le nom, la description et l\'adresse.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Load existing actors from Supabase
      const response = await fetch('/api/actors?limit=10000')
      if (!response.ok) {
        throw new Error('Impossible de charger les acteurs')
      }

      const data = await response.json()
      const existingActors: Actor[] = data.actors || []

      // 2. Check duplicates
      const isDuplicate = existingActors.some(existing =>
        existing.name.toLowerCase() === formData.name?.toLowerCase() ||
        (existing.address && formData.address &&
         existing.address.toLowerCase().includes(formData.address.toLowerCase().substring(0, 20)))
      )

      if (isDuplicate) {
        if (!confirm('⚠️ Un acteur similaire existe déjà (même nom ou adresse).\n\nVoulez-vous quand même l\'ajouter ?')) {
          setIsSubmitting(false)
          return
        }
      }

      // 3. Create new actor
      const categoryImages: Record<string, string> = {
        'commerce': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'artisan': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'therapeute': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'service': 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'association': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }

      const newActor: Actor = {
        name: formData.name!,
        category: formData.category as ActorCategory,
        description: formData.description!,
        address: formData.address!,
        lat: formData.lat!,
        lng: formData.lng!,
        phone: formData.phone || '',
        email: formData.email || '',
        website: formData.website || '',
        horaires: formData.hours || '',
        specialites: [],
        image: formData.image || categoryImages[formData.category!] || categoryImages['commerce'],
        rating: undefined,
        reviews_count: 0,
        premium_level: 'standard'
      }

      // 4. Create in Supabase via API
      const createResponse = await fetch('/api/actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActor)
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }

      const result = await createResponse.json()

      alert(`✅ Acteur "${newActor.name}" créé dans Supabase !\n\n🎉 Disponible instantanément en ligne !`)

      // Reset form
      setFormData({
        name: '',
        category: 'commerce',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        hours: '',
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

  const categories: { key: ActorCategory; label: string }[] = [
    { key: 'commerce', label: '🏪 Commerce' },
    { key: 'restaurant', label: '🍽️ Restaurant' },
    { key: 'artisan', label: '🔨 Artisan' },
    { key: 'therapeute', label: '💆 Thérapeute' },
    { key: 'service', label: '💼 Service' },
    { key: 'association', label: '👥 Association' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600">
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
              ➕ Créer un Acteur Local
            </h1>
            <p className="text-center text-gray-600">
              Remplissez le formulaire pour ajouter un acteur local manuellement
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Name */}
            <Input
              label="Nom *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Boulangerie des Cévennes"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              placeholder="Décrivez l'acteur local..."
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

            {/* Phone */}
            <Input
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="04 67 73 XX XX"
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@exemple.fr"
            />

            {/* Website */}
            <Input
              label="Site web"
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.exemple.fr"
            />

            {/* Hours */}
            <Input
              label="Horaires"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="Ex: Lun-Ven 9h-18h, Sam 9h-12h"
            />

            {/* Image URL */}
            <Input
              label="URL de l'image"
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
