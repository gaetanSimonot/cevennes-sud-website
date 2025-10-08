'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Event, EventCategory } from '@/lib/types'

interface PaginatedResponse {
  events: Event[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState<EventCategory | 'all'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'future'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const categories: { key: EventCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'marche', label: 'Marchés' },
    { key: 'culture', label: 'Culture' },
    { key: 'sport', label: 'Sport' },
    { key: 'festival', label: 'Festivals' },
    { key: 'atelier', label: 'Ateliers' },
    { key: 'theatre', label: 'Théâtre' },
  ]

  useEffect(() => {
    fetchEvents()
  }, [page, category, timeFilter, searchTerm])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        category: category,
        time: timeFilter,
        search: searchTerm
      })

      const response = await fetch(`/api/events?${params}`)
      const data: PaginatedResponse = await response.json()

      setEvents(data.events)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ Événement supprimé avec succès !')
        fetchEvents()
      } else {
        alert('❌ Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins un événement')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} événement(s) ?`)) {
      return
    }

    try {
      const response = await fetch('/api/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'events',
          ids: selectedIds
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ ${data.deletedCount} événement(s) supprimé(s) avec succès !`)
        setSelectedIds([])
        fetchEvents()
      } else {
        alert('❌ Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error bulk deleting:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedIds(events.map(e => e.id))
  }

  const deselectAll = () => {
    setSelectedIds([])
  }

  const isPastEvent = (date: string) => {
    return new Date(date) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">← Retour Admin</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestion des Événements</h1>
              <p className="text-sm text-gray-500">{total} événement(s) au total</p>
            </div>
          </div>
          <Link href="/admin/create-event">
            <Button variant="primary">➕ Nouvel événement</Button>
          </Link>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as EventCategory | 'all')
                setPage(1)
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value as 'all' | 'past' | 'future')
                setPage(1)
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">Tous les événements</option>
              <option value="future">À venir</option>
              <option value="past">Passés</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <span className="font-semibold text-blue-900">
                {selectedIds.length} sélectionné(s)
              </span>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Désélectionner tout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                🗑️ Supprimer la sélection
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Chargement...
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Aucun événement trouvé
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === events.length && events.length > 0}
                          onChange={() => {
                            if (selectedIds.length === events.length) {
                              deselectAll()
                            } else {
                              selectAll()
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Titre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Catégorie
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Lieu
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Prix
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className={`hover:bg-gray-50 transition ${
                          isPastEvent(event.date) ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(event.id)}
                            onChange={() => toggleSelection(event.id)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {event.title}
                            {isPastEvent(event.date) && (
                              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                                Passé
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {event.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{new Date(event.date).toLocaleDateString('fr-FR')}</div>
                          <div className="text-xs text-gray-500">{event.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                            {categories.find(c => c.key === event.category)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{event.location || '-'}</div>
                          <div className="text-xs text-gray-500">{event.address}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {event.price || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/manage-events/${event.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                ✏️ Modifier
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(event.id, event.title)}
                              className="text-red-600 hover:text-red-700"
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      ← Précédent
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Suivant →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
