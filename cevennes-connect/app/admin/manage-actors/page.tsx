'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Actor, ActorCategory } from '@/lib/types'

interface PaginatedResponse {
  actors: Actor[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ManageActorsPage() {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState<ActorCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const categories: { key: ActorCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'commerce', label: 'Commerces' },
    { key: 'restaurant', label: 'Restaurants' },
    { key: 'artisan', label: 'Artisans' },
    { key: 'therapeute', label: 'Thérapeutes' },
    { key: 'service', label: 'Services' },
    { key: 'association', label: 'Associations' },
  ]

  useEffect(() => {
    fetchActors()
  }, [page, category, searchTerm])

  const fetchActors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        category: category,
        search: searchTerm
      })

      const response = await fetch(`/api/actors?${params}`)
      const data: PaginatedResponse = await response.json()

      setActors(data.actors)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching actors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/actors/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ Acteur supprimé avec succès !')
        fetchActors()
      } else {
        alert('❌ Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting actor:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins un acteur')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} acteur(s) ?`)) {
      return
    }

    try {
      const response = await fetch('/api/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'actors',
          ids: selectedIds
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ ${data.deletedCount} acteur(s) supprimé(s) avec succès !`)
        setSelectedIds([])
        fetchActors()
      } else {
        alert('❌ Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error bulk deleting:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedIds(actors.map(a => a.id!))
  }

  const deselectAll = () => {
    setSelectedIds([])
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
              <h1 className="text-xl font-bold text-gray-900">Gestion des Acteurs</h1>
              <p className="text-sm text-gray-500">{total} acteur(s) au total</p>
            </div>
          </div>
          <Link href="/admin/create-actor">
            <Button variant="primary">➕ Nouvel acteur</Button>
          </Link>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Rechercher un acteur..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ActorCategory | 'all')
                setPage(1)
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
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
          ) : actors.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Aucun acteur trouvé
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
                          checked={selectedIds.length === actors.length && actors.length > 0}
                          onChange={() => {
                            if (selectedIds.length === actors.length) {
                              deselectAll()
                            } else {
                              selectAll()
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Nom
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Catégorie
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Adresse
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Premium
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {actors.map((actor) => (
                      <tr
                        key={actor.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(actor.id!)}
                            onChange={() => toggleSelection(actor.id!)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{actor.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {actor.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {categories.find(c => c.key === actor.category)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {actor.address || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{actor.phone || '-'}</div>
                          <div className="text-xs">{actor.email || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          {actor.premium_level && actor.premium_level !== 'standard' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {actor.premium_level}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/manage-actors/${actor.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                ✏️ Modifier
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(actor.id!, actor.name)}
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
