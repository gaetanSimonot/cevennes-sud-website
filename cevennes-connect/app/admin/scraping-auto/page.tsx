'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'

interface ScrapingConfig {
  id: number
  name: string
  url: string
  frequency: 'daily' | 'weekly' | 'monthly'
  active: boolean
  last_run_at: string | null
  next_run_at: string | null
  created_at: string
}

interface PendingEvent {
  id: number
  title: string
  date: string
  location: string
  description: string
  is_duplicate: boolean
  validated: boolean
  rejected: boolean
  scraped_at: string
  scraping_config_id: number
}

export default function ScrapingAutoPage() {
  const [configs, setConfigs] = useState<ScrapingConfig[]>([])
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ScrapingConfig | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    loadConfigs()
    loadPendingEvents()
  }, [])

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/scraping-configs')
      if (res.ok) {
        const data = await res.json()
        setConfigs(data.configs || [])
      }
    } catch (error) {
      console.error('Error loading configs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPendingEvents = async () => {
    try {
      const res = await fetch('/api/scraped-events-pending')
      if (res.ok) {
        const data = await res.json()
        setPendingEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error loading pending events:', error)
    }
  }

  const handleAddConfig = async () => {
    if (!formName || !formUrl) {
      alert('Nom et URL requis')
      return
    }

    try {
      const res = await fetch('/api/scraping-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          url: formUrl,
          frequency: formFrequency
        })
      })

      if (res.ok) {
        await loadConfigs()
        setShowAddModal(false)
        resetForm()
        alert('✅ Configuration ajoutée !')
      }
    } catch (error) {
      alert('Erreur lors de l\'ajout')
    }
  }

  const handleUpdateConfig = async () => {
    if (!editingConfig) return

    try {
      const res = await fetch(`/api/scraping-configs/${editingConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          url: formUrl,
          frequency: formFrequency
        })
      })

      if (res.ok) {
        await loadConfigs()
        setEditingConfig(null)
        resetForm()
        alert('✅ Configuration mise à jour !')
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await fetch(`/api/scraping-configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active })
      })
      await loadConfigs()
    } catch (error) {
      console.error('Error toggling active:', error)
    }
  }

  const handleDeleteConfig = async (id: number) => {
    if (!confirm('Supprimer cette configuration ?')) return

    try {
      await fetch(`/api/scraping-configs/${id}`, { method: 'DELETE' })
      await loadConfigs()
      alert('✅ Configuration supprimée')
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleRunNow = async (id: number) => {
    try {
      const res = await fetch(`/api/scraping-configs/${id}/run`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('✅ Scraping lancé ! Consultez les événements en attente.')
        await loadPendingEvents()
      }
    } catch (error) {
      alert('Erreur lors du lancement')
    }
  }

  const handleValidateEvent = async (id: number) => {
    try {
      await fetch(`/api/scraped-events-pending/${id}/validate`, {
        method: 'POST'
      })
      await loadPendingEvents()
      alert('✅ Événement publié !')
    } catch (error) {
      alert('Erreur lors de la validation')
    }
  }

  const handleRejectEvent = async (id: number) => {
    try {
      await fetch(`/api/scraped-events-pending/${id}/reject`, {
        method: 'POST'
      })
      await loadPendingEvents()
    } catch (error) {
      alert('Erreur lors du rejet')
    }
  }

  const resetForm = () => {
    setFormName('')
    setFormUrl('')
    setFormFrequency('weekly')
  }

  const openEditModal = (config: ScrapingConfig) => {
    setEditingConfig(config)
    setFormName(config.name)
    setFormUrl(config.url)
    setFormFrequency(config.frequency)
    setShowAddModal(true)
  }

  const pendingCount = pendingEvents.filter(e => !e.validated && !e.rejected).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="sm">← Retour Admin</Button>
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 text-center mb-2 mt-4">
              🤖 Scraping Automatique
            </h1>
            <p className="text-center text-gray-600">
              Gérez les agendas externes à scraper automatiquement
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Configurations */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Configurations ({configs.length})
                </h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingConfig(null)
                    resetForm()
                    setShowAddModal(true)
                  }}
                >
                  + Nouvelle config
                </Button>
              </div>

              {isLoading ? (
                <p className="text-gray-500">Chargement...</p>
              ) : configs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-500 mb-4">Aucune configuration</p>
                  <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Créer la première
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {config.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              config.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {config.active ? 'Actif' : 'Inactif'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                              {config.frequency === 'daily' ? 'Quotidien' : config.frequency === 'weekly' ? 'Hebdo' : 'Mensuel'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{config.url}</p>
                          {config.last_run_at && (
                            <p className="text-xs text-gray-500">
                              Dernier scraping: {new Date(config.last_run_at).toLocaleString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRunNow(config.id)}
                        >
                          ▶️ Lancer maintenant
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleActive(config.id, config.active)}
                        >
                          {config.active ? '⏸️ Désactiver' : '▶️ Activer'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(config)}
                        >
                          ✏️ Modifier
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Événements en attente */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                En attente ({pendingCount})
              </h2>

              {pendingEvents.filter(e => !e.validated && !e.rejected).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl">
                  <p className="text-gray-500">Aucun événement en attente</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {pendingEvents
                    .filter(e => !e.validated && !e.rejected)
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`border-2 rounded-xl p-4 ${
                          event.is_duplicate
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {event.is_duplicate && (
                          <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-2">
                            DOUBLON
                          </span>
                        )}
                        <h4 className="font-bold text-sm mb-1">{event.title}</h4>
                        {event.date && <p className="text-xs text-gray-600 mb-1">📅 {event.date}</p>}
                        {event.location && <p className="text-xs text-gray-600 mb-2">📍 {event.location}</p>}

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleValidateEvent(event.id)}
                            disabled={event.is_duplicate}
                          >
                            ✅ Valider
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectEvent(event.id)}
                          >
                            ❌ Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingConfig ? 'Modifier la configuration' : 'Nouvelle configuration'}
            </h2>

            <div className="space-y-4 mb-6">
              <Input
                label="Nom"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Agenda eTerritoire Ganges"
              />

              <TextArea
                label="URL"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                rows={3}
                placeholder="https://www.eterritoire.fr/agenda/..."
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fréquence
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormFrequency('daily')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      formFrequency === 'daily'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Quotidien
                  </button>
                  <button
                    onClick={() => setFormFrequency('weekly')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      formFrequency === 'weekly'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Hebdomadaire
                  </button>
                  <button
                    onClick={() => setFormFrequency('monthly')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      formFrequency === 'monthly'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Mensuel
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={editingConfig ? handleUpdateConfig : handleAddConfig}
              >
                {editingConfig ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingConfig(null)
                  resetForm()
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
