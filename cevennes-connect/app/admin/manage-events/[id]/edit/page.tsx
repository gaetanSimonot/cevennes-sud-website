'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Event, EventCategory } from '@/lib/types'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<Partial<Event>>({})

  const categories: { key: EventCategory; label: string }[] = [
    { key: 'marche', label: 'Marché' },
    { key: 'culture', label: 'Culture' },
    { key: 'sport', label: 'Sport' },
    { key: 'festival', label: 'Festival' },
    { key: 'atelier', label: 'Atelier' },
    { key: 'theatre', label: 'Théâtre' },
  ]

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`)
      const data = await response.json()

      if (data.event) {
        setEvent(data.event)
        setFormData(data.event)
      } else {
        alert('❌ Événement non trouvé')
        router.push('/admin/manage-events')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/admin/manage-events')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('✅ Événement modifié avec succès !')
        router.push('/admin/manage-events')
      } else {
        alert('❌ Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('❌ Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/admin/manage-events">
              <Button variant="ghost" size="sm">← Retour à la liste</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Modifier Événement</h1>
              <p className="text-sm text-gray-500">{event.title}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
            {/* Informations principales */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informations principales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Titre *"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Organisateur"
                  value={formData.organizer || ''}
                  onChange={(e) => handleChange('organizer', e.target.value)}
                  placeholder="Nom de l'organisateur"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Description complète de l'événement..."
                required
              />
            </div>

            {/* Date et heure */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Date et horaire</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Date *"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
                <Input
                  label="Heure *"
                  value={formData.time || ''}
                  onChange={(e) => handleChange('time', e.target.value)}
                  placeholder="14h00"
                  required
                />
                <Input
                  label="Prix"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="Gratuit"
                />
              </div>
            </div>

            {/* Lieu */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Lieu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom du lieu *"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Place du Village"
                  required
                />
                <Input
                  label="Adresse"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Place du Village, 34190 Ganges"
                />
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                  placeholder="43.9345"
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                  placeholder="3.7123"
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="contact@exemple.fr"
                />
                <Input
                  label="Téléphone"
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Image</h2>
              <Input
                label="URL de l'image"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://exemple.fr/image.jpg"
              />
              {formData.image_url && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+non+disponible'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link href="/admin/manage-events">
                <Button variant="ghost" type="button">
                  Annuler
                </Button>
              </Link>
              <Button
                variant="primary"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : '✓ Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
