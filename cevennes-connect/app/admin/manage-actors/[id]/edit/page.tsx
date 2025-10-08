'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Actor, ActorCategory } from '@/lib/types'

export default function EditActorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actor, setActor] = useState<Actor | null>(null)
  const [formData, setFormData] = useState<Partial<Actor>>({})

  const categories: { key: ActorCategory; label: string }[] = [
    { key: 'commerce', label: 'Commerce' },
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'artisan', label: 'Artisan' },
    { key: 'therapeute', label: 'Thérapeute' },
    { key: 'service', label: 'Service' },
    { key: 'association', label: 'Association' },
  ]

  const premiumLevels = [
    { key: 'standard', label: 'Standard' },
    { key: 'premium', label: 'Premium' },
    { key: 'premium_plus', label: 'Premium Plus' },
    { key: 'mega-premium', label: 'Mega Premium' },
  ]

  useEffect(() => {
    fetchActor()
  }, [id])

  const fetchActor = async () => {
    try {
      const response = await fetch(`/api/actors/${id}`)
      const data = await response.json()

      if (data.actor) {
        setActor(data.actor)
        setFormData(data.actor)
      } else {
        alert('❌ Acteur non trouvé')
        router.push('/admin/manage-actors')
      }
    } catch (error) {
      console.error('Error fetching actor:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/admin/manage-actors')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Actor, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/actors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('✅ Acteur modifié avec succès !')
        router.push('/admin/manage-actors')
      } else {
        alert('❌ Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Error updating actor:', error)
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

  if (!actor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/admin/manage-actors">
              <Button variant="ghost" size="sm">← Retour à la liste</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Modifier Acteur</h1>
              <p className="text-sm text-gray-500">{actor.name}</p>
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
                <Input
                  label="Nom *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Description de l'activité..."
              />
            </div>

            {/* Adresse et localisation */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Localisation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Adresse"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Rue de la République, Ganges"
                  />
                </div>
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
                  label="Téléphone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@exemple.fr"
                />
                <Input
                  label="Site web"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://exemple.fr"
                />
                <Input
                  label="Horaires"
                  value={formData.opening_hours || ''}
                  onChange={(e) => handleChange('opening_hours', e.target.value)}
                  placeholder="Lun-Ven 9h-18h"
                />
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Réseaux sociaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Facebook"
                  value={formData.facebook || ''}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="Instagram"
                  value={formData.instagram || ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            {/* Premium et images */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Options avancées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Niveau Premium
                  </label>
                  <select
                    value={formData.premium_level || 'standard'}
                    onChange={(e) => handleChange('premium_level', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {premiumLevels.map(level => (
                      <option key={level.key} value={level.key}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="URL Logo"
                  value={formData.logo_url || ''}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder="https://exemple.fr/logo.png"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags (séparés par des virgules)
              </label>
              <Input
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="bio, local, artisanal"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link href="/admin/manage-actors">
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
